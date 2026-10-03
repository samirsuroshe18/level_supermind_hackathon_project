const MONTHS = 12;

// months counted from year zero, so two dates can be compared by subtraction
const monthIndex = (date) => date.getUTCFullYear() * 12 + date.getUTCMonth();

const label = (index) => `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;

// Posts per month for the last 12 months, oldest first; the last entry is the current month
const monthlyVolume = (posts, now = new Date()) => {
    const first = monthIndex(now) - (MONTHS - 1);

    const months = Array.from({ length: MONTHS }, (_, offset) => ({ month: label(first + offset), count: 0 }));

    for (const post of posts) {
        const date = new Date(post.createdAt);
        if (!post.createdAt || Number.isNaN(date.getTime())) continue;

        const offset = monthIndex(date) - first;
        if (offset >= 0 && offset < MONTHS) {
            months[offset].count += 1;
        }
    }

    return months;
};

export { monthlyVolume }
