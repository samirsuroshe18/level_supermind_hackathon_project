import asyncHandler from '../utils/asynchandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Research, ACTIVE_STATUSES } from '../models/research.model.js';
import { enabledSources } from '../sources/index.js';
import { runResearch } from '../jobs/runResearch.js';
import { attemptLimit, attemptsToday, dailyLimit, usedToday } from '../utils/dailyLimit.js';
import { isValidObjectId } from '../utils/objectId.js';

const TOPIC_MIN = 3;
const TOPIC_MAX = 120;
const HISTORY_LIMIT = 50;
const DUPLICATE_KEY = 11000;
const DELETED_TOPIC = '(deleted)';
const LIST_FIELDS = 'topic status stage error postCount createdAt finishedAt';

const notFound = () => new ApiError(404, "Research not found");
const alreadyRunning = () => new ApiError(409, "A research is already running. Wait for it to finish.");

// A research of the logged-in user. Someone else's research, a deleted one and an id
// that is not an id all look the same from outside.
const findOwn = async (req) => {
    if (!isValidObjectId(req.params.id)) {
        throw notFound();
    }

    const research = await Research.findOne({ _id: req.params.id, user: req.user._id, deletedAt: null });

    if (!research) {
        throw notFound();
    }

    return research;
};

const withoutOwner = (research) => {
    const { user, __v, ...rest } = research.toObject();
    return rest;
};

const getMeta = asyncHandler(async (req, res) => {
    const limit = dailyLimit();
    const [used, attempts] = await Promise.all([usedToday(req.user._id), attemptsToday(req.user._id)]);

    return res.status(200).json(
        new ApiResponse(200, {
            sources: enabledSources().map(({ name, label }) => ({ name, label })),
            dailyLimit: limit,
            remaining: Math.max(0, Math.min(limit - used, attemptLimit() - attempts)),
            topicMaxLength: TOPIC_MAX,
        }, "Research settings")
    );
});

const startResearch = asyncHandler(async (req, res) => {
    const topic = typeof req.body.topic === 'string' ? req.body.topic.trim() : '';

    if (topic.length < TOPIC_MIN || topic.length > TOPIC_MAX) {
        throw new ApiError(400, `Topic must be between ${TOPIC_MIN} and ${TOPIC_MAX} characters`);
    }

    if (await Research.exists({ user: req.user._id, status: { $in: ACTIVE_STATUSES } })) {
        throw alreadyRunning();
    }

    const limit = dailyLimit();

    if (await usedToday(req.user._id) >= limit) {
        throw new ApiError(429, `You have reached today's limit of ${limit} researches. Try again tomorrow.`);
    }

    if (await attemptsToday(req.user._id) >= attemptLimit()) {
        throw new ApiError(429, "Too many attempts today. Try again tomorrow.");
    }

    let research;
    try {
        research = await Research.create({ user: req.user._id, topic });
    } catch (error) {
        // two requests can pass the check above at the same moment; the unique index decides
        if (error.code === DUPLICATE_KEY) {
            throw alreadyRunning();
        }
        throw error;
    }

    // the research goes on after this request has been answered; the app asks for its progress
    runResearch(research._id).catch((error) => console.log(`Research ${research._id} failed: ${error.message}`));

    return res.status(202).json(
        new ApiResponse(202, { id: research._id, status: research.status }, "Research started")
    );
});

const listResearches = asyncHandler(async (req, res) => {
    const researches = await Research.find({ user: req.user._id, deletedAt: null })
        .select(LIST_FIELDS)
        .sort({ createdAt: -1 })
        .limit(HISTORY_LIMIT);

    return res.status(200).json(
        new ApiResponse(200, { researches }, "Researches")
    );
});

const getResearch = asyncHandler(async (req, res) => {
    const research = await findOwn(req);

    return res.status(200).json(
        new ApiResponse(200, { research: withoutOwner(research) }, "Research")
    );
});

const deleteResearch = asyncHandler(async (req, res) => {
    const research = await findOwn(req);

    // every visitor sees the same demo reports
    if (req.user.isDemo) {
        throw new ApiError(403, "The demo account's reports cannot be deleted.");
    }

    if (ACTIVE_STATUSES.includes(research.status)) {
        throw new ApiError(409, "This research is still running. Wait for it to finish.");
    }

    // everything that was found is removed; the empty record keeps the day's count honest
    await Research.updateOne(
        { _id: research._id },
        {
            $set: { topic: DELETED_TOPIC, deletedAt: new Date(), sourcesUsed: [], sourcesSkipped: [] },
            $unset: { report: 1, error: 1, postCount: 1 },
        }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "Research deleted")
    );
});

export {
    getMeta,
    startResearch,
    listResearches,
    getResearch,
    deleteResearch
}
