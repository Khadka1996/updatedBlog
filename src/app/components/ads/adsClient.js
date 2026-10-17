'use client';

// Shared, browser-only helpers for the self-managed ad system
// (Dashboard > Manage Ads). One fetch of /api/ads/public serves every
// <AdSlot> on the page; impressions/clicks are batched into one request.

const FEED_TTL_MS = 60 * 1000;
let feedPromise = null;
let feedFetchedAt = 0;

// Pages where ads and injected code never run.
const NO_AD_PREFIXES = ['/dashboard', '/login', '/register', '/forgot-password', '/reset-password', '/logout'];

export const isNoAdPath = (pathname = '') =>
  NO_AD_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export const fetchAdsFeed = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!feedPromise || Date.now() - feedFetchedAt > FEED_TTL_MS) {
    feedFetchedAt = Date.now();
    feedPromise = fetch('/api/ads/public', { credentials: 'omit' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => (data?.success ? data : null))
      .catch(() => null);
  }
  return feedPromise;
};

// Public code-injection settings from Dashboard > Settings.
let settingsPromise = null;
let settingsFetchedAt = 0;
export const fetchPublicSettings = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!settingsPromise || Date.now() - settingsFetchedAt > 60 * 1000) {
    settingsFetchedAt = Date.now();
    settingsPromise = fetch('/api/settings/public', { credentials: 'omit' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return settingsPromise;
};

export const pageGroupOf = (pathname = '/') => {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/tools')) return 'tools';
  if (pathname.startsWith('/blog')) return 'blog';
  if (pathname.startsWith('/services')) return 'services';
  return 'other';
};

export const isMobileDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

// Set by the dashboard when an admin is signed in on this browser.
const ADMIN_FLAG = 'ek_is_admin';
export const markAdminBrowser = (isAdmin) => {
  try {
    if (isAdmin) localStorage.setItem(ADMIN_FLAG, '1');
    else localStorage.removeItem(ADMIN_FLAG);
  } catch {}
};
const isAdminBrowser = () => {
  try { return localStorage.getItem(ADMIN_FLAG) === '1'; } catch { return false; }
};

/** Should any ad render on this path, given the global ad settings? */
export const adsAllowed = (settings, pathname) => {
  if (!settings || settings.enabled === false) return false;
  if (isNoAdPath(pathname)) return false;
  if (settings.showOnMobile === false && isMobileDevice()) return false;
  if (settings.hideForAdmins && isAdminBrowser()) return false;
  if ((settings.excludedPaths || []).some((p) => pathname === p || (p.endsWith('*') && pathname.startsWith(p.slice(0, -1))))) {
    return false;
  }
  return true;
};

/** Ads eligible for `placement` on this page and device. */
export const eligibleAds = (feed, placement, pathname) => {
  if (!feed?.ads) return [];
  const group = pageGroupOf(pathname);
  const mobile = isMobileDevice();
  return feed.ads.filter((ad) =>
    ad.placement === placement &&
    (!ad.pages?.length || ad.pages.includes(group)) &&
    (ad.devices === 'all' || !ad.devices || (ad.devices === 'mobile') === mobile)
  );
};

/** Weighted random choice (weight 1-10). */
export const pickWeighted = (ads) => {
  if (!ads.length) return null;
  const total = ads.reduce((sum, ad) => sum + (ad.weight || 5), 0);
  let roll = Math.random() * total;
  for (const ad of ads) {
    roll -= ad.weight || 5;
    if (roll <= 0) return ad;
  }
  return ads[ads.length - 1];
};

// ---- Tracking ----
const pending = { impressions: new Set(), clicks: new Set() };
const seenThisView = new Set();
let flushTimer = null;

const flush = () => {
  flushTimer = null;
  if (!pending.impressions.size && !pending.clicks.size) return;
  const body = JSON.stringify({ impressions: [...pending.impressions], clicks: [...pending.clicks] });
  pending.impressions.clear();
  pending.clicks.clear();
  try {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon?.('/api/ads/track', blob)) return;
  } catch {}
  fetch('/api/ads/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
};

const schedule = (delay = 2500) => {
  if (!flushTimer) flushTimer = setTimeout(flush, delay);
};

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush);
}

/** Count an impression once per ad per page view (viewKey = pathname). */
let lastViewKey = null;
const isRealId = (id) => /^[a-f0-9]{24}$/i.test(String(id || ''));

export const trackImpression = (adId, viewKey) => {
  if (!isRealId(adId)) return;
  // A new page means a new view: forget what was counted on the previous one.
  if (viewKey !== lastViewKey) {
    seenThisView.clear();
    lastViewKey = viewKey;
  }
  const key = `${viewKey}|${adId}`;
  if (seenThisView.has(key)) return;
  seenThisView.add(key);
  pending.impressions.add(adId);
  schedule();
};

export const trackClick = (adId) => {
  if (!isRealId(adId)) return;
  pending.clicks.add(adId);
  flush(); // send now — the user is probably leaving the page
};

export const SIZE_DIMENSIONS = {
  '728x90': [728, 90], '970x90': [970, 90], '468x60': [468, 60], '320x50': [320, 50],
  '320x100': [320, 100], '300x250': [300, 250], '336x280': [336, 280],
  '160x600': [160, 600], '300x600': [300, 600],
};
