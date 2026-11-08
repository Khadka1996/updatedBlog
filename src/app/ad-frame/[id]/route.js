import { API_URL } from '@/config/site';

// /ad-frame/<ad id>?f=<frame id>
// A real page on our own domain that runs one ad network snippet exactly as
// the network expects (synchronous <script> tags, document.write, cookies,
// localStorage, the real site address). Banner networks such as Adsterra fail
// inside a sandboxed srcdoc frame ("document is sandboxed and lacks the
// 'allow-same-origin' flag"), so <AdSlot> loads this page in its iframe.
export const dynamic = 'force-dynamic';

const backend = () => (process.env.API_PROXY_TARGET || API_URL).replace(/\/$/, '');

async function findCodeAd(id) {
  const res = await fetch(`${backend()}/api/ads/public`, { next: { revalidate: 30 } });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.ads || []).find((ad) => ad._id === id && ad.type === 'code') || null;
}

// Width declared in an Adsterra-style snippet: atOptions = { ..., 'width' : 728 }.
// Read on the server because the network script removes atOptions once it runs.
const declaredWidth = (code) => {
  const block = /atOptions\s*=\s*\{([\s\S]*?)\}/.exec(code || '');
  const m = block && /['"]?width['"]?\s*:\s*(\d{2,4})/.exec(block[1]);
  return m ? Number(m[1]) : 0;
};

const page = (code, frameId) => `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<base target="_blank">
<title>Advertisement</title>
<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}body{display:flex;justify-content:center;align-items:flex-start}</style>
</head><body>
${code}
<script>(function(){
// Report the rendered ad's height to the page; if the ad is wider than this
// frame (e.g. a 728x90 banner on a phone), scale it down so it shows whole.
// Banner snippets declare their real size (atOptions.width); some networks
// size their frame to the screen but still draw the full-width creative
// inside it, so lay it out at its declared width and scale that down.
var last=-1,b=document.body,aw=${declaredWidth(code)};
function post(){var vw=window.innerWidth,fixed=aw&&aw>vw+1;b.style.width=fixed?aw+'px':'';b.style.transformOrigin=fixed?'top left':'top center';
var w=fixed?aw:0,h=0,k=b.children;for(var i=0;i<k.length;i++){var el=k[i];if(el.tagName==='SCRIPT'||el.tagName==='STYLE'||!el.offsetWidth)continue;w=Math.max(w,el.offsetWidth);h=Math.max(h,el.offsetTop+el.offsetHeight);}
var s=w>vw+1?vw/w:1;b.style.transform=s<1?'scale('+s+')':'';h=Math.ceil(h*s);
if(h!==last){last=h;if(parent!==window)parent.postMessage({ekAdFrame:${JSON.stringify(frameId)},height:h},location.origin);}}
window.addEventListener('load',post);window.addEventListener('resize',post);if(window.ResizeObserver){new ResizeObserver(post).observe(b);}setInterval(post,1000);setTimeout(post,50);})();</script>
</body></html>`;

export async function GET(request, { params }) {
  const { id } = await params;
  // Only [A-Za-z0-9_-]: it is written into a <script> on the page.
  const frameId = (new URL(request.url).searchParams.get('f') || '').replace(/[^\w-]/g, '').slice(0, 80);
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
  };

  let ad = null;
  if (/^[a-f0-9]{24}$/i.test(id || '')) {
    try { ad = await findCodeAd(id); } catch {}
  }
  // Unknown, paused or non-code ad: an empty page (the slot collapses itself).
  return new Response(page(ad ? ad.code : '', frameId), { status: ad ? 200 : 404, headers });
}
