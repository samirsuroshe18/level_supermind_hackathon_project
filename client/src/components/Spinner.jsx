const Spinner = ({ label = 'Loading', className = '' }) => (
  <span role="status" aria-label={label} className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent ${className}`} />
);

// Fills the page while the app finds out who is logged in
export const PageSpinner = () => (
  <div className="flex min-h-dvh items-center justify-center">
    <Spinner className="h-8 w-8" />
  </div>
);

export default Spinner;
