'use client';

import { useEffect, useState } from 'react';

// One shared poll of /api/admin/notifications for the sidebar badges and the
// header bell (previously the header polled audit logs every 5 seconds and the
// sidebar showed hard-coded numbers).
const POLL_MS = 60 * 1000;
const SEEN_KEY = 'ek_notifications_seen_at';
const EMPTY = { counts: { messages: 0, liveChats: 0, reportedComments: 0 }, items: [] };

let state = { ...EMPTY, loading: true };
const listeners = new Set();
let timer = null;
let inflight = null;

const emit = () => listeners.forEach((fn) => fn({ ...state }));

export const refreshNotifications = async () => {
  if (inflight) return inflight;
  inflight = fetch('/api/admin/notifications', { credentials: 'include', cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      state = json?.success ? { ...json.data, loading: false } : { ...state, loading: false };
      emit();
    })
    .catch(() => { state = { ...state, loading: false }; emit(); })
    .finally(() => { inflight = null; });
  return inflight;
};

const start = () => {
  if (timer) return;
  refreshNotifications();
  timer = setInterval(() => {
    if (document.visibilityState === 'visible') refreshNotifications();
  }, POLL_MS);
};

const stop = () => {
  clearInterval(timer);
  timer = null;
};

export const getSeenAt = () => {
  try { return Number(localStorage.getItem(SEEN_KEY) || 0); } catch { return 0; }
};
export const markAllSeen = () => {
  try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch {}
  emit();
};

export default function useDashboardNotifications() {
  const [snapshot, setSnapshot] = useState(state);
  useEffect(() => {
    listeners.add(setSnapshot);
    start();
    return () => {
      listeners.delete(setSnapshot);
      if (!listeners.size) stop();
    };
  }, []);
  return snapshot;
}
