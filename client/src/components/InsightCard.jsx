import { useState } from 'react';
import PostQuote from './PostQuote';

const SHOWN_AT_FIRST = 2;

// One finding (a pain point, a wish or a competitor) with the posts that support it
const InsightCard = ({ title, detail, posts }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? posts : posts.slice(0, SHOWN_AT_FIRST);
  const hidden = posts.length - SHOWN_AT_FIRST;

  return (
    <article className="card flex flex-col p-5">
      <h3 className="text-lg font-semibold leading-snug">{title}</h3>
      {detail && <p className="mt-2 text-sm text-muted">{detail}</p>}

      {shown.length > 0 && (
        <div className="mt-4 space-y-4">
          {shown.map((post) => <PostQuote key={post.id} post={post} clamp />)}
        </div>
      )}

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="mt-4 self-start text-xs font-semibold text-accent hover:underline"
        >
          {expanded ? 'Show fewer posts' : `Show ${hidden} more ${hidden === 1 ? 'post' : 'posts'}`}
        </button>
      )}
    </article>
  );
};

export default InsightCard;
