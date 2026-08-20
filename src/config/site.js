export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_WEBSITE_URL ||
  'https://everestkit.com'
).replace(/\/$/, '');

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.everestkit.com'
).replace(/\/$/, '');
