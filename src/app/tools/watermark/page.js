'use client'

import { useState, useRef, useEffect } from 'react';
import { FaFilePdf, FaImage, FaFont, FaDownload, FaUndo, FaArrowsAlt, FaExpand, FaRedo } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import { PDFDocument, rgb } from 'pdf-lib';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import { toolsAdsConfig } from '@/config/tools-adsense.config';

export default function WatermarkPDF() {
  const [file, setFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [watermarkType, setWatermarkType] = useState('text');
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewDragging, setPreviewDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [watermarkOptions, setWatermarkOptions] = useState({
    text: 'CONFIDENTIAL',
    font: 'Helvetica',
    size: 48,
    color: '#000000',
    opacity: 30,
    rotation: -45,
    position: 'center',
    imageFile: null,
    imageSize: 50,
    imageOpacity: 30,
    pages: 'all',
    customX: 0,
    customY: 0,
  });
  const [previewWatermarkPos, setPreviewWatermarkPos] = useState({ x: 0, y: 0, width: 200, height: 60 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Handle drag & drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  // Handle PDF file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }

    setFile({
      file: selectedFile,
      name: selectedFile.name,
      size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(selectedFile),
    });
    setDownloadUrl('');
    
    // Load PDF pages for preview
    loadPdfPages(selectedFile);
  };

  // Load and render PDF pages
  const loadPdfPages = async (pdfFile) => {
    setIsLoadingPdf(true);
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;

      const pages = [];
      const maxPages = Math.min(pdf.numPages, 5); // Load first 5 pages

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        pages.push({
          pageNumber: i,
          dataUrl: canvas.toDataURL('image/jpeg', 0.8),
          width: viewport.width,
          height: viewport.height,
        });
      }

      setPdfPages(pages);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      setPdfPages([]);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Handle watermark image selection
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (watermarkOptions.imageFile?.preview) {
      URL.revokeObjectURL(watermarkOptions.imageFile.preview);
    }

    setWatermarkOptions((prev) => ({
      ...prev,
      imageFile: {
        file: selectedFile,
        name: selectedFile.name,
        preview: URL.createObjectURL(selectedFile),
      },
    }));
  };

  // Handle option changes
  const handleOptionChange = (option, value) => {
    setWatermarkOptions((prev) => ({
      ...prev,
      [option]: option === 'size' || option === 'opacity' || option === 'rotation' || option === 'imageSize' || option === 'imageOpacity'
        ? parseInt(value)
        : value,
    }));
  };

  // Reset watermark image
  const resetImage = () => {
    if (watermarkOptions.imageFile?.preview) {
      URL.revokeObjectURL(watermarkOptions.imageFile.preview);
    }
    setWatermarkOptions((prev) => ({
      ...prev,
      imageFile: null,
    }));
    imageInputRef.current.click();
  };

  // Apply watermark using pdf-lib.js
  const handleWatermark = async () => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    if (watermarkType === 'image' && !watermarkOptions.imageFile) {
      alert('Please select a watermark image');
      return;
    }

    setIsProcessing(true);

    try {
      const pdfBytes = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      let pageIndices = [];
      if (watermarkOptions.pages === 'all') {
        pageIndices = pages.map((_, index) => index);
      } else if (watermarkOptions.pages === 'first') {
        pageIndices = [0];
      } else if (watermarkOptions.pages === 'last') {
        pageIndices = [pages.length - 1];
      } else if (watermarkOptions.pages === 'custom') {
        pageIndices = [0]; // Placeholder for custom range
      }

      if (watermarkType === 'text') {
        const font = await pdfDoc.embedFont(watermarkOptions.font);
        const text = watermarkOptions.text || 'WATERMARK';
        const fontSize = watermarkOptions.size;
        const opacity = watermarkOptions.opacity / 100;
        const rotation = watermarkOptions.rotation;
        const color = hexToRgb(watermarkOptions.color);

        for (const pageIndex of pageIndices) {
          const page = pages[pageIndex];
          const { width, height } = page.getSize();
          const position = getPosition(watermarkOptions.position, width, height, fontSize, text, font);
          const textWidth = font.widthOfTextAtSize(text, fontSize);

          page.drawText(text, {
            x: position.x,
            y: position.y,
            size: fontSize,
            font,
            color: color ? rgb(color.r / 255, color.g / 255, color.b / 255) : rgb(0, 0, 0), // Use pdf-lib rgb
            opacity,
            rotate: { type: 'degrees', angle: rotation },
            blendMode: 'Overlay',
          });

          if (watermarkOptions.position === 'tiled') {
            const stepX = textWidth + 100;
            const stepY = fontSize * 2;
            for (let x = -width; x < width * 2; x += stepX) {
              for (let y = -height; y < height * 2; y += stepY) {
                if (x !== position.x || y !== position.y) {
                  page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: color ? rgb(color.r / 255, color.g / 255, color.b / 255) : rgb(0, 0, 0), // Use pdf-lib rgb
                    opacity,
                    rotate: { type: 'degrees', angle: rotation },
                    blendMode: 'Overlay',
                  });
                }
              }
            }
          }
        }
      } else if (watermarkType === 'image') {
        const imageFile = watermarkOptions.imageFile.file;
        const imageBytes = await imageFile.arrayBuffer();
        let image;
        if (imageFile.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          throw new Error('Unsupported image format. Use PNG or JPG.');
        }

        const opacity = watermarkOptions.imageOpacity / 100;
        const rotation = watermarkOptions.rotation;
        const imageSizePercent = watermarkOptions.imageSize / 100;

        for (const pageIndex of pageIndices) {
          const page = pages[pageIndex];
          const { width, height } = page.getSize();
          const maxWidth = width * imageSizePercent;
          const scale = maxWidth / image.width;
          const imageDims = { width: image.width * scale, height: image.height * scale };
          const position = getPosition(watermarkOptions.position, width, height, imageDims.height, '', null, imageDims.width);

          page.drawImage(image, {
            x: position.x,
            y: position.y,
            width: imageDims.width,
            height: imageDims.height,
            opacity,
            rotate: { type: 'degrees', angle: rotation },
            blendMode: 'Overlay',
          });

          if (watermarkOptions.position === 'tiled') {
            const stepX = imageDims.width + 50;
            const stepY = imageDims.height + 50;
            for (let x = -width; x < width * 2; x += stepX) {
              for (let y = -height; y < height * 2; y += stepY) {
                if (x !== position.x || y !== position.y) {
                  page.drawImage(image, {
                    x,
                    y,
                    width: imageDims.width,
                    height: imageDims.height,
                    opacity,
                    rotate: { type: 'degrees', angle: rotation },
                    blendMode: 'Overlay',
                  });
                }
              }
            }
          }
        }
      }

      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error('Watermarking failed:', error);
      alert('Failed to apply watermark: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
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
      if (watermarkOptions.imageFile?.preview) URL.revokeObjectURL(watermarkOptions.imageFile.preview);
    };
  }, [file, downloadUrl, watermarkOptions.imageFile]);

  // Helper: Convert hex color to RGB
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };

  // Helper: Calculate watermark position
  const getPosition = (position, pageWidth, pageHeight, size, text = '', font = null, imageWidth = 0) => {
    let x, y;
    const offset = 20;
    const textWidth = font && text ? font.widthOfTextAtSize(text, size) : imageWidth;

    switch (position) {
      case 'top-left':
        x = offset;
        y = pageHeight - size - offset;
        break;
      case 'top-right':
        x = pageWidth - textWidth - offset;
        y = pageHeight - size - offset;
        break;
      case 'bottom-left':
        x = offset;
        y = offset;
        break;
      case 'bottom-right':
        x = pageWidth - textWidth - offset;
        y = offset;
        break;
      case 'center':
      case 'tiled':
        x = (pageWidth - textWidth) / 2;
        y = (pageHeight - size) / 2;
        break;
      default:
        x = pageWidth / 2;
        y = pageHeight / 2;
    }
    return { x, y };
  };

  // Preview Canvas - Handle dragging
  const handlePreviewMouseDown = (e) => {
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x >= previewWatermarkPos.x &&
      x <= previewWatermarkPos.x + previewWatermarkPos.width &&
      y >= previewWatermarkPos.y &&
      y <= previewWatermarkPos.y + previewWatermarkPos.height
    ) {
      setPreviewDragging(true);
      setDragOffset({
        x: x - previewWatermarkPos.x,
        y: y - previewWatermarkPos.y,
      });
    }
  };

  const handlePreviewMouseMove = (e) => {
    if (!previewDragging) return;

    const rect = previewCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPreviewWatermarkPos((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(x - dragOffset.x, rect.width - prev.width)),
      y: Math.max(0, Math.min(y - dragOffset.y, rect.height - prev.height)),
    }));

    setWatermarkOptions((prev) => ({
      ...prev,
      position: 'custom',
      customX: x - dragOffset.x,
      customY: y - dragOffset.y,
    }));
  };

  const handlePreviewMouseUp = () => {
    setPreviewDragging(false);
  };

  // Handle watermark size change in preview
  const handleResizeWatermark = (newSize) => {
    if (watermarkType === 'text') {
      setWatermarkOptions((prev) => ({
        ...prev,
        size: newSize,
      }));
      setPreviewWatermarkPos((prev) => ({
        ...prev,
        height: newSize,
        width: newSize * 4,
      }));
    } else {
      setWatermarkOptions((prev) => ({
        ...prev,
        imageSize: newSize,
      }));
      setPreviewWatermarkPos((prev) => ({
        ...prev,
        width: (newSize / 100) * 400,
      }));
    }
  };

  return (

    <>
    <NavBar/>
  
    <div className="p-6 bg-gray-100 ">
      <Head>
        <title>Watermark PDF - PDF Tools</title>
        <meta name="description" content="Add text or image watermarks to your PDF documents" />
      </Head>
      {toolsAdsConfig.isConfigured() && (
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
        {/* Top Ad Unit */}
        <div className="mb-8">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={toolsAdsConfig.getPublisherId()}
            data-ad-slot={toolsAdsConfig.getSlotId("top")}
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
            <h1 className="text-3xl font-bold text-gray-900">Watermark PDF</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Add text or image watermarks to your PDF documents. Customize appearance and position.
          </p>

          {/* File Upload Area */}
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-8 cursor-pointer transition-all ${
                dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => fileInputRef.current.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
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
                    setFile(null);
                    setPdfPages([]);
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  ×
                </button>
              </div>



              {/* Middle Ad Unit */}
              {file && (
                <div className="my-6">
                  <ins
                    className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client={toolsAdsConfig.getPublisherId()}
                    data-ad-slot={toolsAdsConfig.getSlotId("middle")}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                  ></ins>
                </div>
              )}

              {/* Watermark Type Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Watermark Type</h3>
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setWatermarkType('text')}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      watermarkType === 'text' ? 'bg-[#4caf4f] text-white' : 'bg-gray-100'
                    }`}
                  >
                    <FaFont className="mr-2" />
                    Text Watermark
                  </button>
                  <button
                    onClick={() => setWatermarkType('image')}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      watermarkType === 'image' ? 'bg-[#4caf4f] text-white' : 'bg-gray-100'
                    }`}
                  >
                    <FaImage className="mr-2" />
                    Image Watermark
                  </button>
                </div>

                {/* Live Preview Canvas */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-700 flex items-center">
                      <FaArrowsAlt className="mr-2 text-blue-500" />
                      Live Preview - Drag & Resize Watermark
                    </h4>
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {previewMode ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {isLoadingPdf && (
                    <div className="bg-blue-50 rounded-lg p-8 text-center">
                      <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-blue-700">Loading PDF page...</p>
                    </div>
                  )}

                  {previewMode && pdfPages.length > 0 && (
                    <div className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                      style={{ width: '100%' }}
                      ref={previewCanvasRef}
                      onMouseDown={handlePreviewMouseDown}
                      onMouseMove={handlePreviewMouseMove}
                      onMouseUp={handlePreviewMouseUp}
                      onMouseLeave={handlePreviewMouseUp}
                    >
                      {/* Show Actual PDF Page */}
                      <div className="relative w-full" style={{ position: 'relative', width: '100%', paddingBottom: '125%' }}>
                        <img
                          src={pdfPages[0].dataUrl}
                          alt="PDF Page 1"
                          className="absolute inset-0 w-full h-full object-contain"
                        />

                        {/* Draggable Watermark Preview */}
                        <div
                          className="absolute border-2 border-blue-400 rounded cursor-move group hover:border-blue-600 transition-all"
                          style={{
                            left: `${(previewWatermarkPos.x / (previewCanvasRef.current?.offsetWidth || 500)) * 100}%`,
                            top: `${(previewWatermarkPos.y / (previewCanvasRef.current?.offsetHeight || 500)) * 100}%`,
                            width: `${(previewWatermarkPos.width / (previewCanvasRef.current?.offsetWidth || 500)) * 100}%`,
                            height: `${(previewWatermarkPos.height / (previewCanvasRef.current?.offsetHeight || 500)) * 100}%`,
                            opacity: watermarkOptions.opacity / 100,
                            transform: `rotate(${watermarkOptions.rotation}deg)`,
                          }}
                          onMouseDown={handlePreviewMouseDown}
                          onMouseMove={handlePreviewMouseMove}
                          onMouseUp={handlePreviewMouseUp}
                        >
                          {watermarkType === 'text' ? (
                            <div
                              className="w-full h-full flex items-center justify-center text-white font-bold"
                              style={{
                                color: watermarkOptions.color,
                                fontSize: `${Math.min(watermarkOptions.size * 0.5, 24)}px`,
                                fontFamily: watermarkOptions.font,
                              }}
                            >
                              {watermarkOptions.text}
                            </div>
                          ) : (
                            watermarkOptions.imageFile && (
                              <img
                                src={watermarkOptions.imageFile.preview}
                                alt="Watermark"
                                className="w-full h-full object-contain"
                              />
                            )
                          )}

                          {/* Resize Handle */}
                          <div
                            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize transform translate-x-2 translate-y-2 group-hover:scale-125 transition-transform"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setPreviewDragging('resize');
                            }}
                            title="Drag to resize"
                          ></div>
                        </div>
                      </div>

                      {/* Info Text */}
                      <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white px-2 py-1 rounded opacity-70 z-10">
                        <FaArrowsAlt className="inline mr-1" />
                        Drag to move | Bottom-right corner to resize
                      </div>
                    </div>
                  )}

                  {previewMode && pdfPages.length === 0 && !isLoadingPdf && (
                    <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                      <p>PDF will appear here once loaded</p>
                    </div>
                  )}

                  {/* Quick Resize Sliders for Preview */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <FaExpand className="mr-2" />
                        Quick Size Adjust
                      </label>
                      <input
                        type="range"
                        min={watermarkType === 'text' ? '10' : '5'}
                        max={watermarkType === 'text' ? '100' : '100'}
                        value={watermarkType === 'text' ? watermarkOptions.size : watermarkOptions.imageSize}
                        onChange={(e) => handleResizeWatermark(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-600 mt-1">
                        {watermarkType === 'text' ? `${watermarkOptions.size}px` : `${watermarkOptions.imageSize}%`}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position Lock</label>
                      <select
                        value={watermarkOptions.position}
                        onChange={(e) => {
                          const newPos = e.target.value;
                          handleOptionChange('position', newPos);
                          if (newPos !== 'custom') {
                            // Reset to preset position
                            setPreviewWatermarkPos({
                              x: 50,
                              y: 50,
                              width: 200,
                              height: 60,
                            });
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="center">Center</option>
                        <option value="top-left">Top Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="tiled">Tiled (Repeat)</option>
                        <option value="custom">Custom Position</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Text Watermark Options */}
                {watermarkType === 'text' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 font-medium">Watermark Text</label>
                      <input
                        type="text"
                        value={watermarkOptions.text}
                        onChange={(e) => handleOptionChange('text', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Font</label>
                      <select
                        value={watermarkOptions.font}
                        onChange={(e) => handleOptionChange('font', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times-Roman">Times Roman</option>
                        <option value="Courier">Courier</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Font Size</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={watermarkOptions.size}
                        onChange={(e) => handleOptionChange('size', e.target.value)}
                        className="w-full"
                      />
                      <div className="text-center">{watermarkOptions.size}px</div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Text Color</label>
                      <input
                        type="color"
                        value={watermarkOptions.color}
                        onChange={(e) => handleOptionChange('color', e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                )}

                {/* Image Watermark Options */}
                {watermarkType === 'image' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block mb-2 font-medium">Watermark Image</label>
                      {watermarkOptions.imageFile ? (
                        <div className="flex items-center">
                          <div className="mr-4 border p-1">
                            <img
                              src={watermarkOptions.imageFile.preview}
                              alt="Watermark preview"
                              className="max-h-20 max-w-full object-contain"
                            />
                          </div>
                          <button
                            onClick={resetImage}
                            className="text-red-500 hover:text-red-700 flex items-center"
                          >
                            <FaUndo className="mr-1" />
                            Change Image
                          </button>
                          <input
                            type="file"
                            ref={imageInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </div>
                      ) : (
                        <div
                          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                            dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => imageInputRef.current.click()}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <input
                            type="file"
                            ref={imageInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <p className="text-gray-500">
                            <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                            watermark image
                          </p>
                          <p className="text-sm text-gray-400">PNG, JPG (transparent background recommended)</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 font-medium">Image Size</label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={watermarkOptions.imageSize}
                          onChange={(e) => handleOptionChange('imageSize', e.target.value)}
                          className="w-full"
                        />
                        <div className="text-center">{watermarkOptions.imageSize}% of page width</div>
                      </div>

                      <div>
                        <label className="block mb-2 font-medium">Image Opacity</label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={watermarkOptions.imageOpacity}
                          onChange={(e) => handleOptionChange('imageOpacity', e.target.value)}
                          className="w-full"
                        />
                        <div className="text-center">{watermarkOptions.imageOpacity}%</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Common Options */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-medium">Rotation</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="15"
                      value={watermarkOptions.rotation}
                      onChange={(e) => handleOptionChange('rotation', e.target.value)}
                      className="w-full"
                    />
                    <div className="text-center">{watermarkOptions.rotation}°</div>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Position</label>
                    <select
                      value={watermarkOptions.position}
                      onChange={(e) => handleOptionChange('position', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="center">Center</option>
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="tiled">Tiled (Repeat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Opacity</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={watermarkOptions.opacity}
                      onChange={(e) => handleOptionChange('opacity', e.target.value)}
                      className="w-full"
                    />
                    <div className="text-center">{watermarkOptions.opacity}%</div>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Pages</label>
                    <select
                      value={watermarkOptions.pages}
                      onChange={(e) => handleOptionChange('pages', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="all">All Pages</option>
                      <option value="first">First Page Only</option>
                      <option value="last">Last Page Only</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Watermark Button */}
          {file && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleWatermark}
                disabled={isProcessing || (watermarkType === 'image' && !watermarkOptions.imageFile)}
                className={`px-6 py-3 rounded-lg font-medium text-white ${
                  isProcessing || (watermarkType === 'image' && !watermarkOptions.imageFile)
                    ? 'bg-gray-400'
                    : 'bg-[#4caf4f] hover:bg-[#3e8e40]'
                } transition-colors flex items-center`}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Applying Watermark...
                  </>
                ) : (
                  'Apply Watermark to PDF'
                )}
              </button>
            </div>
          )}

          {/* Download Link */}
          {downloadUrl && (
            <div className="mt-6 text-center">
              <a
                href={downloadUrl}
                download={`watermarked-${file.name}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <FaDownload className="mr-2" />
                Download Watermarked PDF
              </a>
              <div className="mt-4">
                <button
                  onClick={() => {
                    URL.revokeObjectURL(file.preview);
                    if (watermarkOptions.imageFile?.preview) {
                      URL.revokeObjectURL(watermarkOptions.imageFile.preview);
                    }
                    setFile(null);
                    setDownloadUrl('');
                    setWatermarkOptions((prev) => ({
                      ...prev,
                      imageFile: null,
                    }));
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Watermark another file
                </button>
              </div>
            </div>
          )}

          {/* Bottom Ad Unit */}
          <div className="mt-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={toolsAdsConfig.getPublisherId()}
              data-ad-slot={toolsAdsConfig.getSlotId("bottom")}
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        </div>
      </div>
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