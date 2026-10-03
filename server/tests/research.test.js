import { jest } from '@jest/globals';
import request from 'supertest';

// the job itself is tested in runResearch.test.js; here it only needs to be started
const runResearch = jest.fn(async () => {});
jest.unstable_mockModule('../src/jobs/runResearch.js', () => ({
    runResearch,
    failInterrupted: jest.fn(async () => 0),
}));

const { default: app } = await import('../src/app.js');
const { Research } = await import('../src/models/research.model.js');
const { createVerifiedUser, loginAgent } = await import('./helpers.js');

const api = '/api/v1/research';
const TOPIC_MESSAGE = 'Topic must be between 3 and 120 characters';
const DAY_MS = 24 * 60 * 60 * 1000;

const login = async () => {
    const user = await createVerifiedUser();
    return { user, agent: await loginAgent(user) };
};

const stored = (user, overrides = {}) => Research.create({ user: user._id, topic: 'earlier topic', status: 'done', ...overrides });

beforeAll(async () => {
    // the rule "one running research per user" is a database index
    await Research.init();
});

beforeEach(() => {
    runResearch.mockClear();
    process.env.YOUTUBE_API_KEY = 'yt-key';
    delete process.env.REDDIT_CLIENT_ID;
    delete process.env.REDDIT_CLIENT_SECRET;
    delete process.env.DAILY_RESEARCH_LIMIT;
});

afterAll(() => {
    delete process.env.YOUTUBE_API_KEY;
});

describe('access', () => {
    test('every route needs a login', async () => {
        const id = '507f1f77bcf86cd799439011';
        const answers = await Promise.all([
            request(app).get(`${api}/meta`),
            request(app).post(api).send({ topic: 'standing desks' }),
            request(app).get(api),
            request(app).get(`${api}/${id}`),
            request(app).delete(`${api}/${id}`),
        ]);

        expect(answers.map((res) => res.status)).toEqual([401, 401, 401, 401, 401]);
        expect(await Research.countDocuments()).toBe(0);
    });
});

describe('meta', () => {
    test('lists the enabled sources and what is left today', async () => {
        const { agent } = await login();

        const res = await agent.get(`${api}/meta`);

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({
            sources: [{ name: 'youtube', label: 'YouTube' }, { name: 'hackerNews', label: 'Hacker News' }],
            dailyLimit: 5,
            remaining: 5,
            topicMaxLength: 120,
        });
    });

    test('what is left goes down with each research and never below zero', async () => {
        const { user, agent } = await login();
        process.env.DAILY_RESEARCH_LIMIT = '2';
        await stored(user);
        await stored(user);
        await stored(user);

        const res = await agent.get(`${api}/meta`);

        expect(res.body.data.dailyLimit).toBe(2);
        expect(res.body.data.remaining).toBe(0);
    });
});

describe('starting a research', () => {
    test('stores it queued, answers 202 and starts the job', async () => {
        const { user, agent } = await login();

        const res = await agent.post(api).send({ topic: '  standing desks  ' });

        expect(res.status).toBe(202);
        const saved = await Research.findOne({ user: user._id });
        expect(res.body.data).toEqual({ id: String(saved._id), status: 'queued' });
        expect(saved.topic).toBe('standing desks');
        expect(saved.status).toBe('queued');
        expect(runResearch).toHaveBeenCalledTimes(1);
        expect(String(runResearch.mock.calls[0][0])).toBe(String(saved._id));
    });

    test('refuses topics that are missing, too short, too long or not text', async () => {
        const { agent } = await login();
        const topics = [undefined, '', '   ', 'ab', '  ab  ', 'x'.repeat(121), 42, { a: 1 }, ['standing desks']];

        for (const topic of topics) {
            const res = await agent.post(api).send({ topic });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe(TOPIC_MESSAGE);
        }

        expect(await Research.countDocuments()).toBe(0);
        expect(runResearch).not.toHaveBeenCalled();
    });

    test('accepts topics of exactly 3 and 120 characters', async () => {
        const first = await login();
        const second = await login();

        expect((await first.agent.post(api).send({ topic: 'abc' })).status).toBe(202);
        expect((await second.agent.post(api).send({ topic: 'x'.repeat(120) })).status).toBe(202);
    });

    test('keeps markup, quotes and emoji in a topic exactly as typed', async () => {
        const { user, agent } = await login();
        const topic = '<script>alert("x")</script> café ☕ & "desks"';

        const res = await agent.post(api).send({ topic });

        expect(res.status).toBe(202);
        expect((await Research.findOne({ user: user._id })).topic).toBe(topic);
    });

    test('a failure of the job never reaches the request', async () => {
        const { agent } = await login();
        const silenced = jest.spyOn(console, 'log').mockImplementation(() => {});
        runResearch.mockRejectedValueOnce(new Error('job crashed'));

        const res = await agent.post(api).send({ topic: 'standing desks' });
        await new Promise((resolve) => setImmediate(resolve));

        silenced.mockRestore();
        expect(res.status).toBe(202);
    });
});

