import { useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { errorMessage } from '../api/client';
import { startResearch } from '../api/research';
import Button from './Button';
import Notice from './Notice';
import SourceBadges from './SourceBadges';

const TOPIC_MIN = 3;
const EXAMPLES = ['noise cancelling headphones', 'protein powder', 'electric scooters'];

// Starts a research. "meta" says which sources are on and how many researches are left;
// "busy" is true while another research of this user is still running.
const ResearchForm = ({ meta, busy, onStarted }) => {
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // state alone is too slow to stop a double click; the ref is set at once
  const sending = useRef(false);

  const maxLength = meta?.topicMaxLength || 120;
  const noneLeft = meta ? meta.remaining <= 0 : false;
  const trimmed = topic.trim();
  const disabled = submitting || busy || noneLeft || !meta;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending.current || disabled) return;

    if (trimmed.length < TOPIC_MIN) {
      setError(`Topic must be between ${TOPIC_MIN} and ${maxLength} characters`);
      return;
    }

    sending.current = true;
    setSubmitting(true);
    setError('');

    try {
      const { id } = await startResearch(trimmed);
      onStarted(id);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
      sending.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6" noValidate>
      <label htmlFor="topic" className="block text-lg font-semibold font-display">What do you want to research?</label>
      <p className="mt-1 text-sm text-muted">A product, a niche or a question. Broad topics find more posts.</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="topic"
            type="text"
            value={topic}
            maxLength={maxLength}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="standing desks"
            autoComplete="off"
            className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-16 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted" aria-hidden="true">
            {topic.length}/{maxLength}
          </span>
        </div>
        <Button type="submit" disabled={disabled} className="sm:w-40">
          {submitting ? 'Starting…' : 'Start research'}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>Try:</span>
        {EXAMPLES.map((example) => (
          <button key={example} type="button" onClick={() => setTopic(example)} className="rounded-full border border-line px-2.5 py-1 hover:border-accent hover:text-accent">
            {example}
          </button>
        ))}
      </div>

      {error && <Notice tone="error" className="mt-4">{error}</Notice>}
      {!error && busy && <Notice className="mt-4">A research is running. You can start the next one when it finishes.</Notice>}
      {!error && !busy && noneLeft && <Notice className="mt-4">You have used all {meta.dailyLimit} researches for today. The count resets at midnight UTC.</Notice>}

      {meta && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Reads from</span>
            <SourceBadges sources={meta.sources} />
          </div>
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{meta.remaining} of {meta.dailyLimit}</span> left today
          </p>
        </div>
      )}
    </form>
  );
};

export default ResearchForm;
