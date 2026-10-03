import { Research } from '../models/research.model.js';

const DEFAULT_LIMIT = 5;

// researches each user may run per day
const dailyLimit = () => {
    const configured = Number(process.env.DAILY_RESEARCH_LIMIT);
    return Number.isInteger(configured) && configured > 0 ? configured : DEFAULT_LIMIT;
};

// The day runs from midnight to midnight UTC. A failed research is not counted,
// a deleted one still is.
const usedToday = (userId, now = new Date()) => {
    const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    return Research.countDocuments({
        user: userId,
        createdAt: { $gte: dayStart },
        status: { $ne: 'failed' },
    });
};

export { dailyLimit, usedToday }
