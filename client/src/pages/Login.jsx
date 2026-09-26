import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  // Preserve the page the user originally wanted (e.g. a city+category page)
  // so we can redirect them back after a successful login.
  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login(form.identifier, form.password);
      const roleHome = loggedInUser.role === 'admin' ? '/admin' : loggedInUser.role === 'business' ? '/business/dashboard' : '/dashboard';
      navigate(redirectTo !== '/' ? redirectTo : roleHome, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setError('');
    setGoogleSubmitting(true);
    try {
      const loggedInUser = await googleLogin(credential);
      const roleHome = loggedInUser.role === 'admin' ? '/admin' : loggedInUser.role === 'business' ? '/business/dashboard' : '/dashboard';
      navigate(redirectTo !== '/' ? redirectTo : roleHome, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-3xl border border-white/80 bg-white/85 p-7 shadow-[0_20px_55px_rgba(16,42,67,0.12)] backdrop-blur sm:p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Log in to Google Pages</h1>
        <p className="mt-1 text-sm text-ink/55">Pick up right where you left off.</p>

        <div className="mt-6">
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={setError} disabled={googleSubmitting || submitting} />
        </div>
        <div className="my-5 flex items-center gap-3 text-xs text-ink/35"><span className="h-px flex-1 bg-line" />OR<span className="h-px flex-1 bg-line" /></div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="text-sm text-ink/70">Email or mobile number</label>
            <input
              type="text"
              required
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40"
            />
          </div>
          <div>
            <label className="text-sm text-ink/70">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40"
            />
          </div>

          {error && <p className="text-sm text-vermilion">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-marigold py-2.5 text-[15px] font-medium text-white shadow-sm transition hover:bg-marigold-dark disabled:opacity-60"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <button type="button" onClick={() => { setShowForgot(!showForgot); setError(''); setForgotMessage(''); }} className="mt-4 text-sm text-ink/70 underline underline-offset-2">
          Forgot password?
        </button>

        {showForgot && (
          <form onSubmit={handleForgotPassword} className="mt-4 rounded border border-line bg-white p-4">
            <label className="text-sm text-ink/70">Account email</label>
            <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="mt-1 w-full rounded border border-line px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" />
            <button type="submit" disabled={submitting} className="mt-3 w-full rounded bg-vermilion py-2.5 text-sm font-medium text-paper disabled:opacity-60">
              {submitting ? 'Sending…' : 'Email reset link'}
            </button>
            {forgotMessage && <p className="mt-3 text-sm text-green-700">{forgotMessage}</p>}
          </form>
        )}

        <p className="mt-6 text-sm text-ink/55">
          New to Google Pages?{' '}
          <Link to="/register" className="text-ink underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
