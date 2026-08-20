'use client';

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { 
  FaUpload, 
  FaCamera,
  FaMagic,
  FaUndo,
  FaEye,
  FaEyeSlash,
  FaRulerCombined,
  FaDownload,
  FaLayerGroup,
  FaCrop,
  FaMobileAlt,
  FaTimes
} from 'react-icons/fa';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import { toolsAdsConfig } from '@/config/tools-adsense.config';

export default function AdvancedDocumentCorrector() {
  const [imgSrc, setImgSrc] = useState('');
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [points, setPoints] = useState([]);
  const [activePoint, setActivePoint] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [correctionMode, setCorrectionMode] = useState('perspective');
  const [opencvReady, setOpencvReady] = useState(false);
  const [correctedSrc, setCorrectedSrc] = useState('');
  const [cameraError, setCameraError] = useState('');

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);
  const captureCanvasRef = useRef(null);

  const defaultPoints = [
    { id: 'tl', x: 15, y: 15, label: 'Top Left' },
    { id: 'tr', x: 85, y: 15, label: 'Top Right' },
    { id: 'br', x: 85, y: 85, label: 'Bottom Right' },
    { id: 'bl', x: 15, y: 85, label: 'Bottom Left' }
  ];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (window.innerWidth <= 768);
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (imgSrc) {
      setPoints([...defaultPoints]);
    }
  }, [imgSrc]);

  useEffect(() => {
    if (imgSrc && points.length >= 4 && opencvReady) {
      applyCorrection();
    }
  }, [points, imgSrc, opencvReady, correctionMode]);

  const orderPoints = (pts) => {
    const pointsArray = pts.map(p => [p[0], p[1]]);
    
    const sum = pointsArray.map(p => p[0] + p[1]);
    const diff = pointsArray.map(p => p[0] - p[1]);
    
    return [
      pointsArray[sum.indexOf(Math.min(...sum))],
      pointsArray[diff.indexOf(Math.max(...diff))],
      pointsArray[sum.indexOf(Math.max(...sum))],
      pointsArray[diff.indexOf(Math.min(...diff))]
    ];
  };

  // 🔴 FIXED: Camera initialization with better error handling
  const startCamera = async () => {
    if (!isMobile) {
      alert('Camera feature is only available on mobile devices. Please upload an image instead.');
      return;
    }
    
    setCameraError('');
    
    try {
      // First check if we have camera permissions
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      // Wait for video element to be ready
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to load metadata
        await new Promise((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().then(resolve).catch(reject);
            };
          }
        });
        
        setShowCamera(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(err.message);
      
      // User-friendly error messages
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('Camera access was denied. Please allow camera access in your browser settings and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        alert('No camera found on this device.');
      } else if (err.name === 'NotSupportedError') {
        alert('Camera not supported in this browser.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        alert('Camera is already in use by another application.');
      } else {
        alert(`Camera error: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setShowCamera(false);
    setCameraError('');
  };

  // 🔴 FIXED: Capture photo function
  const capturePhoto = () => {
    if (!videoRef.current || !captureCanvasRef.current) {
      console.error('Video or canvas not ready');
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = captureCanvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Set the image source
      setImgSrc(imageDataUrl);
      
      // Stop camera
      stopCamera();
      
      console.log('Photo captured successfully');
    } catch (err) {
      console.error('Capture error:', err);
      alert('Failed to capture photo. Please try again.');
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const onSelectFile = (e) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => setImgSrc(reader.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const resetPoints = () => {
    setPoints([...defaultPoints]);
    setActivePoint(null);
  };

  const autoDetectEdges = () => {
    if (!opencvReady || !imgRef.current) return;

    try {
      const src = cv.imread(imgRef.current);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
      cv.Canny(gray, gray, 75, 200);

      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(gray, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      let largest = null;
      let maxArea = 0;
      for (let i = 0; i < contours.size(); i++) {
        const c = contours.get(i);
        const area = cv.contourArea(c);
        if (area > maxArea) {
          maxArea = area;
          largest = c;
        }
      }

      if (largest && maxArea > 15000) {
        const peri = cv.arcLength(largest, true);
        const approx = new cv.Mat();
        cv.approxPolyDP(largest, approx, 0.02 * peri, true);

        if (approx.rows === 4) {
          const pts = [];
          for (let i = 0; i < 4; i++) {
            pts.push({
              x: approx.data32F[i * 2] / src.cols * 100,
              y: approx.data32F[i * 2 + 1] / src.rows * 100
            });
          }
          
          const pixelPts = pts.map(p => [p.x, p.y]);
          const orderedPixelPts = orderPoints(pixelPts);
          
          setPoints(orderedPixelPts.map((p, i) => ({
            x: p[0],
            y: p[1],
            id: defaultPoints[i].id,
            label: defaultPoints[i].label
          })));
        } else {
          alert('No clear document detected. Please adjust corners manually.');
        }
        approx.delete();
      } else {
        alert('No document found. Try better lighting or manual adjustment.');
        resetPoints();
      }

      src.delete(); gray.delete(); contours.delete(); hierarchy.delete();
    } catch (err) {
      console.error('Edge detection error:', err);
      alert('Error detecting edges. Please adjust corners manually.');
    }
  };

  const handleMouseDown = (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    setActivePoint(id);
  };

  const handleMouseMove = (e) => {
    if (!activePoint || !containerRef.current) return;
    
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setPoints(prev =>
      prev.map(p =>
        p.id === activePoint
          ? {
              ...p,
              x: Math.max(5, Math.min(95, x)),
              y: Math.max(5, Math.min(95, y))
            }
          : p
      )
    );
  };

  const applyCorrection = () => {
    if (!opencvReady || !imgRef.current || points.length < 4) return;

    try {
      const srcImg = cv.imread(imgRef.current);
      const w = srcImg.cols, h = srcImg.rows;

      const srcPts = points.map(p => [p.x / 100 * w, p.y / 100 * h]);
      const orderedSrcPts = orderPoints(srcPts);

      if (correctionMode === 'perspective') {
        const widthTop = Math.hypot(
          orderedSrcPts[1][0] - orderedSrcPts[0][0],
          orderedSrcPts[1][1] - orderedSrcPts[0][1]
        );
        const widthBottom = Math.hypot(
          orderedSrcPts[2][0] - orderedSrcPts[3][0],
          orderedSrcPts[2][1] - orderedSrcPts[3][1]
        );
        const maxWidth = Math.max(widthTop, widthBottom);

        const heightLeft = Math.hypot(
          orderedSrcPts[3][0] - orderedSrcPts[0][0],
          orderedSrcPts[3][1] - orderedSrcPts[0][1]
        );
        const heightRight = Math.hypot(
          orderedSrcPts[2][0] - orderedSrcPts[1][0],
          orderedSrcPts[2][1] - orderedSrcPts[1][1]
        );
        const maxHeight = Math.max(heightLeft, heightRight);

        const srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, orderedSrcPts.flat());
        const dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
          0, 0,
          maxWidth - 1, 0,
          maxWidth - 1, maxHeight - 1,
          0, maxHeight - 1
        ]);
        
        const M = cv.getPerspectiveTransform(srcMat, dstMat);
        const dsize = new cv.Size(maxWidth, maxHeight);

        let dstImg = new cv.Mat();
        cv.warpPerspective(srcImg, dstImg, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(255,255,255,255));
        cv.imshow(canvasRef.current, dstImg);
        
        srcMat.delete(); dstMat.delete(); M.delete(); dstImg.delete();
      } else {
        const xValues = orderedSrcPts.map(p => p[0]);
        const yValues = orderedSrcPts.map(p => p[1]);
        
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        
        const cropWidth = Math.round(maxX - minX);
        const cropHeight = Math.round(maxY - minY);
        
        const roi = new cv.Rect(Math.round(minX), Math.round(minY), cropWidth, cropHeight);
        const cropped = srcImg.roi(roi);
        
        const dstCanvas = document.createElement('canvas');
        dstCanvas.width = cropWidth;
        dstCanvas.height = cropHeight;
        cv.imshow(dstCanvas, cropped);
        
        canvasRef.current.width = cropWidth;
        canvasRef.current.height = cropHeight;
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(dstCanvas, 0, 0);
        
        cropped.delete();
      }

      setCorrectedSrc(canvasRef.current.toDataURL('image/png'));
      srcImg.delete();
    } catch (err) {
      console.error('Correction error:', err);
    }
  };

  const handleDownload = () => {
    if (!correctedSrc) return;
    const a = document.createElement('a');
    a.href = correctedSrc;
    a.download = `document-corrected-${Date.now()}.png`;
    a.click();
  };

  useEffect(() => {
    const handleEndDrag = () => setActivePoint(null);
    
    if (activePoint) {
      const preventDefault = (e) => e.preventDefault();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEndDrag);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleEndDrag);
      document.addEventListener('touchcancel', handleEndDrag);
      document.addEventListener('contextmenu', preventDefault);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEndDrag);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleEndDrag);
        document.removeEventListener('touchcancel', handleEndDrag);
        document.removeEventListener('contextmenu', preventDefault);
      };
    }
  }, [activePoint]);

  return (
    <>
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
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <Head>
          <title>Document Perspective Corrector - Fix Skewed Photos</title>
          <meta name="description" content="Fix skewed document photos with perspective correction. Upload or take photo, adjust corners, and download clean documents." />
        </Head>

        <Script src="https://docs.opencv.org/4.x/opencv.js" onLoad={() => setOpencvReady(true)} />

        {/* Hidden canvas for capturing photos */}
        <canvas ref={captureCanvasRef} className="hidden" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Document Perspective Corrector
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto">
              Fix skewed documents, receipts, and forms with AI-powered edge detection and manual fine-tuning.
            </p>
          </div>

          {/* Top Ad Unit */}
          {toolsAdsConfig.isConfigured() ? (
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
          ) : (
            <div className="mb-8 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center">
              <p className="text-gray-500">Advertisement Space</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upload */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-lg mb-5 flex items-center">
                  <FaUpload className="mr-3 text-emerald-600" /> Upload Document
                </h3>
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-emerald-500 hover:bg-emerald-50 transition">
                    <FaUpload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="font-semibold text-gray-700">Click to upload</p>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG • Up to 20MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
                </label>

                {/* Mobile-only Camera Button */}
                {isMobile ? (
                  <button
                    onClick={startCamera}
                    className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all"
                  >
                    <FaMobileAlt className="mr-3 text-xl" />
                    <span className="flex items-center">
                      <FaCamera className="mr-2" /> Take Photo
                    </span>
                  </button>
                ) : (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                    <p className="text-sm text-gray-600">
                      <FaMobileAlt className="inline mr-2 text-gray-500" />
                      Camera is optimized for mobile devices
                    </p>
                  </div>
                )}
              </div>

              {imgSrc && (
                <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="font-bold text-lg flex items-center">
                    <FaLayerGroup className="mr-3 text-emerald-600" /> Tools
                  </h3>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Correction Mode</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setCorrectionMode('perspective')}
                        className={`py-3 rounded-lg font-medium transition ${correctionMode === 'perspective' ? 'bg-emerald-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        Perspective
                      </button>
                      <button
                        onClick={() => setCorrectionMode('freeform')}
                        className={`py-3 rounded-lg font-medium transition ${correctionMode === 'freeform' ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        Bounding Crop
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={autoDetectEdges} 
                      className="py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 flex items-center justify-center shadow-md transition-all"
                    >
                      <FaMagic className="mr-2" /> Auto Detect
                    </button>
                    <button 
                      onClick={resetPoints} 
                      className="py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 flex items-center justify-center shadow-md transition-all"
                    >
                      <FaUndo className="mr-2" /> Reset
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowGrid(!showGrid)} 
                      className={`py-3 rounded-lg flex items-center justify-center shadow-md transition-all ${showGrid ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      <FaRulerCombined className="mr-2" /> Grid
                    </button>
                    <button 
                      onClick={() => setShowPreview(!showPreview)} 
                      className={`py-3 rounded-lg flex items-center justify-center shadow-md transition-all ${showPreview ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {showPreview ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />} Preview
                    </button>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={!correctedSrc}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center shadow-lg transition-all duration-200"
                  >
                    <FaDownload className="mr-3 text-xl" /> Download Corrected
                  </button>
                </div>
              )}
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {imgSrc ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                    {/* Original with draggable points */}
                    <div>
                      <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                        <FaCrop className="mr-3 text-blue-600" /> Adjust Document Corners
                      </h3>
                      <div className="mb-2 text-sm text-gray-600">
                        Drag corner handles to align the document edges. Release to place the corner.
                      </div>
                      <div
                        ref={containerRef}
                        className="relative bg-gray-900 rounded-xl overflow-hidden cursor-crosshair select-none"
                        onMouseMove={(e) => {
                          if (activePoint) handleMouseMove(e);
                        }}
                        onTouchMove={(e) => {
                          if (activePoint) handleMouseMove(e);
                        }}
                        style={{ touchAction: activePoint ? 'none' : 'auto' }}
                      >
                        <img
                          ref={imgRef}
                          src={imgSrc}
                          alt="Document"
                          className="w-full max-h-[70vh] object-contain"
                          draggable="false"
                        />

                        {showGrid && (
                          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-40">
                            {Array(3).fill(null).map((_, i) => <div key={`v${i}`} className="border-r border-white" />)}
                            {Array(3).fill(null).map((_, i) => <div key={`h${i}`} className="border-b border-white col-span-4" />)}
                          </div>
                        )}

                        {points.map(p => (
                          <div
                            key={p.id}
                            className={`absolute w-8 h-8 rounded-full border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${activePoint === p.id ? 'bg-emerald-500 scale-150 ring-4 ring-emerald-300 ring-opacity-50 z-10' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-125 z-0'}`}
                            style={{ left: `${p.x}%`, top: `${p.y}%` }}
                            onMouseDown={(e) => handleMouseDown(p.id, e)}
                            onTouchStart={(e) => handleMouseDown(p.id, e)}
                          >
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg z-10">
                              {p.label}
                            </div>
                          </div>
                        ))}

                        <svg
                          className="absolute inset-0 pointer-events-none"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <polyline
                            points={points.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke="rgba(255,255,255,0.7)"
                            strokeWidth="2"
                            strokeDasharray="6,4"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Preview */}
                    {showPreview && (
                      <div>
                        <h3 className="font-bold text-xl mb-4 flex items-center text-gray-800">
                          <FaCrop className="mr-3 text-emerald-600" /> Corrected Preview
                        </h3>
                        <div className="bg-gray-900 rounded-xl overflow-hidden border-4 border-gray-800 shadow-inner">
                          <canvas ref={canvasRef} className="w-full max-h-[70vh] object-contain" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-20 text-center">
                    <FaLayerGroup className="w-32 h-32 text-gray-300 mx-auto mb-8" />
                    <h3 className="text-3xl font-bold text-gray-700 mb-4">Ready to Correct Your Document</h3>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                      Upload a photo of a document, receipt, or form. Then drag the corners to align it perfectly.
                    </p>
                    <label className="inline-block px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xl font-bold rounded-2xl cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-200 shadow-lg">
                      <FaUpload className="inline mr-3" /> Upload Image
                      <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Camera Modal - Fixed camera interface */}
        {showCamera && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Take Document Photo</h3>
              <button 
                onClick={stopCamera}
                className="text-2xl hover:text-gray-300 transition p-2"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Camera feed container */}
            <div className="flex-1 relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              
              {/* Camera overlay with guides */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-4/5 h-3/5 border-2 border-white border-dashed rounded-lg opacity-70"></div>
              </div>
            </div>
            
            {/* Camera controls */}
            <div className="p-6 bg-gray-900 text-center">
              <p className="text-white mb-4">Align document within the frame</p>
              
              <div className="flex justify-center items-center gap-8">
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full border-8 border-gray-400 shadow-2xl hover:scale-105 transition-transform"
                />
                
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Close
                </button>
              </div>
              
              {cameraError && (
                <div className="mt-4 p-2 bg-red-900/50 text-red-200 text-sm rounded">
                  {cameraError}
                </div>
              )}
            </div>
          </div>
        )}

        

        {/* Bottom Ad Unit */}
        {toolsAdsConfig.isConfigured() ? (
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
        ) : (
          <div className="mt-8 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center">
            <p className="text-gray-500">Advertisement Space</p>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}