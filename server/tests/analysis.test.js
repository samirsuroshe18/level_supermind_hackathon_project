import { classify, summariseSentiment } from '../src/analysis/sentiment.js';
import { weeklyVolume } from '../src/analysis/volume.js';
import { topPosts, samplePosts } from '../src/analysis/sample.js';

let counter = 0;

const post = (overrides = {}) => {
    counter += 1;
    return {
        source: 'youtube',
        id: `yt:${counter}`,
        text: 'A neutral statement about a desk.',
        author: 'someone',
        url: `https://example.com/${counter}`,
        score: 0,
        createdAt: new Date('2026-10-06T00:00:00Z'),
        ...overrides,
    };
};

const many = (count, overrides) => Array.from({ length: count }, (_, index) => post(overrides(index)));

describe('sentiment', () => {
    test('classifies positive, negative and neutral text', () => {
        expect(classify('I love this desk, it is fantastic and my back feels great.')).toBe('positive');
        expect(classify('Terrible build quality, it broke and I hate it.')).toBe('negative');
        expect(classify('The desk is 140 centimetres wide.')).toBe('neutral');
    });

    test('text that is empty or not text is neutral', () => {
        expect(classify('')).toBe('neutral');
        expect(classify(undefined)).toBe('neutral');
    });

    test('counts overall and per source', () => {
        const posts = [
            post({ source: 'youtube', text: 'I love it, great product.' }),
            post({ source: 'youtube', text: 'Awful, I hate it.' }),
            post({ source: 'hackerNews', text: 'Great value, excellent support.' }),
            post({ source: 'hackerNews', text: 'It has four legs.' }),
        ];

        expect(summariseSentiment(posts)).toEqual({
            overall: { positive: 2, neutral: 1, negative: 1 },
            bySource: {
                youtube: { positive: 1, neutral: 0, negative: 1 },
                hackerNews: { positive: 1, neutral: 1, negative: 0 },
            },
        });
    });

    test('no posts gives zeros and no sources', () => {
        expect(summariseSentiment([])).toEqual({ overall: { positive: 0, neutral: 0, negative: 0 }, bySource: {} });
    });
});

describe('weekly volume', () => {
    // a Wednesday; its week starts on Monday 5 October
    const now = new Date('2026-10-07T12:00:00Z');

    test('gives 12 weeks, oldest first, ending with the current week', () => {
        const volume = weeklyVolume([], now);

        expect(volume).toHaveLength(12);
        expect(volume[11]).toEqual({ weekStart: '2026-10-05', count: 0 });
        expect(volume[10].weekStart).toBe('2026-09-28');
        expect(volume[0].weekStart).toBe('2026-07-20');
        expect(volume.every((week) => week.count === 0)).toBe(true);
    });

    test('counts each post in the week it was written, weeks starting on Monday', () => {
        const posts = [
            post({ createdAt: new Date('2026-10-05T00:00:00Z') }),
            post({ createdAt: new Date('2026-10-07T09:00:00Z') }),
            post({ createdAt: new Date('2026-10-04T23:59:59Z') }),
            post({ createdAt: new Date('2026-07-20T00:00:00Z') }),
        ];

        const volume = weeklyVolume(posts, now);

        expect(volume[11].count).toBe(2);
        expect(volume[10].count).toBe(1);
        expect(volume[0].count).toBe(1);
    });

    test('ignores posts older than 12 weeks, in the future or without a valid date', () => {
        const posts = [
            post({ createdAt: new Date('2026-07-19T23:59:59Z') }),
            post({ createdAt: new Date('2026-10-20T00:00:00Z') }),
            post({ createdAt: new Date('not a date') }),
            post({ createdAt: undefined }),
        ];

        expect(weeklyVolume(posts, now).reduce((sum, week) => sum + week.count, 0)).toBe(0);
    });
});

describe('top posts', () => {
    test('returns the highest-scored posts of each source', () => {
        const posts = [
            post({ id: 'yt:low', score: 1 }),
            post({ id: 'yt:high', score: 50 }),
            post({ id: 'yt:mid', score: 10 }),
            post({ id: 'hn:only', source: 'hackerNews', score: 3 }),
        ];

        expect(topPosts(posts, 2).map((item) => item.id)).toEqual(['yt:high', 'yt:mid', 'hn:only']);
        expect(topPosts(posts)).toHaveLength(4);
    });
});

describe('sampling', () => {
    test('returns everything when there are fewer posts than the limit', () => {
        const posts = many(30, (index) => ({ score: index }));
        expect(samplePosts(posts)).toHaveLength(30);
    });

    test('gives every source an equal share and hands unused share to the others', () => {
        const youtube = many(200, (index) => ({ source: 'youtube', score: index }));
        const hackerNews = many(10, (index) => ({ source: 'hackerNews', score: index }));

        const sample = samplePosts([...youtube, ...hackerNews], 120);

        const fromYoutube = sample.filter((item) => item.source === 'youtube');
        expect(sample).toHaveLength(120);
        expect(sample.filter((item) => item.source === 'hackerNews')).toHaveLength(10);
        expect(fromYoutube).toHaveLength(110);
        // the 110 highest-scored of the 200
        expect(Math.min(...fromYoutube.map((item) => item.score))).toBe(90);
    });

    test('splits evenly between three large sources', () => {
        const posts = ['youtube', 'hackerNews', 'reddit'].flatMap((source) => many(100, (index) => ({ source, score: index })));

        const sample = samplePosts(posts, 120);

        for (const source of ['youtube', 'hackerNews', 'reddit']) {
            expect(sample.filter((item) => item.source === source)).toHaveLength(40);
        }
    });
});
