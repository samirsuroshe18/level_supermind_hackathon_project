const dateFormat = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' });
const monthFormat = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' });
const numberFormat = new Intl.NumberFormat('en');

export const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '');

export const formatDateTime = (value) =>
  (value ? `${dateFormat.format(new Date(value))}, ${timeFormat.format(new Date(value))}` : '');

// "2026-10" becomes "Oct"; January carries the year so a new year is visible on the axis
export const formatMonth = (month) => {
  const [year, number] = month.split('-').map(Number);
  const name = monthFormat.format(new Date(Date.UTC(year, number - 1, 1)));
  return number === 1 ? `${name} ${year}` : name;
};

export const formatNumber = (value) => numberFormat.format(value || 0);

export const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);

export const SOURCE_LABELS = { youtube: 'YouTube', hackerNews: 'Hacker News', reddit: 'Reddit' };

// what a post's score counts, per source
export const SCORE_WORDS = { youtube: 'likes', hackerNews: 'points', reddit: 'upvotes' };
