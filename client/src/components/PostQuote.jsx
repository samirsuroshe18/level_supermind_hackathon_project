import { FiExternalLink } from 'react-icons/fi';
import { formatDate, formatNumber, SCORE_WORDS, SOURCE_LABELS } from '../utils/format';

// A post someone wrote, shown as evidence. The text is always rendered as plain text.
// "clamp" shortens long posts to a few lines; the link leads to the whole post.
const PostQuote = ({ post, clamp = false }) => {
  const details = [
    SOURCE_LABELS[post.source] || post.source,
    post.author,
    post.score > 0 ? `${formatNumber(post.score)} ${SCORE_WORDS[post.source] || 'points'}` : '',
    formatDate(post.createdAt),
  ].filter(Boolean);

  return (
    <figure className="border-l-2 border-accent/50 pl-3">
      <blockquote className={`whitespace-pre-line break-words text-sm text-ink ${clamp ? 'line-clamp-4' : ''}`}>{post.text}</blockquote>
      <figcaption className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <span>{details.join(' · ')}</span>
        {post.url && (
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
            Open post <FiExternalLink aria-hidden="true" />
          </a>
        )}
      </figcaption>
    </figure>
  );
};

export default PostQuote;
