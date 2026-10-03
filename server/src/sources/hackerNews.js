import { withQuery, getJson } from './http.js';

const API = 'https://hn.algolia.com/api/v1/search';
const MAX_HITS = 100;
// the search ranks by relevance over all time; older discussion says little about today
const MAX_AGE_YEARS = 2;

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'", '&#39;': "'", '&#x2F;': '/' };

// Comments arrive as HTML. Paragraph breaks become spaces, every other tag is removed.
const toPlainText = (html) =>
    String(html || '')
        .replace(/<\/?(p|br|pre)\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&(amp|lt|gt|quot|#x27|#39|#x2F);/g, (entity) => ENTITIES[entity])
        .replace(/\s+/g, ' ')
        .trim();

const toPost = (hit) => {
    const text = hit.comment_text
        ? toPlainText(hit.comment_text)
        : [hit.title, toPlainText(hit.story_text)].filter(Boolean).join(' ');

    if (!hit.objectID || !text) return null;

    return {
        source: 'hackerNews',
        id: `hn:${hit.objectID}`,
        text,
        author: hit.author || '',
        url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        score: hit.points || 0,
        createdAt: new Date(hit.created_at),
    };
};

// Recent stories and comments that match the topic
const collect = async (topic, { fetchFn = fetch, signal, now = new Date() } = {}) => {
    const oldest = new Date(now);
    oldest.setUTCFullYear(oldest.getUTCFullYear() - MAX_AGE_YEARS);

    const url = withQuery(API, {
        query: topic,
        tags: '(story,comment)',
        hitsPerPage: MAX_HITS,
        numericFilters: `created_at_i>${Math.floor(oldest.getTime() / 1000)}`,
    });
    const data = await getJson(fetchFn, url, { signal }, 'Hacker News');

    return (data.hits || []).map(toPost).filter(Boolean);
};

export default {
    name: 'hackerNews',
    label: 'Hacker News',
    // the search is public and needs no key
    isEnabled: () => true,
    collect,
}
