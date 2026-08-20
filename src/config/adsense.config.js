// frontend/src/config/adsense.config.js
/**
 * Google AdSense Configuration
 * All values come from environment variables
 */

export const adsenseConfig = {
  // Master enable/disable switch
  enabled: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED === 'true',
  
  // Publisher ID (ca-pub-xxxxxxxxxxxxxxxx)
  publisherId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID,
  
  // Ad Unit Slots (get from AdSense console)
  slots: {
    top: process.env.NEXT_PUBLIC_AD_TOP_SLOT,
    bottom: process.env.NEXT_PUBLIC_AD_BOTTOM_SLOT,
    left: process.env.NEXT_PUBLIC_AD_LEFT_SLOT,
    right: process.env.NEXT_PUBLIC_AD_RIGHT_SLOT,
  },
  
  // Display settings
  display: {
    showOnMobile: process.env.NEXT_PUBLIC_ADS_SHOW_ON_MOBILE === 'true',
    delayMs: parseInt(process.env.NEXT_PUBLIC_ADS_DELAY_MS || '1000'),
  },
  
  // Helper methods
  isConfigured() {
    return this.enabled && this.publisherId && Object.values(this.slots).some(slot => slot);
  },
  
  hasSlot(position) {
    return !!this.slots[position];
  },
  
  getScriptUrl() {
    return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.publisherId}`;
  },
};

export default adsenseConfig;
