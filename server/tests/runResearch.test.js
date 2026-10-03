import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { Research, MIN_POSTS, ACTIVE_STATUSES } from '../src/models/research.model.js';
import { runResearch, failInterrupted } from '../src/jobs/runResearch.js';
import { createVerifiedUser } from './helpers.js';

const makePosts = (count, source = 'youtube') => Array.from({ length: count }, (_, index) => ({
    source,
    id: `${source}:${index}`,
    text: `Post ${index} from ${source}: I love this desk, it is great.`,
    author: `author-${index}`,
    url: `https://example.com/${source}/${index}`,
    score: index,
    createdAt: new Date(),
}));

const collected = (posts) => ({
    posts,
    used: [{ name: 'youtube', label: 'YouTube', count: posts.length }],
    skipped: [{ name: 'reddit', label: 'Reddit', reason: 'Timed out' }],
});

const insightsCiting = (ids) => ({
    summary: 'People like it.',
    painPoints: [{ title: 'Wobble', detail: 'Shakes.', postIds: ids }],
    wishes: [],
    competitors: [],
    hooks: [{ text: 'Stay still.', basedOn: 'Wobble' }],
    callsToAction: [{ text: 'Try it', basedOn: 'Wobble' }],
});

const newResearch = async (overrides = {}) => {
    const user = await createVerifiedUser();
    return Research.create({ user: user._id, topic: 'standing desks', ...overrides });
};

const silence = () => jest.spyOn(console, 'log').mockImplementation(() => {});

test('the model exports the minimum number of posts and the active statuses', () => {
    expect(MIN_POSTS).toBe(15);
    expect(ACTIVE_STATUSES).toEqual(['queued', 'running']);
});

test('a new research starts queued', async () => {
    const research = await newResearch();
    expect(research.status).toBe('queued');
    expect(research.stage).toBeUndefined();
});

