'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { toolsAdsConfig } from '@/config/tools-adsense.config';

export default function AdSenseBanner({ adSlot, format = 'auto' }) {
  const [visible, setVisible] = useState(true);
  const adRef = useRef(null);

  useEffect(() => {
    if (!toolsAdsConfig.isConfigured() || !toolsAdsConfig.isValidSlotId(adSlot)) {
      setVisible(false);
      return undefined;
    }

    const ad = adRef.current;
    if (!ad) return undefined;

    const updateVisibility = () => {
      const status = ad.getAttribute('data-ad-status');
      if (status === 'unfilled') setVisible(false);
      if (status === 'filled') setVisible(true);
    };

    const observer = new MutationObserver(updateVisibility);
    observer.observe(ad, { attributes: true, attributeFilter: ['data-ad-status'] });

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
      setVisible(false);
    }

    const timeoutId = window.setTimeout(() => {
      if (ad.getAttribute('data-ad-status') !== 'filled') setVisible(false);
    }, 8000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, [adSlot]);

  if (!toolsAdsConfig.isConfigured() || !toolsAdsConfig.isValidSlotId(adSlot) || !visible) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={toolsAdsConfig.getScriptUrl()}
        crossOrigin="anonymous"
        onError={(e) => console.error("AdSense script failed to load", e)}
      />
      
      <div className="my-8 w-full flex justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={toolsAdsConfig.getPublisherId()}
          data-ad-slot={adSlot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </>
  );
}