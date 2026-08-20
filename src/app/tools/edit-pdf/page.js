'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaFilePdf, FaFont, FaImage, FaShapes, FaTrash, FaDownload, FaUndo, FaRedo,
  FaHighlighter, FaSearch, FaCopy, FaPlus, FaMinus, FaArrowUp, FaArrowDown,
} from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import { toolsAdsConfig } from '@/config/tools-adsense.config';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import API_URL from '@/app/config';

// npm install fabric  (this file targets fabric.js v6/v7's ESM named-export API)

// pdfjs is dynamically imported on the client to avoid server-side DOM globals.
const pdfjsLibRef = { current: null };
// fabric is also dynamically imported on the client for the same reason - it touches
// canvas/DOM APIs that don't exist during Next.js SSR.
const PDF_RENDER_SCALE = 1.5;

// ---------------------------------------------------------------------------
// Fabric <-> plain-object element helpers
//
// `elements` (React state) is the single source of truth used for undo/redo
// and PDF export. Fabric objects are a *view* of that state rendered onto the
// canvas - every user interaction (add/move/resize/rotate/delete) is synced
// back into `elements` via canvas events, and the canvas is rebuilt from
// `elements` on page change / undo / redo.
// ---------------------------------------------------------------------------

// Fabric object -> plain element (used by the object:added / object:modified handlers)
function fabricObjectToElement(obj, pageIndex) {
  const base = {
    id: obj.data?.id || `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    page: pageIndex,
    left: obj.left ?? 0,
    top: obj.top ?? 0,
    angle: obj.angle || 0,
    opacity: obj.opacity ?? 1,
    visible: obj.visible !== false,
    width: (obj.width || 0) * (obj.scaleX || 1),
    height: (obj.height || 0) * (obj.scaleY || 1),
  };

  const type = obj.data?.type || 'shape';

  if (type === 'text' || type === 'watermark') {
    return {
      ...base,
      type,
      text: obj.text || '',
      fontFamily: obj.fontFamily || 'Helvetica',
      fontSize: obj.fontSize || 16,
      fill: obj.fill || '#000000',
      fontWeight: obj.fontWeight || 'normal',
      fontStyle: obj.fontStyle || 'normal',
    };
  }

  if (type === 'image') {
    return { ...base, type: 'image', src: obj.data?.src };
  }

  if (type === 'highlight') {
    return { ...base, type: 'highlight', fill: obj.fill || '#FFFF00' };
  }

  // shape (rectangle / circle / line)
  const shapeType = obj.data?.shapeType || (obj.rx !== undefined ? 'circle' : 'rectangle');
  return {
    ...base,
    type: 'shape',
    shapeType,
    fill: obj.stroke || obj.fill || '#FF0000',
    strokeWidth: obj.strokeWidth || 2,
    fillEnabled: obj.data?.fillEnabled ?? (!!obj.fill && obj.fill !== 'transparent'),
  };
}

// Plain element -> Fabric object (used when rebuilding the canvas from state).
// Images are handled separately (async) by the caller since fabric.Image.fromURL
// returns a Promise.
function elementToFabricObject(fb, e) {
  let obj = null;
  const common = {
    left: e.left,
    top: e.top,
    angle: e.angle || 0,
    opacity: e.opacity ?? 1,
    visible: e.visible !== false,
  };

  if (e.type === 'text' || e.type === 'watermark') {
    obj = new fb.Textbox(e.text || '', {
      ...common,
      width: e.width || 200,
      fontFamily: e.fontFamily || 'Helvetica',
      fontSize: e.fontSize || 16,
      fill: e.fill || '#000000',
      fontWeight: e.fontWeight || 'normal',
      fontStyle: e.fontStyle || 'normal',
      textAlign: e.type === 'watermark' ? 'center' : 'left',
    });
  } else if (e.type === 'highlight') {
    obj = new fb.Rect({
      ...common,
      width: e.width || 100,
      height: e.height || 20,
      fill: e.fill || '#FFFF00',
    });
  } else if (e.type === 'shape') {
    if (e.shapeType === 'circle') {
      obj = new fb.Ellipse({
        ...common,
        rx: (e.width || 100) / 2,
        ry: (e.height || 60) / 2,
        fill: e.fillEnabled ? e.fill : 'transparent',
        stroke: e.fill || '#FF0000',
        strokeWidth: e.strokeWidth || 2,
      });
    } else {
      obj = new fb.Rect({
        ...common,
        width: e.width || 100,
        height: e.height || 60,
        fill: e.fillEnabled ? e.fill : 'transparent',
        stroke: e.fill || '#FF0000',
        strokeWidth: e.strokeWidth || 2,
      });
    }
  }

  if (obj) {
    obj.data = { id: e.id, type: e.type, shapeType: e.shapeType, fillEnabled: e.fillEnabled };
  }
  return obj;
}

// Helper to convert hex color to RGB (0-1 range, used by pdf-lib's rgb())
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ] : [0, 0, 0];
};

export default function EditPDF() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [activeTool, setActiveTool] = useState(null);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [pdfPages, setPdfPages] = useState([]);
  const [pageThumbnails, setPageThumbnails] = useState([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [textLayerItems, setTextLayerItems] = useState([]);
  const [selectedPdfText, setSelectedPdfText] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [elements, setElements] = useState([]); // source of truth for undo/redo + export
  const [zoom, setZoom] = useState(100);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [selectedCount, setSelectedCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [editorOptions, setEditorOptions] = useState({
    text: { font: 'Helvetica', size: 20, color: '#000000', bold: false, italic: false },
    image: null,
    shapes: { type: 'rectangle', color: '#FF0000', fill: false, strokeWidth: 2 },
    highlight: { color: '#FFFF00', opacity: 0.5 },
    watermark: { text: '', opacity: 0.3, fontSize: 60, angle: -45, color: '#CCCCCC' },
  });

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const containerRef = useRef(null);
  const fabricCanvasElRef = useRef(null); // the <canvas> DOM node fabric.Canvas wraps

  // Fabric.js state - replaces the old elements[]/isDragging/dragOffset/selectedElements
  // manual drag-and-drop system with a real canvas engine (selection, drag, resize,
  // rotation handles, multi-select marquee are all native Fabric behavior).
  const fabricRef = useRef(null); // the imported fabric module
  const fabricCanvasRef = useRef(null); // the fabric.Canvas instance for the current page
  const suppressSync = useRef(false); // true while we bulk-mutate the canvas ourselves
  const baseCanvasSizeRef = useRef(null); // unscaled {width, height} of the current page raster

  // Refs mirroring state so Fabric event callbacks (registered once per canvas
  // instance) always read fresh values instead of a stale closure.
  const elementsRef = useRef([]);
  const historyRef = useRef([]);
  const historyStepRef = useRef(-1);
  const currentPageRef = useRef(0);
  const zoomRef = useRef(100);
  const gridEnabledRef = useRef(false);
  const gridSizeRef = useRef(20);
  const textLayerItemsRef = useRef([]);

  useEffect(() => { setIsHydrated(true); }, []);

  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { gridEnabledRef.current = gridEnabled; }, [gridEnabled]);
  useEffect(() => { gridSizeRef.current = gridSize; }, [gridSize]);
  useEffect(() => { textLayerItemsRef.current = textLayerItems; }, [textLayerItems]);

  const tools = [
    { id: 'image', icon: <FaImage />, label: 'Image' },
    { id: 'highlight', icon: <FaHighlighter />, label: 'Highlight' },
    { id: 'shapes', icon: <FaShapes />, label: 'Shapes' },
    { id: 'watermark', icon: <FaCopy />, label: 'Watermark' },
    { id: 'search', icon: <FaSearch />, label: 'Search Text' },
    { id: 'delete', icon: <FaTrash />, label: 'Remove' },
  ];

  // ---- History (undo/redo) --------------------------------------------------
  // Stable across renders (reads/writes refs) so it's safe to call from Fabric
  // event callbacks that were registered once when the canvas was created.
  const saveToHistory = useCallback((newElements) => {
    const trimmed = historyRef.current.slice(0, historyStepRef.current + 1);
    trimmed.push(newElements);
    historyRef.current = trimmed;
    historyStepRef.current = trimmed.length - 1;
    elementsRef.current = newElements;
    setHistory(trimmed);
    setHistoryStep(historyStepRef.current);
    setElements(newElements);
  }, []);

  // Rebuilds the Fabric canvas contents from a plain-element snapshot for a given
  // page. Used on page change and after undo/redo. Wrapped in suppressSync so the
  // object:added events fired by canvas.add() don't re-write history while rebuilding.
  const rebuildCanvasFromElements = useCallback(async (pageIndex, elementsList) => {
    const canvas = fabricCanvasRef.current;
    const fb = fabricRef.current;
    if (!canvas || !fb) return;

    suppressSync.current = true;
    canvas.getObjects().slice().forEach((o) => canvas.remove(o));

    const pageElements = elementsList.filter((e) => e.page === pageIndex);
    for (const e of pageElements) {
      if (e.type === 'image' && e.src) {
        try {
          const img = await fb.Image.fromURL(e.src);
          img.set({
            left: e.left, top: e.top, angle: e.angle || 0,
            opacity: e.opacity ?? 1, visible: e.visible !== false,
          });
          if (img.width) img.scaleX = (e.width || img.width) / img.width;
          if (img.height) img.scaleY = (e.height || img.height) / img.height;
          img.data = { id: e.id, type: 'image', src: e.src };
          canvas.add(img);
        } catch (err) {
          console.warn('Failed to rebuild image element:', err);
        }
      } else {
        const obj = elementToFabricObject(fb, e);
        if (obj) canvas.add(obj);
      }
    }

    canvas.requestRenderAll();
    suppressSync.current = false;
  }, []);

  // Adds already-constructed Fabric objects to the canvas and commits a single
  // history entry for them. Used by every "+ Add X" button, image insertion,
  // duplication, and the click-to-edit-PDF-text flow.
  const commitNewObjects = useCallback((objs) => {
    const canvas = fabricCanvasRef.current;
    const fb = fabricRef.current;
    if (!canvas || !fb || objs.length === 0) return;

    suppressSync.current = true;
    objs.forEach((o) => canvas.add(o));
    if (objs.length === 1) {
      canvas.setActiveObject(objs[0]);
    } else {
      canvas.setActiveObject(new fb.ActiveSelection(objs, { canvas }));
    }
    canvas.requestRenderAll();
    suppressSync.current = false;

    const newEls = objs.map((o) => fabricObjectToElement(o, currentPageRef.current));
    saveToHistory([...elementsRef.current, ...newEls]);
  }, [saveToHistory]);

  // Deletes whatever is currently selected on the canvas (single object or
  // Fabric's native ActiveSelection multi-select).
  const deleteSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length === 0) return;
    const ids = active.map((o) => o.data?.id).filter(Boolean);

    suppressSync.current = true;
    canvas.discardActiveObject();
    active.forEach((o) => canvas.remove(o));
    canvas.requestRenderAll();
    suppressSync.current = false;

    saveToHistory(elementsRef.current.filter((e) => !ids.includes(e.id)));
  }, [saveToHistory]);

  // Duplicates the current selection (thin wrapper around Fabric's clone(), which
  // replaces the old batchDuplicate() position-math version).
  const duplicateSelected = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length === 0) return;

    const clones = [];
    for (const obj of active) {
      const clone = await obj.clone();
      clone.set({ left: (obj.left || 0) + 15, top: (obj.top || 0) + 15 });
      clone.data = { ...obj.data, id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
      clones.push(clone);
    }
    canvas.discardActiveObject();
    commitNewObjects(clones);
  }, [commitNewObjects]);

  const clearAllElements = useCallback(() => {
    if (!confirm('Are you sure you want to remove all elements?')) return;
    const canvas = fabricCanvasRef.current;
    suppressSync.current = true;
    canvas?.getObjects().slice().forEach((o) => canvas.remove(o));
    canvas?.requestRenderAll();
    suppressSync.current = false;
    saveToHistory([]);
  }, [saveToHistory]);

  const handleUndo = useCallback(() => {
    if (historyStepRef.current <= 0) return;
    const step = historyStepRef.current - 1;
    historyStepRef.current = step;
    const snap = historyRef.current[step];
    elementsRef.current = snap;
    setHistoryStep(step);
    setElements(snap);
    rebuildCanvasFromElements(currentPageRef.current, snap);
  }, [rebuildCanvasFromElements]);

  const handleRedo = useCallback(() => {
    if (historyStepRef.current >= historyRef.current.length - 1) return;
    const step = historyStepRef.current + 1;
    historyStepRef.current = step;
    const snap = historyRef.current[step];
    elementsRef.current = snap;
    setHistoryStep(step);
    setElements(snap);
    rebuildCanvasFromElements(currentPageRef.current, snap);
  }, [rebuildCanvasFromElements]);

  // Layer ordering - thin wrapper around Fabric's z-order API.
  const moveSelectedLayer = (direction) => {
    const canvas = fabricCanvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj) return;
    if (direction === 'up') canvas.bringObjectForward(obj);
    else canvas.sendObjectBackwards(obj);
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: obj });
  };

  // Populates a Fabric Textbox directly over a clicked PDF text run, plus a white
  // Fabric Rect behind it to mask the original glyphs on export - this is the
  // Fabric-driven replacement for the old "pipe into Quill" cover+replace flow.
  const selectPdfTextForEdit = useCallback((item) => {
    const fb = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    if (!fb || !canvas) return;

    setSelectedPdfText(item);
    setActiveTool('text');

    const cover = new fb.Rect({
      left: item.x - 2,
      top: item.y - item.height - 2,
      width: item.width + 4,
      height: item.height + 4,
      fill: '#FFFFFF',
    });
    cover.data = { id: `el_${Date.now()}`, type: 'shape', shapeType: 'rectangle', fillEnabled: true };

    const textbox = new fb.Textbox(item.text, {
      left: item.x,
      top: item.y - item.height,
      width: Math.max(item.width, 120),
      fontSize: editorOptions.text.size,
      fontFamily: editorOptions.text.font,
      fill: editorOptions.text.color,
      fontWeight: editorOptions.text.bold ? 'bold' : 'normal',
      fontStyle: editorOptions.text.italic ? 'italic' : 'normal',
    });
    textbox.data = { id: `el_${Date.now() + 1}`, type: 'text' };

    commitNewObjects([cover, textbox]);
    canvas.setActiveObject(textbox);
    if (textbox.enterEditing) {
      textbox.enterEditing();
      textbox.selectAll();
    }
    canvas.requestRenderAll();
  }, [commitNewObjects, editorOptions.text]);

  // Places a brand-new element (text / highlight / shape / watermark) at a default
  // position and, for text, immediately drops the user into Fabric's own inline
  // text editing - no separate rich-text panel needed.
  const addElement = (type, options, position = { x: 60, y: 60 }) => {
    const fb = fabricRef.current;
    const canvas = fabricCanvasRef.current;
    if (!fb || !canvas) return;

    let obj = null;
    if (type === 'text') {
      obj = new fb.Textbox('New text', {
        left: position.x, top: position.y, width: 220,
        fontFamily: options.font, fontSize: options.size, fill: options.color,
        fontWeight: options.bold ? 'bold' : 'normal',
        fontStyle: options.italic ? 'italic' : 'normal',
      });
    } else if (type === 'watermark') {
      obj = new fb.Textbox(options.text || 'Watermark', {
        left: position.x, top: position.y, width: 320,
        fontSize: options.fontSize, fill: options.color, opacity: options.opacity,
        angle: options.angle || 0, fontWeight: 'bold', textAlign: 'center',
      });
    } else if (type === 'highlight') {
      obj = new fb.Rect({
        left: position.x, top: position.y, width: 150, height: 20,
        fill: options.color, opacity: options.opacity,
      });
    } else if (type === 'shape') {
      if (options.type === 'circle') {
        obj = new fb.Ellipse({
          left: position.x, top: position.y, rx: 60, ry: 40,
          fill: options.fill ? options.color : 'transparent',
          stroke: options.color, strokeWidth: options.strokeWidth,
        });
      } else {
        obj = new fb.Rect({
          left: position.x, top: position.y, width: 120, height: 70,
          fill: options.fill ? options.color : 'transparent',
          stroke: options.color, strokeWidth: options.strokeWidth,
        });
      }
    }
    if (!obj) return;

    obj.data = {
      id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      shapeType: type === 'shape' ? options.type : undefined,
      fillEnabled: type === 'shape' ? options.fill : undefined,
    };
    commitNewObjects([obj]);

    if (type === 'text' && obj.enterEditing) {
      canvas.setActiveObject(obj);
      obj.enterEditing();
      obj.selectAll();
      canvas.requestRenderAll();
    }
  };

  const addImageElement = async () => {
    const fb = fabricRef.current;
    if (!fb || !editorOptions.image) return;
    try {
      const img = await fb.Image.fromURL(editorOptions.image.preview);
      img.scaleToWidth(180);
      img.set({ left: 60, top: 60 });
      img.data = { id: `el_${Date.now()}`, type: 'image', src: editorOptions.image.preview };
      commitNewObjects([img]);
    } catch (err) {
      console.error('Failed to add image:', err);
      alert('Could not load that image.');
    }
  };

  // ---- Attach Fabric canvas event listeners (once per canvas instance) ------
  const attachCanvasEvents = useCallback((canvas, fb) => {
    const syncSingle = (obj) => {
      if (suppressSync.current || !obj || !obj.data) return;
      const updated = fabricObjectToElement(obj, currentPageRef.current);
      const next = elementsRef.current.map((e) => (e.id === updated.id ? updated : e));
      saveToHistory(next);
    };

    canvas.on('object:modified', (e) => {
      if (suppressSync.current) return;
      const target = e.target;
      if (!target) return;
      if (target.type === 'activeselection' || target.type === 'activeSelection') {
        target.forEachObject((child) => syncSingle(child));
      } else {
        syncSingle(target);
      }
    });

    // Grid snapping while dragging - replaces the old manual snapToGrid() math.
    canvas.on('object:moving', (e) => {
      if (!gridEnabledRef.current) return;
      const obj = e.target;
      const size = gridSizeRef.current;
      obj.set({
        left: Math.round(obj.left / size) * size,
        top: Math.round(obj.top / size) * size,
      });
    });

    canvas.on('selection:created', () => setSelectedCount(canvas.getActiveObjects().length));
    canvas.on('selection:updated', () => setSelectedCount(canvas.getActiveObjects().length));
    canvas.on('selection:cleared', () => setSelectedCount(0));

    // Click-to-edit-original-PDF-text: replaces the old transparent DOM span
    // overlay. If the click didn't hit an existing Fabric object, hit-test it
    // against the text runs extracted from page.getTextContent().
    canvas.on('mouse:down', (opt) => {
      if (opt.target) return;
      const pointer = typeof canvas.getScenePoint === 'function'
        ? canvas.getScenePoint(opt.e)
        : { x: opt.e.clientX, y: opt.e.clientY };
      const hit = textLayerItemsRef.current.find((item) => (
        pointer.x >= item.x && pointer.x <= item.x + item.width &&
        pointer.y >= item.y - item.height && pointer.y <= item.y
      ));
      if (hit) selectPdfTextForEdit(hit);
    });
  }, [saveToHistory, selectPdfTextForEdit]);

  // ---- Zoom via Fabric's own viewport transform ------------------------------
  // Replaces the old `transform: scale(zoom/100)` CSS wrapper, which broke
  // pointer-position math for drag/resize at anything other than 100%.
  const applyZoom = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const base = baseCanvasSizeRef.current;
    if (!canvas || !base) return;
    const z = zoomRef.current / 100;
    // Keep the scene coordinates in PDF pixels, but resize the visible Fabric
    // viewport to the zoomed page bounds so the page is not clipped into a
    // small corner of the editor surface.
    canvas.setDimensions({ width: base.width * z, height: base.height * z });
    canvas.setZoom(z);
    canvas.requestRenderAll();
  }, []);

  const fitPageToViewport = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const base = baseCanvasSizeRef.current;
    const viewport = containerRef.current;
    if (!canvas || !base || !viewport) return;
    const availableWidth = Math.max(320, viewport.clientWidth - 48);
    const availableHeight = Math.max(320, viewport.clientHeight - 48);
    const fitRatio = Math.min(availableWidth / base.width, availableHeight / base.height);
    const fit = Math.min(100, Math.max(40, Math.floor(fitRatio * 100)));
    setZoom(fit);
  }, []);

  const fitPageWidth = useCallback(() => {
    const base = baseCanvasSizeRef.current;
    const viewport = containerRef.current;
    if (!base || !viewport) return;
    const availableWidth = Math.max(320, viewport.clientWidth - 48);
    setZoom(Math.min(200, Math.max(40, Math.floor((availableWidth / base.width) * 100))));
  }, []);

  useEffect(() => { applyZoom(); }, [zoom, applyZoom]);

  // ---- File upload ------------------------------------------------------------
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      setIsLoadingPages(true);
      setFile({
        file: selectedFile,
        name: selectedFile.name,
        size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        preview: URL.createObjectURL(selectedFile),
      });
      setDownloadUrl('');
      elementsRef.current = [];
      historyRef.current = [];
      historyStepRef.current = -1;
      setElements([]);
      setHistory([]);
      setHistoryStep(-1);
      setActiveTool(null);
      setCurrentPage(0);
      setSelectedPdfText(null);
      setPageThumbnails([]);

      if (typeof window === 'undefined') {
        alert('PDF preview is only available in the browser');
        return;
      }

      if (!pdfjsLibRef.current) {
        try {
          const mod = await import('pdfjs-dist/legacy/build/pdf.min.mjs');
          pdfjsLibRef.current = mod;
          pdfjsLibRef.current.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        } catch (impErr) {
          console.error('Failed to load pdfjs:', impErr);
          alert('PDF preview failed to load pdf worker.');
          return;
        }
      }

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLibRef.current.getDocument({ data: arrayBuffer }).promise;
      const pages = [];
      const thumbnails = [];
      for (let i = 0; i < pdf.numPages; i++) {
        const pageNumber = i + 1;
        const page = await pdf.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const thumbnailScale = Math.min(0.24, 150 / baseViewport.width);
        const viewport = page.getViewport({ scale: thumbnailScale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        pages.push(pageNumber);
        thumbnails.push({ pageNumber, dataUrl: canvas.toDataURL('image/jpeg', 0.72) });
      }
      setPdfPages(pages);
      setPageThumbnails(thumbnails);
    } catch (error) {
      alert('Error loading PDF: ' + error.message);
    } finally {
      setIsLoadingPages(false);
    }
  };

  // ---- Render current page: rasterize via pdfjs, feed it to Fabric as the
  // canvas background, extract text runs, and rebuild page objects. -----------
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!file || pdfPages.length === 0 || !fabricCanvasElRef.current) return;
      if (typeof window === 'undefined') return;

      if (!pdfjsLibRef.current) {
        try {
          const mod = await import('pdfjs-dist/legacy/build/pdf.min.mjs');
          pdfjsLibRef.current = mod;
          pdfjsLibRef.current.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        } catch (impErr) {
          console.error('Failed to load pdfjs:', impErr);
          alert('PDF render failed to load pdf worker.');
          return;
        }
      }

      let page;
      let viewport;
      try {
        const arrayBuffer = await file.file.arrayBuffer();
        const pdf = await pdfjsLibRef.current.getDocument({ data: arrayBuffer }).promise;
        page = await pdf.getPage(currentPage + 1);
        viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
      } catch (error) {
        console.error('Error loading PDF page:', error);
        alert('Error rendering PDF. Please try another file.');
        return;
      }
      if (cancelled) return;

      const textContent = await page.getTextContent();
      const extracted = textContent.items.map((item, index) => ({
        id: `${currentPage}-${index}`,
        text: item.str,
        x: item.transform[4] * PDF_RENDER_SCALE,
        y: viewport.height - item.transform[5] * PDF_RENDER_SCALE,
        width: item.width * PDF_RENDER_SCALE,
        height: Math.max(12, Math.abs(item.transform[3]) * PDF_RENDER_SCALE),
      })).filter((item) => item.text.trim());
      if (cancelled) return;
      setTextLayerItems(extracted);
      textLayerItemsRef.current = extracted;

      // Rasterize the page to an offscreen canvas for use as the Fabric background.
      const raster = document.createElement('canvas');
      raster.width = viewport.width;
      raster.height = viewport.height;
      try {
        await page.render({ canvasContext: raster.getContext('2d'), viewport }).promise;
      } catch (error) {
        console.error('Error rendering PDF page:', error);
        alert('Error rendering PDF. Please try another file.');
        return;
      }
      if (cancelled) return;
      const bgDataUrl = raster.toDataURL();

      if (!fabricRef.current) {
        try {
          fabricRef.current = await import('fabric');
        } catch (impErr) {
          console.error('Failed to load fabric:', impErr);
          alert('Failed to load the editor engine.');
          return;
        }
      }
      if (cancelled) return;
      const fb = fabricRef.current;

      let canvas = fabricCanvasRef.current;
      if (!canvas) {
        canvas = new fb.Canvas(fabricCanvasElRef.current, {
          preserveObjectStacking: true,
          selection: true,
        });
        fabricCanvasRef.current = canvas;
        attachCanvasEvents(canvas, fb);
      }

      canvas.setDimensions({ width: viewport.width, height: viewport.height });
      baseCanvasSizeRef.current = { width: viewport.width, height: viewport.height };

      applyZoom();
      requestAnimationFrame(fitPageWidth);
      await rebuildCanvasFromElements(currentPage, elementsRef.current);
      try {
        const bgImg = await fb.Image.fromURL(bgDataUrl);
        if (cancelled) return;
        bgImg.set({ left: 0, top: 0, selectable: false, evented: false, excludeFromExport: true });
        canvas.add(bgImg);
        canvas.sendObjectToBack(bgImg);
      } catch (err) {
        console.warn('Failed to add PDF page image:', err);
      }
      if (!cancelled) canvas.requestRenderAll();
    }

    setup();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, currentPage, pdfPages.length]);

  // Dispose the Fabric canvas when the file is cleared / component unmounts.
  useEffect(() => {
    if (!file && fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }
  }, [file]);

  useEffect(() => () => { fabricCanvasRef.current?.dispose(); }, []);

  useEffect(() => {
    setSelectedPdfText(null);
  }, [file]);

  // ---- Keyboard shortcuts: delete + arrow-key nudge --------------------------
  useEffect(() => {
    const handler = (e) => {
      const activeElement = document.activeElement;
      const isTextEditing = activeElement && (
        ['INPUT', 'TEXTAREA'].includes(activeElement.tagName) ||
        activeElement.isContentEditable
      );
      const modifier = e.ctrlKey || e.metaKey;

      if (modifier && !isTextEditing && (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) handleUndo();
        else handleRedo();
        return;
      }

      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      if (isTextEditing) return;
      if (active.isEditing) return; // typing inside a Fabric Textbox

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 2;
        const delta = {
          ArrowUp: [0, -step], ArrowDown: [0, step],
          ArrowLeft: [-step, 0], ArrowRight: [step, 0],
        }[e.key];
        active.set({ left: active.left + delta[0], top: active.top + delta[1] });
        active.setCoords();
        canvas.requestRenderAll();
        canvas.fire('object:modified', { target: active });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteSelected, handleUndo, handleRedo]);

  // ---- Image tool input change -------------------------------------------------
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditorOptions((prev) => ({ ...prev, image: { file: selectedFile, preview: event.target.result } }));
      setActiveTool('image');
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleOptionChange = (tool, option, value) => {
    setEditorOptions((prev) => ({ ...prev, [tool]: { ...prev[tool], [option]: value } }));
  };

  // ---- PDF export: shared by Save + Preview -----------------------------------
  const applyElementsToPdf = async (pdfDoc) => {
    const embeddedFonts = {
      Helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
      'Times-Roman': await pdfDoc.embedFont(StandardFonts.TimesRoman),
      Courier: await pdfDoc.embedFont(StandardFonts.Courier),
    };
    const pages = pdfDoc.getPages();
    const visibleElements = elements.filter((el) => el.visible !== false);

    for (const element of visibleElements) {
      try {
        const pageIndex = Math.min(element.page ?? 0, pages.length - 1);
        const page = pages[pageIndex];
        const { height } = page.getSize();
        const rotate = degrees(element.angle || 0);

        if (element.type === 'text') {
          page.drawText(element.text || 'Sample Text', {
            x: element.left / PDF_RENDER_SCALE,
            y: height - element.top / PDF_RENDER_SCALE - (element.fontSize || 12),
            size: element.fontSize || 12,
            color: rgb(...hexToRgb(element.fill || '#000000')),
            font: embeddedFonts[element.fontFamily] || embeddedFonts.Helvetica,
            rotate,
          });
        } else if (element.type === 'image' && element.src) {
          try {
            const imageUrl = element.src;
            let imageData;
            if (imageUrl.startsWith('data:')) {
              const base64 = imageUrl.split(',')[1];
              imageData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
            } else {
              const response = await fetch(imageUrl);
              imageData = await response.arrayBuffer();
            }
            const isJpeg = imageUrl.includes('jpeg') || imageUrl.includes('jpg');
            const pdfImage = isJpeg ? await pdfDoc.embedJpg(imageData) : await pdfDoc.embedPng(imageData);
            const imgWidth = element.width || 100;
            const imgHeight = element.height || 100;
            page.drawImage(pdfImage, {
              x: element.left / PDF_RENDER_SCALE,
              y: height - element.top / PDF_RENDER_SCALE - imgHeight / PDF_RENDER_SCALE,
              width: imgWidth / PDF_RENDER_SCALE,
              height: imgHeight / PDF_RENDER_SCALE,
              rotate,
            });
          } catch (imgErr) {
            console.warn('Failed to embed image:', imgErr);
          }
        } else if (element.type === 'highlight') {
          const [r, g, b] = hexToRgb(element.fill || '#FFFF00');
          page.drawRectangle({
            x: element.left / PDF_RENDER_SCALE,
            y: height - element.top / PDF_RENDER_SCALE - (element.height || 20) / PDF_RENDER_SCALE,
            width: (element.width || 100) / PDF_RENDER_SCALE,
            height: (element.height || 20) / PDF_RENDER_SCALE,
            color: rgb(r, g, b),
            opacity: element.opacity ?? 0.3,
            rotate,
          });
        } else if (element.type === 'shape') {
          const [r, g, b] = hexToRgb(element.fill || '#FF0000');
          const x = element.left / PDF_RENDER_SCALE;
          const y = height - element.top / PDF_RENDER_SCALE - (element.height || 60) / PDF_RENDER_SCALE;
          const w = (element.width || 100) / PDF_RENDER_SCALE;
          const h = (element.height || 60) / PDF_RENDER_SCALE;

          if (element.shapeType === 'rectangle' || element.shapeType === 'line') {
            page.drawRectangle({
              x, y, width: w, height: h,
              color: element.fillEnabled ? rgb(r, g, b) : undefined,
              borderColor: rgb(r, g, b),
              borderWidth: element.strokeWidth || 2,
              rotate,
            });
          } else if (element.shapeType === 'circle') {
            page.drawEllipse({
              x: x + w / 2, y: y + h / 2,
              xScale: w / 2, yScale: h / 2,
              color: element.fillEnabled ? rgb(r, g, b) : undefined,
              borderColor: rgb(r, g, b),
              borderWidth: element.strokeWidth || 2,
              rotate,
            });
          }
        } else if (element.type === 'watermark') {
          const [r, g, b] = hexToRgb(element.fill || '#CCCCCC');
          page.drawText(element.text || 'Watermark', {
            x: element.left / PDF_RENDER_SCALE,
            y: height - element.top / PDF_RENDER_SCALE - (element.fontSize || 60),
            size: element.fontSize || 60,
            color: rgb(r, g, b),
            opacity: element.opacity ?? 0.3,
            rotate,
          });
        }
      } catch (err) {
        console.warn('Failed to add element:', err);
      }
    }
  };

  const handleSave = async () => {
    if (!file) { alert('Please select a PDF file first'); return; }
    setIsProcessing(true);
    try {
      const fileData = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileData);
      await applyElementsToPdf(pdfDoc);
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      alert('✓ PDF saved successfully! All elements applied. Click download to get your file.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save PDF: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = async () => {
    if (!file) { alert('Please select a PDF file first'); return; }
    setIsProcessing(true);
    try {
      const fileData = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileData);
      await applyElementsToPdf(pdfDoc);
      const previewBytes = await pdfDoc.save();
      const blob = new Blob([previewBytes], { type: 'application/pdf' });
      setPreviewUrl(URL.createObjectURL(blob));
      setShowPreview(true);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Preview error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const adsConfigured = isHydrated && toolsAdsConfig.isConfigured();

  // Initialize ad units
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        const unfilledAds = document.querySelectorAll(
          'ins.adsbygoogle:not([data-adsbygoogle-status])'
        );
        unfilledAds.forEach(() => window.adsbygoogle.push({}));
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded, file]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (file?.preview) URL.revokeObjectURL(file.preview);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (editorOptions.image?.preview) URL.revokeObjectURL(editorOptions.image.preview);
    };
  }, [file, downloadUrl, editorOptions.image]);

  const searchMatches = (searchQuery.trim()
    ? textLayerItems.filter((i) => i.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : textLayerItems
  ).slice(0, 50);

  return (
    <>
      <NavBar />

      <div className="p-6 bg-gray-100 ">
        <Head>
          <title>Edit PDF - PDF Tools</title>
          <meta name="description" content="Edit your PDF documents by adding text, images, and annotations" />
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
              <li aria-current="page" className="font-semibold text-[#3A9D44]">Edit PDF</li>
            </ol>
          </nav>

          {/* Top Ad Unit */}
          {adsConfigured && (
            <div className="mb-8">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={toolsAdsConfig.getPublisherId()}
                data-ad-slot={toolsAdsConfig.getSlotId('top')}
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
            </div>
          )}

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <FaFilePdf className="text-[#4caf4f] text-4xl mr-4" />
              <h1 className="text-3xl font-bold text-gray-900">Edit PDF</h1>
            </div>

            <p className="text-gray-600 mb-8">
              Add text, images, and annotations to your PDF documents. Drag, resize, and rotate freely - then save your changes.
            </p>

            {!file ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-8 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                <p className="text-gray-500 mb-2">
                  <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-400">PDF files only (max 50MB)</p>
              </div>
            ) : (
              <div className="mb-8">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-50 flex items-center justify-center rounded mr-3">
                    <FaFilePdf className="text-red-500" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.size}</p>
                  </div>
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(file.preview);
                      if (editorOptions.image?.preview) URL.revokeObjectURL(editorOptions.image.preview);
                      setFile(null);
                      setPdfPages([]);
                      setPageThumbnails([]);
                      setElements([]);
                    }}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>

                {adsConfigured && (
                  <div className="my-6">
                    <ins
                      className="adsbygoogle"
                      style={{ display: 'block' }}
                      data-ad-client={toolsAdsConfig.getPublisherId()}
                      data-ad-slot={toolsAdsConfig.getSlotId('middle')}
                      data-ad-format="auto"
                      data-full-width-responsive="true"
                    ></ins>
                  </div>
                )}

                {/* Editor Area */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white p-3">
                    <button onClick={handleUndo} disabled={historyStep <= 0} className="rounded bg-gray-100 p-2 disabled:opacity-30 hover:bg-gray-200" title="Undo">
                      <FaUndo />
                    </button>
                    <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className="rounded bg-gray-100 p-2 disabled:opacity-30 hover:bg-gray-200" title="Redo">
                      <FaRedo />
                    </button>
                    <span className="mx-1 h-6 w-px bg-gray-200" />
                    <button
                      onClick={() => addElement('text', editorOptions.text)}
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                      title="Add Text"
                    >
                      <FaFont /><span className="hidden sm:inline">Text</span>
                    </button>
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          if (tool.id === 'image') { imageInputRef.current?.click(); return; }
                          if (tool.id === 'delete') { deleteSelected(); return; }
                          setActiveTool(activeTool === tool.id ? null : tool.id);
                        }}
                        className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${activeTool === tool.id ? 'bg-[#4DB154] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        title={tool.label}
                      >
                        {tool.icon}<span className="hidden sm:inline">{tool.label}</span>
                      </button>
                    ))}
                    <span className="ml-auto text-xs text-gray-500">Click PDF text to edit it in place · double-click any text box to retype it</span>
                  </div>

                  <div className="flex flex-col gap-6 p-4 lg:flex-row">
                    {/* Options rail */}
                    <div className="w-full lg:w-1/6">
                      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />

                      <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-gray-800">Pages</h3>
                          <span className="text-xs text-gray-500">{pdfPages.length}</span>
                        </div>
                        {isLoadingPages ? (
                          <div className="flex h-24 items-center justify-center text-center text-xs text-gray-500">Loading pages…</div>
                        ) : (
                          <div className="max-h-[calc(100vh-18rem)] space-y-2 overflow-y-auto pr-1">
                            {pageThumbnails.map((thumbnail, index) => (
                              <button
                                key={thumbnail.pageNumber}
                                type="button"
                                onClick={() => setCurrentPage(index)}
                                className={`w-full rounded-md border-2 bg-white p-1 text-left transition ${
                                  currentPage === index ? 'border-[#4DB154] shadow-sm' : 'border-transparent hover:border-gray-300'
                                }`}
                                aria-label={`Open page ${thumbnail.pageNumber}`}
                                aria-current={currentPage === index ? 'page' : undefined}
                              >
                                <img src={thumbnail.dataUrl} alt={`Page ${thumbnail.pageNumber}`} className="w-full rounded object-contain" />
                                <span className={`mt-1 block text-center text-xs font-medium ${currentPage === index ? 'text-[#3A9D44]' : 'text-gray-500'}`}>
                                  Page {thumbnail.pageNumber}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-1 space-y-4">
                        {/* Text tool options (styles new text boxes) */}
                        {activeTool === 'text' && (
                          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-[#4DB154]">
                            <h4 className="font-medium mb-3 text-sm">🔤 Text Style</h4>
                            {selectedPdfText && (
                              <p className="mb-3 rounded bg-[#4DB154]/10 px-3 py-2 text-xs text-[#2E7D32]">
                                Editing PDF text in place - just type on the canvas.
                              </p>
                            )}
                            <div className="space-y-3 text-sm">
                              <div>
                                <label className="block mb-1 font-medium">Font</label>
                                <select value={editorOptions.text.font} onChange={(e) => handleOptionChange('text', 'font', e.target.value)} className="w-full rounded border border-gray-300 p-2">
                                  <option value="Helvetica">Helvetica</option>
                                  <option value="Times-Roman">Times Roman</option>
                                  <option value="Courier">Courier</option>
                                </select>
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">Size: {editorOptions.text.size}px</label>
                                <input type="range" min="8" max="72" value={editorOptions.text.size} onChange={(e) => handleOptionChange('text', 'size', parseInt(e.target.value, 10))} className="w-full accent-[#4DB154]" />
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">Color</label>
                                <input type="color" value={editorOptions.text.color} onChange={(e) => handleOptionChange('text', 'color', e.target.value)} className="w-full h-8 cursor-pointer" />
                              </div>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-1">
                                  <input type="checkbox" checked={editorOptions.text.bold} onChange={(e) => handleOptionChange('text', 'bold', e.target.checked)} /> Bold
                                </label>
                                <label className="flex items-center gap-1">
                                  <input type="checkbox" checked={editorOptions.text.italic} onChange={(e) => handleOptionChange('text', 'italic', e.target.checked)} /> Italic
                                </label>
                              </div>
                              <button
                                onClick={() => addElement('text', editorOptions.text)}
                                className="w-full rounded bg-[#3A9D44] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#4DB154]"
                              >
                                + Add Text Box
                              </button>
                            </div>
                          </div>
                        )}

                        {activeTool === 'image' && editorOptions.image && (
                          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-medium mb-3 text-sm">🖼️ Image Preview</h4>
                            <img src={editorOptions.image.preview} alt="Selected" className="max-w-full h-auto mb-3 border border-gray-300 rounded" />
                            <button onClick={addImageElement} className="w-full p-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                              + Add Image
                            </button>
                          </div>
                        )}

                        {activeTool === 'highlight' && (
                          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-400">
                            <h4 className="font-medium mb-3 text-sm">🔆 Highlight Options</h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <label className="block mb-1 font-medium">Color</label>
                                <input type="color" value={editorOptions.highlight.color} onChange={(e) => handleOptionChange('highlight', 'color', e.target.value)} className="w-full h-8 cursor-pointer" />
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">Opacity: {Math.round(editorOptions.highlight.opacity * 100)}%</label>
                                <input type="range" min="0" max="1" step="0.1" value={editorOptions.highlight.opacity} onChange={(e) => handleOptionChange('highlight', 'opacity', parseFloat(e.target.value))} className="w-full" />
                              </div>
                              <button onClick={() => addElement('highlight', editorOptions.highlight)} className="w-full p-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">
                                + Add Highlight
                              </button>
                            </div>
                          </div>
                        )}

                        {activeTool === 'shapes' && (
                          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                            <h4 className="font-medium mb-3 text-sm">📦 Shape Options</h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <label className="block mb-1 font-medium">Type</label>
                                <select value={editorOptions.shapes.type} onChange={(e) => handleOptionChange('shapes', 'type', e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                                  <option value="rectangle">Rectangle</option>
                                  <option value="circle">Circle</option>
                                  <option value="line">Line</option>
                                </select>
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">Color</label>
                                <input type="color" value={editorOptions.shapes.color} onChange={(e) => handleOptionChange('shapes', 'color', e.target.value)} className="w-full h-8 cursor-pointer" />
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">Stroke Width: {editorOptions.shapes.strokeWidth}px</label>
                                <input type="range" min="1" max="10" value={editorOptions.shapes.strokeWidth} onChange={(e) => handleOptionChange('shapes', 'strokeWidth', parseInt(e.target.value, 10))} className="w-full" />
                              </div>
                              <label className="flex items-center text-sm cursor-pointer">
                                <input type="checkbox" checked={editorOptions.shapes.fill} onChange={(e) => handleOptionChange('shapes', 'fill', e.target.checked)} className="mr-2" />
                                <span>Fill Shape</span>
                              </label>
                              <button onClick={() => addElement('shape', editorOptions.shapes)} className="w-full p-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                                + Add Shape
                              </button>
                            </div>
                          </div>
                        )}

                        {activeTool === 'watermark' && (
                          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                            <h4 className="font-medium mb-3 text-sm">💧 Watermark Options</h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <label className="block mb-1 font-medium">Text</label>
                                <input type="text" value={editorOptions.watermark.text} onChange={(e) => handleOptionChange('watermark', 'text', e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="Watermark text..." />
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">Size: {editorOptions.watermark.fontSize}px</label>
                                <input type="range" min="20" max="120" value={editorOptions.watermark.fontSize} onChange={(e) => handleOptionChange('watermark', 'fontSize', parseInt(e.target.value, 10))} className="w-full" />
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">Color</label>
                                <input type="color" value={editorOptions.watermark.color} onChange={(e) => handleOptionChange('watermark', 'color', e.target.value)} className="w-full h-8 cursor-pointer" />
                              </div>
                              <div>
                                <label className="block mb-1 font-medium">Opacity: {Math.round(editorOptions.watermark.opacity * 100)}%</label>
                                <input type="range" min="0.1" max="1" step="0.1" value={editorOptions.watermark.opacity} onChange={(e) => handleOptionChange('watermark', 'opacity', parseFloat(e.target.value))} className="w-full" />
                              </div>
                              <button onClick={() => addElement('watermark', editorOptions.watermark)} className="w-full p-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                                + Add Watermark
                              </button>
                            </div>
                          </div>
                        )}

                        {activeTool === 'search' && (
                          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                            <h4 className="font-medium mb-3 text-sm">🔍 Search Page Text</h4>
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search text on this page..."
                              className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
                            />
                            <div className="max-h-56 overflow-y-auto space-y-1">
                              {searchMatches.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => selectPdfTextForEdit(item)}
                                  className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded hover:border-green-400 hover:bg-green-50 truncate"
                                  title="Click to edit this text"
                                >
                                  {item.text}
                                </button>
                              ))}
                              {searchQuery && searchMatches.length === 0 && (
                                <p className="text-xs text-gray-400">No matches on this page.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {elements.length > 0 && (
                        <button onClick={clearAllElements} className="w-full mt-4 p-2 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                          Clear All Elements
                        </button>
                      )}
                    </div>

                    {/* Canvas Area */}
                    <div className="w-full lg:w-5/6">
                      {/* Zoom & Grid Controls */}
                      <div className="mb-3 flex items-center gap-2 bg-gray-100 p-3 rounded-lg flex-wrap">
                        <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1 text-sm" title="Zoom out">
                          <FaMinus size={14} /> {zoom}%
                        </button>
                        <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1 text-sm" title="Zoom in">
                          <FaPlus size={14} />
                        </button>
                        <button onClick={fitPageToViewport} className="rounded bg-[#4DB154] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#3A9D44]" title="Fit the whole PDF page">
                          Fit page
                        </button>
                        <button onClick={fitPageWidth} className="rounded bg-gray-200 px-3 py-2 text-sm transition hover:bg-gray-300" title="Fit PDF page width and scroll vertically">
                          Fit width
                        </button>
                        <button onClick={() => setZoom(100)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                          Reset Zoom
                        </button>

                        <div className="h-6 w-px bg-gray-300 mx-1"></div>

                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={gridEnabled} onChange={(e) => setGridEnabled(e.target.checked)} className="w-4 h-4" />
                          <span>Snap to grid ({gridSize}px)</span>
                        </label>
                        {gridEnabled && (
                          <input
                            type="number" min="5" max="50" value={gridSize}
                            onChange={(e) => setGridSize(parseInt(e.target.value, 10) || 20)}
                            className="w-14 p-1 border border-gray-300 rounded text-sm"
                          />
                        )}

                        <div className="h-6 w-px bg-gray-300 mx-1"></div>

                        {selectedCount > 0 && (
                          <>
                            <span className="text-sm font-medium text-blue-600">{selectedCount} selected</span>
                            {selectedCount === 1 && (
                              <>
                                <button onClick={() => moveSelectedLayer('up')} className="p-2 bg-gray-200 hover:bg-gray-300 rounded text-sm" title="Bring forward">
                                  <FaArrowUp size={14} />
                                </button>
                                <button onClick={() => moveSelectedLayer('down')} className="p-2 bg-gray-200 hover:bg-gray-300 rounded text-sm" title="Send backward">
                                  <FaArrowDown size={14} />
                                </button>
                              </>
                            )}
                            <button onClick={duplicateSelected} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center gap-1" title="Duplicate selected">
                              <FaCopy size={14} />
                            </button>
                            <button onClick={deleteSelected} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm" title="Delete selected">
                              <FaTrash size={14} />
                            </button>
                          </>
                        )}
                      </div>

                      {file && elements.length > 0 && (
                        <button onClick={handlePreview} disabled={isProcessing} className="mb-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm">
                          👁️ Preview Before Save
                        </button>
                      )}

                      {/* Fabric-backed PDF canvas - replaces the old raw <canvas> + manual
                          absolute-positioned element divs. All drag/resize/rotate/multi-select
                          interaction now lives inside Fabric, not in React event handlers. */}
                      <div
                        ref={containerRef}
                        className="relative h-[calc(100vh-14rem)] min-h-[360px] max-h-[900px] overflow-auto rounded-lg border-2 border-solid border-gray-300 bg-gray-100 p-4 sm:p-6"
                        onWheel={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            setZoom(e.deltaY < 0 ? Math.min(200, zoom + 10) : Math.max(50, zoom - 10));
                          }
                        }}
                      >
                        <div className="flex min-h-full min-w-full w-full items-start justify-center">
                          <canvas ref={fabricCanvasElRef} className="flex-none" />
                        </div>
                      </div>

                      {file && pdfPages.length > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-4">
                          <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="px-4 py-2 bg-gray-300 disabled:opacity-50 rounded hover:bg-gray-400">
                            Previous
                          </button>
                          <span className="text-sm font-medium">Page {currentPage + 1} of {pdfPages.length}</span>
                          <button onClick={() => setCurrentPage(Math.min(pdfPages.length - 1, currentPage + 1))} disabled={currentPage === pdfPages.length - 1} className="px-4 py-2 bg-gray-300 disabled:opacity-50 rounded hover:bg-gray-400">
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {file && (
              <div className="flex justify-center gap-4 mt-6 flex-wrap">
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className={`px-6 py-3 rounded-lg font-medium text-white ${isProcessing ? 'bg-gray-400' : 'bg-[#4caf4f] hover:bg-[#3e8e40]'} transition-colors flex items-center`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Edited PDF'}
                </button>

                {elements.length > 0 && (
                  <button onClick={handlePreview} disabled={isProcessing} className="px-6 py-3 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center">
                    👁️ Preview
                  </button>
                )}
              </div>
            )}

            {downloadUrl && (
              <div className="mt-6 text-center">
                <a href={downloadUrl} download={`edited-${file.name}`} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center">
                  <FaDownload className="mr-2" />
                  Download Edited PDF
                </a>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(file.preview);
                      if (editorOptions.image?.preview) URL.revokeObjectURL(editorOptions.image.preview);
                      setFile(null);
                      setPdfPages([]);
                      setPageThumbnails([]);
                      setDownloadUrl('');
                      setElements([]);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit another file
                  </button>
                </div>
              </div>
            )}

            {adsConfigured && (
              <div className="mt-8">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client={toolsAdsConfig.getPublisherId()}
                  data-ad-slot={toolsAdsConfig.getSlotId('bottom')}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
              </div>
            )}
          </div>
        </div>

        {/* PDF Preview Modal */}
        {showPreview && previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-96 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">PDF Preview - Before Saving</h3>
                <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              </div>
              <p className="text-sm text-gray-600 mb-4">This is exactly how your PDF will look when saved:</p>
              <iframe src={previewUrl} className="w-full flex-1 border border-gray-300 rounded mb-4" title="PDF Preview" />
              <div className="flex gap-4 justify-end">
                <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm">← Edit More</button>
                <button
                  onClick={() => { setShowPreview(false); handleSave(); }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-2"
                >
                  ✓ Confirm & Save
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] mt-5 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Let's discuss how we can help you achieve your digital goals and take your business to the next level.
          </p>
          <a href="/contact" className="inline-block bg-white text-[#25609A] px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
            Get in Touch
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}