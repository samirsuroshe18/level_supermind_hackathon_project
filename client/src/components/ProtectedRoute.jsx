import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { PageSpinner } from './Spinner';

// Pages for logged-in users; everyone else is sent to the login page
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner />;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// Login and sign-up make no sense for someone who is already logged in
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner />;

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
