import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import AuthCard from '../components/AuthCard';
import Button from '../components/Button';
import Notice from '../components/Notice';
import Spinner from '../components/Spinner';

// Landing page for the link in the verification email
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | verified | failed
  const [message, setMessage] = useState('');
  // the link works once; StrictMode runs effects twice in development
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    api.get('/verify/verify-email', { params: { token } })
      .then(() => setStatus('verified'))
      .catch((err) => {
        setMessage(errorMessage(err));
        setStatus('failed');
      });
  }, [token]);

  return (
    <AuthCard title="Email verification">
      {status === 'verifying' && <p className="flex items-center gap-3 text-sm text-muted"><Spinner /> Verifying…</p>}

      {status === 'verified' && (
        <>
          <Notice tone="success">Your email is verified. You can log in now.</Notice>
          <Button to="/login" className="mt-5 w-full">Go to login</Button>
        </>
      )}

      {status === 'failed' && (
        <>
          <Notice tone="error">{message}</Notice>
          <p className="mt-3 text-sm text-muted">Log in to get a new link.</p>
          <Button to="/login" variant="secondary" className="mt-5 w-full">Go to login</Button>
        </>
      )}
    </AuthCard>
  );
};

export default VerifyEmail;
