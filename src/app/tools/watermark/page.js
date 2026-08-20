'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FaFilePdf, FaImage, FaFont, FaDownload, FaUndo, FaArrowsAlt, FaTimes } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import Link from 'next/link';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import { toolsAdsConfig } from '@/config/tools-adsense.config';

const FONTS = [
  { label: 'Helvetica', value: StandardFonts.Helvetica },
  { label: 'Times Roman', value: StandardFonts.TimesRoman },
  { label: 'Courier', value: StandardFonts.Courier },
];

// Anchor presets store the CENTER of the watermark as a fraction of page width/height (0–1, top-left origin).
const PRESETS = [
  { id: 'top-left', label: 'Top Left', x: 0.16, y: 0.12 },
  { id: 'top-center', label: 'Top Center', x: 0.5, y: 0.12 },
  { id: 'top-right', label: 'Top Right', x: 0.84, y: 0.12 },
  { id: 'center-left', label: 'Mid Left', x: 0.16, y: 0.5 },
  { id: 'center', label: 'Center', x: 0.5, y: 0.5 },
  { id: 'center-right', label: 'Mid Right', x: 0.84, y: 0.5 },
  { id: 'bottom-left', label: 'Bottom Left', x: 0.16, y: 0.88 },
  { id: 'bottom-center', label: 'Bottom Center', x: 0.5, y: 0.88 },
  { id: 'bottom-right', label: 'Bottom Right', x: 0.84, y: 0.88 },
];

