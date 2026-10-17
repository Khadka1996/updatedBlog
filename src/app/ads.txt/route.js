import { API_URL } from '@/config/site';

// /ads.txt — content is edited in Dashboard > Settings > Ads (ad networks
// require it to verify that you own the site before they pay out).
export const revalidate = 300;

export async function GET() {
  const backend = (process.env.API_PROXY_TARGET || API_URL).replace(/\/$/, '');
  let body = '';
  try {
    const res = await fetch(`${backend}/api/settings/ads.txt`, { next: { revalidate: 300 } });
    if (res.ok) body = await res.text();
  } catch {}
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