describe('one at a time', () => {
    test('a second research is refused while one is queued or running', async () => {
        const { user, agent } = await login();
        await agent.post(api).send({ topic: 'standing desks' });

        const whileQueued = await agent.post(api).send({ topic: 'another topic' });
        await Research.updateOne({ user: user._id }, { status: 'running', stage: 'collecting' });
        const whileRunning = await agent.post(api).send({ topic: 'another topic' });

        for (const res of [whileQueued, whileRunning]) {
            expect(res.status).toBe(409);
            expect(res.body.message).toBe('A research is already running. Wait for it to finish.');
        }
        expect(await Research.countDocuments()).toBe(1);
    });

    test('a new one can start once the first is finished', async () => {
        const { user, agent } = await login();
        await agent.post(api).send({ topic: 'standing desks' });
        await Research.updateOne({ user: user._id }, { status: 'done' });

        const res = await agent.post(api).send({ topic: 'another topic' });

        expect(res.status).toBe(202);
    });

    test('two requests sent at the same moment start only one research', async () => {
        const { agent } = await login();

        const answers = await Promise.all([
            agent.post(api).send({ topic: 'standing desks' }),
            agent.post(api).send({ topic: 'standing desks' }),
        ]);

        expect(answers.map((res) => res.status).sort()).toEqual([202, 409]);
        expect(await Research.countDocuments()).toBe(1);
        expect(runResearch).toHaveBeenCalledTimes(1);
    });

    test('one user running a research does not block another user', async () => {
        const first = await login();
        const second = await login();
        await first.agent.post(api).send({ topic: 'standing desks' });

        const res = await second.agent.post(api).send({ topic: 'standing desks' });

        expect(res.status).toBe(202);
    });
});

describe('daily limit', () => {
    test('the sixth research of the day is refused', async () => {
        const { user, agent } = await login();
        for (let i = 0; i < 5; i += 1) await stored(user);

        const res = await agent.post(api).send({ topic: 'standing desks' });

        expect(res.status).toBe(429);
        expect(res.body.message).toBe("You have reached today's limit of 5 researches. Try again tomorrow.");
        expect(await Research.countDocuments()).toBe(5);
        expect(runResearch).not.toHaveBeenCalled();
    });

    test('failed researches and those of earlier days do not count', async () => {
        const { user, agent } = await login();
        for (let i = 0; i < 4; i += 1) await stored(user);
        await stored(user, { status: 'failed', error: 'Earlier failure' });
        await stored(user, { createdAt: new Date(Date.now() - DAY_MS - 1000) });

        const meta = await agent.get(`${api}/meta`);
        const res = await agent.post(api).send({ topic: 'standing desks' });

        expect(meta.body.data.remaining).toBe(1);
        expect(res.status).toBe(202);
    });

    test('the limit can be changed with DAILY_RESEARCH_LIMIT', async () => {
        const { user, agent } = await login();
        process.env.DAILY_RESEARCH_LIMIT = '2';
        await stored(user);
        await stored(user);

        const res = await agent.post(api).send({ topic: 'standing desks' });

        expect(res.status).toBe(429);
        expect(res.body.message).toBe("You have reached today's limit of 2 researches. Try again tomorrow.");
    });

    test('a setting that is not a positive number falls back to 5', async () => {
        const { agent } = await login();
        process.env.DAILY_RESEARCH_LIMIT = 'lots';

        expect((await agent.get(`${api}/meta`)).body.data.dailyLimit).toBe(5);
    });

    test("another user's researches do not count", async () => {
        const first = await login();
        const second = await login();
        for (let i = 0; i < 5; i += 1) await stored(first.user);

        expect((await second.agent.post(api).send({ topic: 'standing desks' })).status).toBe(202);
    });
});

