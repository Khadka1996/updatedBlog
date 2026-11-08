'use client';

import { useEffect, useRef, useState } from 'react';
import { SIZE_DIMENSIONS, trackClick } from './adsClient';

/**
 * Insert an HTML snippet into `container` so that its <script> tags actually
 * execute (innerHTML never runs scripts; a contextual fragment does).
 */
export const injectHtml = (container, html, { prepend = false } = {}) => {
  if (!container || !html) return [];
  const range = document.createRange();
  range.selectNodeContents(container);
  const fragment = range.createContextualFragment(html);
  const nodes = [...fragment.childNodes];
  if (prepend) container.prepend(fragment); else container.appendChild(fragment);
  return nodes;
};

// Sandboxed frame document for unsaved previews. Scripts run while the frame document is still
// parsing, so network snippets that rely on document.write (Adsterra,
// PropellerAds banners, ...) work. The frame reports the height of what the
// network actually rendered (0 = nothing) to the parent.
const frameDocument = (code, frameId) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<base target="_blank">
<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}body{display:flex;justify-content:center;align-items:flex-start}</style>
</head><body>${code}
<script>(function(){var last=-1;function post(){var h=0,k=document.body.children;for(var i=0;i<k.length;i++){if(k[i].tagName==='SCRIPT'||k[i].tagName==='STYLE')continue;var r=k[i].getBoundingClientRect();if(r.width>0&&r.bottom>h)h=Math.ceil(r.bottom);}if(h!==last){last=h;parent.postMessage({ekAdFrame:${JSON.stringify(frameId)},height:h},'*');}}
window.addEventListener('load',post);if(window.ResizeObserver){new ResizeObserver(post).observe(document.body);}setInterval(post,1000);setTimeout(post,50);})();</script>
</body></html>`;

let frameCounter = 0;

// How long a network gets to put something in its frame before the slot collapses.
const EMPTY_AFTER_MS = 10000;

function IframeCode({ ad, onEmptyChange }) {
  const ref = useRef(null);
  const [frameId] = useState(() => `ekad-${++frameCounter}-${ad._id}`);
  const dims = SIZE_DIMENSIONS[ad.size];
  const [height, setHeight] = useState(dims ? dims[1] : 90);
  const filledRef = useRef(false);
  const timerRef = useRef(null);
  const emptyCb = useRef(onEmptyChange);
  emptyCb.current = onEmptyChange;

  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== ref.current?.contentWindow || event.data?.ekAdFrame !== frameId) return;
      const h = Number(event.data?.height);
      if (!(h >= 0 && h < 2000)) return;
      if (h > 10) {
        setHeight(dims ? dims[1] : h);
        if (!filledRef.current) { filledRef.current = true; emptyCb.current?.(false); }
      }
    };
    window.addEventListener('message', onMessage);
    return () => { window.removeEventListener('message', onMessage); clearTimeout(timerRef.current); };
  }, [frameId, dims]);

  // Saved ads load from /ad-frame/<id>: a real page on our domain, because
  // banner networks (Adsterra, ...) need cookies and the real site address,
  // which a sandboxed srcdoc frame can't give them. Unsaved previews in the
  // dashboard still run sandboxed.
  const isSaved = /^[a-f0-9]{24}$/i.test(String(ad._id || ''));
  const frameSource = isSaved
    ? { src: `/ad-frame/${ad._id}?f=${encodeURIComponent(frameId)}` }
    : {
        srcDoc: frameDocument(ad.code, frameId),
        sandbox: 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation',
      };

  // The frame is lazy-loaded, so start the clock when it actually loads.
  // No ad by then (unfilled, blocked, or a script that can't run in a frame):
  // collapse the slot instead of leaving an empty "Advertisement" box.
  const onFrameLoad = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { if (!filledRef.current) emptyCb.current?.(true); }, EMPTY_AFTER_MS);
  };

  return (
    <iframe
      ref={ref}
      title={ad.name || 'Advertisement'}
      {...frameSource}
      onLoad={onFrameLoad}
      loading="lazy"
      scrolling="no"
      style={{
        border: 0,
        display: 'block',
        margin: '0 auto',
        width: dims ? `${dims[0]}px` : '100%',
        maxWidth: '100%',
        height: `${height}px`,
        overflow: 'hidden',
        background: 'transparent',
      }}
    />
  );
}

function InlineCode({ ad }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.innerHTML = '';
    try { injectHtml(el, ad.code); } catch (err) { console.warn('Ad code failed to run:', err); }
    return () => { el.innerHTML = ''; };
  }, [ad.code]);
  return <div ref={ref} className="w-full flex justify-center" />;
}

function ImageAd({ ad, imgClassName = '', eager = false }) {
  // The size only caps the width — the whole creative is always shown (no cropping).
  const dims = SIZE_DIMENSIONS[ad.size];
  return (
    <a
      href={ad.websiteLink}
      target={ad.openInNewTab === false ? '_self' : '_blank'}
      rel="sponsored noopener noreferrer"
      onClick={() => trackClick(ad._id)}
      className="block mx-auto w-fit max-w-full"
      style={dims ? { maxWidth: `min(100%, ${dims[0]}px)` } : undefined}
    >
      <picture>
        {/* Phones get a ~480px copy — a fraction of the download. */}
        {ad.imageMobilePath && <source media="(max-width: 767px)" srcSet={ad.imageMobilePath} type="image/webp" />}
        <img
          src={ad.imagePath}
          alt={ad.altText || ad.name || 'Advertisement'}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={`block max-w-full h-auto rounded-md ${imgClassName}`}
        />
      </picture>
    </a>
  );
}

export default function AdCreative({ ad, imgClassName, eager, onEmptyChange }) {
  if (!ad) return null;
  if (ad.type === 'image') return <ImageAd ad={ad} imgClassName={imgClassName} eager={eager} />;
  return ad.renderMode === 'inline' ? <InlineCode ad={ad} /> : <IframeCode ad={ad} onEmptyChange={onEmptyChange} />;
}
