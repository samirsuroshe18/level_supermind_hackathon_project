import { Research } from '../models/research.model.js';

const DEFAULT_LIMIT = 5;

// researches each user may run per day
const dailyLimit = () => {
    const configured = Number(process.env.DAILY_RESEARCH_LIMIT);
    return Number.isInteger(configured) && configured > 0 ? configured : DEFAULT_LIMIT;
};

// A failed research is free for the user but still costs API quota, so attempts of any
// outcome are capped as well, at this many times the daily limit.
const ATTEMPT_FACTOR = 3;

const attemptLimit = () => dailyLimit() * ATTEMPT_FACTOR;

// the day runs from midnight to midnight UTC
const startOfDay = (now) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

// A failed research is not counted, a deleted one still is.
const usedToday = (userId, now = new Date()) =>
    Research.countDocuments({
        user: userId,
        createdAt: { $gte: startOfDay(now) },
        status: { $ne: 'failed' },
    });

// every research started today, whatever became of it
const attemptsToday = (userId, now = new Date()) =>
    Research.countDocuments({ user: userId, createdAt: { $gte: startOfDay(now) } });

export { dailyLimit, attemptLimit, usedToday, attemptsToday }
