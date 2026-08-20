'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to send the reset link.');
      }

      setMessage(result.message || 'Password reset instructions have been sent to your email.');
      setEmail('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to send the reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we will send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-green px-4 py-2 font-medium text-white transition hover:bg-brand-green-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <Link href="/login" className="mt-6 inline-block text-sm text-brand-blue hover:underline">
          Back to login
        </Link>
      </section>
    </main>
  );
}