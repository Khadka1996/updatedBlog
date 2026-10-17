'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdCreative, { injectHtml } from './AdCreative';
import {
  adsAllowed, adsHiddenForAdmin, eligibleAds, fetchAdsFeed, fetchPublicSettings, isNoAdPath, pickWeighted,
  showAdsToAdminThisVisit, trackImpression,
} from './adsClient';

const POPUP_KEY = 'ek_popup_seen';
const STICKY_KEY = 'ek_sticky_closed';

const readStore = (storage, key) => { try { return storage.getItem(key); } catch { return null; } };
const writeStore = (storage, key, value) => { try { storage.setItem(key, value); } catch {} };

/**
 * Runs once per full page load: code injection from Dashboard > Settings and
 * page-level ad scripts (popunders, social bars). These are never removed on
 * client-side navigation because the scripts they load can't be "un-run".
 */
function useCodeInjection(pathname) {
  const done = useRef(false);
  useEffect(() => {
    // Never run injected third-party code inside the admin area.
    if (done.current || isNoAdPath(pathname)) return;
    done.current = true;

    fetchPublicSettings().then((data) => {
      const code = data?.codeInjection || {};
      try {
        if (code.customCss) {
          const style = document.createElement('style');
          style.id = 'ek-custom-css';
          style.textContent = code.customCss;
          document.head.appendChild(style);
        }
        if (code.head) injectHtml(document.head, code.head);
        if (code.bodyStart) injectHtml(document.body, code.bodyStart, { prepend: true });
        if (code.footer) injectHtml(document.body, code.footer);
        if (code.customJs) {
          const script = document.createElement('script');
          script.id = 'ek-custom-js';
          script.textContent = `try{${code.customJs}\n}catch(e){console.warn('Custom JS error:',e)}`;
          document.body.appendChild(script);
        }
      } catch (err) {
        console.warn('Code injection failed:', err);
      }
    });
  }, [pathname]);
}

function useGlobalScripts(feed, pathname) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !feed || !adsAllowed(feed.settings, pathname)) return;
    done.current = true;
    eligibleAds(feed, 'global_script', pathname).forEach((ad) => {
      if (ad.type !== 'code' || !ad.code) return;
      try {
        injectHtml(document.body, ad.code);
        trackImpression(ad._id, `global|${pathname}`);
      } catch (err) {
        console.warn('Global ad script failed:', err);
      }
    });
  }, [feed, pathname]);
}

function PopupAd({ ad, onClose, countdown = 0 }) {
  const [left, setLeft] = useState(countdown);
  const [bar, setBar] = useState(100);
  useEffect(() => {
    if (!countdown) return undefined;
    const raf = requestAnimationFrame(() => setBar(0)); // drain smoothly over `countdown` seconds
    return () => cancelAnimationFrame(raf);
  }, [countdown]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 5 → 4 → 3 → 2 → 1 → close
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!countdown) return undefined;
    if (left <= 0) { closeRef.current(); return undefined; }
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left, countdown]);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement"
    >
      <div className="relative bg-white rounded-xl shadow-2xl p-3 max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 text-white text-lg leading-none shadow-lg hover:bg-gray-700"
          aria-label="Close advertisement"
        >
          ×
        </button>
        <div className="flex items-center justify-between gap-3 mb-1.5 px-0.5">
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Advertisement</span>
          {countdown > 0 && (
            <span className="text-xs font-medium text-gray-600 tabular-nums" aria-live="polite">
              Closes in <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#174fa2] text-white text-[11px]">{Math.max(left, 1)}</span>
            </span>
          )}
        </div>
        <div className="min-w-[260px] max-h-[80vh] overflow-auto">
          <AdCreative ad={ad} eager imgClassName="max-h-[68vh] w-auto max-w-[min(86vw,560px)]" />
        </div>
        {countdown > 0 && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full bg-[#174fa2]" style={{ width: `${bar}%`, transition: `width ${countdown}s linear` }} />
          </div>
        )}
      </div>
    </div>
  );
}

function StickyAd({ ad, dismissible, onClose }) {
  return (
    <div className="fixed left-0 right-0 bottom-16 md:bottom-0 z-[45] bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="relative max-w-5xl mx-auto px-8 py-1.5">
        {dismissible && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-sm leading-none hover:bg-gray-300"
            aria-label="Close advertisement"
          >
            ×
          </button>
        )}
        <AdCreative ad={ad} imgClassName="max-h-[56px] md:max-h-[90px] w-auto" />
      </div>
    </div>
  );
}

