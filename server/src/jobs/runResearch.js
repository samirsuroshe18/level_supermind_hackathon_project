import { Research, ACTIVE_STATUSES, MIN_POSTS } from '../models/research.model.js';
import { collectPosts } from '../sources/index.js';
import { summariseSentiment } from '../analysis/sentiment.js';
import { weeklyVolume } from '../analysis/volume.js';
import { topPosts } from '../analysis/sample.js';
import { writeInsights } from '../analysis/insights.js';

const TOO_FEW_POSTS = 'Not enough public discussion found for this topic. Try a broader one.';
const GENERAL_FAILURE = 'Something went wrong while running this research. Please try again.';
const INTERRUPTED = 'Interrupted, please run it again';

const setStage = (id, stage) => Research.updateOne({ _id: id }, { $set: { stage } });

const finish = (id, changes) =>
    Research.updateOne({ _id: id }, { $set: { ...changes, finishedAt: new Date() }, $unset: { stage: 1 } });

// the model is one outside service among several; without it the computed parts still stand
const tryToWrite = async (write, topic, posts) => {
    try {
        return await write(topic, posts);
    } catch (error) {
        console.log(`Writing insights failed: ${error.message}`);
        return null;
    }
};

// only posts the report points at are kept
const evidenceFor = (posts, insights, topIds) => {
    const cited = insights
        ? [...insights.painPoints, ...insights.wishes, ...insights.competitors].flatMap((item) => item.postIds)
        : [];
    const wanted = new Set([...cited, ...topIds]);

    return posts.filter((post) => wanted.has(post.id));
};

// Runs one queued research from start to finish and saves the outcome. It is started
// without being awaited, so it must never throw: every failure ends as a failed research.
const runResearch = async (researchId, { collect = collectPosts, write = writeInsights } = {}) => {
    try {
        // claiming the research in one step means it can never be run twice
        const research = await Research.findOneAndUpdate(
            { _id: researchId, status: 'queued' },
            { $set: { status: 'running', stage: 'collecting' } },
            { new: true }
        );

        if (!research) return;

        const { posts, used, skipped } = await collect(research.topic);
        const found = { sourcesUsed: used, sourcesSkipped: skipped, postCount: posts.length };

        if (posts.length < MIN_POSTS) {
            await finish(researchId, { ...found, status: 'failed', error: TOO_FEW_POSTS });
            return;
        }

        await setStage(researchId, 'analysing');
        const sentiment = summariseSentiment(posts);
        const volume = weeklyVolume(posts);
        const topIds = topPosts(posts).map((post) => post.id);

        await setStage(researchId, 'writing');
        const insights = await tryToWrite(write, research.topic, posts);

        const report = {
            sentiment,
            volume,
            topPosts: topIds,
            insightsAvailable: Boolean(insights),
            evidence: evidenceFor(posts, insights, topIds),
        };
        if (insights) report.insights = insights;

        await finish(researchId, { ...found, status: 'done', report });
    } catch (error) {
        console.log(`Research ${researchId} failed: ${error.message}`);
        await finish(researchId, { status: 'failed', error: GENERAL_FAILURE }).catch(() => {});
    }
};

// A research runs inside the server process, so a restart loses whatever was in
// progress. Called at startup, this marks those researches as failed instead of
// leaving them waiting for ever.
const failInterrupted = async () => {
    const result = await Research.updateMany(
        { status: { $in: ACTIVE_STATUSES } },
        { $set: { status: 'failed', error: INTERRUPTED, finishedAt: new Date() }, $unset: { stage: 1 } }
    );

    return result.modifiedCount;
};

export { runResearch, failInterrupted }
