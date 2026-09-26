import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

const initialForm = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  state: '',
  district: '',
  city: '',
  role: 'user',
};

export default function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(() => ({
    ...initialForm,
    role: searchParams.get('role') === 'business' ? 'business' : 'user',
  }));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const registered = await register(form);
      navigate(registered.role === 'business' ? '/business/dashboard' : '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setError('');
    setGoogleSubmitting(true);
    try {
      await googleLogin(credential);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink/55">Join Google Pages to save favorites and write reviews.</p>

        <div className="mt-6">
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={setError} disabled={googleSubmitting || submitting} />
        </div>
        <div className="my-5 flex items-center gap-3 text-xs text-ink/35"><span className="h-px flex-1 bg-line" />OR<span className="h-px flex-1 bg-line" /></div>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-2 gap-4">
          <div className="col-span-2 flex gap-2 rounded border border-line bg-white/50 p-1">
            {[
              { value: 'user', label: "I'm exploring places" },
              { value: 'business', label: 'I own a business' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setForm({ ...form, role: opt.value })}
                className={`flex-1 rounded px-3 py-2 text-sm transition ${
                  form.role === opt.value ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="col-span-2">
            <label className="text-sm text-ink/70">Full name</label>
            <input required value={form.name} onChange={update('name')} className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm text-ink/70">Email</label>
            <input type="email" required value={form.email} onChange={update('email')} className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm text-ink/70">Mobile number</label>
            <input required value={form.mobile} onChange={update('mobile')} placeholder="98765 43210" className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm text-ink/70">Password</label>
            <input type="password" required value={form.password} onChange={update('password')} className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm text-ink/70">Confirm password</label>
            <input type="password" required value={form.confirmPassword} onChange={update('confirmPassword')} className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm text-ink/70">State</label>
            <input required value={form.state} onChange={update('state')} className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm text-ink/70">District</label>
            <input required value={form.district} onChange={update('district')} className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-ink/70">City</label>
            <input required value={form.city} onChange={update('city')} className="mt-1 w-full rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40" />
          </div>

          {error && <p className="col-span-2 text-sm text-vermilion">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 mt-2 rounded bg-ink py-2.5 text-[15px] font-medium text-paper transition hover:bg-ink-light disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/55">
          Already have an account?{' '}
          <Link to="/login" className="text-ink underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
