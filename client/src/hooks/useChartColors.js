import { useMemo } from 'react';
import { useTheme } from '../context/theme';

const NAMES = ['text', 'muted', 'border', 'surface', 'accent', 'positive', 'neutral', 'negative'];

// Charts are drawn on a canvas and cannot use CSS classes, so the theme's colours are
// read from the CSS variables. Reading again when the theme changes redraws the charts.
const useChartColors = () => {
  const { theme } = useTheme();

  return useMemo(() => {
    const styles = getComputedStyle(document.documentElement);
    const colors = { theme };

    for (const name of NAMES) {
      colors[name] = `rgb(${styles.getPropertyValue(`--${name}`).trim().split(/\s+/).join(', ')})`;
    }

    return colors;
  }, [theme]);
};

export default useChartColors;
