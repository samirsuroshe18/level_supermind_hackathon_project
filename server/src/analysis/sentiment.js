import Sentiment from 'sentiment';

const analyser = new Sentiment();

// the comparative score is the word score divided by the number of words; values
// close to zero mean the text leans neither way
const THRESHOLD = 0.05;

const classify = (text) => {
    if (typeof text !== 'string' || !text) return 'neutral';

    const { comparative } = analyser.analyze(text);

    if (comparative > THRESHOLD) return 'positive';
    if (comparative < -THRESHOLD) return 'negative';
    return 'neutral';
};

const emptyCounts = () => ({ positive: 0, neutral: 0, negative: 0 });

// How many posts lean each way, overall and for every source
const summariseSentiment = (posts) => {
    const overall = emptyCounts();
    const bySource = {};

    for (const post of posts) {
        const label = classify(post.text);

        bySource[post.source] = bySource[post.source] || emptyCounts();
        bySource[post.source][label] += 1;
        overall[label] += 1;
    }

    return { overall, bySource };
};

export { classify, summariseSentiment }
