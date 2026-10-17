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

// Sandboxed frame document. Scripts run while the frame document is still
// parsing, so network snippets that rely on document.write (Adsterra,
// PropellerAds banners, ...) work. The frame reports its height to the parent.
const frameDocument = (code, frameId) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<base target="_blank">
<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}body{display:flex;justify-content:center;align-items:flex-start}</style>
</head><body>${code}
<script>(function(){var last=0;function post(){var h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);if(h!==last){last=h;parent.postMessage({ekAdFrame:${JSON.stringify(frameId)},height:h},'*');}}
window.addEventListener('load',post);if(window.ResizeObserver){new ResizeObserver(post).observe(document.body);}setInterval(post,1000);setTimeout(post,50);})();</script>
</body></html>`;

let frameCounter = 0;

function IframeCode({ ad }) {
  const ref = useRef(null);
  const [frameId] = useState(() => `ekad-${++frameCounter}-${ad._id}`);
  const dims = SIZE_DIMENSIONS[ad.size];
  const [height, setHeight] = useState(dims ? dims[1] : 90);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== ref.current?.contentWindow) return;
      const h = Number(event.data?.height);
      if (event.data?.ekAdFrame === frameId && h > 0 && h < 2000) setHeight(dims ? dims[1] : h);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [frameId, dims]);

  return (
    <iframe
      ref={ref}
      title={ad.name || 'Advertisement'}
      srcDoc={frameDocument(ad.code, frameId)}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation"
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

export default function AdCreative({ ad, imgClassName, eager }) {
  if (!ad) return null;
  if (ad.type === 'image') return <ImageAd ad={ad} imgClassName={imgClassName} eager={eager} />;
  return ad.renderMode === 'inline' ? <InlineCode ad={ad} /> : <IframeCode ad={ad} />;
}
