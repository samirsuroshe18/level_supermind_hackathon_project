import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import useChartColors from '../hooks/useChartColors';
import { formatNumber, percent, SOURCE_LABELS } from '../utils/format';

ChartJS.register(ArcElement, Tooltip);

const TONES = [
  { key: 'positive', label: 'Positive', bar: 'bg-positive' },
  { key: 'neutral', label: 'Neutral', bar: 'bg-neutral' },
  { key: 'negative', label: 'Negative', bar: 'bg-negative' },
];

const totalOf = (counts) => TONES.reduce((sum, tone) => sum + (counts[tone.key] || 0), 0);

// one source's split as a single stacked bar
const SourceBar = ({ name, counts }) => {
  const total = totalOf(counts);

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span className="font-medium text-ink">{SOURCE_LABELS[name] || name}</span>
        <span>{formatNumber(total)} posts</span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-soft" role="img"
        aria-label={TONES.map((tone) => `${percent(counts[tone.key], total)}% ${tone.label.toLowerCase()}`).join(', ')}>
        {TONES.map((tone) => (
          <span key={tone.key} className={tone.bar} style={{ width: `${total > 0 ? (counts[tone.key] / total) * 100 : 0}%` }} />
        ))}
      </div>
    </div>
  );
};

// How the posts lean: a ring for all of them, and a bar for each source
const SentimentChart = ({ sentiment }) => {
  const colors = useChartColors();
  const { overall, bySource } = sentiment;
  const total = totalOf(overall);

  const data = {
    labels: TONES.map((tone) => tone.label),
    datasets: [{
      data: TONES.map((tone) => overall[tone.key]),
      backgroundColor: TONES.map((tone) => colors[tone.key]),
      borderColor: colors.surface,
      borderWidth: 3,
    }],
  };

  const options = {
    cutout: '68%',
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <div className="grid gap-6 sm:grid-cols-[11rem_1fr] sm:items-center">
      <div className="relative mx-auto h-44 w-44">
        {/* the theme is part of the key so the ring is redrawn in the new colours */}
        <Doughnut key={colors.theme} data={data} options={options} aria-label="Sentiment of all posts" role="img" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-semibold">{percent(overall.positive, total)}%</span>
          <span className="text-xs text-muted">positive</span>
        </div>
      </div>

      <div className="space-y-5">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {TONES.map((tone) => (
            <li key={tone.key} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${tone.bar}`} aria-hidden="true" />
              <span className="text-muted">{tone.label}</span>
              <span className="font-semibold">{formatNumber(overall[tone.key])}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          {Object.entries(bySource || {}).map(([name, counts]) => <SourceBar key={name} name={name} counts={counts} />)}
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;
