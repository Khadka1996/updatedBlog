'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { toolsAdsConfig } from '@/config/tools-adsense.config';
import AdCreative, { injectHtml } from './AdCreative';
import { adsAllowed, eligibleAds, fetchAdsFeed, fetchPublicSettings, pickWeighted, trackImpression } from './adsClient';

// Which AdSense env slot backs each placement when no managed ad exists.
const ADSENSE_SLOT_FOR = {
  top: 'top',
  middle: 'middle',
  bottom: 'bottom',
  sidebar_top: 'left',
  sidebar_bottom: 'right',
};

function AdSenseUnit({ position, vertical }) {
  const ref = useRef(null);
  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  }, []);
  return (
    <ins
      ref={ref}
      className="adsbygoogle block w-full"
      style={{ display: 'block' }}
      data-ad-client={toolsAdsConfig.getPublisherId()}
      data-ad-slot={toolsAdsConfig.getSlotId(position)}
      data-ad-format={vertical ? 'vertical' : 'auto'}
      data-full-width-responsive="true"
    />
  );
}

/** Code from Dashboard > Settings > Code Injection > Sidebar. */
function SidebarCode({ code }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !code) return undefined;
    try { injectHtml(el, code); } catch {}
    return () => { el.innerHTML = ''; };
  }, [code]);
  return <div ref={ref} className="my-4" />;
}

/**
 * <AdSlot placement="top" /> — renders the ad managed in Dashboard > Manage Ads
 * for this placement (rotating by weight), falls back to Google AdSense when
 * configured, and renders nothing at all when there is no ad.
 */
export default function AdSlot({ placement, className = 'my-6', withSidebarCode = false }) {
  const pathname = usePathname() || '/';
  const [state, setState] = useState({ ready: false, ad: null, settings: null, sidebarCode: '' });
  const boxRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [feed, injected] = await Promise.all([
        fetchAdsFeed(),
        withSidebarCode ? fetchPublicSettings() : Promise.resolve(null),
      ]);
      if (cancelled) return;
      const settings = feed?.settings || null;
      const allowed = adsAllowed(settings, pathname);
      const ad = allowed ? pickWeighted(eligibleAds(feed, placement, pathname)) : null;
      setState({
        ready: true,
        ad,
        settings,
        allowed,
        sidebarCode: injected?.codeInjection?.sidebar || '',
      });
    };
    load();
    return () => { cancelled = true; };
  }, [placement, pathname, withSidebarCode]);

  // Count the impression once the ad is actually on screen.
  useEffect(() => {
    const el = boxRef.current;
    const adId = state.ad?._id;
    if (!el || !adId) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        trackImpression(adId, pathname);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [state.ad, pathname]);

  if (!state.ready) return null;

  const fallbackPosition = ADSENSE_SLOT_FOR[placement];
  const useAdSense =
    !state.ad &&
    state.allowed &&
    state.settings?.adsenseFallback !== false &&
    fallbackPosition &&
    toolsAdsConfig.isConfigured() &&
    toolsAdsConfig.hasSlot(fallbackPosition);

  const sidebarCode = withSidebarCode && state.sidebarCode ? <SidebarCode code={state.sidebarCode} /> : null;

  if (!state.ad && !useAdSense) return sidebarCode;

  return (
    <>
      <div ref={boxRef} className={`w-full ${className}`} data-ad-container data-ad-placement={placement}>
        {state.settings?.showAdLabel !== false && (
          <div className="text-[10px] uppercase tracking-wider text-gray-400 text-center mb-1 select-none">
            Advertisement
          </div>
        )}
        {state.ad ? (
          <AdCreative ad={state.ad} />
        ) : (
          <AdSenseUnit position={fallbackPosition} vertical={placement.startsWith('sidebar')} />
        )}
      </div>
      {sidebarCode}
    </>
  );
}