const MAX_FILE_MB = 50;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function hexToRgb(hex) {
  const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const full = hex.replace(shorthand, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

// Parses "1-3,5,8" into zero-based page indices, clipped to the document's page count.
function parsePageRange(rangeStr, totalPages) {
  const indices = new Set();
  rangeStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((part) => {
      if (part.includes('-')) {
        const [a, b] = part.split('-').map((n) => parseInt(n, 10));
        if (!Number.isNaN(a) && !Number.isNaN(b)) {
          for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
            if (i >= 1 && i <= totalPages) indices.add(i - 1);
          }
        }
      } else {
        const n = parseInt(part, 10);
        if (!Number.isNaN(n) && n >= 1 && n <= totalPages) indices.add(n - 1);
      }
    });
  return Array.from(indices).sort((a, b) => a - b);
}

function resolvePageIndices(pagesOption, customRange, totalPages, currentPage) {
  if (pagesOption === 'current') return [currentPage];
  if (pagesOption === 'first') return [0];
  if (pagesOption === 'last') return [totalPages - 1];
  if (pagesOption === 'custom') {
    const parsed = parsePageRange(customRange, totalPages);
    return parsed.length ? parsed : Array.from({ length: totalPages }, (_, i) => i);
  }
  return Array.from({ length: totalPages }, (_, i) => i);
}

function centeredRotatedPlacement(centerX, centerY, width, height, angle) {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const corners = [[0, 0], [width * cos, width * sin], [-height * sin, height * cos], [width * cos - height * sin, width * sin + height * cos]];
  const minX = Math.min(...corners.map(([x]) => x));
  const maxX = Math.max(...corners.map(([x]) => x));
  const minY = Math.min(...corners.map(([, y]) => y));
  const maxY = Math.max(...corners.map(([, y]) => y));
  return {
    x: centerX - (maxX - minX) / 2 - minX,
    y: centerY - (maxY - minY) / 2 - minY,
  };
}

export default function WatermarkPDF() {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [pdfPages, setPdfPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(0);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [processError, setProcessError] = useState('');

  const [watermarkType, setWatermarkType] = useState('text');
  const [tiled, setTiled] = useState(false);
  const [text, setText] = useState('CONFIDENTIAL');
  const [font, setFont] = useState(StandardFonts.Helvetica);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(30);
  const [rotation, setRotation] = useState(-45);
  const [imageFile, setImageFile] = useState(null);
  const [imageSizePct, setImageSizePct] = useState(30);
  const [imageOpacity, setImageOpacity] = useState(30);
  const [imageNaturalRatio, setImageNaturalRatio] = useState(1);
  const [pagesOption, setPagesOption] = useState('all');
  const [customRange, setCustomRange] = useState('');

  // Center anchor of the watermark, as a fraction of page width/height (top-left origin).
  const [anchor, setAnchor] = useState({ x: 0.5, y: 0.5 });

  const [dragging, setDragging] = useState(null); // null | 'move' | 'resize'
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [fileDragOver, setFileDragOver] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const [adsLoaded, setAdsLoaded] = useState(false);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const containerRef = useRef(null);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, anchor: { x: 0.5, y: 0.5 }, size: 0 });

  const adsConfigured = toolsAdsConfig.isConfigured();

  // ---------- File handling ----------

  const validatePdfFile = (candidate) => {
    const isPdfType = candidate.type === 'application/pdf' || candidate.name.toLowerCase().endsWith('.pdf');
    if (!isPdfType) return 'Please choose a PDF file.';
    if (candidate.size > MAX_FILE_MB * 1024 * 1024) return `File is larger than ${MAX_FILE_MB}MB.`;
    return '';
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validationError = validatePdfFile(selected);
    if (validationError) {
      setFileError(validationError);
      return;
    }
    setFileError('');

    if (file?.preview) URL.revokeObjectURL(file.preview);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);

    setFile({
      file: selected,
      name: selected.name,
      size: (selected.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(selected),
    });
    setDownloadUrl('');
    setProcessError('');
    loadPdfPages(selected);
  };

  const loadPdfPages = async (pdfFile) => {
    setIsLoadingPdf(true);
    setPreviewError('');
    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.min.mjs');

      // Keep the worker as a public asset copied by the package postinstall
      // script so it always matches the installed pdfjs-dist version.
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      const renderedPages = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        renderedPages.push({
          pageNumber,
          dataUrl: canvas.toDataURL('image/jpeg', 0.85),
          width: viewport.width,
          height: viewport.height,
          totalPages: pdf.numPages,
        });
      }

      setPdfPages(renderedPages);
      setSelectedPage(0);
    } catch (err) {
      console.error('Failed to load PDF preview:', err);
      setPdfPages([]);
      setPreviewError(
        err?.name === 'PasswordException'
          ? 'This PDF is password-protected, so it can\u2019t be previewed here.'
          : 'Couldn\u2019t generate a visual preview for this PDF (the file itself is fine). You can still set watermark options and apply — use the quick-position buttons on the right since drag-to-place needs the preview.'
      );
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const removeFile = () => {
    if (file?.preview) URL.revokeObjectURL(file.preview);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setPdfPages([]);
    setSelectedPage(0);
    setDownloadUrl('');
    setProcessError('');
  };

  // ---------- Watermark image handling ----------

  const handleImageChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!/^image\/(png|jpe?g)$/.test(selected.type)) {
      setProcessError('Watermark image must be PNG or JPG.');
      return;
    }
    if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    setImageFile({ file: selected, name: selected.name, preview: URL.createObjectURL(selected) });
    setProcessError('');
    if (downloadUrl) { URL.revokeObjectURL(downloadUrl); setDownloadUrl(''); }
  };

  const resetImage = () => {
    if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    setImageFile(null);
  };

  // ---------- Preview: measure container ----------

  useEffect(() => {
    if (!containerRef.current || pdfPages.length === 0) return undefined;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].target.getBoundingClientRect();
      setContainerSize({ width, height });
    });
    observer.observe(el);
    const { width, height } = el.getBoundingClientRect();
    setContainerSize({ width, height });
    return () => observer.disconnect();
  }, [pdfPages.length, selectedPage]);

  // Scale factor: displayed CSS pixels per PDF point.
  const scaleFactor = useMemo(() => {
    if (!pdfPages[selectedPage] || !containerSize.width) return 0;
    const pageWidthPoints = pdfPages[selectedPage].width / 1.5;
    return containerSize.width / pageWidthPoints;
  }, [pdfPages, selectedPage, containerSize]);

  const previewBox = useMemo(() => {
    if (!scaleFactor) return { width: 0, height: 0 };
    if (watermarkType === 'text') {
      const px = fontSize * scaleFactor;
      const width = clamp((text.length || 1) * px * 0.56 + 16, 40, containerSize.width || 9999);
      const height = px * 1.5;
      return { width, height };
    }
    const width = containerSize.width * (imageSizePct / 100);
    const height = width * imageNaturalRatio;
    return { width, height };
  }, [watermarkType, fontSize, text, scaleFactor, imageSizePct, imageNaturalRatio, containerSize.width]);

  // ---------- Drag / resize (pointer-based, works for mouse + touch) ----------

  const applyPresetAnchor = (preset) => setAnchor({ x: preset.x, y: preset.y });

  const startMove = (e) => {
    e.preventDefault();
    dragStartRef.current = {
      pointerX: e.clientX ?? e.touches?.[0]?.clientX ?? 0,
      pointerY: e.clientY ?? e.touches?.[0]?.clientY ?? 0,
      anchor: { ...anchor },
    };
    setDragging('move');
  };

  const startResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragStartRef.current = {
      pointerX: e.clientX ?? e.touches?.[0]?.clientX ?? 0,
      pointerY: e.clientY ?? e.touches?.[0]?.clientY ?? 0,
      size: watermarkType === 'text' ? fontSize : imageSizePct,
    };
    setDragging('resize');
  };

  useEffect(() => {
    if (!dragging) return undefined;

    const onMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX == null || !containerSize.width) return;

      if (dragging === 'move') {
        const dxFrac = (clientX - dragStartRef.current.pointerX) / containerSize.width;
        const dyFrac = (clientY - dragStartRef.current.pointerY) / containerSize.height;
        setAnchor({
          x: clamp(dragStartRef.current.anchor.x + dxFrac, 0.03, 0.97),
          y: clamp(dragStartRef.current.anchor.y + dyFrac, 0.03, 0.97),
        });
      } else if (dragging === 'resize') {
        const delta = clientX - dragStartRef.current.pointerX;
        if (watermarkType === 'text') {
          setFontSize(clamp(Math.round(dragStartRef.current.size + delta * 0.3), 10, 150));
        } else {
          const deltaPct = (delta / containerSize.width) * 100;
          setImageSizePct(clamp(Math.round(dragStartRef.current.size + deltaPct), 5, 90));
        }
      }
    };

    const onUp = () => setDragging(null);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, containerSize, watermarkType]);

  const nudgeAnchor = (e) => {
    const step = e.shiftKey ? 0.05 : 0.01;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (!moves[e.key]) return;
    e.preventDefault();
    const [dx, dy] = moves[e.key];
    setAnchor((prev) => ({ x: clamp(prev.x + dx, 0.03, 0.97), y: clamp(prev.y + dy, 0.03, 0.97) }));
  };

  // ---------- Apply watermark ----------

  const handleWatermark = async () => {
    if (!file) {
      setProcessError('Please select a PDF file first.');
      return;
    }
    if (watermarkType === 'text' && !text.trim()) {
      setProcessError('Enter watermark text.');
      return;
    }
    if (watermarkType === 'image' && !imageFile) {
      setProcessError('Please select a watermark image.');
      return;
    }

    setIsProcessing(true);
    setProcessError('');

    try {
      const pdfBytes = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const pageIndices = resolvePageIndices(pagesOption, customRange, pages.length, selectedPage);
      const op = clamp(opacity, 1, 100) / 100;
      const rgbColor = hexToRgb(color);

      if (watermarkType === 'text') {
        const embeddedFont = await pdfDoc.embedFont(font);
        const content = text.trim();
        const textWidth = embeddedFont.widthOfTextAtSize(content, fontSize);
        const textHeight = embeddedFont.heightAtSize(fontSize);

        for (const idx of pageIndices) {
          const page = pages[idx];
          const { width, height } = page.getSize();

          if (tiled) {
            const stepX = textWidth + 90;
            const stepY = fontSize * 3;
            for (let x = -width * 0.25; x < width * 1.25; x += stepX) {
              for (let y = -height * 0.25; y < height * 1.25; y += stepY) {
                page.drawText(content, {
                  x, y, size: fontSize, font: embeddedFont,
                  color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255),
                  opacity: op, rotate: degrees(rotation),
                });
              }
            }
          } else {
            const placement = centeredRotatedPlacement(anchor.x * width, (1 - anchor.y) * height, textWidth, textHeight, rotation);
            page.drawText(content, {
              x: placement.x, y: placement.y, size: fontSize, font: embeddedFont,
              color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255),
              opacity: op, rotate: degrees(rotation),
            });
          }
        }
      } else {
        const imgBytes = await imageFile.file.arrayBuffer();
        const isPng = imageFile.file.type === 'image/png';
        const embeddedImage = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
        const imgOp = clamp(imageOpacity, 1, 100) / 100;

        for (const idx of pageIndices) {
          const page = pages[idx];
          const { width, height } = page.getSize();
          const drawWidth = width * (imageSizePct / 100);
          const scale = drawWidth / embeddedImage.width;
          const drawHeight = embeddedImage.height * scale;

          if (tiled) {
            const stepX = drawWidth + 40;
            const stepY = drawHeight + 40;
            for (let x = -width * 0.25; x < width * 1.25; x += stepX) {
              for (let y = -height * 0.25; y < height * 1.25; y += stepY) {
                page.drawImage(embeddedImage, {
                  x, y, width: drawWidth, height: drawHeight, opacity: imgOp, rotate: degrees(rotation),
                });
              }
            }
          } else {
            const placement = centeredRotatedPlacement(anchor.x * width, (1 - anchor.y) * height, drawWidth, drawHeight, rotation);
            page.drawImage(embeddedImage, {
              x: placement.x, y: placement.y, width: drawWidth, height: drawHeight, opacity: imgOp, rotate: degrees(rotation),
            });
          }
        }
      }

      const outBytes = await pdfDoc.save();
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Watermarking failed:', err);
      setProcessError('Failed to apply watermark: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- Ads + cleanup ----------

  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        window.adsbygoogle.push({});
        if (file) window.adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded, file]);

  useEffect(() => {
    return () => {
      if (file?.preview) URL.revokeObjectURL(file.preview);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewLeft = anchor.x * containerSize.width - previewBox.width / 2;
  const previewTop = anchor.y * containerSize.height - previewBox.height / 2;

  return (
    <>
      <NavBar />

      <div className="p-6 bg-gray-100 min-h-screen">
        <Head>
          <title>Watermark PDF - PDF Tools</title>
          <meta name="description" content="Add text or image watermarks to your PDF documents" />
        </Head>

        {adsConfigured && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            src={toolsAdsConfig.getScriptUrl()}
            crossOrigin="anonymous"
            onLoad={() => setAdsLoaded(true)}
            onError={(e) => console.error('AdSense script failed to load', e)}
          />
        )}

        <div className="mx-3 md:mx-10 lg:mx-18">
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <li><Link href="/" className="transition hover:text-[#3A9D44]">Home</Link></li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li><Link href="/tools" className="transition hover:text-[#3A9D44]">Tools</Link></li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li aria-current="page" className="font-semibold text-[#3A9D44]">Watermark PDF</li>
            </ol>
          </nav>

          {adsConfigured && (
            <div className="mb-8">
              <ins className="adsbygoogle" style={{ display: 'block' }}
                data-ad-client={toolsAdsConfig.getPublisherId()} data-ad-slot={toolsAdsConfig.getSlotId('top')}
                data-ad-format="auto" data-full-width-responsive="true" />
            </div>
          )}

          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-2">
              <FaFilePdf className="text-[#4caf4f] text-3xl mr-3" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Watermark PDF</h1>
            </div>
            <p className="text-gray-600 mb-8">
              Add a text or image watermark to your PDF. Drag it directly on the preview to place it exactly where you want.
            </p>

            {fileError && (
              <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
                {fileError}
              </div>
            )}

            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
                  fileDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => fileInputRef.current.click()}
                onDragEnter={(e) => { e.preventDefault(); setFileDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setFileDragOver(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setFileDragOver(false);
                  if (e.dataTransfer.files.length) handleFileChange({ target: { files: e.dataTransfer.files } });
                }}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,application/pdf" onChange={handleFileChange} />
                <p className="text-gray-500 mb-1">
                  <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-400">PDF files only (max {MAX_FILE_MB}MB)</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-50 flex items-center justify-center rounded mr-3">
                    <FaFilePdf className="text-red-500" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-medium truncate text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.size}{pdfPages.length ? ` • ${pdfPages.length} pages` : ''}</p>
                  </div>
                  <button onClick={removeFile} className="p-2 text-gray-400 hover:text-red-600" aria-label="Remove file">
                    <FaTimes />
                  </button>
                </div>

                {adsConfigured && (
                  <div className="my-6">
                    <ins className="adsbygoogle" style={{ display: 'block' }}
                      data-ad-client={toolsAdsConfig.getPublisherId()} data-ad-slot={toolsAdsConfig.getSlotId('middle')}
                      data-ad-format="auto" data-full-width-responsive="true" />
                  </div>
                )}

                {processError && (
                  <div role="alert" className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
                    {processError}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Preview */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FaArrowsAlt className="text-blue-500" />
                        Live Preview
                      </h3>
                      <span className="text-xs text-gray-400">Drag to move · corner handle to resize</span>
                    </div>

                    {isLoadingPdf && (
                      <div className="bg-gray-50 rounded-lg p-16 text-center border border-gray-200">
                        <span className="inline-block h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-gray-500 text-sm">Loading preview…</p>
                      </div>
                    )}

                    {!isLoadingPdf && previewError && (
                      <div role="alert" className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                        {previewError}
                      </div>
                    )}

                    {!isLoadingPdf && pdfPages.length > 0 && (
                      <div className="max-h-[70vh] space-y-4 overflow-y-auto rounded-lg border border-gray-200 bg-gray-100 p-3 sm:p-4">
                        {pdfPages.map((page, index) => (
                          <div key={page.pageNumber}>
                            <button
                              type="button"
                              onClick={() => setSelectedPage(index)}
                              className={`mb-2 flex w-full items-center justify-between rounded px-3 py-2 text-left text-xs font-semibold transition ${
                                selectedPage === index ? 'bg-[#4DB154]/10 text-[#3A9D44]' : 'text-gray-500 hover:bg-white'
                              }`}
                            >
                              <span>Page {page.pageNumber}</span>
                              <span>{selectedPage === index ? 'Placement page' : 'Select page'}</span>
                            </button>
                            <div
                              ref={selectedPage === index ? containerRef : undefined}
                              onClick={() => setSelectedPage(index)}
                              className={`relative mx-auto w-full select-none overflow-hidden rounded-lg border bg-white ${selectedPage === index ? 'border-[#4DB154] shadow-sm' : 'border-gray-200'}`}
                              style={{ paddingBottom: `${(page.height / page.width) * 100}%` }}
                            >
                              <img src={page.dataUrl} alt={`PDF page ${page.pageNumber} preview`} className="pointer-events-none absolute inset-0 h-full w-full object-contain" />

                              {selectedPage === index && !tiled && containerSize.width > 0 && (
                                <div
                                  role="group"
                                  tabIndex={0}
                                  aria-label="Watermark position — use arrow keys to nudge"
                                  onKeyDown={nudgeAnchor}
                                  onMouseDown={startMove}
                                  onTouchStart={startMove}
                                  className="absolute flex cursor-move items-center justify-center rounded border-2 border-dashed border-[#4DB154] hover:border-[#3A9D44] focus:border-[#3A9D44] focus:outline-none"
                                  style={{
                                    left: previewLeft, top: previewTop,
                                    width: previewBox.width, height: previewBox.height,
                                    opacity: (watermarkType === 'text' ? opacity : imageOpacity) / 100,
                                    transform: `rotate(${rotation}deg)`,
                                  }}
                                >
                                  {watermarkType === 'text' ? (
                                    <span className="pointer-events-none whitespace-nowrap font-bold" style={{ color, fontSize: Math.max(8, fontSize * scaleFactor * 0.7) }}>
                                      {text || 'WATERMARK'}
                                    </span>
                                  ) : (
                                    imageFile && (
                                      <img
                                        src={imageFile.preview}
                                        alt="Watermark preview"
                                        className="pointer-events-none h-full w-full object-contain"
                                        onLoad={(e) => setImageNaturalRatio(e.target.naturalHeight / e.target.naturalWidth || 1)}
                                      />
                                    )
                                  )}
                                  <div onMouseDown={startResize} onTouchStart={startResize} className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize rounded-full border-2 border-white bg-[#4DB154] shadow" title="Drag to resize" />
                                </div>
                              )}

                              {selectedPage === index && tiled && (
                                <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded border border-dashed border-gray-300">
                                  <span className="rounded bg-white/80 px-2 py-1 text-xs text-gray-400">Tiled across full page</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Watermark Type</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setWatermarkType('text'); if (downloadUrl) { URL.revokeObjectURL(downloadUrl); setDownloadUrl(''); } }}
                          className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                            watermarkType === 'text' ? 'bg-[#4caf4f] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FaFont /> Text
                        </button>
                        <button
                          onClick={() => { setWatermarkType('image'); if (downloadUrl) { URL.revokeObjectURL(downloadUrl); setDownloadUrl(''); } }}
                          className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                            watermarkType === 'image' ? 'bg-[#4caf4f] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FaImage /> Image
                        </button>
                      </div>
                    </div>

                    {watermarkType === 'text' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                          <input type="text" value={text} onChange={(e) => setText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#4caf4f] outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Font</label>
                            <select value={font} onChange={(e) => setFont(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded">
                              {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-9 rounded border border-gray-300" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Font size — {fontSize}px</label>
                          <input type="range" min="10" max="150" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value, 10))} className="w-full" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Opacity — {opacity}%</label>
                          <input type="range" min="1" max="100" value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value, 10))} className="w-full" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Watermark image</label>
                          {imageFile ? (
                            <div className="flex items-center gap-3">
                              <div className="border border-gray-200 rounded p-1 flex-shrink-0">
                                <img src={imageFile.preview} alt="Watermark" className="h-14 w-14 object-contain" />
                              </div>
                              <button onClick={resetImage} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                                <FaUndo size={12} /> Change image
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                                imageDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => imageInputRef.current.click()}
                              onDragEnter={(e) => { e.preventDefault(); setImageDragOver(true); }}
                              onDragLeave={(e) => { e.preventDefault(); setImageDragOver(false); }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                setImageDragOver(false);
                                if (e.dataTransfer.files.length) handleImageChange({ target: { files: e.dataTransfer.files } });
                              }}
                            >
                              <p className="text-gray-500 text-sm">
                                <span className="text-blue-600 font-medium">Click</span> or drag & drop
                              </p>
                              <p className="text-xs text-gray-400 mt-1">PNG or JPG, transparent PNG recommended</p>
                            </div>
                          )}
                          <input type="file" ref={imageInputRef} className="hidden" accept="image/png,image/jpeg" onChange={handleImageChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Size — {imageSizePct}% of page width</label>
                          <input type="range" min="5" max="90" value={imageSizePct} onChange={(e) => setImageSizePct(parseInt(e.target.value, 10))} className="w-full" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Opacity — {imageOpacity}%</label>
                          <input type="range" min="1" max="100" value={imageOpacity} onChange={(e) => setImageOpacity(parseInt(e.target.value, 10))} className="w-full" />
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rotation — {rotation}°</label>
                        <input type="range" min="-180" max="180" step="5" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value, 10))} className="w-full" />
                      </div>

                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input type="checkbox" checked={tiled} onChange={(e) => setTiled(e.target.checked)} className="rounded" />
                        Tile watermark across the whole page
                      </label>

                      {!tiled && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quick position</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {PRESETS.map((p) => (
                              <button key={p.id} onClick={() => applyPresetAnchor(p)}
                                className="text-xs py-1.5 rounded border border-gray-200 hover:border-[#4caf4f] hover:bg-green-50 text-gray-600">
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                        <select value={pagesOption} onChange={(e) => setPagesOption(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded">
                          <option value="all">All pages</option>
                          <option value="current">Current preview page only</option>
                          <option value="first">First page only</option>
                          <option value="last">Last page only</option>
                          <option value="custom">Custom range</option>
                        </select>
                        {pagesOption === 'custom' && (
                          <input
                            type="text"
                            value={customRange}
                            onChange={(e) => setCustomRange(e.target.value)}
                            placeholder="e.g. 1-3,5,8"
                            className="w-full mt-2 p-2 border border-gray-300 rounded text-sm"
                          />
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          Current preview page: {selectedPage + 1}{pdfPages.length ? ` of ${pdfPages.length}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleWatermark}
                    disabled={isProcessing}
                    className={`px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-colors ${
                      isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4caf4f] hover:bg-[#3e8e40]'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Applying Watermark…
                      </>
                    ) : (
                      'Apply Watermark to PDF'
                    )}
                  </button>
                </div>

                {downloadUrl && (
                  <div className="mt-6 text-center">
                    <a
                      href={downloadUrl}
                      download={`watermarked-${file.name}`}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <FaDownload />
                      Download Watermarked PDF
                    </a>
                  </div>
                )}
              </div>
            )}

            {adsConfigured && (
              <div className="mt-8">
                <ins className="adsbygoogle" style={{ display: 'block' }}
                  data-ad-client={toolsAdsConfig.getPublisherId()} data-ad-slot={toolsAdsConfig.getSlotId('bottom')}
                  data-ad-format="auto" data-full-width-responsive="true" />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}