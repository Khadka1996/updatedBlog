'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const consentStorageKey = 'everestkit-cookie-consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(window.localStorage.getItem(consentStorageKey) === null);
  }, []);

  const saveConsent = (value) => {
    window.localStorage.setItem(consentStorageKey, value);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-3xl flex-col gap-4 border border-slate-200 bg-white p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <p className="max-w-2xl text-sm leading-6 text-slate-700">
        We use cookies for essential site functions, analytics, and relevant advertising.{' '}
        <Link className="font-semibold text-emerald-700 underline" href="/cookies-policy">
          View our Cookies Policy
        </Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          className="border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => saveConsent('essential')}
        >
          Essential only
        </button>
        <button
          type="button"
          className="bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          onClick={() => saveConsent('all')}
        >
          Accept all
        </button>
      </div>
    </aside>
  );
}
