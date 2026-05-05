'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight } from 'lucide-react';

export function AuthCard({ initialTab, callbackUrl }: { initialTab: 'login' | 'register'; callbackUrl?: string }) {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tab === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Registration failed');
      }

      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) throw new Error('Invalid credentials');

      // Fetch session to determine redirect target (admin → /admin, user → /account)
      const sessRes = await fetch('/api/auth/session').then((r) => r.json()).catch(() => null);
      const role = sessRes?.user?.role;
      const defaultDest = role === 'ADMIN' ? '/admin' : '/account';
      router.push(callbackUrl || defaultDest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-gray-900 sm:p-8 md:p-10">
      {/* Tabs */}
      <div className="mx-auto mb-8 flex w-fit rounded-full bg-gray-100 p-1 dark:bg-gray-800">
        <button
          onClick={() => setTab('login')}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition sm:px-8 ${
            tab === 'login' ? 'bg-brand text-white shadow-brand' : 'text-ink-muted dark:text-gray-400'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setTab('register')}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition sm:px-8 ${
            tab === 'register' ? 'bg-brand text-white shadow-brand' : 'text-ink-muted dark:text-gray-400'
          }`}
        >
          Register
        </button>
      </div>

      <div className="text-center">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
          {tab === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="mt-2 text-sm text-ink-muted dark:text-gray-400">
          {tab === 'login' ? 'Secure access to your enterprise dashboard' : 'Start configuring your servers in minutes'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {tab === 'register' && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink dark:text-gray-200">
              <UserIcon className="h-4 w-4 text-brand" /> Full Name
            </label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
              placeholder="Jane Doe"
            />
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-ink dark:text-gray-200">
            <Mail className="h-4 w-4 text-brand" /> Email Address
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
            placeholder="name@company.com"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-ink dark:text-gray-200">
            <Lock className="h-4 w-4 text-brand" /> Password
          </label>
          <input
            required
            minLength={6}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-brand w-full disabled:opacity-60">
          {loading ? 'Please wait...' : tab === 'login' ? 'Login Now' : 'Create Account'}
          <ArrowRight className="h-4 w-4" />
        </button>

        {process.env.NEXT_PUBLIC_GOOGLE_ENABLED && (
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: callbackUrl || '/auth/redirect' })}
            className="w-full rounded-full border border-gray-200 bg-white py-3 font-semibold text-ink transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Continue with Google
          </button>
        )}

        <p className="flex items-center justify-center gap-2 pt-2 text-center text-xs text-ink-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Secure enterprise authentication
        </p>
      </form>
    </div>
  );
}
