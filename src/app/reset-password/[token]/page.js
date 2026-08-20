'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/users/reset-password/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          newPassword: password,
          confirmPassword,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to reset your password.');
      }

      router.push('/login?reset=success');
    } catch (requestError) {
      setError(requestError.message || 'Unable to reset your password.');
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-green px-4 py-2 font-medium text-white transition hover:bg-brand-green-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <Link href="/login" className="mt-6 inline-block text-sm text-brand-blue hover:underline">
          Back to login
        </Link>
      </section>
    </main>
  );
}