describe('runResearch', () => {
    test('saves the finished report', async () => {
        const research = await newResearch();
        const posts = makePosts(20);
        const collect = jest.fn(async () => collected(posts));
        const write = jest.fn(async () => insightsCiting(['youtube:1', 'youtube:2']));

        await runResearch(research._id, { collect, write });

        const saved = await Research.findById(research._id);
        expect(collect).toHaveBeenCalledWith('standing desks');
        expect(write).toHaveBeenCalledWith('standing desks', posts);
        expect(saved.status).toBe('done');
        expect(saved.stage).toBeUndefined();
        expect(saved.error).toBeUndefined();
        expect(saved.postCount).toBe(20);
        expect(saved.finishedAt).toBeInstanceOf(Date);
        expect(saved.toObject().sourcesUsed).toEqual([{ name: 'youtube', label: 'YouTube', count: 20 }]);
        expect(saved.toObject().sourcesSkipped).toEqual([{ name: 'reddit', label: 'Reddit', reason: 'Timed out' }]);
        expect(saved.report.insightsAvailable).toBe(true);
        expect(saved.report.insights.summary).toBe('People like it.');
        expect(saved.report.insights.painPoints[0].postIds).toEqual(['youtube:1', 'youtube:2']);
        expect(saved.report.sentiment.overall).toEqual({ positive: 20, neutral: 0, negative: 0 });
        expect(saved.report.sentiment.bySource.youtube.positive).toBe(20);
        expect(saved.report.volume).toHaveLength(12);
        expect(saved.report.volume[11].count).toBe(20);
        expect(saved.report.topPosts).toEqual(['youtube:19', 'youtube:18', 'youtube:17']);
    });

    test('stores only the posts the report refers to', async () => {
        const research = await newResearch();
        const collect = async () => collected(makePosts(20));
        const write = async () => insightsCiting(['youtube:1', 'youtube:19']);

        await runResearch(research._id, { collect, write });

        const { evidence } = (await Research.findById(research._id)).report;
        expect(evidence.map((post) => post.id).sort()).toEqual(['youtube:1', 'youtube:17', 'youtube:18', 'youtube:19']);
        expect(evidence[0].text).toContain('I love this desk');
        expect(evidence[0].url).toContain('https://example.com/youtube/');
    });

    test('reports the stage it is in while it works', async () => {
        const research = await newResearch();
        const seen = [];
        const look = async () => {
            const { status, stage } = await Research.findById(research._id);
            seen.push(`${status}/${stage}`);
        };
        const collect = async () => { await look(); return collected(makePosts(20)); };
        const write = async () => { await look(); return insightsCiting(['youtube:1']); };

        await runResearch(research._id, { collect, write });

        expect(seen).toEqual(['running/collecting', 'running/writing']);
    });

    test('fails when too little was found, without asking the model', async () => {
        const research = await newResearch();
        const write = jest.fn();

        await runResearch(research._id, { collect: async () => collected(makePosts(14)), write });

        const saved = await Research.findById(research._id);
        expect(write).not.toHaveBeenCalled();
        expect(saved.status).toBe('failed');
        expect(saved.stage).toBeUndefined();
        expect(saved.error).toBe('Not enough public discussion found for this topic. Try a broader one.');
        expect(saved.postCount).toBe(14);
        expect(saved.finishedAt).toBeInstanceOf(Date);
        expect(saved.report).toBeUndefined();
    });

    test('15 posts are enough', async () => {
        const research = await newResearch();

        await runResearch(research._id, { collect: async () => collected(makePosts(15)), write: async () => insightsCiting(['youtube:1']) });

        expect((await Research.findById(research._id)).status).toBe('done');
    });

    test('finishes without written insights when the model gives nothing', async () => {
        const research = await newResearch();

        await runResearch(research._id, { collect: async () => collected(makePosts(20)), write: async () => null });

        const saved = await Research.findById(research._id);
        expect(saved.status).toBe('done');
        expect(saved.report.insightsAvailable).toBe(false);
        expect(saved.report.insights).toBeUndefined();
        expect(saved.report.sentiment.overall.positive).toBe(20);
        expect(saved.report.volume).toHaveLength(12);
        expect(saved.report.evidence).toHaveLength(3);
    });

    test('finishes without written insights when writing throws', async () => {
        const research = await newResearch();
        const silenced = silence();

        await runResearch(research._id, {
            collect: async () => collected(makePosts(20)),
            write: async () => { throw new Error('unexpected'); },
        });

        silenced.mockRestore();
        const saved = await Research.findById(research._id);
        expect(saved.status).toBe('done');
        expect(saved.report.insightsAvailable).toBe(false);
    });

    test('fails with a general message when collecting throws, and does not reject', async () => {
        const research = await newResearch();
        const silenced = silence();

        await expect(runResearch(research._id, {
            collect: async () => { throw new Error('database detail that must not be shown'); },
            write: async () => null,
        })).resolves.toBeUndefined();

        silenced.mockRestore();
        const saved = await Research.findById(research._id);
        expect(saved.status).toBe('failed');
        expect(saved.error).toBe('Something went wrong while running this research. Please try again.');
    });

    test('an unknown id does nothing and does not reject', async () => {
        const collect = jest.fn();

        await expect(runResearch(new mongoose.Types.ObjectId(), { collect })).resolves.toBeUndefined();

        expect(collect).not.toHaveBeenCalled();
    });

    test('a research that is not queued is left alone', async () => {
        const research = await newResearch({ status: 'done' });
        const collect = jest.fn();

        await runResearch(research._id, { collect });

        expect(collect).not.toHaveBeenCalled();
    });
});

describe('failInterrupted', () => {
    test('fails queued and running researches and leaves the others', async () => {
        const queued = await newResearch();
        const running = await newResearch({ status: 'running', stage: 'collecting' });
        const done = await newResearch({ status: 'done' });
        const failed = await newResearch({ status: 'failed', error: 'Earlier failure' });

        const count = await failInterrupted();

        expect(count).toBe(2);
        for (const research of [queued, running]) {
            const saved = await Research.findById(research._id);
            expect(saved.status).toBe('failed');
            expect(saved.stage).toBeUndefined();
            expect(saved.error).toBe('Interrupted, please run it again');
        }
        expect((await Research.findById(done._id)).status).toBe('done');
        expect((await Research.findById(failed._id)).error).toBe('Earlier failure');
    });
});
