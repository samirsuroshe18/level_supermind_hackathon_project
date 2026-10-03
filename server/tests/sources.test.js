import youtube from '../src/sources/youtube.js';
import hackerNews from '../src/sources/hackerNews.js';
import reddit from '../src/sources/reddit.js';
import { cleanPosts } from '../src/sources/clean.js';
import { collectPosts, enabledSources } from '../src/sources/index.js';
import {
    fakeFetch, youtubeRoutes, hackerNewsSearch, redditRoutes,
    YT_SEARCH, YT_COMMENTS, HN_SEARCH, REDDIT_TOKEN, REDDIT_SEARCH, REDDIT_COMMENTS,
} from './fixtures/sources.js';

const SOURCE_KEYS = ['YOUTUBE_API_KEY', 'REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET'];

beforeEach(() => {
    process.env.YOUTUBE_API_KEY = 'yt-key';
    process.env.REDDIT_CLIENT_ID = 'reddit-id';
    process.env.REDDIT_CLIENT_SECRET = 'reddit-secret';
});

afterEach(() => {
    SOURCE_KEYS.forEach((key) => delete process.env[key]);
});

const post = (overrides = {}) => ({
    source: 'youtube',
    id: 'yt:1',
    text: 'A comment that is long enough to be kept.',
    author: 'someone',
    url: 'https://example.com/1',
    score: 1,
    createdAt: new Date('2026-09-01T00:00:00Z'),
    ...overrides,
});

// a source that is not one of the real ones, for collectPosts
const fakeSource = (name, behaviour, enabled = true) => ({
    name,
    label: name.toUpperCase(),
    isEnabled: () => enabled,
    collect: behaviour,
});

describe('youtube', () => {
    test('maps comments to the common post shape', async () => {
        const posts = await youtube.collect('standing desks', { fetchFn: fakeFetch(youtubeRoutes()) });

        expect(posts).toHaveLength(4);
        expect(posts[0]).toEqual({
            source: 'youtube',
            id: 'yt:a1',
            text: 'The motor on mine died after three months, very disappointing.',
            author: '@viewer-a1',
            url: 'https://www.youtube.com/watch?v=vidA&lc=a1',
            score: 12,
            createdAt: new Date('2026-09-20T10:00:00Z'),
        });
        expect(posts[0].createdAt).toBeInstanceOf(Date);
    });

    test('skips a video whose comments are disabled', async () => {
        const fetchFn = fakeFetch(youtubeRoutes());

        const posts = await youtube.collect('standing desks', { fetchFn });

        expect(fetchFn.calls.filter((call) => call.url.startsWith(YT_COMMENTS))).toHaveLength(3);
        expect(posts.map((item) => item.id)).toEqual(['yt:a1', 'yt:a2', 'yt:b1', 'yt:b2']);
    });

    test('sends the topic URL-encoded and asks for 5 videos and 40 comments', async () => {
        const fetchFn = fakeFetch(youtubeRoutes());
        const topic = 'c++ & "rust"';

        await youtube.collect(topic, { fetchFn });

        const search = new URL(fetchFn.calls[0].url);
        expect(fetchFn.calls[0].url).toContain(`q=${encodeURIComponent(topic)}`);
        expect(search.searchParams.get('q')).toBe(topic);
        expect(search.searchParams.get('maxResults')).toBe('5');
        expect(search.searchParams.get('type')).toBe('video');
        expect(search.searchParams.get('key')).toBe('yt-key');
        expect(new URL(fetchFn.calls[1].url).searchParams.get('maxResults')).toBe('40');
    });

    test('returns no posts when the response has no items', async () => {
        const posts = await youtube.collect('nothing', { fetchFn: fakeFetch({ [YT_SEARCH]: { body: {} } }) });
        expect(posts).toEqual([]);
    });

    test('fails when the search itself is refused', async () => {
        const fetchFn = fakeFetch({ [YT_SEARCH]: { status: 403, body: { error: { message: 'quotaExceeded' } } } });
        await expect(youtube.collect('desks', { fetchFn })).rejects.toThrow('YouTube answered 403');
    });
});

