'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Script from 'next/script';
import Head from 'next/head';
import Link from 'next/link';
import {
  FaDownload,
  FaRedo,
  FaArrowsAltH,
  FaTimes,
  FaImage
} from 'react-icons/fa';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import FileDropzone from '@/app/components/tools/FileDropzone';
import { toolsAdsConfig } from '@/config/tools-adsense.config';

// ─── Design tokens ──────────────────────────────────────────────────────
// A "darkroom" concept: a dark canvas stage (the light table) framed by a
// quiet white control rail. Pixel dimensions render in monospace, like a
// viewfinder HUD, because this is a precision instrument, not a form.
//   canvas   #14171A   the stage
//   brand    #4DB154   primary actions (site accent)
//   safelight#F5A623   active/selection accents on the dark stage
//   ink      #111827   body text
//   muted    #6B7280   secondary text

const ASPECTS = [
  { value: 0, label: 'Freeform' },
  { value: 1, label: '1:1' },
  { value: 4 / 3, label: '4:3' },
  { value: 3 / 4, label: '3:4' },
  { value: 16 / 9, label: '16:9' },
  { value: 9 / 16, label: '9:16' }
];

const FORMATS = [
  { value: 'image/png', label: 'PNG', ext: 'png', lossless: true },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg', lossless: false },
  { value: 'image/webp', label: 'WebP', ext: 'webp', lossless: false }
];

const MAX_FILE_MB = 25;

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Bake a rotation/flip into the source image itself (as a new data URL) so
// the crop tool and the exporter never have to reason about transforms —
// they just always see an upright, unflipped image.
async function transformImage(src, { rotateBy = 0, flip = false }) {
  const img = await loadImage(src);
  const swap = Math.abs(rotateBy) % 180 === 90;
  const canvas = document.createElement('canvas');
  canvas.width = swap ? img.height : img.width;
  canvas.height = swap ? img.width : img.height;
  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rotateBy) ctx.rotate((rotateBy * Math.PI) / 180);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  return canvas.toDataURL('image/png', 1);
}

