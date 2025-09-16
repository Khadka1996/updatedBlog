'use client'

import { useState, useRef, useEffect } from 'react';
import { FaFilePdf, FaFileImage, FaDownload, FaTrash, FaPlus, FaTimes, FaCheck, FaInfoCircle, FaImages } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';

export default function PdfToJpg() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewPages, setPreviewPages] = useState([]);
  const [quality, setQuality] = useState(90);
  const [adsLoaded, setAdsLoaded] = useState(false); // Track AdSense script loading
  const fileInputRef = useRef(null);

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

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Reset previous file
    if (file) {
      URL.revokeObjectURL(file.preview);
    }

    const newFile = {
      file: selectedFile,
      name: selectedFile.name,
      size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(selectedFile)
    };

    setFile(newFile);
    generatePdfPreview(newFile.preview);
  };

  // Generate preview of PDF pages
  const generatePdfPreview = async (pdfUrl) => {
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      
      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      const pages = [];
      for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) { // Preview first 3 pages
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        pages.push(canvas.toDataURL('image/jpeg'));
      }
      
      setPreviewPages(pages);
    } catch (error) {
      console.error('Preview generation failed:', error);
    }
  };

  // Remove file
  const removeFile = () => {
    if (file) {
      URL.revokeObjectURL(file.preview);
      setFile(null);
      setPreviewPages([]);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      alert('Please select a PDF file first!');
      return;
    }

    setIsProcessing(true);
    
    const formData = new FormData();
    formData.append('pdf', file.file);
    formData.append('quality', quality);

    try {
      const response = await fetch('/api/pdf-to-jpg/convert', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Conversion failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Change extension to .jpg for single file, keep .zip for multiple
      const isSingleFile = previewPages.length === 1;
      const newName = file.name.replace(/\.pdf$/i, '') + 
                     (isSingleFile ? '.jpg' : '-converted.zip');
      
      setDownloadUrl({
        url,
        name: newName,
        isSingleFile
      });
      setShowDownloadModal(true);
    } catch (error) {
      alert(error.message);
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
      if (file) URL.revokeObjectURL(file.preview);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl.url);
    };
  }, [file, downloadUrl]);

  return (
        <>
        <NavBar/>
    <div className="p-6 bg-gray-100 ">
      <Head>
        <title>PDF to JPG Converter - PDF Tools</title>
        <meta name="description" content="Convert PDF pages to high-quality JPG images" />
      </Head>

       {/* Google AdSense Script */}
        <Script 
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX`}
          // Replace 'ca-pub-XXXXXXXXXXXXXXXX' with your actual AdSense publisher ID from your AdSense account
          crossOrigin="anonymous"
          onLoad={() => setAdsLoaded(true)}
          onError={(e) => console.error('AdSense script failed to load', e)}
        />
      
      <div className="max-w-6xl mx-auto">
        {/* Top Ad Unit - Responsive Leaderboard */}
        <div className="mb-8">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual AdSense publisher ID
            data-ad-slot="YOUR_TOP_AD_SLOT" // Replace with your actual top ad unit slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>

        <div className="flex items-center mb-6">
          <a href="/tools" className="text-blue-600 hover:underline">← Back to all tools</a>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            <span className="inline-flex items-center justify-center gap-2">
              <FaFilePdf className="text-red-500" />
              → 
              <FaFileImage class Cards is="text-green-500" />
            </span>
          </h1>
          <h2 className="text-2xl font-semibold text-blue-600">PDF to JPG Converter</h2>
          <p className="text-gray-600 text-lg mt-2">Convert your PDF to high-quality JPG images instantly</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & Options */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-4">
            {/* Drag & Drop Upload */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
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
              <div className="flex flex-col items-center">
                <FaPlus className={`text-2xl mb-2 ${dragging ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className={`font-medium ${dragging ? 'text-blue-600' : 'text-gray-600'}`}>
                  {dragging ? 'Drop PDF here' : 'Click or drag & drop to upload PDF'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Supports PDF files</p>
              </div>
            </div>

            {/* Middle Ad Unit - Responsive Rectangle */}
            {file && (
              <div className="my-6">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual AdSense publisher ID
                  data-ad-slot="YOUR_MIDDLE_AD_SLOT" // Replace with your actual middle ad unit slot ID
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
              </div>
            )}

            {/* Selected File Info */}
            {file && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">
                    Selected File
                  </h3>
                  <button 
                    onClick={removeFile}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <FaTrash size={12} /> Remove
                  </button>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex items-center">
                    <FaFilePdf className="text-red-500 text-2xl mr-3" />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quality Selector */}
            {file && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" />
                  Conversion Options
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors ${
                    isProcessing 
                      ? 'bg-blue-400 cursor-wait' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Converting...
                    </>
                  ) : (
                    <>
                      <FaFileImage /> Convert to JPG
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            {!file ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="max-w-md mx-auto">
                  <FaFilePdf className="text-gray-300 text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">No PDF Selected</h3>
                  <p className="text-gray-400 mb-6">Upload a PDF file to preview its pages</p>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Select PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-700">PDF Preview</h3>
                </div>
                
                <div className="p-4">
                  {previewPages.length > 0 ? (
                    <div className="space-y-6">
                      {previewPages.map((page, index) => (
                        <div key={index} className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                          <div className="text-center text-sm text-gray-500 mb-4">
                            Page {index + 1} (Preview)
                          </div>
                          
                          <div className="flex justify-center">
                            <div className="relative group">
                              <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                <img
                                  src={page}
                                  alt={`Page ${index + 1} preview`}
                                  className="max-h-96 object-contain"
                                />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                {file.name} - Page {index + 1}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {previewPages.length < 3 && (
                        <div className="text-center text-sm text-gray-500">
                          {previewPages.length === 1 ? '1 page' : `${previewPages.length} pages`} detected
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p>Generating preview...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Ad Unit - Responsive Leaderboard */}
        <div className="mt-8">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual AdSense publisher ID
            data-ad-slot="YOUR_BOTTOM_AD_SLOT" // Replace with your actual bottom ad unit slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </div>

      {/* Download Ready Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-pop-in">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaCheck className="text-green-500" />
                  Conversion Complete!
                </h3>
                <p className="text-gray-600 mt-1 text-sm">{downloadUrl.name}</p>
              </div>
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-center gap-3">
              <FaImages className="text-blue-500 text-2xl" />
              <p className="text-blue-700">
                {downloadUrl.isSingleFile 
                  ? 'Your PDF has been converted to a JPG image.' 
                  : 'Your PDF has been converted to multiple JPG images and bundled in a ZIP file.'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <a
                href={downloadUrl.url}
                download={downloadUrl.name}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <FaDownload /> Download {downloadUrl.isSingleFile ? 'JPG' : 'ZIP'}
              </a>
              
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setFile(null);
                  setDownloadUrl(null);
                  setPreviewPages([]);
                }}
                className="flex-1 py-3 px-4 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Convert Another
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