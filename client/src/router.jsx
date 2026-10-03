import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import Team from './pages/Team';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  {
    // every page can ask who is logged in
    element: <AuthProvider><Outlet /></AuthProvider>,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/login', element: <GuestRoute><Login /></GuestRoute> },
      { path: '/register', element: <GuestRoute><Register /></GuestRoute> },
      { path: '/verify-email', element: <VerifyEmail /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
      {
        element: <ProtectedRoute><AppShell /></ProtectedRoute>,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/research/:id', element: <Report /> },
          { path: '/team', element: <Team /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
