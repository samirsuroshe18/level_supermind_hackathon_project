import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { PageSpinner } from './Spinner';

const WAKING = 'Waking the server. The first visit after a quiet spell can take up to a minute.';

// Pages for logged-in users; everyone else is sent to the login page
const ProtectedRoute = ({ children }) => {
  const { user, loading, waking } = useAuth();

  if (loading) return <PageSpinner message={waking ? WAKING : ''} />;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// Login and sign-up make no sense for someone who is already logged in
export const GuestRoute = ({ children }) => {
  const { user, loading, waking } = useAuth();

  if (loading) return <PageSpinner message={waking ? WAKING : ''} />;

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