export default function HighQualityCropper() {
  const [imgSrc, setImgSrc] = useState('');
  const [fileMeta, setFileMeta] = useState(null); // { name, size }
  const [naturalSize, setNaturalSize] = useState(null); // { width, height }
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [aspect, setAspect] = useState(0);
  const [format, setFormat] = useState(FORMATS[0]);
  const [quality, setQuality] = useState(0.92);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ─── Load a file (from input, drop, or paste) ──────────────────────────
  const loadFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('That file isn\u2019t an image. Try a JPG, PNG, or WebP.');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`That file is too large. Keep it under ${MAX_FILE_MB} MB.`);
      return;
    }
    setError('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result?.toString() || '');
      setFileMeta({ name: file.name, size: file.size });
    };
    reader.readAsDataURL(file);
  }, []);

  const onSelectFile = (e) => loadFile(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    loadFile(e.dataTransfer.files?.[0]);
  };

  // Paste an image from the clipboard anywhere on the page
  useEffect(() => {
    const onPaste = (e) => {
      const item = Array.from(e.clipboardData?.items || []).find(i => i.type.startsWith('image/'));
      if (item) loadFile(item.getAsFile());
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadFile]);

  const clearImage = () => {
    setImgSrc('');
    setFileMeta(null);
    setNaturalSize(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Crop box setup ─────────────────────────────────────────────────
  function applyInitialCrop(width, height, targetAspect) {
    const base = { unit: '%', width: 80, height: 80, x: 10, y: 10 };
    const next = targetAspect
      ? centerCrop(makeAspectCrop({ unit: '%', width: 80 }, targetAspect, width, height), width, height)
      : centerCrop(base, width, height);
    setCrop(next);
  }

  function onImageLoad(e) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    applyInitialCrop(naturalWidth, naturalHeight, aspect || undefined);
  }

  function changeAspect(value) {
    setAspect(value);
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      applyInitialCrop(naturalWidth, naturalHeight, value || undefined);
    }
  }

  async function rotate(deg) {
    if (!imgSrc || busy) return;
    setBusy(true);
    try {
      const next = await transformImage(imgSrc, { rotateBy: deg });
      setImgSrc(next);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } finally {
      setBusy(false);
    }
  }

  async function flipHorizontal() {
    if (!imgSrc || busy) return;
    setBusy(true);
    try {
      const next = await transformImage(imgSrc, { flip: true });
      setImgSrc(next);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } finally {
      setBusy(false);
    }
  }

  // ─── Render the crop into an offscreen canvas at full resolution ────────
  useEffect(() => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropWidth = Math.round(completedCrop.width * scaleX);
    const cropHeight = Math.round(completedCrop.height * scaleY);

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, cropWidth, cropHeight);
    ctx.drawImage(
      image,
      completedCrop.x * scaleX, completedCrop.y * scaleY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
  }, [completedCrop]);

  const outputSize = completedCrop?.width && imgRef.current
    ? {
        w: Math.round(completedCrop.width * (imgRef.current.naturalWidth / imgRef.current.width)),
        h: Math.round(completedCrop.height * (imgRef.current.naturalHeight / imgRef.current.height))
      }
    : null;

  async function handleDownload() {
    if (!canvasRef.current || !outputSize?.w) return;
    try {
      const blob = await new Promise((resolve) =>
        canvasRef.current.toBlob(resolve, format.value, format.lossless ? undefined : quality)
      );
      if (!blob) throw new Error('Failed to create image blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const baseName = (fileMeta?.name || 'image').replace(/\.[^/.]+$/, '');
      link.download = `${baseName}-cropped.${format.ext}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 200);
    } catch (err) {
      console.error('Download error:', err);
      setError('Could not export that image. Please try again.');
    }
  }

  return (
    <>
      <Head>
        <title>Photo Cropper | Crop Images Online</title>
        <meta name="description" content="Crop, rotate, flip, and resize images online with EverestKit's free photo cropper." />
        <link rel="canonical" href="https://everestkit.com/tools/photo-cropper" />
        <meta property="og:title" content="Photo Cropper | Crop Images Online" />
        <meta property="og:description" content="Crop, rotate, flip, and resize images online with a free photo cropper." />
        <meta property="og:url" content="https://everestkit.com/tools/photo-cropper" />
      </Head>
      <NavBar />
      <div className="bg-gray-50 min-h-screen">
        {toolsAdsConfig.isConfigured() && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            src={toolsAdsConfig.getScriptUrl()}
            crossOrigin="anonymous"
            onLoad={() => {
              if (window.adsbygoogle) (window.adsbygoogle = window.adsbygoogle || []).push({});
            }}
            onError={(e) => console.error('AdSense script failed to load', e)}
          />
        )}

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
          <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="transition hover:text-[#3A9D44]">Home</Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li>
                <Link href="/tools" className="transition hover:text-[#3A9D44]">Tools</Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li aria-current="page" className="font-semibold text-[#3A9D44]">
                Photo Cropper
              </li>
            </ol>
          </nav>

          {toolsAdsConfig.isConfigured() && toolsAdsConfig.hasSlot('TOP_SLOT') && (
            <div className="mb-8 flex justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '100%', height: 'auto' }}
                data-ad-client={toolsAdsConfig.getPublisherId()}
                data-ad-slot={toolsAdsConfig.getSlotId('TOP_SLOT')}
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
            </div>
          )}

          <div className="mb-8">
            <span className="text-xs font-semibold tracking-widest text-[#4DB154] uppercase">Image tool</span>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Crop your photo</h1>
            <p className="mt-2 text-gray-500 max-w-xl">
              Upload an image, frame your crop, and export it at full resolution — nothing leaves your browser.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <FaTimes className="flex-shrink-0" />
              {error}
            </div>
          )}

          {!imgSrc ? (
            <FileDropzone
              accept="image/*"
              inputRef={fileInputRef}
              onChange={onSelectFile}
              onDrop={onDrop}
              title="Drop an image, paste, or"
              helpText={`JPG, PNG, or WebP · up to ${MAX_FILE_MB} MB`}
            />
          ) : (
            /* ─── Workspace ───────────────────────────────────────────── */
            <div className="grid lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">

              {/* Canvas stage */}
              <div className="relative rounded-2xl overflow-hidden bg-[#14171A] min-h-[360px] sm:min-h-[480px] flex items-center justify-center p-4 sm:p-8">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect || undefined}
                  ruleOfThirds
                  minWidth={20}
                  minHeight={20}
                  className="max-w-full max-h-[70vh]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    alt="Image to crop"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-w-full max-h-[70vh] object-contain block"
                  />
                </ReactCrop>

                {/* Viewfinder HUD — live output dimensions */}
                {outputSize && (
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 rounded-md bg-black/60 backdrop-blur px-3 py-1.5 font-mono text-[11px] sm:text-xs text-[#F5A623] tracking-wide">
                    {outputSize.w} × {outputSize.h} px
                  </div>
                )}

                {/* Transform toolbar */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => rotate(90)}
                    disabled={busy}
                    title="Rotate 90°"
                    aria-label="Rotate 90 degrees"
                    className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#F5A623] outline-none"
                  >
                    <FaRedo className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={flipHorizontal}
                    disabled={busy}
                    title="Flip horizontal"
                    aria-label="Flip horizontal"
                    className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#F5A623] outline-none"
                  >
                    <FaArrowsAltH className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    title="Remove image"
                    aria-label="Remove image"
                    className="w-9 h-9 rounded-full bg-black/50 hover:bg-red-500/80 text-white flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-[#F5A623] outline-none"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Control rail */}
              <div className="space-y-4 sm:space-y-5">

                {/* File info */}
                <div className="rounded-xl bg-white border border-gray-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 truncate">
                    <FaImage className="text-[#4DB154] flex-shrink-0" />
                    <span className="truncate">{fileMeta?.name || 'Untitled'}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {naturalSize ? `${naturalSize.width} × ${naturalSize.height} px` : '—'}
                    {fileMeta?.size ? ` · ${formatBytes(fileMeta.size)}` : ''}
                  </p>
                </div>

                {/* Aspect ratio */}
                <div className="rounded-xl bg-white border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Aspect ratio</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECTS.map((r) => (
                      <button
                        key={r.label}
                        type="button"
                        onClick={() => changeAspect(r.value)}
                        className={`py-2 rounded-lg text-xs font-semibold border transition ${
                          aspect === r.value
                            ? 'border-[#4DB154] bg-[#4DB154]/10 text-[#3A9D44]'
                            : 'border-gray-200 text-gray-500 hover:border-[#4DB154]/40'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export format */}
                <div className="rounded-xl bg-white border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Export as</p>
                  <div className="flex gap-2">
                    {FORMATS.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFormat(f)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                          format.value === f.value
                            ? 'border-[#4DB154] bg-[#4DB154]/10 text-[#3A9D44]'
                            : 'border-gray-200 text-gray-500 hover:border-[#4DB154]/40'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {!format.lossless && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Quality</span>
                        <span className="font-mono">{Math.round(quality * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.01"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full accent-[#4DB154]"
                      />
                    </div>
                  )}
                </div>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={!outputSize?.w}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#3A9D44] to-[#4DB154] hover:from-[#4DB154] hover:to-[#3A9D44] shadow-md hover:shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4DB154] outline-none"
                >
                  <FaDownload />
                  Download {format.label}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  {outputSize?.w ? 'Exports at full source resolution.' : 'Drag the crop box to set your selection.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}