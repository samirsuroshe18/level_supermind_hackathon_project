// Canned answers of the three public APIs, cut down to the fields that are read.

// Answers by the longest matching URL prefix and records every request.
// A route may be an object ({ status, body }) or a function of the URL.
export const fakeFetch = (routes) => {
    const calls = [];

    const fetchFn = async (url, options = {}) => {
        calls.push({ url: String(url), options });

        const prefix = Object.keys(routes)
            .filter((key) => String(url).startsWith(key))
            .sort((a, b) => b.length - a.length)[0];

        if (!prefix) {
            throw new Error(`No fake answer for ${url}`);
        }

        const route = typeof routes[prefix] === 'function' ? routes[prefix](String(url)) : routes[prefix];
        const status = route.status || 200;

        return { ok: status < 400, status, json: async () => route.body };
    };

    fetchFn.calls = calls;
    return fetchFn;
};

export const YT_SEARCH = 'https://www.googleapis.com/youtube/v3/search';
export const YT_COMMENTS = 'https://www.googleapis.com/youtube/v3/commentThreads';
export const HN_SEARCH = 'https://hn.algolia.com/api/v1/search';
export const REDDIT_TOKEN = 'https://www.reddit.com/api/v1/access_token';
export const REDDIT_SEARCH = 'https://oauth.reddit.com/search';
export const REDDIT_COMMENTS = 'https://oauth.reddit.com/comments/';

const ytComment = (id, text, likes, date) => ({
    id: `thread-${id}`,
    snippet: {
        topLevelComment: {
            id,
            snippet: { textDisplay: text, authorDisplayName: `@viewer-${id}`, likeCount: likes, publishedAt: date },
        },
    },
});

export const youtubeSearch = {
    items: [
        { id: { videoId: 'vidA' }, snippet: { title: 'Video A' } },
        { id: { videoId: 'vidB' }, snippet: { title: 'Video B' } },
        { id: { videoId: 'vidOff' }, snippet: { title: 'Comments disabled' } },
    ],
};

export const youtubeComments = {
    vidA: {
        items: [
            ytComment('a1', 'The motor on mine died after three months, very disappointing.', 12, '2026-09-20T10:00:00Z'),
            ytComment('a2', 'Best purchase I made this year, my back pain is gone.', 40, '2026-09-21T10:00:00Z'),
        ],
    },
    vidB: {
        items: [
            ytComment('b1', 'I wish these came with a proper cable tray out of the box.', 3, '2026-08-01T08:30:00Z'),
            ytComment('b2', 'Wobbles a lot at full height, would not buy again.', 7, '2026-08-02T08:30:00Z'),
        ],
    },
};

export const youtubeRoutes = () => ({
    [YT_SEARCH]: { body: youtubeSearch },
    [YT_COMMENTS]: (url) => {
        const videoId = new URL(url).searchParams.get('videoId');
        return youtubeComments[videoId]
            ? { body: youtubeComments[videoId] }
            : { status: 403, body: { error: { message: 'commentsDisabled' } } };
    },
});

export const hackerNewsSearch = {
    hits: [
        {
            objectID: '101', author: 'pg_fan', points: 250, created_at: '2026-09-10T12:00:00Z',
            title: 'Ask HN: Are standing desks worth it?', story_text: 'I sit ten hours a day and my back hurts.', comment_text: null,
        },
        {
            objectID: '102', author: 'deskjockey', points: null, created_at: '2026-09-10T13:00:00Z',
            title: null, story_text: null,
            comment_text: '<p>I switched last year &amp; it helped.</p><p>The cheap ones <i>wobble</i> though, see <a href="https://example.com">this</a>.</p>',
        },
        {
            objectID: '103', author: 'linker', points: 12, created_at: '2026-09-11T09:00:00Z',
            title: 'Show HN: A standing desk controller that reminds you to stand', story_text: null, comment_text: null,
        },
        {
            objectID: '104', author: null, points: 1, created_at: '2026-09-12T09:00:00Z',
            title: null, story_text: null, comment_text: null,
        },
    ],
};

export const redditToken = { access_token: 'reddit-token', token_type: 'bearer', expires_in: 86400 };

export const redditSearch = {
    data: {
        children: [
            {
                kind: 't3',
                data: {
                    id: 'p1', name: 't3_p1', title: 'Standing desk regrets?', selftext: 'Bought one, barely use it standing.',
                    author: 'redditor1', score: 120, created_utc: 1789000000, permalink: '/r/desks/comments/p1/standing_desk_regrets/',
                },
            },
            {
                kind: 't3',
                data: {
                    id: 'p2', name: 't3_p2', title: 'Which standing desk under $400 is stable?', selftext: '',
                    author: 'redditor2', score: 30, created_utc: 1789100000, permalink: '/r/desks/comments/p2/which_desk/',
                },
            },
        ],
    },
};

export const redditComments = {
    p1: [
        { data: { children: [] } },
        {
            data: {
                children: [
                    {
                        kind: 't1',
                        data: {
                            id: 'c1', name: 't1_c1', body: 'Get an anti-fatigue mat, it changed everything for me.',
                            author: 'commenter1', score: 55, created_utc: 1789000500, permalink: '/r/desks/comments/p1/standing_desk_regrets/c1/',
                        },
                    },
                    { kind: 'more', data: { id: 'more1' } },
                ],
            },
        },
    ],
    p2: [
        { data: { children: [] } },
        { data: { children: [] } },
    ],
};

export const redditRoutes = () => ({
    [REDDIT_TOKEN]: { body: redditToken },
    [REDDIT_SEARCH]: { body: redditSearch },
    [REDDIT_COMMENTS]: (url) => {
        const id = new URL(url).pathname.split('/').pop();
        return { body: redditComments[id] };
    },
});
