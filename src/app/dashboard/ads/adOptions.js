// Option lists for Dashboard > Manage Ads. Must match Server/models/adsModel.js.

export const PLACEMENTS = [
  { value: 'top', label: 'Top banner', hint: 'Top of tool, blog, services and home pages' },
  { value: 'middle', label: 'In-content', hint: 'Between sections inside tool pages and articles' },
  { value: 'bottom', label: 'Bottom banner', hint: 'Bottom of tool, blog, services and home pages' },
  { value: 'sidebar_top', label: 'Sidebar (top)', hint: 'Blog article sidebar, above “Latest Articles”' },
  { value: 'sidebar_bottom', label: 'Sidebar (bottom)', hint: 'Blog article sidebar, below “Latest Articles”' },
  { value: 'in_article_1', label: 'In article — after 1st paragraph', hint: 'Inside every blog post, right after the first paragraph' },
  { value: 'in_article_2', label: 'In article — after 2nd paragraph', hint: 'Inside every blog post, right after the second paragraph' },
  { value: 'in_article_end', label: 'In article — end of post', hint: 'Inside every blog post, after the last paragraph' },
  { value: 'in_feed', label: 'In feed', hint: 'Between sections on the home page and between blog cards on /blog' },
  { value: 'sticky_footer', label: 'Sticky footer', hint: 'Bar fixed to the bottom of the screen on every page' },
  { value: 'article_popup', label: 'Article popup (5s countdown)', hint: 'Opens with every blog post and closes itself after a 5-4-3-2-1 countdown' },
  { value: 'popup', label: 'Popup', hint: 'Modal shown after a delay (frequency set in Settings > Ads)' },
  { value: 'global_script', label: 'Page script', hint: 'Runs once per visit: popunder, social bar, push, interstitial' },
];

export const PLACEMENT_LABEL = Object.fromEntries(PLACEMENTS.map((p) => [p.value, p.label]));

export const SIZES = [
  { value: 'responsive', label: 'Responsive (fit width)' },
  { value: '728x90', label: '728 × 90 Leaderboard' },
  { value: '970x90', label: '970 × 90 Large leaderboard' },
  { value: '468x60', label: '468 × 60 Banner' },
  { value: '320x50', label: '320 × 50 Mobile banner' },
  { value: '320x100', label: '320 × 100 Large mobile banner' },
  { value: '300x250', label: '300 × 250 Medium rectangle' },
  { value: '336x280', label: '336 × 280 Large rectangle' },
  { value: '160x600', label: '160 × 600 Skyscraper' },
  { value: '300x600', label: '300 × 600 Half page' },
];

export const PAGES = [
  { value: 'home', label: 'Home' },
  { value: 'tools', label: 'Tools' },
  { value: 'blog', label: 'Blog' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other pages' },
];

export const NETWORKS = [
  'Adsterra', 'PropellerAds', 'Monetag', 'Media.net', 'HilltopAds', 'A-Ads',
  'Ezoic', 'Infolinks', 'RevContent', 'Google AdSense', 'Direct sponsor', 'Other',
];

export const STATUS_META = {
  live: { color: 'green', label: 'Live' },
  scheduled: { color: 'blue', label: 'Scheduled' },
  expired: { color: 'default', label: 'Expired' },
  paused: { color: 'orange', label: 'Paused' },
};

export const EMPTY_AD = {
  name: '',
  type: 'image',
  imagePath: '',
  imageMobilePath: '',
  websiteLink: '',
  altText: '',
  openInNewTab: true,
  network: 'Adsterra',
  code: '',
  renderMode: 'iframe',
  placement: 'top',
  size: 'responsive',
  pages: [],
  devices: 'all',
  isActive: true,
  startDate: null,
  endDate: null,
  weight: 5,
};

/**
 * Best placements for an image of width × height, best first.
 * Wide banners go across the page, squarish/portrait images suit the popup
 * and sidebar, and very tall "skyscrapers" only fit the desktop sidebar.
 */
export const suggestPlacements = (width, height) => {
  const ratio = width / Math.max(1, height);
  const s = (placement, size = 'responsive', devices = 'all') => ({ placement, size, devices });
  if (ratio >= 2) return [s('top'), s('in_article_1'), s('in_article_2'), s('middle'), s('in_feed'), s('bottom'), s('sticky_footer')];
  if (ratio >= 0.8) return [s('article_popup'), s('popup'), s('sidebar_top'), s('in_article_end'), s('sidebar_bottom')];
  if (ratio >= 0.5) return [s('article_popup'), s('popup'), s('sidebar_top'), s('sidebar_bottom')];
  return [s('sidebar_bottom', 'responsive', 'desktop'), s('sidebar_top', 'responsive', 'desktop')];
};
