import youtube from './youtube.js';
import hackerNews from './hackerNews.js';
import reddit from './reddit.js';
import { cleanPosts } from './clean.js';

const SOURCE_TIMEOUT_MS = 10000;
const TIMED_OUT = 'Timed out';

const allSources = [youtube, hackerNews, reddit];

// a source without credentials is switched off
const enabledSources = (sources = allSources) => sources.filter((source) => source.isEnabled());

// Runs one source with a time limit. The signal stops its requests; the race makes sure
// the wait ends on time even when a request does not react to the signal.
const runSource = (source, topic, fetchFn, timeoutMs) => {
    const controller = new AbortController();
    let timer;

    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            controller.abort();
            reject(new Error(TIMED_OUT));
        }, timeoutMs);
    });

    const options = { signal: controller.signal };
    if (fetchFn) options.fetchFn = fetchFn;

    return Promise.race([Promise.resolve().then(() => source.collect(topic, options)), timeout])
        .finally(() => clearTimeout(timer));
};

// Asks every source at the same time. A source that fails is skipped and named in the
// result, so one broken service never stops a research.
const collectPosts = async (topic, { sources = enabledSources(), fetchFn, timeoutMs = SOURCE_TIMEOUT_MS } = {}) => {
    const results = await Promise.allSettled(sources.map((source) => runSource(source, topic, fetchFn, timeoutMs)));

    const collected = [];
    const skipped = [];
    const answered = [];

    results.forEach((result, index) => {
        const { name, label } = sources[index];

        if (result.status === 'rejected') {
            const aborted = result.reason?.name === 'AbortError' || result.reason?.name === 'TimeoutError';
            skipped.push({ name, label, reason: aborted ? TIMED_OUT : (result.reason?.message || 'Failed') });
        } else if (!Array.isArray(result.value)) {
            skipped.push({ name, label, reason: 'Unexpected answer' });
        } else {
            answered.push({ name, label });
            collected.push(...result.value.map((post) => ({ ...post, collectedBy: name })));
        }
    });

    const cleaned = cleanPosts(collected);
    const used = answered.map(({ name, label }) => ({
        name,
        label,
        count: cleaned.filter((post) => post.collectedBy === name).length,
    }));

    const posts = cleaned.map(({ collectedBy, ...post }) => post);

    return { posts, used, skipped };
};

export { allSources, enabledSources, collectPosts }
