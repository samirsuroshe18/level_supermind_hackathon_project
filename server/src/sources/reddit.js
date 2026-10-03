import { withQuery, getJson } from './http.js';

const TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const API = 'https://oauth.reddit.com';
const USER_AGENT = 'web:advise:1.0';
const MAX_POSTS = 50;
const POSTS_WITH_COMMENTS = 5;
const MAX_COMMENTS = 10;

const toPost = (item) => {
    const data = item?.data;
    const text = item?.kind === 't1' ? data?.body : [data?.title, data?.selftext].filter(Boolean).join(' ');

    if (!data?.name || !text) return null;

    return {
        source: 'reddit',
        id: `rd:${data.name}`,
        text,
        author: data.author || '',
        url: `https://www.reddit.com${data.permalink}`,
        score: data.score || 0,
        createdAt: new Date(data.created_utc * 1000),
    };
};

// An application-only token; no Reddit user is involved
const getToken = async (fetchFn, signal) => {
    const credentials = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64');

    const data = await getJson(fetchFn, TOKEN_URL, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': USER_AGENT,
        },
        body: 'grant_type=client_credentials',
        signal,
    }, 'Reddit');

    return data.access_token;
};

// The answer is [post listing, comment listing]; "load more" stubs are not comments
const commentsOf = async (postId, request) => {
    try {
        const data = await request(withQuery(`${API}/comments/${postId}`, { limit: MAX_COMMENTS, sort: 'top', depth: 1 }));
        const children = data?.[1]?.data?.children || [];
        return children.filter((child) => child.kind === 't1').map(toPost).filter(Boolean);
    } catch (error) {
        return [];
    }
};

// Posts that match the topic, and the top comments of the highest-scored ones
const collect = async (topic, { fetchFn = fetch, signal } = {}) => {
    const token = await getToken(fetchFn, signal);
    const request = (url) => getJson(fetchFn, url, {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': USER_AGENT },
        signal,
    }, 'Reddit');

    const search = await request(withQuery(`${API}/search`, { q: topic, limit: MAX_POSTS, sort: 'relevance', t: 'year' }));
    const children = (search.data?.children || []).filter((child) => child.kind === 't3');

    const mostDiscussed = [...children]
        .sort((a, b) => (b.data.score || 0) - (a.data.score || 0))
        .slice(0, POSTS_WITH_COMMENTS);
    const comments = await Promise.all(mostDiscussed.map((child) => commentsOf(child.data.id, request)));

    return [...children.map(toPost).filter(Boolean), ...comments.flat()];
};

export default {
    name: 'reddit',
    label: 'Reddit',
    isEnabled: () => Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET),
    collect,
}