export default function GlobalAds() {
  const pathname = usePathname() || '/';
  const [feed, setFeed] = useState(null);
  const [popup, setPopup] = useState(null);
  const [articlePopup, setArticlePopup] = useState(null);
  const [sticky, setSticky] = useState(null);

  useCodeInjection(pathname);

  useEffect(() => {
    let cancelled = false;
    fetchAdsFeed().then((data) => { if (!cancelled) setFeed(data); });
    return () => { cancelled = true; };
  }, [pathname]);

  useGlobalScripts(feed, pathname);

  // Sticky footer — re-evaluated per page (targeting may differ by section).
  useEffect(() => {
    if (!feed || !adsAllowed(feed.settings, pathname)) { setSticky(null); return; }
    if (readStore(sessionStorage, STICKY_KEY)) { setSticky(null); return; }
    setSticky(pickWeighted(eligibleAds(feed, 'sticky_footer', pathname)));
  }, [feed, pathname]);

  useEffect(() => {
    if (sticky?._id) trackImpression(sticky._id, `sticky|${pathname}`);
  }, [sticky, pathname]);

  const isArticle = /^\/blogs\/[^/]+$/.test(pathname);
  const hasArticlePopup = Boolean(feed && isArticle && eligibleAds(feed, 'article_popup', pathname).length);

  // Article popup — opens with every blog post (once per post per visit)
  // and closes itself after a 5-second countdown.
  useEffect(() => {
    if (!hasArticlePopup || !adsAllowed(feed.settings, pathname)) return undefined;
    const key = `ek_article_popup|${pathname}`;
    if (readStore(sessionStorage, key)) return undefined;
    const ad = pickWeighted(eligibleAds(feed, 'article_popup', pathname));
    const timer = setTimeout(() => {
      setArticlePopup(ad);
      writeStore(sessionStorage, key, '1');
      trackImpression(ad._id, `article_popup|${pathname}`);
    }, 1200);
    return () => clearTimeout(timer);
  }, [feed, pathname, hasArticlePopup]);

  // Popup — after a delay, at most once per `popupFrequencyHours`.
  // Skipped on articles that already show the article popup.
  useEffect(() => {
    if (!feed || hasArticlePopup || !adsAllowed(feed.settings, pathname)) return undefined;
    const ad = pickWeighted(eligibleAds(feed, 'popup', pathname));
    if (!ad) return undefined;
    const hours = Number(feed.settings.popupFrequencyHours ?? 24);
    const last = Number(readStore(localStorage, POPUP_KEY) || 0);
    if (hours > 0 && Date.now() - last < hours * 3600 * 1000) return undefined;
    const timer = setTimeout(() => {
      setPopup(ad);
      writeStore(localStorage, POPUP_KEY, String(Date.now()));
      trackImpression(ad._id, `popup|${pathname}`);
    }, Math.max(0, Number(feed.settings.popupDelaySeconds ?? 8)) * 1000);
    return () => clearTimeout(timer);
  }, [feed, pathname, hasArticlePopup]);

  // Close popups when navigating away from the page that opened them.
  useEffect(() => { setPopup(null); setArticlePopup(null); }, [pathname]);

  // Tell a signed-in admin why they see no ads (Settings > Ads > Hide ads from admins).
  const hiddenForAdmin = Boolean(feed && !isNoAdPath(pathname) && adsHiddenForAdmin(feed.settings) && feed.ads?.length);

  return (
    <>
      {hiddenForAdmin && (
        <div className="fixed top-24 left-3 z-[61] flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full bg-gray-900/90 py-1.5 pl-3 pr-1.5 text-xs text-white shadow-lg backdrop-blur">
          <span>Ads are hidden because you&apos;re signed in as admin</span>
          <button
            type="button"
            onClick={() => { showAdsToAdminThisVisit(); window.location.reload(); }}
            className="rounded-full bg-white px-2.5 py-1 font-semibold text-gray-900 hover:bg-gray-100"
          >
            Show ads
          </button>
        </div>
      )}
      {popup && <PopupAd ad={popup} onClose={() => setPopup(null)} />}
      {articlePopup && <PopupAd ad={articlePopup} countdown={5} onClose={() => setArticlePopup(null)} />}
      {sticky && (
        <StickyAd
          ad={sticky}
          dismissible={feed?.settings?.stickyDismissible !== false}
          onClose={() => { writeStore(sessionStorage, STICKY_KEY, '1'); setSticky(null); }}
        />
      )}
    </>
  );
}
