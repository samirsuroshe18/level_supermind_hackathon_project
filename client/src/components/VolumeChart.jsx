import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import useChartColors from '../hooks/useChartColors';
import { formatMonth } from '../utils/format';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

// Posts per month over the last twelve months
const VolumeChart = ({ volume }) => {
  const colors = useChartColors();

  const data = {
    labels: volume.map((entry) => formatMonth(entry.month)),
    datasets: [{
      label: 'Posts',
      data: volume.map((entry) => entry.count),
      backgroundColor: colors.accent,
      borderRadius: 4,
      maxBarThickness: 28,
    }],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: colors.muted }, border: { color: colors.border } },
      y: { beginAtZero: true, grid: { color: colors.border }, ticks: { color: colors.muted, precision: 0 }, border: { display: false } },
    },
  };

  const total = volume.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="h-56">
      <Bar key={colors.theme} data={data} options={options} role="img" aria-label={`Posts per month over the last 12 months, ${total} in total`} />
    </div>
  );
};

export default VolumeChart;
