import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import AuthCard from '../components/AuthCard';
import Button from '../components/Button';
import Field from '../components/Field';
import Notice from '../components/Notice';

const MIN_PASSWORD_LENGTH = 6;

const Register = () => {
  const [form, setForm] = useState({ userName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // the address the verification link went to, once sign-up has worked
  const [sentTo, setSentTo] = useState('');

  const update = (field) => (e) => setForm((current) => ({ ...current, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/users/register', { userName: form.userName, email: form.email, password: form.password });
      setSentTo(form.email.trim());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <AuthCard title="Check your email" footer={<Link to="/login" className="font-medium text-accent hover:underline">Go to login</Link>}>
        <p className="text-sm text-muted">
          We sent a verification link to <span className="font-medium text-ink break-all">{sentTo}</span>. It is valid
          for 10 minutes. If it does not arrive, log in and a new link is sent.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Five researches a day, free."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-accent hover:underline">Log in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Notice tone="error">{error}</Notice>}

        <Field label="Name" autoComplete="name" maxLength={80} value={form.userName} onChange={update('userName')} required />
        <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={update('email')} required />
        <Field label="Password" type="password" autoComplete="new-password" hint="At least 6 characters" value={form.password} onChange={update('password')} required />
        <Field label="Confirm password" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} required />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  );
};

export default Register;
