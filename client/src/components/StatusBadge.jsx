const STYLES = {
  queued: 'bg-soft text-muted',
  running: 'bg-accent/15 text-accent',
  done: 'bg-positive/15 text-positive',
  failed: 'bg-negative/15 text-negative',
};

const LABELS = { queued: 'Queued', running: 'Running', done: 'Done', failed: 'Failed' };

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status] || STYLES.queued}`}>
    {LABELS[status] || status}
  </span>
);

export default StatusBadge;
