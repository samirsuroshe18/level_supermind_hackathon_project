import { Link } from 'react-router-dom';

const BASE = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS = {
  primary: 'bg-accent text-accent-ink hover:bg-accent/90',
  secondary: 'border border-line bg-surface text-ink hover:bg-soft',
  ghost: 'text-muted hover:bg-soft hover:text-ink',
  danger: 'border border-negative/40 text-negative hover:bg-negative/10',
};

// Renders a link when "to" is given, a button otherwise; both look the same
const Button = ({ variant = 'primary', to, className = '', type = 'button', children, ...rest }) => {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`;

  if (to) {
    return <Link to={to} className={classes} {...rest}>{children}</Link>;
  }

  return <button type={type} className={classes} {...rest}>{children}</button>;
};

export default Button;
