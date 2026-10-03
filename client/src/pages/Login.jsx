import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/auth';
import AuthCard from '../components/AuthCard';
import Button from '../components/Button';
import Field from '../components/Field';
import Notice from '../components/Notice';

// seeded by "npm run seed" on the server
const DEMO_ACCOUNT = { email: 'demo@advise.demo', password: 'Demo@123' };

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const signIn = async (credentials) => {
    setError('');
    setSubmitting(true);

    try {
      await login(credentials.email, credentials.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn({ email, password });
  };

  return (
    <AuthCard
      title="Log in"
      subtitle="Pick up your research where you left it."
      footer={<>New here? <Link to="/register" className="font-medium text-accent hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Notice tone="error">{error}</Notice>}

        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-accent hover:underline">Forgot your password?</Link>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm text-muted">Just looking around? The demo account has finished reports to read.</p>
        <Button variant="secondary" className="mt-3 w-full" disabled={submitting} onClick={() => signIn(DEMO_ACCOUNT)}>
          Use the demo account
        </Button>
      </div>
    </AuthCard>
  );
};

export default Login;