describe('reading', () => {
    const report = { insightsAvailable: false, topPosts: ['yt:1'], evidence: [{ id: 'yt:1', source: 'youtube', text: 'A post.' }] };

    test('the list is newest first, only the caller\'s own, and without reports', async () => {
        const { user, agent } = await login();
        const other = await login();
        await stored(user, { topic: 'older', createdAt: new Date(Date.now() - 60000), report, postCount: 30 });
        await stored(user, { topic: 'newer', report });
        await stored(other.user, { topic: 'not mine' });

        const res = await agent.get(api);

        expect(res.status).toBe(200);
        expect(res.body.data.researches.map((item) => item.topic)).toEqual(['newer', 'older']);
        expect(res.body.data.researches[1].postCount).toBe(30);
        expect(res.body.data.researches[0]).not.toHaveProperty('report');
        expect(res.body.data.researches[0]).not.toHaveProperty('user');
    });

    test('one research comes with its report', async () => {
        const { user, agent } = await login();
        const research = await stored(user, { report });

        const res = await agent.get(`${api}/${research._id}`);

        expect(res.status).toBe(200);
        expect(res.body.data.research.topic).toBe('earlier topic');
        expect(res.body.data.research.report.evidence[0].text).toBe('A post.');
        expect(res.body.data.research).not.toHaveProperty('user');
    });

    test("another user's research, an unknown id and a malformed id are all 404", async () => {
        const { agent } = await login();
        const other = await login();
        const theirs = await stored(other.user);

        const answers = await Promise.all([
            agent.get(`${api}/${theirs._id}`),
            agent.get(`${api}/507f1f77bcf86cd799439011`),
            agent.get(`${api}/not-an-id`),
            agent.delete(`${api}/${theirs._id}`),
            agent.delete(`${api}/not-an-id`),
        ]);

        for (const res of answers) {
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Research not found');
        }
        expect(await Research.countDocuments()).toBe(1);
    });
});

describe('deleting', () => {
    test('removes a finished research and everything it found', async () => {
        const { user, agent } = await login();
        const research = await stored(user, {
            report: { insightsAvailable: false, evidence: [{ id: 'yt:1', text: 'A post.' }] },
            sourcesUsed: [{ name: 'youtube', label: 'YouTube', count: 30 }],
        });

        const res = await agent.delete(`${api}/${research._id}`);

        expect(res.status).toBe(200);
        expect((await agent.get(api)).body.data.researches).toEqual([]);
        expect((await agent.get(`${api}/${research._id}`)).status).toBe(404);
        expect((await agent.delete(`${api}/${research._id}`)).status).toBe(404);
        // only an empty record stays, so the day's count cannot be reset by deleting
        const left = await Research.findById(research._id);
        expect(left.report).toBeUndefined();
        expect(left.topic).toBe('(deleted)');
        expect(left.sourcesUsed).toEqual([]);
    });

    test('refuses while the research is still running', async () => {
        const { user, agent } = await login();
        const research = await stored(user, { status: 'running', stage: 'collecting' });

        const res = await agent.delete(`${api}/${research._id}`);

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('This research is still running. Wait for it to finish.');
        expect(await Research.countDocuments()).toBe(1);
    });

    test('a deleted research still counts towards the daily limit', async () => {
        const { user, agent } = await login();
        const research = await stored(user);

        await agent.delete(`${api}/${research._id}`);

        expect((await agent.get(`${api}/meta`)).body.data.remaining).toBe(4);
    });
});

describe('review fixes', () => {
    test('attempts are capped too, so failed researches cannot be repeated without end', async () => {
        const { user, agent } = await login();
        for (let i = 0; i < 15; i += 1) await stored(user, { status: 'failed', error: 'Earlier failure' });

        const meta = await agent.get(`${api}/meta`);
        const res = await agent.post(api).send({ topic: 'standing desks' });

        expect(meta.body.data.remaining).toBe(0);
        expect(res.status).toBe(429);
        expect(res.body.message).toBe('Too many attempts today. Try again tomorrow.');
        expect(runResearch).not.toHaveBeenCalled();
    });

    test('14 failed attempts still leave room for one more', async () => {
        const { user, agent } = await login();
        for (let i = 0; i < 14; i += 1) await stored(user, { status: 'failed', error: 'Earlier failure' });

        expect((await agent.get(`${api}/meta`)).body.data.remaining).toBe(1);
        expect((await agent.post(api).send({ topic: 'standing desks' })).status).toBe(202);
    });

    test('the demo account cannot delete its reports', async () => {
        const user = await createVerifiedUser({ isDemo: true });
        const agent = await loginAgent(user);
        const research = await stored(user, { topic: 'kept for every visitor' });

        const res = await agent.delete(`${api}/${research._id}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("The demo account's reports cannot be deleted.");
        expect((await Research.findById(research._id)).topic).toBe('kept for every visitor');
    });
});
