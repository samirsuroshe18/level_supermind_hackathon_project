import { Link } from 'react-router-dom';

// The wordmark: "Vise" sits in a frame, as in the original logo
const Logo = ({ to = '/', className = '' }) => (
  <Link to={to} className={`inline-flex items-center font-display text-xl font-semibold tracking-tight text-ink ${className}`} aria-label="AdVise home">
    <span>Ad</span>
    <span className="ml-0.5 border-2 border-accent px-1 leading-tight text-accent">Vise</span>
  </Link>
);

export default Logo;
