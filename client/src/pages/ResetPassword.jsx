import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, ...form });
      setMessage(data.message);
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-ink">Create a new password</h1>
        <p className="mt-1 text-sm text-ink/55">Choose a new password for your Google Pages account.</p>
        {!token ? <p className="mt-6 text-sm text-vermilion">This password reset link is missing or invalid.</p> : (
          <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
            <div><label className="text-sm text-ink/70">New password</label><input type="password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" /></div>
            <div><label className="text-sm text-ink/70">Confirm new password</label><input type="password" minLength="8" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" /></div>
            {error && <p className="text-sm text-vermilion">{error}</p>}
            {message && <p className="text-sm text-green-700">{message}</p>}
            <button type="submit" disabled={submitting} className="rounded bg-ink py-2.5 text-[15px] font-medium text-paper disabled:opacity-60">{submitting ? 'Updating…' : 'Update password'}</button>
          </form>
        )}
        <Link to="/login" className="mt-6 inline-block text-sm text-ink underline underline-offset-2">Back to login</Link>
      </div>
    </div>
  );
}
