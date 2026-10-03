const WEEKS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

// Monday 00:00 UTC of the week a date falls in
const weekStartOf = (date) => {
    const midnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;

    return midnight - daysSinceMonday * DAY_MS;
};

// Posts per week for the last 12 weeks, oldest first; the last entry is the current week
const weeklyVolume = (posts, now = new Date()) => {
    const currentWeek = weekStartOf(now);
    const firstWeek = currentWeek - (WEEKS - 1) * WEEK_MS;

    const weeks = Array.from({ length: WEEKS }, (_, index) => ({
        weekStart: new Date(firstWeek + index * WEEK_MS).toISOString().slice(0, 10),
        count: 0,
    }));

    for (const post of posts) {
        const time = new Date(post.createdAt).getTime();
        if (Number.isNaN(time) || !post.createdAt) continue;

        const index = Math.floor((time - firstWeek) / WEEK_MS);
        if (index >= 0 && index < WEEKS) {
            weeks[index].count += 1;
        }
    }

    return weeks;
};

export { weeklyVolume }
