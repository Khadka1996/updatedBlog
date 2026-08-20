'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import JSZip from 'jszip';
import {
  FaCompressAlt,
  FaDownload,
  FaCloudUploadAlt,
  FaCrop,
  FaUndo,
  FaTimes,
  FaPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileArchive,
} from 'react-icons/fa';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import { toolsAdsConfig } from '@/config/tools-adsense.config';

const PRESET_GROUPS = [
  {
    group: 'Common',
    options: [
      { label: 'Free', ratio: null },
      { label: 'Square (1:1)', ratio: 1 },
      { label: 'Landscape (4:3)', ratio: 4 / 3 },
      { label: 'Portrait (3:4)', ratio: 3 / 4 },
      { label: 'Widescreen (16:9)', ratio: 16 / 9 },
    ],
  },
  {
    group: 'Social & web',
    options: [
      { label: 'Instagram post (1:1)', ratio: 1 },
      { label: 'Instagram portrait (4:5)', ratio: 4 / 5 },
      { label: 'Instagram / TikTok story (9:16)', ratio: 9 / 16 },
      { label: 'Facebook cover (2.63:1)', ratio: 2.63 },
      { label: 'X / Twitter post (16:9)', ratio: 16 / 9 },
      { label: 'LinkedIn banner (4:1)', ratio: 4 },
      { label: 'YouTube thumbnail (16:9)', ratio: 16 / 9 },
      { label: 'Website hero (21:9)', ratio: 21 / 9 },
    ],
  },
];

const MIN_CROP_SIZE = 24;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- Compression helpers (pure, outside the component) ----------

function loadImageEl(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

function drawToCanvas(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext('2d').drawImage(img, 0, 0);
  return canvas;
}

function mimeFor(format) {
  if (format === 'png') return 'image/png';
  if (format === 'webp') return 'image/webp';
  return 'image/jpeg';
}

async function compressWithQuality(dataUrl, format, qualityPct) {
  const img = await loadImageEl(dataUrl);
  const canvas = drawToCanvas(img);
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Compression failed'))), mimeFor(format), qualityPct / 100)
  );
  return blob;
}

// Binary-searches the quality knob to land at or just under a target byte size.
async function compressToTarget(dataUrl, format, targetBytes) {
  const img = await loadImageEl(dataUrl);
  const canvas = drawToCanvas(img);
  const mime = mimeFor(format);
  let lo = 5;
  let hi = 95;
  let best = null;

  for (let i = 0; i < 7 && lo <= hi; i++) {
    const mid = Math.round((lo + hi) / 2);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, mid / 100));
    if (!blob) break;
    if (blob.size <= targetBytes) {
      if (!best || blob.size > best.size) best = blob; // stay under target, maximize quality
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (!best) {
    // Couldn't get under target even at the lowest quality tried \u2014 return the smallest we found.
    best = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.05));
  }
  return best;
}

