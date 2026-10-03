import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import AuthCard from '../components/AuthCard';
import Button from '../components/Button';
import Field from '../components/Field';
import Notice from '../components/Notice';
import Spinner from '../components/Spinner';

const MIN_PASSWORD_LENGTH = 6;

// Landing page for the link in the password reset email
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('checking'); // checking | ready | invalid | done
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api.get('/verify/reset-password', { params: { token } })
      .then(() => { if (!cancelled) setStatus('ready'); })
      .catch((err) => {
        if (cancelled) return;
        setError(errorMessage(err));
        setStatus('invalid');
      });

    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/verify/verify-password', { password, confirmPassword }, { params: { token } });
      setStatus('done');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Set a new password">
      {status === 'checking' && <p className="flex items-center gap-3 text-sm text-muted"><Spinner /> Checking your link…</p>}

      {status === 'invalid' && (
        <>
          <Notice tone="error">{error}</Notice>
          <Button to="/forgot-password" variant="secondary" className="mt-5 w-full">Request a new link</Button>
        </>
      )}

      {status === 'done' && (
        <>
          <Notice tone="success">Your password is updated. You can log in with it now.</Notice>
          <Button to="/login" className="mt-5 w-full">Go to login</Button>
        </>
      )}

      {status === 'ready' && (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <Notice tone="error">{error}</Notice>}

          <Field label="New password" type="password" autoComplete="new-password" hint="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Field label="Confirm new password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save new password'}
          </Button>
        </form>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
