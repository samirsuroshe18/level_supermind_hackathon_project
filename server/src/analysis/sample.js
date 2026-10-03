const SAMPLE_LIMIT = 120;
const TOP_PER_SOURCE = 3;

// posts of each source, highest score first
const bySourceRanked = (posts) => {
    const groups = new Map();

    for (const post of posts) {
        if (!groups.has(post.source)) groups.set(post.source, []);
        groups.get(post.source).push(post);
    }

    for (const group of groups.values()) {
        group.sort((a, b) => b.score - a.score);
    }

    return groups;
};

// The posts shown as evidence: the highest-scored of every source
const topPosts = (posts, perSource = TOP_PER_SOURCE) =>
    [...bySourceRanked(posts).values()].flatMap((group) => group.slice(0, perSource));

// Picks the posts the language model reads. Every source gets an equal share, so a
// source with thousands of comments cannot drown out the others; a source that has
// fewer posts than its share passes the rest on.
const samplePosts = (posts, limit = SAMPLE_LIMIT) => {
    if (posts.length <= limit) return [...posts];

    let remaining = limit;
    let open = [...bySourceRanked(posts).values()];
    const picked = [];

    // sources that fit entirely are taken first, which frees their unused share
    while (open.length > 0) {
        const share = Math.floor(remaining / open.length);
        const small = open.filter((group) => group.length <= share);

        if (small.length === 0) break;

        for (const group of small) {
            picked.push(...group);
            remaining -= group.length;
        }
        open = open.filter((group) => group.length > share);
    }

    open.forEach((group, index) => {
        const share = Math.floor(remaining / open.length) + (index < remaining % open.length ? 1 : 0);
        picked.push(...group.slice(0, share));
    });

    return picked;
};

export { topPosts, samplePosts }
