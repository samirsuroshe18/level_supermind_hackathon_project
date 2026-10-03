import { FaHackerNews, FaRedditAlien, FaYoutube } from 'react-icons/fa';
import { formatNumber } from '../utils/format';

const ICONS = { youtube: FaYoutube, hackerNews: FaHackerNews, reddit: FaRedditAlien };

// One pill per source; with a count when the source has been read for a research
const SourceBadges = ({ sources, className = '' }) => (
  <ul className={`flex flex-wrap gap-2 ${className}`}>
    {sources.map((source) => {
      const Icon = ICONS[source.name];

      return (
        <li key={source.name} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink">
          {Icon && <Icon className="text-muted" aria-hidden="true" />}
          {source.label}
          {typeof source.count === 'number' && <span className="text-muted">{formatNumber(source.count)}</span>}
        </li>
      );
    })}
  </ul>
);

export default SourceBadges;
