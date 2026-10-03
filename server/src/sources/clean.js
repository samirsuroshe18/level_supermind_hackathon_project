const MAX_LENGTH = 600;
const MIN_LENGTH = 20;

// two posts are the same when their text matches apart from case and spacing
const fingerprint = (text) => text.toLowerCase().replace(/\s+/g, ' ');

// Trims every post, drops the ones too short to say anything and removes repeats
const cleanPosts = (posts) => {
    const seen = new Set();
    const cleaned = [];

    for (const post of posts) {
        if (typeof post?.text !== 'string') continue;

        const text = post.text.trim().slice(0, MAX_LENGTH);
        if (text.length < MIN_LENGTH) continue;

        const key = fingerprint(text);
        if (seen.has(key)) continue;

        seen.add(key);
        cleaned.push({ ...post, text });
    }

    return cleaned;
};

export { cleanPosts }
