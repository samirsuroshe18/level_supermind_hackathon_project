import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import { formatDateTime, formatNumber } from '../utils/format';
import { isActive } from '../hooks/useResearch';
import StatusBadge from './StatusBadge';

// one line under the topic: what happened, or what is happening
const detailOf = (research) => {
  if (research.status === 'failed') return research.error;
  if (research.status === 'done') return `${formatNumber(research.postCount)} posts read`;
  return 'In progress';
};

// The user's researches, newest first. Deleting asks once more in place;
// without onDelete the list is read-only.
const HistoryList = ({ researches, onDelete }) => {
  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const remove = async (id) => {
    setDeleting(id);
    try {
      await onDelete(id);
    } finally {
      setDeleting(null);
      setConfirming(null);
    }
  };

  if (researches.length === 0) {
    return (
      <div className="card border-dashed p-8 text-center">
        <p className="font-display text-lg font-semibold">No research yet</p>
        <p className="mt-1 text-sm text-muted">Your reports are listed here once you start one.</p>
      </div>
    );
  }

  return (
    <ul className="card divide-y divide-line">
      {researches.map((research) => (
        <li key={research._id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <Link to={`/research/${research._id}`} className="group min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="break-words font-semibold group-hover:text-accent">{research.topic}</span>
              <StatusBadge status={research.status} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {formatDateTime(research.createdAt)} · {detailOf(research)}
            </p>
          </Link>

          {confirming === research._id ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">Delete this report?</span>
              <button type="button" disabled={deleting === research._id} onClick={() => remove(research._id)} className="rounded-lg px-2.5 py-1.5 font-semibold text-negative hover:bg-negative/10 disabled:opacity-50">
                {deleting === research._id ? 'Deleting…' : 'Delete'}
              </button>
              <button type="button" onClick={() => setConfirming(null)} className="rounded-lg px-2.5 py-1.5 font-medium text-muted hover:bg-soft">
                Keep
              </button>
            </div>
          ) : (
            onDelete && !isActive(research) && (
              <button
                type="button"
                onClick={() => setConfirming(research._id)}
                aria-label={`Delete the report on ${research.topic}`}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-negative/10 hover:text-negative"
              >
                <FiTrash2 aria-hidden="true" />
              </button>
            )
          )}
        </li>
      ))}
    </ul>
  );
};

export default HistoryList;
