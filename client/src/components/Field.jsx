import { useId } from 'react';

// A labelled input. Extra props go to the input itself.
const Field = ({ label, hint, className = '', ...input }) => {
  const id = useId();

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <input
        id={id}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        {...input}
      />
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
};

export default Field;