describe('hacker news', () => {
    test('maps stories and comments and strips HTML', async () => {
        const fetchFn = fakeFetch({ [HN_SEARCH]: { body: hackerNewsSearch } });

        const posts = await hackerNews.collect('standing desks', { fetchFn });

        expect(posts).toHaveLength(3);
        expect(posts[0]).toEqual({
            source: 'hackerNews',
            id: 'hn:101',
            text: 'Ask HN: Are standing desks worth it? I sit ten hours a day and my back hurts.',
            author: 'pg_fan',
            url: 'https://news.ycombinator.com/item?id=101',
            score: 250,
            createdAt: new Date('2026-09-10T12:00:00Z'),
        });
        expect(posts[1].text).toBe('I switched last year & it helped. The cheap ones wobble though, see this.');
        expect(posts[1].score).toBe(0);
        expect(posts[2].text).toBe('Show HN: A standing desk controller that reminds you to stand');

        const url = new URL(fetchFn.calls[0].url);
        expect(url.searchParams.get('query')).toBe('standing desks');
        expect(url.searchParams.get('tags')).toBe('(story,comment)');
        expect(url.searchParams.get('hitsPerPage')).toBe('100');
    });

    test('only asks for posts of the last 24 months', async () => {
        const fetchFn = fakeFetch({ [HN_SEARCH]: { body: hackerNewsSearch } });
        const now = new Date('2026-10-07T12:00:00Z');

        await hackerNews.collect('standing desks', { fetchFn, now });

        const filter = new URL(fetchFn.calls[0].url).searchParams.get('numericFilters');
        expect(filter).toBe(`created_at_i>${Date.UTC(2024, 9, 7, 12) / 1000}`);
    });

    test('returns no posts when the response has no hits', async () => {
        const posts = await hackerNews.collect('nothing', { fetchFn: fakeFetch({ [HN_SEARCH]: { body: {} } }) });
        expect(posts).toEqual([]);
    });
});

describe('reddit', () => {
    test('fetches a token, then posts and top comments', async () => {
        const fetchFn = fakeFetch(redditRoutes());

        const posts = await reddit.collect('standing desks', { fetchFn });

        const [tokenCall, searchCall] = fetchFn.calls;
        expect(tokenCall.url).toBe(REDDIT_TOKEN);
        expect(tokenCall.options.method).toBe('POST');
        expect(tokenCall.options.headers.Authorization).toBe(`Basic ${Buffer.from('reddit-id:reddit-secret').toString('base64')}`);
        expect(searchCall.url.startsWith(REDDIT_SEARCH)).toBe(true);
        expect(searchCall.options.headers.Authorization).toBe('Bearer reddit-token');
        expect(searchCall.options.headers['User-Agent']).toBe('web:advise:1.0');
        expect(new URL(searchCall.url).searchParams.get('limit')).toBe('50');
        expect(fetchFn.calls.filter((call) => call.url.startsWith(REDDIT_COMMENTS))).toHaveLength(2);

        expect(posts.map((item) => item.id)).toEqual(['rd:t3_p1', 'rd:t3_p2', 'rd:t1_c1']);
        expect(posts[0]).toEqual({
            source: 'reddit',
            id: 'rd:t3_p1',
            text: 'Standing desk regrets? Bought one, barely use it standing.',
            author: 'redditor1',
            url: 'https://www.reddit.com/r/desks/comments/p1/standing_desk_regrets/',
            score: 120,
            createdAt: new Date(1789000000 * 1000),
        });
        expect(posts[2].text).toBe('Get an anti-fatigue mat, it changed everything for me.');
    });
});

describe('enabled sources', () => {
    test('reddit is disabled without credentials; hacker news is always enabled', () => {
        delete process.env.REDDIT_CLIENT_SECRET;
        delete process.env.YOUTUBE_API_KEY;

        expect(reddit.isEnabled()).toBe(false);
        expect(youtube.isEnabled()).toBe(false);
        expect(hackerNews.isEnabled()).toBe(true);
        expect(enabledSources().map((source) => source.name)).toEqual(['hackerNews']);
    });

    test('all three are enabled when their credentials are set', () => {
        expect(enabledSources().map((source) => source.name)).toEqual(['youtube', 'hackerNews', 'reddit']);
    });
});

describe('cleanPosts', () => {
    test('trims text to 600 characters, drops posts under 20 characters and removes duplicates', () => {
        const long = post({ id: 'yt:long', text: 'x'.repeat(700) });
        const short = post({ id: 'yt:short', text: 'too short' });
        const original = post({ id: 'yt:orig', text: 'This desk   wobbles at\nfull height.' });
        const duplicate = post({ id: 'hn:dup', source: 'hackerNews', text: 'this desk wobbles at full HEIGHT.' });
        const padded = post({ id: 'yt:pad', text: '   Surrounded by spaces but long enough.   ' });

        const cleaned = cleanPosts([long, short, original, duplicate, padded]);

        expect(cleaned.map((item) => item.id)).toEqual(['yt:long', 'yt:orig', 'yt:pad']);
        expect(cleaned[0].text).toHaveLength(600);
        expect(cleaned[2].text).toBe('Surrounded by spaces but long enough.');
    });

    test('drops posts whose text is missing or not text', () => {
        expect(cleanPosts([post({ text: undefined }), post({ text: 42 }), post({ text: null })])).toEqual([]);
    });
});

