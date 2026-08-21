'use client'

import { useEffect } from 'react'
import { toolsAdsConfig } from '@/config/tools-adsense.config';

export default function AdsInit({ publisherId }) {
  // Load the adsbygoogle script manually (not via next/script) so Next.js
  // never stamps it with data-nscript, which AdSense's own loader warns about.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!publisherId || !toolsAdsConfig.isConfigured()) return;

    const existing = document.querySelector(
      `script[src*="pagead/js/adsbygoogle.js"][src*="${publisherId}"]`
    );

    let script;
    if (!existing) {
      script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    return () => {
      // Leave the script in place across route changes; only clean up
      // if this component actually created it and is unmounting for good.
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [publisherId]);

  useEffect(() => {
    const timers = new WeakMap();

    const collapseAd = (ad) => {
      if (!ad.matches?.('ins.adsbygoogle')) return;
      const status = ad.getAttribute('data-ad-status');
      if (!toolsAdsConfig.isConfigured() || status === 'unfilled') {
        const container = ad.closest('[data-ad-container]') || ad.parentElement;
        if (container) container.hidden = true;
        return;
      }

      if (!timers.has(ad)) {
        const timeoutId = window.setTimeout(() => {
          if (ad.getAttribute('data-ad-status') !== 'filled') {
            const container = ad.closest('[data-ad-container]') || ad.parentElement;
            if (container) container.hidden = true;
          }
          timers.delete(ad);
        }, 8000);
        timers.set(ad, timeoutId);
      }
    };

    try {
      if (typeof window === 'undefined') return
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(({ target, addedNodes }) => {
          collapseAd(target);
          addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            collapseAd(node);
            node.querySelectorAll?.('ins.adsbygoogle').forEach(collapseAd);
          });
        });
      });
      document.querySelectorAll('ins.adsbygoogle').forEach(collapseAd);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-ad-status'],
        childList: true,
        subtree: true,
      });

      if (window.adsbygoogle) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch {}
      }

      return () => observer.disconnect();
    } catch {}
  }, [])

  return null
}