export default function PhotoSizeReducer() {
  const [items, setItems] = useState([]);
  const [activeItemId, setActiveItemId] = useState(null);

  // Active item's in-progress crop box (on-screen px, relative to the editor image)
  const [crop, setCrop] = useState(null);
  const [aspect, setAspect] = useState(null);
  const [presetLabel, setPresetLabel] = useState('Free');
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);

  // Export settings, applied to the whole batch
  const [mode, setMode] = useState('quality'); // 'quality' | 'target'
  const [format, setFormat] = useState('jpeg');
  const [quality, setQuality] = useState(80);
  const [targetKB, setTargetKB] = useState(200);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });

  const [isDragOverDropzone, setIsDragOverDropzone] = useState(false);
  const [error, setError] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const interactionRef = useRef(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && window.adsbygoogle) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, [hasMounted]);

  // Revoke every compressed blob URL on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((i) => i.compressedBlobUrl && URL.revokeObjectURL(i.compressedBlobUrl));
    };
  }, []);

  // Switching PNG out when target-size mode can't use it (no quality knob to search over)
  useEffect(() => {
    if (mode === 'target' && format === 'png') setFormat('jpeg');
  }, [mode, format]);

  // Reset the crop UI whenever the active item changes
  useEffect(() => {
    setCrop(null);
    setAspect(null);
    setPresetLabel('Free');
  }, [activeItemId]);

  const activeItem = items.find((i) => i.id === activeItemId) || null;

  // ---------- File intake ----------

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) {
      setError('No images found in that selection. Try a JPG, PNG, or WEBP.');
      return;
    }
    setError('');

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) =>
              resolve({
                id: makeId(),
                fileName: file.name,
                originalDataUrl: e.target.result,
                originalSize: file.size,
                naturalWidth: 0,
                naturalHeight: 0,
                croppedImage: null,
                compressedBlobUrl: null,
                compressedSize: null,
                compressedType: null,
                status: 'ready',
              });
            reader.readAsDataURL(file);
          })
      )
    ).then((newItems) => {
      setItems((prev) => [...prev, ...newItems]);
      setActiveItemId((prev) => prev || newItems[0]?.id || null);
    });
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOverDropzone(false);
    addFiles(e.dataTransfer.files);
  };

  const removeItem = (id) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.compressedBlobUrl) URL.revokeObjectURL(target.compressedBlobUrl);
      const next = prev.filter((i) => i.id !== id);
      if (activeItemId === id) setActiveItemId(next[0]?.id || null);
      return next;
    });
  };

  const clearAll = () => {
    items.forEach((i) => i.compressedBlobUrl && URL.revokeObjectURL(i.compressedBlobUrl));
    setItems([]);
    setActiveItemId(null);
    setError('');
  };

  // ---------- Crop box geometry ----------

  const initCropBox = () => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.clientWidth;
    const h = img.clientHeight;
    const marginX = w * 0.08;
    const marginY = h * 0.08;
    setCrop({ x: marginX, y: marginY, w: w - marginX * 2, h: h - marginY * 2 });
  };

  const handleImageLoad = () => {
    const img = imgRef.current;
    if (!img || !activeItemId) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === activeItemId ? { ...i, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight } : i
      )
    );
    initCropBox();
  };

  const applyPreset = (option) => {
    setAspect(option.ratio);
    setPresetLabel(option.label);
    const img = imgRef.current;
    if (!img || !option.ratio) {
      initCropBox();
      return;
    }
    const stageW = img.clientWidth;
    const stageH = img.clientHeight;
    let w = stageW * 0.7;
    let h = w / option.ratio;
    if (h > stageH * 0.9) {
      h = stageH * 0.9;
      w = h * option.ratio;
    }
    setCrop({ x: (stageW - w) / 2, y: (stageH - h) / 2, w, h });
  };

  // ---------- Drag / resize interactions ----------

  const beginInteraction = (mode_, e) => {
    e.preventDefault();
    e.stopPropagation();
    const point = e.touches ? e.touches[0] : e;
    interactionRef.current = { mode: mode_, startX: point.clientX, startY: point.clientY, startCrop: { ...crop } };
    setIsDraggingCrop(true);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', endInteraction);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', endInteraction);
  };

  const handlePointerMove = useCallback(
    (e) => {
      const interaction = interactionRef.current;
      const img = imgRef.current;
      if (!interaction || !img) return;
      e.preventDefault();

      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - interaction.startX;
      const dy = point.clientY - interaction.startY;
      const stageW = img.clientWidth;
      const stageH = img.clientHeight;
      const { mode: m, startCrop } = interaction;

      setCrop(() => {
        let { x, y, w, h } = startCrop;

        if (m === 'move') {
          x = clamp(startCrop.x + dx, 0, stageW - startCrop.w);
          y = clamp(startCrop.y + dy, 0, stageH - startCrop.h);
          return { x, y, w, h };
        }

        const anchorX = m.includes('w') ? startCrop.x + startCrop.w : startCrop.x;
        const anchorY = m.includes('n') ? startCrop.y + startCrop.h : startCrop.y;

        let newW = m.includes('w') ? startCrop.w - dx : startCrop.w + dx;
        let newH = m.includes('n') ? startCrop.h - dy : startCrop.h + dy;

        if (aspect) {
          if (Math.abs(dx) > Math.abs(dy)) newH = newW / aspect;
          else newW = newH * aspect;
        }

        newW = Math.max(newW, MIN_CROP_SIZE);
        newH = Math.max(newH, MIN_CROP_SIZE);

        x = m.includes('w') ? anchorX - newW : anchorX;
        y = m.includes('n') ? anchorY - newH : anchorY;

        if (x < 0) { newW += x; x = 0; }
        if (y < 0) { newH += y; y = 0; }
        if (x + newW > stageW) newW = stageW - x;
        if (y + newH > stageH) newH = stageH - y;

        return { x, y, w: Math.max(newW, MIN_CROP_SIZE), h: Math.max(newH, MIN_CROP_SIZE) };
      });
    },
    [aspect]
  );

  const endInteraction = useCallback(() => {
    interactionRef.current = null;
    setIsDraggingCrop(false);
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', endInteraction);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('touchend', endInteraction);
  }, [handlePointerMove]);

  useEffect(() => () => endInteraction(), [endInteraction]);

  // ---------- Apply crop (active item only) ----------

  const applyCropForActive = () => {
    const img = imgRef.current;
    if (!img || !crop || !activeItemId) return;
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    const canvas = canvasRef.current;
    const sw = crop.w * scaleX;
    const sh = crop.h * scaleY;
    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext('2d').drawImage(img, crop.x * scaleX, crop.y * scaleY, sw, sh, 0, 0, sw, sh);
    const dataUrl = canvas.toDataURL('image/png');
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== activeItemId) return i;
        if (i.compressedBlobUrl) URL.revokeObjectURL(i.compressedBlobUrl);
        return { ...i, croppedImage: dataUrl, compressedBlobUrl: null, compressedSize: null, status: 'ready' };
      })
    );
  };

  const recropActive = () => {
    setItems((prev) => prev.map((i) => (i.id === activeItemId ? { ...i, croppedImage: null } : i)));
  };

  // ---------- Batch compression ----------

  const compressAll = async () => {
    if (!items.length) return;
    setIsProcessingBatch(true);
    setBatchProgress({ done: 0, total: items.length });
    setError('');

    for (const item of itemsRef.current) {
      try {
        const working = item.croppedImage || item.originalDataUrl;
        const blob =
          mode === 'quality'
            ? await compressWithQuality(working, format, quality)
            : await compressToTarget(working, format, targetKB * 1024);
        setItems((prev) =>
          prev.map((i) => {
            if (i.id !== item.id) return i;
            if (i.compressedBlobUrl) URL.revokeObjectURL(i.compressedBlobUrl);
            return { ...i, compressedBlobUrl: URL.createObjectURL(blob), compressedSize: blob.size, compressedType: format, status: 'done' };
          })
        );
      } catch (e) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'error' } : i)));
      }
      setBatchProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setIsProcessingBatch(false);
  };

  const downloadItem = (item) => {
    if (!item.compressedBlobUrl) return;
    const extension = item.compressedType === 'jpeg' ? 'jpg' : item.compressedType;
    const link = document.createElement('a');
    link.href = item.compressedBlobUrl;
    link.download = `${item.fileName.replace(/\.[^/.]+$/, '')}-compressed.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllZip = async () => {
    const done = items.filter((i) => i.compressedBlobUrl);
    if (!done.length) return;
    try {
      const zip = new JSZip();
      for (const item of done) {
        const res = await fetch(item.compressedBlobUrl);
        const blob = await res.blob();
        const extension = item.compressedType === 'jpeg' ? 'jpg' : item.compressedType;
        const base = item.fileName.replace(/\.[^/.]+$/, '');
        zip.file(`${base}-compressed.${extension}`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressed-images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError('Couldn\u2019t build the zip file. You can still download images one at a time below.');
    }
  };

  const compressedItems = items.filter((i) => i.compressedBlobUrl);
  const totalOriginal = compressedItems.reduce((s, i) => s + i.originalSize, 0);
  const totalCompressed = compressedItems.reduce((s, i) => s + (i.compressedSize || 0), 0);
  const totalSavingsPct = totalOriginal && totalCompressed ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

  return (
    <>
      <NavBar />
      <Head>
        <title>Photo Size Reducer | Crop &amp; Compress Images Online</title>
        <meta
          name="description"
          content="Crop and compress photos in your browser, one at a time or in batches. Named presets for Instagram, YouTube, and more. Nothing uploads to a server."
        />
      </Head>
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

      <div className="min-h-screen bg-[#F6F7F9]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <nav className="mb-6" aria-label="Breadcrumb">
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
                Photo Size Reducer
              </li>
            </ol>
          </nav>

          {toolsAdsConfig.isConfigured() && toolsAdsConfig.hasSlot('TOP_SLOT') && (
            <div className="mb-6 flex justify-center">
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

          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#4DB154]/10">
              <FaCompressAlt className="text-xl text-[#4DB154]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#14181F] md:text-3xl">Photo Size Reducer</h1>
              <p className="mt-1 max-w-xl text-[#5B6470]">
                Crop to a named preset or a custom frame, then compress \u2014 one image or a whole batch.
                Everything runs in your browser.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>
              <button onClick={() => setError('')} aria-label="Dismiss error">
                <FaTimes className="text-red-400 hover:text-red-600" />
              </button>
            </div>
          )}

          <input
            id="image-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {items.length === 0 && (
            <label
              htmlFor="image-upload"
              onDragOver={(e) => { e.preventDefault(); setIsDragOverDropzone(true); }}
              onDragLeave={() => setIsDragOverDropzone(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center transition-colors ${
                isDragOverDropzone ? 'border-[#4DB154] bg-[#4DB154]/5' : 'border-[#D6DAE1] bg-white hover:border-[#4DB154]/50'
              }`}
            >
              <FaCloudUploadAlt className="mb-4 text-5xl text-[#4DB154]/70" />
              <p className="text-lg font-semibold text-[#14181F]">Drop images here, or click to browse</p>
              <p className="mt-1 text-sm text-[#8A93A0]">Select as many as you like &mdash; JPG, PNG, or WEBP</p>
            </label>
          )}

          {items.length > 0 && (
            <>
              {/* Filmstrip */}
              <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItemId(item.id)}
                    className={`group relative flex-shrink-0 cursor-pointer rounded-xl border-2 p-1.5 transition-colors ${
                      activeItemId === item.id ? 'border-[#4DB154]' : 'border-transparent hover:border-[#E2E5EA]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.croppedImage || item.originalDataUrl}
                      alt={item.fileName}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#8A93A0] opacity-0 shadow transition-opacity hover:text-red-500 group-hover:opacity-100"
                      aria-label={`Remove ${item.fileName}`}
                    >
                      <FaTimes className="text-xs" />
                    </button>
                    {item.status === 'done' && (
                      <FaCheckCircle className="absolute -bottom-1 -right-1 rounded-full bg-white text-sm text-[#3A9D44]" />
                    )}
                    {item.status === 'error' && (
                      <FaExclamationCircle className="absolute -bottom-1 -right-1 rounded-full bg-white text-sm text-red-500" />
                    )}
                    {item.compressedBlobUrl && (
                      <button
                        onClick={(e) => { e.stopPropagation(); downloadItem(item); }}
                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 text-transparent transition-colors hover:bg-black/40 hover:text-white"
                        aria-label={`Download ${item.fileName}`}
                      >
                        <FaDownload />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D6DAE1] text-[#8A93A0] transition-colors hover:border-[#4DB154] hover:text-[#4DB154]"
                >
                  <FaPlus />
                  <span className="mt-1 text-[10px] font-medium">Add more</span>
                </button>
                <button onClick={clearAll} className="ml-2 flex-shrink-0 text-xs font-medium text-[#8A93A0] hover:text-red-500">
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                {/* Crop stage */}
                <div className="rounded-2xl border border-[#E2E5EA] bg-white p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#14181F]">
                      <FaCrop className="text-[#4DB154]" />
                      <select
                        value={presetLabel}
                        disabled={!!activeItem?.croppedImage}
                        onChange={(e) => {
                          const opt = PRESET_GROUPS.flatMap((g) => g.options).find((o) => o.label === e.target.value);
                          if (opt) applyPreset(opt);
                        }}
                        className="rounded-md border border-[#E2E5EA] bg-white px-2.5 py-1.5 text-xs font-medium text-[#14181F] focus:border-[#4DB154] focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {PRESET_GROUPS.map((g) => (
                          <optgroup key={g.group} label={g.group}>
                            {g.options.map((o) => (
                              <option key={o.label} value={o.label}>{o.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  {activeItem && !activeItem.croppedImage && (
                    <div className="relative mx-auto select-none" style={{ maxWidth: '100%', width: 'fit-content' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={activeItem.id}
                        ref={imgRef}
                        src={activeItem.originalDataUrl}
                        alt={`${activeItem.fileName} \u2014 crop target`}
                        onLoad={handleImageLoad}
                        draggable={false}
                        className="block max-h-[60vh] w-auto max-w-full rounded-lg"
                      />

                      {crop && (
                        <>
                          <div className="pointer-events-none absolute bg-black/50" style={{ left: 0, top: 0, right: 0, height: crop.y }} />
                          <div className="pointer-events-none absolute bg-black/50" style={{ left: 0, top: crop.y + crop.h, right: 0, bottom: 0 }} />
                          <div className="pointer-events-none absolute bg-black/50" style={{ left: 0, top: crop.y, width: crop.x, height: crop.h }} />
                          <div className="pointer-events-none absolute bg-black/50" style={{ left: crop.x + crop.w, top: crop.y, right: 0, height: crop.h }} />

                          <div
                            onMouseDown={(e) => beginInteraction('move', e)}
                            onTouchStart={(e) => beginInteraction('move', e)}
                            className="absolute cursor-move border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
                            style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                          >
                            {isDraggingCrop && (
                              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                                {Array.from({ length: 9 }).map((_, i) => (
                                  <div key={i} className="border border-white/40" />
                                ))}
                              </div>
                            )}
                            {['nw', 'ne', 'sw', 'se'].map((corner) => (
                              <div
                                key={corner}
                                onMouseDown={(e) => beginInteraction(corner, e)}
                                onTouchStart={(e) => beginInteraction(corner, e)}
                                className={`absolute h-5 w-5 rounded-full border-2 border-[#4DB154] bg-white ${
                                  corner === 'nw' ? '-left-2.5 -top-2.5 cursor-nwse-resize' : ''
                                }${corner === 'ne' ? '-right-2.5 -top-2.5 cursor-nesw-resize' : ''}${
                                  corner === 'sw' ? '-left-2.5 -bottom-2.5 cursor-nesw-resize' : ''
                                }${corner === 'se' ? '-right-2.5 -bottom-2.5 cursor-nwse-resize' : ''}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeItem?.croppedImage && (
                    <div className="flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={activeItem.croppedImage} alt="Cropped result" className="max-h-[60vh] w-auto max-w-full rounded-lg" />
                    </div>
                  )}

                  {activeItem && (
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg bg-[#F6F7F9] px-4 py-2.5 font-mono text-xs text-[#5B6470]">
                      <span>{activeItem.fileName}</span>
                      {activeItem.naturalWidth > 0 && (
                        <span>{activeItem.naturalWidth} &times; {activeItem.naturalHeight}px</span>
                      )}
                      <span>{formatFileSize(activeItem.originalSize)}</span>
                      {activeItem.croppedImage && <span className="text-[#3A9D44]">cropped</span>}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    {activeItem && !activeItem.croppedImage ? (
                      <button
                        onClick={applyCropForActive}
                        disabled={!crop}
                        className="rounded-lg bg-[#3A9D44] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4DB154] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Apply crop
                      </button>
                    ) : (
                      activeItem && (
                        <button
                          onClick={recropActive}
                          className="flex items-center gap-2 rounded-lg border border-[#E2E5EA] px-4 py-2 text-sm font-medium text-[#5B6470] transition-colors hover:bg-[#F0F2F5]"
                        >
                          <FaUndo className="text-xs" /> Recrop
                        </button>
                      )
                    )}
                    <span className="ml-auto self-center text-xs text-[#8A93A0]">
                      {items.length} image{items.length !== 1 ? 's' : ''} in this batch
                    </span>
                  </div>
                </div>

                {/* Export panel */}
                <div className="h-fit rounded-2xl border border-[#E2E5EA] bg-white p-5">
                  <h2 className="mb-4 text-sm font-medium text-[#14181F]">Compress &amp; export</h2>

                  <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-[#F0F2F5] p-1">
                    <button
                      onClick={() => setMode('quality')}
                      className={`rounded-md py-1.5 text-xs font-medium transition-colors ${mode === 'quality' ? 'bg-white text-[#14181F] shadow-sm' : 'text-[#8A93A0]'}`}
                    >
                      By quality
                    </button>
                    <button
                      onClick={() => setMode('target')}
                      className={`rounded-md py-1.5 text-xs font-medium transition-colors ${mode === 'target' ? 'bg-white text-[#14181F] shadow-sm' : 'text-[#8A93A0]'}`}
                    >
                      By target size
                    </button>
                  </div>

                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8A93A0]">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="mb-4 w-full rounded-lg border border-[#E2E5EA] bg-white p-2.5 text-sm text-[#14181F] focus:border-[#4DB154] focus:outline-none focus:ring-2 focus:ring-[#4DB154]/20"
                  >
                    <option value="jpeg">JPEG &mdash; best for photos</option>
                    <option value="webp">WEBP &mdash; smallest file size</option>
                    <option value="png" disabled={mode === 'target'}>
                      PNG &mdash; lossless{mode === 'target' ? ' (quality mode only)' : ''}
                    </option>
                  </select>

                  {mode === 'quality' ? (
                    <>
                      <label className="mb-1 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-[#8A93A0]">
                        <span>Quality</span>
                        <span className="font-mono normal-case text-[#14181F]">{format === 'png' ? '\u2014' : `${quality}%`}</span>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        disabled={format === 'png'}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="mb-1 w-full accent-[#4DB154] disabled:opacity-40"
                      />
                      <p className="mb-5 text-xs text-[#8A93A0]">
                        {format === 'png' ? 'PNG is lossless \u2014 quality doesn\u2019t apply.' : 'Lower quality means a smaller file.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8A93A0]">Target size per image</label>
                      <div className="mb-1 flex items-center gap-2">
                        <input
                          type="number"
                          min="10"
                          value={targetKB}
                          onChange={(e) => setTargetKB(Math.max(10, Number(e.target.value) || 0))}
                          className="w-full rounded-lg border border-[#E2E5EA] bg-white p-2.5 text-sm text-[#14181F] focus:border-[#4DB154] focus:outline-none focus:ring-2 focus:ring-[#4DB154]/20"
                        />
                        <span className="text-sm text-[#8A93A0]">KB</span>
                      </div>
                      <p className="mb-5 text-xs text-[#8A93A0]">
                        We search for the highest quality that still fits under this size. Very small targets may not be reachable.
                      </p>
                    </>
                  )}

                  <button
                    onClick={compressAll}
                    disabled={isProcessingBatch || !items.length}
                    className="w-full rounded-lg bg-[#3A9D44] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4DB154] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessingBatch
                      ? `Compressing ${batchProgress.done}/${batchProgress.total}\u2026`
                      : `Compress all (${items.length})`}
                  </button>

                  {isProcessingBatch && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#F0F2F5]">
                      <div
                        className="h-full bg-[#4DB154] transition-all"
                        style={{ width: `${(batchProgress.done / Math.max(batchProgress.total, 1)) * 100}%` }}
                      />
                    </div>
                  )}

                  {compressedItems.length > 0 && (
                    <div className="mt-5 border-t border-[#E2E5EA] pt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-[#14181F]">
                          {compressedItems.length} of {items.length} compressed
                        </span>
                        {totalSavingsPct > 0 && (
                          <span className="rounded-full bg-[#3A9D44]/10 px-2.5 py-0.5 text-xs font-semibold text-[#3A9D44]">
                            {totalSavingsPct}% smaller
                          </span>
                        )}
                      </div>
                      <div className="mb-4 flex justify-between font-mono text-xs text-[#5B6470]">
                        <span>{formatFileSize(totalOriginal)} total</span>
                        <span>&rarr; {formatFileSize(totalCompressed)}</span>
                      </div>
                      <button
                        onClick={downloadAllZip}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3A9D44] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4DB154]"
                      >
                        <FaFileArchive /> Download all (.zip)
                      </button>
                      <p className="mt-2 text-center text-xs text-[#8A93A0]">
                        Or hover a thumbnail above and click <FaDownload className="inline text-[10px]" /> to download it alone.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-8 rounded-xl border border-[#E2E5EA] bg-white p-5">
            <h3 className="mb-2 text-sm font-semibold text-[#14181F]">Tips for best results</h3>
            <ul className="space-y-1 text-sm text-[#5B6470]">
              <li>Photos: JPEG at 60&ndash;80% quality is usually the best size-to-quality trade-off.</li>
              <li>Logos and graphics with flat colors: use PNG to keep edges sharp and support transparency.</li>
              <li>Use target-size mode when a form or platform enforces a strict upload limit.</li>
              <li>Crop first, then compress &mdash; a smaller frame compresses further at the same quality.</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}