describe('collectPosts', () => {
    test('reports each source and its count after cleaning', async () => {
        const one = fakeSource('one', async () => [post({ id: 'a' , text: 'First post that is long enough.' }), post({ id: 'b', text: 'short' })]);
        const two = fakeSource('two', async () => [post({ id: 'c', source: 'two', text: 'Second post that is long enough.' })]);

        const result = await collectPosts('desks', { sources: [one, two] });

        expect(result.posts.map((item) => item.id)).toEqual(['a', 'c']);
        expect(result.used).toEqual([
            { name: 'one', label: 'ONE', count: 1 },
            { name: 'two', label: 'TWO', count: 1 },
        ]);
        expect(result.skipped).toEqual([]);
    });

    test('skips a source that throws and gives the reason', async () => {
        const good = fakeSource('good', async () => [post()]);
        const bad = fakeSource('bad', async () => { throw new Error('YouTube answered 403'); });

        const result = await collectPosts('desks', { sources: [good, bad] });

        expect(result.posts).toHaveLength(1);
        expect(result.used).toEqual([{ name: 'good', label: 'GOOD', count: 1 }]);
        expect(result.skipped).toEqual([{ name: 'bad', label: 'BAD', reason: 'YouTube answered 403' }]);
    });

    test('skips a source that takes longer than the timeout', async () => {
        const slow = fakeSource('slow', () => new Promise((resolve) => setTimeout(() => resolve([post()]), 300)));
        const fast = fakeSource('fast', async () => [post({ id: 'f' })]);

        const result = await collectPosts('desks', { sources: [slow, fast], timeoutMs: 50 });

        expect(result.used.map((source) => source.name)).toEqual(['fast']);
        expect(result.skipped).toEqual([{ name: 'slow', label: 'SLOW', reason: 'Timed out' }]);
    });

    test('a source that answers with something other than a list is skipped', async () => {
        const odd = fakeSource('odd', async () => ({ not: 'a list' }));

        const result = await collectPosts('desks', { sources: [odd] });

        expect(result.posts).toEqual([]);
        expect(result.skipped).toEqual([{ name: 'odd', label: 'ODD', reason: 'Unexpected answer' }]);
    });

    test('a source with no posts counts as used with zero', async () => {
        const empty = fakeSource('empty', async () => []);

        const result = await collectPosts('desks', { sources: [empty] });

        expect(result.used).toEqual([{ name: 'empty', label: 'EMPTY', count: 0 }]);
    });

    test('passes the topic, the fetch function and an abort signal to each source', async () => {
        const seen = [];
        const fetchFn = async () => ({});
        const spy = fakeSource('spy', async (topic, options) => { seen.push({ topic, options }); return []; });

        await collectPosts('standing desks', { sources: [spy], fetchFn });

        expect(seen[0].topic).toBe('standing desks');
        expect(seen[0].options.fetchFn).toBe(fetchFn);
        expect(seen[0].options.signal).toBeInstanceOf(AbortSignal);
    });

    test('only uses enabled sources by default', async () => {
        delete process.env.YOUTUBE_API_KEY;
        delete process.env.REDDIT_CLIENT_ID;
        const fetchFn = fakeFetch({ [HN_SEARCH]: { body: hackerNewsSearch } });

        const result = await collectPosts('standing desks', { fetchFn });

        expect(result.used).toEqual([{ name: 'hackerNews', label: 'Hacker News', count: 3 }]);
        expect(fetchFn.calls.every((call) => call.url.startsWith(HN_SEARCH))).toBe(true);
    });
});

describe('review fixes', () => {
    test('cleanPosts replaces a missing or invalid date with null', () => {
        const cleaned = cleanPosts([
            post({ id: 'a', text: 'First post that is long enough.', createdAt: new Date('not a date') }),
            post({ id: 'b', text: 'Second post that is long enough.', createdAt: undefined }),
            post({ id: 'c', text: 'Third post that is long enough.' }),
        ]);

        expect(cleaned.map((item) => item.createdAt)).toEqual([null, null, new Date('2026-09-01T00:00:00Z')]);
    });

    test('a source that answers 200 with a body that is not JSON is skipped', async () => {
        const fetchFn = async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token <'); } });

        const result = await collectPosts('desks', { sources: [hackerNews], fetchFn });

        expect(result.posts).toEqual([]);
        expect(result.skipped).toEqual([{ name: 'hackerNews', label: 'Hacker News', reason: 'Unexpected token <' }]);
    });
});
