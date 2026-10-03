const Spinner = ({ label = 'Loading', className = '' }) => (
  <span role="status" aria-label={label} className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent ${className}`} />
);

// Fills the page while the app finds out who is logged in
export const PageSpinner = ({ message }) => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
    <Spinner className="h-8 w-8" />
    {message && <p className="max-w-xs text-sm text-muted">{message}</p>}
  </div>
);

export default Spinner;
