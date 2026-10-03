import { withQuery, getJson } from './http.js';

const API = 'https://www.googleapis.com/youtube/v3';
const MAX_VIDEOS = 5;
const MAX_COMMENTS = 40;

const toPost = (videoId, thread) => {
    const comment = thread.snippet?.topLevelComment;
    const details = comment?.snippet;

    if (!comment?.id || !details) return null;

    return {
        source: 'youtube',
        id: `yt:${comment.id}`,
        text: details.textDisplay,
        author: details.authorDisplayName || '',
        url: `https://www.youtube.com/watch?v=${videoId}&lc=${comment.id}`,
        score: details.likeCount || 0,
        createdAt: new Date(details.publishedAt),
    };
};

// Comments are switched off on some videos; those answer with an error and are left out
const commentsOf = async (videoId, fetchFn, signal) => {
    const url = withQuery(`${API}/commentThreads`, {
        part: 'snippet',
        videoId,
        maxResults: MAX_COMMENTS,
        order: 'relevance',
        textFormat: 'plainText',
        key: process.env.YOUTUBE_API_KEY,
    });

    try {
        const data = await getJson(fetchFn, url, { signal }, 'YouTube');
        return (data.items || []).map((thread) => toPost(videoId, thread)).filter(Boolean);
    } catch (error) {
        return [];
    }
};

// The most relevant videos for the topic, and the top comments under each
const collect = async (topic, { fetchFn = fetch, signal } = {}) => {
    const searchUrl = withQuery(`${API}/search`, {
        part: 'snippet',
        type: 'video',
        maxResults: MAX_VIDEOS,
        order: 'relevance',
        q: topic,
        key: process.env.YOUTUBE_API_KEY,
    });

    const search = await getJson(fetchFn, searchUrl, { signal }, 'YouTube');
    const videoIds = (search.items || []).map((item) => item.id?.videoId).filter(Boolean);
    const perVideo = await Promise.all(videoIds.map((videoId) => commentsOf(videoId, fetchFn, signal)));

    return perVideo.flat();
};

export default {
    name: 'youtube',
    label: 'YouTube',
    isEnabled: () => Boolean(process.env.YOUTUBE_API_KEY),
    collect,
}
