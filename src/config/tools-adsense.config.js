/**
 * Google AdSense Configuration for Tool Pages
 * Centralized configuration for all tool page ads
 */

export const toolsAdsConfig = {
  // Get AdSense configuration status
  isConfigured: () => {
    return (
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED === 'true' &&
      !!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
    );
  },

  // Get publisher ID
  getPublisherId: () => {
    return process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || '';
  },

  // Get ad script URL
  getScriptUrl: () => {
    const publisherId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
    if (!publisherId) return '';
    return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  },

  // Check if specific ad slot is configured
  hasSlot: (position) => {
    const slotEnv = `NEXT_PUBLIC_AD_${position.toUpperCase()}_SLOT`;
    return !!process.env[slotEnv];
  },

  // Get ad slot ID for specific position
  getSlotId: (position) => {
    const slotEnv = `NEXT_PUBLIC_AD_${position.toUpperCase()}_SLOT`;
    return process.env[slotEnv] || '';
  },

  // Tool-specific ad positions
  positions: {
    TOP: 'top',          // Top of page horizontal ad (728x90)
    MIDDLE: 'middle',    // Middle of page vertical/horizontal ad (300x600 or 728x90)
    BOTTOM: 'bottom'     // Bottom of page horizontal ad (728x90)
  }
};

/**
 * Ad rendering helper component patterns for tool pages
 * 
 * Usage in tool pages:
 * 
 * 1. Add Script component for AdSense loading:
 *    <Script 
 *      id="adsbygoogle-init"
 *      strategy="afterInteractive"
 *      src={toolsAdsConfig.getScriptUrl()}
 *      crossOrigin="anonymous"
 *      onLoad={() => setAdsLoaded(true)}
 *    />
 * 
 * 2. Add environment variables to .env.local:
 *    NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED=true
 *    NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
 *    NEXT_PUBLIC_AD_TOP_SLOT=1234567890
 *    NEXT_PUBLIC_AD_MIDDLE_SLOT=1234567891
 *    NEXT_PUBLIC_AD_BOTTOM_SLOT=1234567892
 * 
 * 3. Add effect to push ads when loaded:
 *    useEffect(() => {
 *      if (adsLoaded && window.adsbygoogle) {
 *        window.adsbygoogle = window.adsbygoogle || [];
 *        window.adsbygoogle.push({});
 *      }
 *    }, [adsLoaded]);
 * 
 * 4. Render ad units:
 *    <ins
 *      className="adsbygoogle"
 *      style={{ display: 'block' }}
 *      data-ad-client={toolsAdsConfig.getPublisherId()}
 *      data-ad-slot={toolsAdsConfig.getSlotId('top')}
 *      data-ad-format="auto"
 *      data-full-width-responsive="true"
 *    />
 */
