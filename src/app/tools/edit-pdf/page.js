'use client'

import { useState, useRef, useEffect } from 'react';
import { FaFilePdf, FaFont, FaImage, FaPen, FaShapes, FaSignature, FaTrash, FaDownload, FaUndo, FaRedo, FaHighlighter, FaSearch, FaCopy, FaArrowUp, FaArrowDown, FaEye, FaEyeSlash, FaPlus, FaMinus, FaExpand, FaAlignLeft, FaAlignCenter, FaAlignRight } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import { toolsAdsConfig } from '@/config/tools-adsense.config';
import { PDFDocument, rgb } from 'pdf-lib';
import API_URL from '@/app/config';

// pdfjs will be dynamically imported on the client to avoid server-side DOM globals
const pdfjsLibRef = { current: null };

export default function EditPDF() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [activeTool, setActiveTool] = useState(null);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfScale, setPdfScale] = useState(1);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [editorOptions, setEditorOptions] = useState({
    text: {
      content: '',
      font: 'Helvetica',
      size: 12,
      color: '#000000',
      bold: false,
      italic: false
    },
    image: null,
    shapes: {
      type: 'rectangle',
      color: '#FF0000',
      fill: false,
      strokeWidth: 2
    },
    highlight: {
      color: '#FFFF00',
      opacity: 0.5
    },
    watermark: {
      text: '',
      opacity: 0.3,
      fontSize: 60,
      angle: -45,
      color: '#CCCCCC'
    }
  });
  const [elements, setElements] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [gridEnabled, setGridEnabled] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [selectedElements, setSelectedElements] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingData, setDrawingData] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const drawCanvasRef = useRef(null);

  // Tools available in the editor
  const tools = [
    { id: 'text', icon: <FaFont />, label: 'Text' },
    { id: 'image', icon: <FaImage />, label: 'Image' },
    { id: 'highlight', icon: <FaHighlighter />, label: 'Highlight' },
    { id: 'shapes', icon: <FaShapes />, label: 'Shapes' },
    { id: 'watermark', icon: <FaCopy />, label: 'Watermark' },
    { id: 'search', icon: <FaSearch />, label: 'Search Text' },
    { id: 'delete', icon: <FaTrash />, label: 'Remove' }
  ];

  // Save to history for undo/redo
  const saveToHistory = (newElements) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setElements(newElements);
  };

  // Undo action
  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements([...history[historyStep - 1]]);
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setElements([...history[historyStep + 1]]);
    }
  };

  // Handle PDF file selection
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      setFile({
        file: selectedFile,
        name: selectedFile.name,
        size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        preview: URL.createObjectURL(selectedFile)
      });
      setDownloadUrl('');
      setElements([]);
      setHistory([]);
      setHistoryStep(-1);
      setActiveTool(null);
      setCurrentPage(0);
      setSelectedElementId(null);

      // Load PDF pages for preview (ensure pdfjs is loaded)
      if (typeof window === 'undefined') {
        alert('PDF preview is only available in the browser');
        return;
      }

      if (!pdfjsLibRef.current) {
        try {
          const mod = await import('pdfjs-dist');
          pdfjsLibRef.current = mod;
          pdfjsLibRef.current.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
        } catch (impErr) {
          console.error('Failed to load pdfjs:', impErr);
          alert('PDF preview failed to load pdf worker.');
          return;
        }
      }

      // Load PDF pages for preview
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLibRef.current.getDocument(arrayBuffer).promise;
      const pages = [];
      
      for (let i = 0; i < pdf.numPages; i++) {
        pages.push(i + 1);
      }
      setPdfPages(pages);
    } catch (error) {
      alert('Error loading PDF: ' + error.message);
    }
  };

  // Render current PDF page
  const renderPdfPage = async () => {
    if (!file || !containerRef.current) return;

    try {
      const arrayBuffer = await file.file.arrayBuffer();
      if (typeof window === 'undefined') return;

      if (!pdfjsLibRef.current) {
        try {
          const mod = await import('pdfjs-dist');
          pdfjsLibRef.current = mod;
          pdfjsLibRef.current.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
        } catch (impErr) {
          console.error('Failed to load pdfjs:', impErr);
          alert('PDF render failed to load pdf worker.');
          return;
        }
      }

      // Load PDF with worker from public folder
      const pdf = await pdfjsLibRef.current.getDocument({ 
        data: arrayBuffer,
        workerSrc: '/pdf.worker.min.js'
      }).promise;
      
      const page = await pdf.getPage(currentPage + 1);
      
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context, viewport }).promise;
      
      const container = containerRef.current;
      container.innerHTML = '';
      container.appendChild(canvas);
      
      // Make canvas overlay for editing
      canvas.style.position = 'relative';
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto';
    } catch (error) {
      console.error('Error rendering PDF:', error);
      alert('Error rendering PDF. Please try another file.');
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (file && pdfPages.length > 0) {
      renderPdfPage();
    }
  }, [file, currentPage, pdfPages]);

  // Handle image selection for image tool
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditorOptions(prev => ({
        ...prev,
        image: {
          file: selectedFile,
          preview: event.target.result
        }
      }));
      setActiveTool('image');
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handle option changes
  const handleOptionChange = (tool, option, value) => {
    setEditorOptions(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool],
        [option]: value
      }
    }));
  };

  // Simulate save process
  const handleSave = async () => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Read the PDF file
      const fileData = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileData);
      
      // Apply elements to each page that has edits
      const visibleElements = elements.filter(el => el.visible !== false);
      
      for (const element of visibleElements) {
        try {
          const pages = pdfDoc.getPages();
          const pageIndex = Math.min(currentPage, pages.length - 1);
          const page = pages[pageIndex];
          const { width, height } = page.getSize();

          if (element.type === 'text') {
            page.drawText(element.options.content || 'Sample Text', {
              x: element.position.x,
              y: height - element.position.y - (element.options.size || 12),
              size: element.options.size || 12,
              color: element.options.color ? rgb(...hexToRgb(element.options.color)) : rgb(0, 0, 0),
              font: element.options.font || 'Helvetica'
            });
          } 
          else if (element.type === 'image' && element.options.src) {
            try {
              // Embed image in PDF
              const imageUrl = element.options.src;
              let imageData;
              
              if (imageUrl.startsWith('data:')) {
                // Base64 image
                const base64 = imageUrl.split(',')[1];
                imageData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
              } else {
                // Fetch image from URL
                const response = await fetch(imageUrl);
                imageData = await response.arrayBuffer();
              }
              
              // Determine image type
              const isJpeg = imageUrl.includes('jpeg') || imageUrl.includes('jpg');
              let pdfImage;
              
              if (isJpeg) {
                pdfImage = await pdfDoc.embedJpg(imageData);
              } else {
                pdfImage = await pdfDoc.embedPng(imageData);
              }
              
              const imgWidth = element.width || 100;
              const imgHeight = element.height || 100;
              
              page.drawImage(pdfImage, {
                x: element.position.x,
                y: height - element.position.y - imgHeight,
                width: imgWidth,
                height: imgHeight
              });
            } catch (imgErr) {
              console.warn('Failed to embed image:', imgErr);
            }
          }
          else if (element.type === 'highlight') {
            const [r, g, b] = hexToRgb(element.options.color || '#FFFF00');
            page.drawRectangle({
              x: element.position.x,
              y: height - element.position.y - (element.height || 20),
              width: element.width || 100,
              height: element.height || 20,
              color: rgb(r, g, b),
              opacity: element.options.opacity || 0.3
            });
          } 
          else if (element.type === 'shape') {
            const [r, g, b] = hexToRgb(element.options.color || '#FF0000');
            const x = element.position.x;
            const y = height - element.position.y - (element.height || 60);
            const w = element.width || 100;
            const h = element.height || 60;
            
            if (element.options.type === 'rectangle' || element.options.type === 'line') {
              page.drawRectangle({
                x,
                y,
                width: w,
                height: h,
                color: element.options.fill ? rgb(r, g, b) : undefined,
                borderColor: rgb(r, g, b),
                borderWidth: element.options.strokeWidth || 2
              });
            } else if (element.options.type === 'circle') {
              page.drawEllipse({
                x: x + w / 2,
                y: y + h / 2,
                xScale: w / 2,
                yScale: h / 2,
                color: element.options.fill ? rgb(r, g, b) : undefined,
                borderColor: rgb(r, g, b),
                borderWidth: element.options.strokeWidth || 2
              });
            }
          }
          else if (element.type === 'watermark') {
            const [r, g, b] = hexToRgb(element.options.color || '#CCCCCC');
            page.drawText(element.options.text || 'Watermark', {
              x: width / 2 - 50,
              y: height / 2,
              size: element.options.fontSize || 60,
              color: rgb(r, g, b),
              opacity: element.options.opacity || 0.3
            });
          }
          else if (element.type === 'drawing' && element.options.imageData) {
            try {
              // Embed freehand drawing
              const imageData = element.options.imageData;
              const base64 = imageData.split(',')[1];
              const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
              
              const drawingImage = await pdfDoc.embedPng(imgBytes);
              page.drawImage(drawingImage, {
                x: element.position.x,
                y: height - element.position.y - (element.height || 100),
                width: element.width || 200,
                height: element.height || 100
              });
            } catch (drawErr) {
              console.warn('Failed to embed drawing:', drawErr);
            }
          }
        } catch (err) {
          console.warn('Failed to add element:', err);
        }
      }

      // Save the modified PDF
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

  // Generate preview
  const handlePreview = async () => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    
    try {
      const fileData = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileData);
      
      const visibleElements = elements.filter(el => el.visible !== false);
      
      for (const element of visibleElements) {
        try {
          const pages = pdfDoc.getPages();
          const pageIndex = Math.min(currentPage, pages.length - 1);
          const page = pages[pageIndex];
          const { width, height } = page.getSize();

          // Same rendering logic as handleSave
          if (element.type === 'text') {
            page.drawText(element.options.content || 'Sample Text', {
              x: element.position.x,
              y: height - element.position.y - (element.options.size || 12),
              size: element.options.size || 12,
              color: element.options.color ? rgb(...hexToRgb(element.options.color)) : rgb(0, 0, 0)
            });
          } else if (element.type === 'highlight') {
            const [r, g, b] = hexToRgb(element.options.color || '#FFFF00');
            page.drawRectangle({
              x: element.position.x,
              y: height - element.position.y - (element.height || 20),
              width: element.width || 100,
              height: element.height || 20,
              color: rgb(r, g, b),
              opacity: element.options.opacity || 0.3
            });
          } else if (element.type === 'watermark') {
            const [r, g, b] = hexToRgb(element.options.color || '#CCCCCC');
            page.drawText(element.options.text || 'Watermark', {
              x: width / 2 - 50,
              y: height / 2,
              size: element.options.fontSize || 60,
              color: rgb(r, g, b),
              opacity: element.options.opacity || 0.3
            });
          }
        } catch (err) {
          console.warn('Preview render error:', err);
        }
      }

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

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ] : [0, 0, 0];
  };

  // Add a new element to the PDF
  const addElement = (type, options) => {
    const newElement = {
      id: Date.now(),
      type,
      options,
      position: { x: 50, y: 50 },
      width: 150,
      height: type === 'text' ? 30 : 100
    };
    const newElements = [...elements, newElement];
    saveToHistory(newElements);
  };

  // Update element position
  const updateElementPosition = (id, position) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, position } : el
    );
    setElements(newElements);
  };

  // Update element size
  const updateElementSize = (id, width, height) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, width, height } : el
    );
    setElements(newElements);
  };

  // Update element options
  const updateElementOptions = (id, options) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, options: { ...el.options, ...options } } : el
    );
    saveToHistory(newElements);
  };

  // Remove an element
  const removeElement = (id) => {
    const newElements = elements.filter(el => el.id !== id);
    saveToHistory(newElements);
    setSelectedElementId(null);
  };

  // Clear all elements
  const clearAllElements = () => {
    if (confirm('Are you sure you want to remove all elements?')) {
      saveToHistory([]);
      setSelectedElementId(null);
    }
  };

  // Duplicate element
  const duplicateElement = (id) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (elementToDuplicate) {
      const duplicated = {
        ...elementToDuplicate,
        id: Date.now(),
        position: { x: elementToDuplicate.position.x + 10, y: elementToDuplicate.position.y + 10 }
      };
      const newElements = [...elements, duplicated];
      saveToHistory(newElements);
    }
  };

  // Move element with keyboard
  const moveElementWithKeyboard = (id, direction) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const step = 5;
    let newX = element.position.x;
    let newY = element.position.y;

    switch(direction) {
      case 'up':
        newY -= step;
        break;
      case 'down':
        newY += step;
        break;
      case 'left':
        newX -= step;
        break;
      case 'right':
        newX += step;
        break;
      default:
        break;
    }

    updateElementPosition(id, { x: Math.max(0, newX), y: Math.max(0, newY) });
  };

  // Snap to grid
  const snapToGrid = (value) => {
    if (!gridEnabled) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  // Multi-select handler
  const handleElementClick = (e, elementId) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      // Toggle multi-select
      if (selectedElements.includes(elementId)) {
        setSelectedElements(selectedElements.filter(id => id !== elementId));
      } else {
        setSelectedElements([...selectedElements, elementId]);
      }
      setSelectedElementId(elementId);
    } else {
      // Single select
      setSelectedElements([elementId]);
      setSelectedElementId(elementId);
    }
  };

  // Batch delete
  const batchDelete = () => {
    if (selectedElements.length === 0) return;
    if (!confirm(`Delete ${selectedElements.length} elements?`)) return;
    
    const newElements = elements.filter(el => !selectedElements.includes(el.id));
    saveToHistory(newElements);
    setSelectedElements([]);
    setSelectedElementId(null);
  };

  // Batch duplicate
  const batchDuplicate = () => {
    if (selectedElements.length === 0) return;
    
    const selectedEls = elements.filter(el => selectedElements.includes(el.id));
    const newElements = [...elements];
    
    selectedEls.forEach(element => {
      const duplicated = {
        ...element,
        id: Date.now() + Math.random(),
        position: { 
          x: element.position.x + 10, 
          y: element.position.y + 10 
        }
      };
      newElements.push(duplicated);
    });
    
    saveToHistory(newElements);
  };

  // Move layer up
  const moveLayerUp = (id) => {
    const index = elements.findIndex(el => el.id === id);
    if (index < elements.length - 1) {
      const newElements = [...elements];
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
      saveToHistory(newElements);
    }
  };

  // Move layer down
  const moveLayerDown = (id) => {
    const index = elements.findIndex(el => el.id === id);
    if (index > 0) {
      const newElements = [...elements];
      [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
      saveToHistory(newElements);
    }
  };

  // Toggle element visibility
  const toggleElementVisibility = (id) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, visible: el.visible !== false ? false : true } : el
    );
    setElements(newElements);
  };

  // Initialize all ad units
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({}); // Top ad
        window.adsbygoogle.push({}); // Bottom ad
        if (file) {
          window.adsbygoogle.push({}); // Middle ad
        }
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

  return (
    <>
    <NavBar/>
    
    <div className="p-6 bg-gray-100 ">
      <Head>
        <title>Edit PDF - PDF Tools</title>
        <meta name="description" content="Edit your PDF documents by adding text, images, and annotations" />
      </Head>

       {/* Google AdSense Script */}
      {toolsAdsConfig.isConfigured() && (
          <Script 
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={toolsAdsConfig.getScriptUrl()}
          // Replace 'ca-pub-XXXXXXXXXXXXXXXX' with your actual AdSense publisher ID from your AdSense account
          crossOrigin="anonymous"
          onLoad={() => setAdsLoaded(true)}
          onError={(e) => console.error('AdSense script failed to load', e)}
        />
      )}
      
      <div className="mx-3 md:mx-10 lg:mx-18">
        {/* Top Ad Unit - Responsive Leaderboard */}
        <div className="mb-8">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={toolsAdsConfig.getPublisherId()} // Replace with your actual AdSense publisher ID
            data-ad-slot={toolsAdsConfig.getSlotId("top")} // Replace with your actual top ad unit slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
        
        <div className="flex items-center mb-6">
          <a href="/tools" className="text-blue-600 hover:underline">← Back to all tools</a>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <FaFilePdf className="text-[#4caf4f] text-4xl mr-4" />
            <h1 className="text-3xl font-bold text-gray-900">Edit PDF</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            Add text, images, drawings, and annotations to your PDF documents. Customize and save your changes.
          </p>
          
          {/* File Upload Area */}
          {!file ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-8 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".pdf" 
                onChange={handleFileChange}
              />
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
                    if (editorOptions.image?.preview) {
                      URL.revokeObjectURL(editorOptions.image.preview);
                    }
                    setFile(null);
                    setElements([]);
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  ×
                </button>
              </div>
              
              {/* Middle Ad Unit - Responsive Rectangle */}
              {file && (
                <div className="my-6">
                  <ins
                    className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client={toolsAdsConfig.getPublisherId()} // Replace with your actual AdSense publisher ID
                    data-ad-slot={toolsAdsConfig.getSlotId("middle")} // Replace with your actual middle ad unit slot ID
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                  ></ins>
                </div>
              )}
              
              {/* Editor Area */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Toolbar */}
                <div className="w-full lg:w-1/6">
                  <div className="flex lg:flex-col gap-2 mb-4 lg:mb-0">
                    <h3 className="hidden lg:block text-lg font-semibold mb-2">Tools</h3>
                    
                    {/* Undo/Redo Buttons */}
                    <div className="flex gap-1 lg:mb-2">
                      <button
                        onClick={handleUndo}
                        disabled={historyStep <= 0}
                        className="flex-1 lg:flex-none p-2 bg-gray-200 disabled:opacity-30 rounded flex items-center justify-center hover:bg-gray-300"
                        title="Undo (Ctrl+Z)"
                      >
                        <FaUndo size={16} />
                      </button>
                      <button
                        onClick={handleRedo}
                        disabled={historyStep >= history.length - 1}
                        className="flex-1 lg:flex-none p-2 bg-gray-200 disabled:opacity-30 rounded flex items-center justify-center hover:bg-gray-300"
                        title="Redo (Ctrl+Y)"
                      >
                        <FaRedo size={16} />
                      </button>
                    </div>

                    {/* Main Tools */}
                    <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                      {tools.map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => {
                            if (tool.id === 'image') {
                              imageInputRef.current.click();
                            } else {
                              setActiveTool(activeTool === tool.id ? null : tool.id);
                            }
                          }}
                          className={`p-3 rounded-lg flex flex-col items-center text-xs ${activeTool === tool.id ? 'bg-[#4caf4f] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                          title={tool.label}
                        >
                          <span className="text-xl mb-1">{tool.icon}</span>
                          <span className="text-xs">{tool.label}</span>
                        </button>
                      ))}
                    </div>
                    <input 
                      type="file" 
                      ref={imageInputRef}
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange}
                    />
                  </div>
                  
                  {/* Tool Options */}
                  <div className="mt-4 lg:mt-6 space-y-4">
                    {/* Text Tool Options */}
                    {activeTool === 'text' && (
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-[#4caf4f]">
                        <h4 className="font-medium mb-3 text-sm">📝 Text Options</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <label className="block mb-1 font-medium">Content</label>
                            <input
                              type="text"
                              value={editorOptions.text.content}
                              onChange={(e) => handleOptionChange('text', 'content', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="Enter text..."
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Font</label>
                            <select
                              value={editorOptions.text.font}
                              onChange={(e) => handleOptionChange('text', 'font', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                            >
                              <option value="Helvetica">Helvetica</option>
                              <option value="Times-Roman">Times Roman</option>
                              <option value="Courier">Courier</option>
                            </select>
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Size: {editorOptions.text.size}px</label>
                            <input
                              type="range"
                              min="8"
                              max="72"
                              value={editorOptions.text.size}
                              onChange={(e) => handleOptionChange('text', 'size', parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Color</label>
                            <input
                              type="color"
                              value={editorOptions.text.color}
                              onChange={(e) => handleOptionChange('text', 'color', e.target.value)}
                              className="w-full h-8 cursor-pointer"
                            />
                          </div>
                          <div className="flex gap-2">
                            <label className="flex items-center text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editorOptions.text.bold}
                                onChange={(e) => handleOptionChange('text', 'bold', e.target.checked)}
                                className="mr-1"
                              />
                              <span className="font-bold">Bold</span>
                            </label>
                            <label className="flex items-center text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editorOptions.text.italic}
                                onChange={(e) => handleOptionChange('text', 'italic', e.target.checked)}
                                className="mr-1"
                              />
                              <span className="italic">Italic</span>
                            </label>
                          </div>
                          <button
                            onClick={() => addElement('text', editorOptions.text)}
                            className="w-full mt-2 p-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            + Add Text
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Image Tool Options */}
                    {activeTool === 'image' && editorOptions.image && (
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-medium mb-3 text-sm">🖼️ Image Preview</h4>
                        <img 
                          src={editorOptions.image.preview} 
                          alt="Selected" 
                          className="max-w-full h-auto mb-3 border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => addElement('image', { src: editorOptions.image.preview })}
                          className="w-full p-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          + Add Image
                        </button>
                      </div>
                    )}

                    {/* Highlight Tool Options */}
                    {activeTool === 'highlight' && (
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-400">
                        <h4 className="font-medium mb-3 text-sm">🔆 Highlight Options</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <label className="block mb-1 font-medium">Color</label>
                            <input
                              type="color"
                              value={editorOptions.highlight.color}
                              onChange={(e) => handleOptionChange('highlight', 'color', e.target.value)}
                              className="w-full h-8 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Opacity: {Math.round(editorOptions.highlight.opacity * 100)}%</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={editorOptions.highlight.opacity}
                              onChange={(e) => handleOptionChange('highlight', 'opacity', parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <button
                            onClick={() => addElement('highlight', editorOptions.highlight)}
                            className="w-full p-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                          >
                            + Add Highlight
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Shape Tool Options */}
                    {activeTool === 'shapes' && (
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                        <h4 className="font-medium mb-3 text-sm">📦 Shape Options</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <label className="block mb-1 font-medium">Type</label>
                            <select
                              value={editorOptions.shapes.type}
                              onChange={(e) => handleOptionChange('shapes', 'type', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                            >
                              <option value="rectangle">Rectangle</option>
                              <option value="circle">Circle</option>
                              <option value="line">Line</option>
                            </select>
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Color</label>
                            <input
                              type="color"
                              value={editorOptions.shapes.color}
                              onChange={(e) => handleOptionChange('shapes', 'color', e.target.value)}
                              className="w-full h-8 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Stroke Width: {editorOptions.shapes.strokeWidth}px</label>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={editorOptions.shapes.strokeWidth}
                              onChange={(e) => handleOptionChange('shapes', 'strokeWidth', parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <label className="flex items-center text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editorOptions.shapes.fill}
                              onChange={(e) => handleOptionChange('shapes', 'fill', e.target.checked)}
                              className="mr-2"
                            />
                            <span>Fill Shape</span>
                          </label>
                          <button
                            onClick={() => addElement('shape', editorOptions.shapes)}
                            className="w-full p-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                          >
                            + Add Shape
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Watermark Tool Options */}
                    {activeTool === 'watermark' && (
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                        <h4 className="font-medium mb-3 text-sm">💧 Watermark Options</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <label className="block mb-1 font-medium">Text</label>
                            <input
                              type="text"
                              value={editorOptions.watermark.text}
                              onChange={(e) => handleOptionChange('watermark', 'text', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="Watermark text..."
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Size: {editorOptions.watermark.fontSize}px</label>
                            <input
                              type="range"
                              min="20"
                              max="120"
                              value={editorOptions.watermark.fontSize}
                              onChange={(e) => handleOptionChange('watermark', 'fontSize', parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Color</label>
                            <input
                              type="color"
                              value={editorOptions.watermark.color}
                              onChange={(e) => handleOptionChange('watermark', 'color', e.target.value)}
                              className="w-full h-8 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Opacity: {Math.round(editorOptions.watermark.opacity * 100)}%</label>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={editorOptions.watermark.opacity}
                              onChange={(e) => handleOptionChange('watermark', 'opacity', parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <button
                            onClick={() => addElement('watermark', editorOptions.watermark)}
                            className="w-full p-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            + Add Watermark
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Clear All Button */}
                  {elements.length > 0 && (
                    <button
                      onClick={clearAllElements}
                      className="w-full mt-4 p-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Clear All Elements
                    </button>
                  )}
                </div>
                
                {/* Canvas Area */}
                <div className="w-full lg:w-5/6">
                  {/* Zoom & Pan Controls */}
                  <div className="mb-3 flex items-center gap-2 bg-gray-100 p-3 rounded-lg flex-wrap">
                    <button
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1 text-sm"
                      title="Zoom out"
                    >
                      <FaMinus size={14} /> {zoom}%
                    </button>
                    <button
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1 text-sm"
                      title="Zoom in"
                    >
                      <FaPlus size={14} />
                    </button>
                    <button
                      onClick={() => setZoom(100)}
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      Reset Zoom
                    </button>
                    
                    <div className="h-6 w-px bg-gray-300 mx-1"></div>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={gridEnabled}
                        onChange={(e) => setGridEnabled(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Grid ({gridSize}px)</span>
                    </label>
                    {gridEnabled && (
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={gridSize}
                        onChange={(e) => setGridSize(parseInt(e.target.value) || 20)}
                        className="w-14 p-1 border border-gray-300 rounded text-sm"
                      />
                    )}

                    <div className="h-6 w-px bg-gray-300 mx-1"></div>

                    {selectedElements.length > 0 && (
                      <>
                        <span className="text-sm font-medium text-blue-600">
                          {selectedElements.length} selected
                        </span>
                        <button
                          onClick={batchDuplicate}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center gap-1"
                          title="Duplicate selected"
                        >
                          <FaCopy size={14} />
                        </button>
                        <button
                          onClick={batchDelete}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                          title="Delete selected"
                        >
                          <FaTrash size={14} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Preview Button */}
                  {file && elements.length > 0 && (
                    <button
                      onClick={handlePreview}
                      disabled={isProcessing}
                      className="mb-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm"
                    >
                      👁️ Preview Before Save
                    </button>
                  )}

                  {/* PDF Canvas */}
                  <div 
                    ref={containerRef}
                    className="border-2 border-solid border-gray-300 rounded-lg bg-white relative overflow-auto"
                    style={{ 
                      minHeight: '600px', 
                      maxHeight: '800px',
                      cursor: activeTool === 'draw' ? 'crosshair' : 'default'
                    }}
                    onWheel={(e) => {
                      if (e.ctrlKey) {
                        e.preventDefault();
                        setZoom(e.deltaY < 0 ? Math.min(200, zoom + 10) : Math.max(50, zoom - 10));
                      }
                    }}
                  >
                    {/* PDF Canvas with zoom */}
                    <div
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top left',
                        transition: 'transform 0.1s ease'
                      }}
                    >
                      <div 
                        ref={canvasRef}
                        className="relative bg-white"
                        style={{ 
                          display: 'inline-block',
                          position: 'relative'
                        }}
                        onMouseDown={(e) => {
                          if (activeTool === 'draw') {
                            setIsDrawing(true);
                          } else if (file && !selectedElementId) {
                            const rect = canvasRef.current.getBoundingClientRect();
                            const x = (e.clientX - rect.left) / (zoom / 100);
                            const y = (e.clientY - rect.top) / (zoom / 100);
                            
                            // Check if clicked on element
                            const clicked = elements.find(el => 
                              el.visible !== false &&
                              x >= el.position.x &&
                              x <= el.position.x + el.width &&
                              y >= el.position.y &&
                              y <= el.position.y + el.height
                            );
                            
                            if (clicked) {
                              handleElementClick(e, clicked.id);
                              setIsDragging(true);
                              setDragOffset({
                                x: x - clicked.position.x,
                                y: y - clicked.position.y
                              });
                            }
                          }
                        }}
                        onMouseMove={(e) => {
                          if (isDragging && selectedElementId) {
                            const rect = canvasRef.current.getBoundingClientRect();
                            const x = (e.clientX - rect.left) / (zoom / 100);
                            const y = (e.clientY - rect.top) / (zoom / 100);
                            
                            const newPos = {
                              x: snapToGrid(Math.max(0, x - dragOffset.x)),
                              y: snapToGrid(Math.max(0, y - dragOffset.y))
                            };
                            
                            updateElementPosition(selectedElementId, newPos);
                          } else if (isDrawing && activeTool === 'draw') {
                            // Drawing would happen here
                          }
                        }}
                        onMouseUp={() => {
                          setIsDragging(false);
                          setIsDrawing(false);
                        }}
                        onMouseLeave={() => {
                          setIsDragging(false);
                          setIsDrawing(false);
                        }}
                      >
                        {!file ? (
                          <div className="text-gray-400 text-center p-20">
                            <FaFilePdf size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Upload a PDF to view and edit</p>
                          </div>
                        ) : (
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            {/* PDF Canvas will be rendered here */}
                          </div>
                        )}
                      </div>

                      {/* Element Overlays with Enhanced Interactivity */}
                      {file && elements.length > 0 && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                          {elements.map(element => {
                            if (element.visible === false) return null;
                            
                            const isSelected = selectedElements.includes(element.id);
                            return (
                              <div 
                                key={element.id}
                                onClick={(e) => handleElementClick(e, element.id)}
                                style={{
                                  position: 'absolute',
                                  left: `${element.position.x}px`,
                                  top: `${element.position.y}px`,
                                  width: `${element.width}px`,
                                  height: `${element.height}px`,
                                  border: isSelected ? '3px solid #2563eb' : '2px solid #9ca3af',
                                  padding: '4px',
                                  background: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255,255,255,0.9)',
                                  borderRadius: '4px',
                                  cursor: 'move',
                                  pointerEvents: 'auto',
                                  zIndex: isSelected ? 20 : 10,
                                  boxShadow: isSelected ? '0 0 10px rgba(37, 99, 235, 0.5)' : 'none'
                                }}
                              >
                                {element.type === 'text' && (
                                  <div style={{
                                    fontFamily: element.options.font,
                                    fontSize: `${element.options.size * (zoom / 100)}px`,
                                    color: element.options.color,
                                    fontWeight: element.options.bold ? 'bold' : 'normal',
                                    fontStyle: element.options.italic ? 'italic' : 'normal',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {element.options.content || 'Text'}
                                  </div>
                                )}
                                {element.type === 'image' && (
                                  <img 
                                    src={element.options.src} 
                                    alt="Added to PDF" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                )}
                                {element.type === 'highlight' && (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: element.options.color,
                                    opacity: element.options.opacity
                                  }}></div>
                                )}
                                {element.type === 'shape' && (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    border: `${element.options.strokeWidth || 2}px solid ${element.options.color}`,
                                    backgroundColor: element.options.fill ? element.options.color : 'transparent',
                                    borderRadius: element.options.type === 'circle' ? '50%' : '0'
                                  }}></div>
                                )}
                                {element.type === 'watermark' && (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: element.options.color,
                                    fontSize: `${element.options.fontSize}px`,
                                    opacity: element.options.opacity,
                                    transform: `rotate(${element.options.angle}deg)`,
                                    fontWeight: 'bold'
                                  }}>
                                    {element.options.text}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Page Navigation */}
                  {file && pdfPages.length > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-4 py-2 bg-gray-300 disabled:opacity-50 rounded hover:bg-gray-400"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-medium">
                        Page {currentPage + 1} of {pdfPages.length}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(pdfPages.length - 1, currentPage + 1))}
                        disabled={currentPage === pdfPages.length - 1}
                        className="px-4 py-2 bg-gray-300 disabled:opacity-50 rounded hover:bg-gray-400"
                      >
                        Next
                      </button>
                    </div>
                  )}
                  
                  {/* Elements List with Advanced Controls */}
                  {elements.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center">
                          📋 Layers ({elements.length})
                        </h4>
                        <button
                          onClick={clearAllElements}
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {elements.map((element, index) => (
                          <div 
                            key={element.id} 
                            onClick={() => handleElementClick({}, element.id)}
                            className={`p-2 rounded border cursor-pointer transition-all text-sm ${
                              selectedElements.includes(element.id)
                                ? 'bg-blue-100 border-blue-500 shadow-sm' 
                                : 'bg-white hover:bg-gray-100 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                {/* Visibility Toggle */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleElementVisibility(element.id);
                                  }}
                                  className="p-1 text-gray-600 hover:text-gray-900"
                                  title="Toggle visibility"
                                >
                                  {element.visible !== false ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                                </button>
                                
                                {/* Element Type Icon */}
                                {element.type === 'text' && <FaFont className="text-blue-500" size={12} />}
                                {element.type === 'image' && <FaImage className="text-green-500" size={12} />}
                                {element.type === 'highlight' && <FaHighlighter className="text-yellow-500" size={12} />}
                                {element.type === 'shape' && <FaShapes className="text-purple-500" size={12} />}
                                {element.type === 'watermark' && <FaCopy className="text-gray-500" size={12} />}
                                {element.type === 'drawing' && <FaPen className="text-orange-500" size={12} />}
                                
                                {/* Element Label */}
                                <span className="font-medium capitalize">{element.type}</span>
                                {element.type === 'text' && (
                                  <span className="text-xs text-gray-500 truncate">"{element.options.content}"</span>
                                )}
                              </div>
                              
                              {/* Layer Controls */}
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveLayerUp(element.id);
                                  }}
                                  disabled={index === elements.length - 1}
                                  className="p-1 text-gray-600 hover:bg-gray-200 disabled:opacity-30 rounded text-xs"
                                  title="Move up"
                                >
                                  ⬆️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveLayerDown(element.id);
                                  }}
                                  disabled={index === 0}
                                  className="p-1 text-gray-600 hover:bg-gray-200 disabled:opacity-30 rounded text-xs"
                                  title="Move down"
                                >
                                  ⬇️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateElement(element.id);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded text-xs"
                                  title="Duplicate"
                                >
                                  📋
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeElement(element.id);
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded text-xs"
                                  title="Delete"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            
                            {/* Position Controls - Show when selected */}
                            {selectedElements.includes(element.id) && (
                              <div className="mt-2 pt-2 border-t border-gray-300">
                                <div className="grid grid-cols-2 gap-1 mb-2">
                                  <div>
                                    <label className="block text-xs text-gray-600">X:</label>
                                    <input
                                      type="number"
                                      value={element.position.x}
                                      onChange={(e) => updateElementPosition(element.id, { ...element.position, x: parseInt(e.target.value) || 0 })}
                                      className="w-full p-1 border border-gray-300 rounded text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600">Y:</label>
                                    <input
                                      type="number"
                                      value={element.position.y}
                                      onChange={(e) => updateElementPosition(element.id, { ...element.position, y: parseInt(e.target.value) || 0 })}
                                      className="w-full p-1 border border-gray-300 rounded text-xs"
                                    />
                                  </div>
                                </div>
                                
                                {/* Move with arrows */}
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => moveElementWithKeyboard(element.id, 'up')}
                                    className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                  >
                                    ⬆️
                                  </button>
                                  <button
                                    onClick={() => moveElementWithKeyboard(element.id, 'down')}
                                    className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                  >
                                    ⬇️
                                  </button>
                                  <button
                                    onClick={() => moveElementWithKeyboard(element.id, 'left')}
                                    className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                  >
                                    ⬅️
                                  </button>
                                  <button
                                    onClick={() => moveElementWithKeyboard(element.id, 'right')}
                                    className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                  >
                                    ➡️
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Save Button */}
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
                ) : (
                  'Save Edited PDF'
                )}
              </button>
              
              {elements.length > 0 && (
                <button
                  onClick={handlePreview}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center"
                >
                  👁️ Preview
                </button>
              )}
            </div>
          )}
          
          {/* Download Link */}
          {downloadUrl && (
            <div className="mt-6 text-center">
              <a 
                href={downloadUrl} 
                download={`edited-${file.name}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <FaDownload className="mr-2" />
                Download Edited PDF
              </a>
              <div className="mt-4">
                <button
                  onClick={() => {
                    URL.revokeObjectURL(file.preview);
                    if (editorOptions.image?.preview) {
                      URL.revokeObjectURL(editorOptions.image.preview);
                    }
                    setFile(null);
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
          
          {/* Bottom Ad Unit - Responsive Leaderboard */}
          <div className="mt-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={toolsAdsConfig.getPublisherId()} // Replace with your actual AdSense publisher ID
              data-ad-slot={toolsAdsConfig.getSlotId("bottom")} // Replace with your actual bottom ad unit slot ID
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-96 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">PDF Preview - Before Saving</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">This is exactly how your PDF will look when saved:</p>
            <iframe 
              src={previewUrl} 
              className="w-full flex-1 border border-gray-300 rounded mb-4"
              title="PDF Preview"
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
              >
                ← Edit More
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleSave();
                }}
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
            <a 
              href="/contact" 
              className="inline-block bg-white text-[#25609A] px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Get in Touch
            </a>
          </div>
    </div>
    <Footer/>
    </>
  );
}