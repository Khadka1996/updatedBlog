'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function AdSenseBanner({ adSlot, format = 'auto' }) {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, []);

  // Define placeholder dimensions based on ad format
  const placeholderStyles = {
    rectangle: { height: '250px', width: '100%' },
    vertical: { height: '600px', width: '120px' },
    auto: { height: '90px', width: '100%' }
  };

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID`}
        crossOrigin="anonymous"
        onError={(e) => console.error("AdSense script failed to load", e)}
      />
      
      <div className="my-8 w-full flex justify-center">
        {/* Demo placeholder (shown before ad loads) */}
        {!adLoaded && (
          <div 
            className="bg-white border-2 border-dashed border-gray-300 animate-pulse flex items-center justify-center"
            style={placeholderStyles[format] || placeholderStyles.auto}
          >
            <span className="text-gray-500 text-sm font-medium">
              {format.toUpperCase()} AD PLACEHOLDER
            </span>
          </div>
        )}

        {/* Actual AdSense Ad */}
        <ins
          className="adsbygoogle"
          style={{
            display: adLoaded ? 'block' : 'none',
            ...placeholderStyles[format]
          }}
          data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
          data-ad-slot={adSlot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </>
  );
}