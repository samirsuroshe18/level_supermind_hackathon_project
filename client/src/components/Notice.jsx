const TONES = {
  error: 'border-negative/40 bg-negative/10 text-negative',
  success: 'border-positive/40 bg-positive/10 text-positive',
  info: 'border-line bg-soft text-ink',
};

// A short message above or inside a form or section
const Notice = ({ tone = 'info', children, className = '' }) => (
  <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3 py-2.5 text-sm ${TONES[tone]} ${className}`}>
    {children}
  </p>
);

export default Notice;
