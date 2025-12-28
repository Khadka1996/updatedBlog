'use client'

import { useState, useRef, useEffect } from 'react';
import { FaImage, FaFilePdf, FaDownload, FaTrash, FaPlus, FaTimes, FaCheck, FaInfoCircle } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function PhotoToPdf() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [gridSize, setGridSize] = useState(1); // 1, 2, 3, or 4 images per page
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [dragging, setDragging] = useState(false);
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
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map(file => ({
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  // Remove a file
  const removeFile = (index) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Simulate conversion process
  const handleProcess = async () => {
    if (files.length === 0) {
      alert('Please add photos first!');
      return;
    }
  
    setIsProcessing(true);
    
    // Mock implementation for demo
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      const mockBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(mockBlob);
      
      setDownloadUrl({
        url,
        name: `photos-${new Date().getTime()}.pdf`
      });
      setShowDownloadModal(true);
    } catch (error) {
      alert('Conversion failed');
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
        if (files.length > 0) {
          window.adsbygoogle.push({}); // Middle ad
        }
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded, files]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
      if (downloadUrl) URL.revokeObjectURL(downloadUrl.url);
    };
  }, [files, downloadUrl]);

  // Calculate total pages
  const totalPages = Math.ceil(files.length / gridSize);

  return (
    <>
    <NavBar/>
    <div className="p-6 bg-white">
      <Head>
        <title>Photo to PDF Converter - PDF Tools</title>
        <meta name="description" content="Convert photos to PDF with customizable grid layouts" />
        
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

      <div className="mx-3 md:mx-10 lg:mx-18">
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
              <FaImage className="text-blue-500" />
              →
              <FaFilePdf className="text-red-500" />
            </span>
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700">Photo to PDF Converter</h2>
          <p className="text-gray-500 mt-2">Arrange images in a grid and export as PDF</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & Options */}
          <div className="lg:col-span-1 bg-gray-100 rounded-xl shadow-sm border border-gray-300 p-5 sticky top-4">
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
                accept="image/*" 
                onChange={handleFileChange}
                multiple
              />
              <div className="flex flex-col items-center">
                <FaPlus className={`text-2xl mb-2 ${dragging ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className={`font-medium ${dragging ? 'text-blue-600' : 'text-gray-600'}`}>
                  {dragging ? 'Drop photos here' : 'Click or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WEBP</p>
              </div>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">
                    Selected Photos ({files.length})
                  </h3>
                  <button 
                    onClick={() => {
                      files.forEach(file => URL.revokeObjectURL(file.preview));
                      setFiles([]);
                    }}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <FaTrash size={12} /> Clear All
                  </button>
                </div>
                
                <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center p-3 hover:bg-gray-50 transition-colors">
                      <img 
                        src={file.preview} 
                        alt={file.name} 
                        className="w-10 h-10 object-cover rounded mr-3"
                      />
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                      <button 
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Middle Ad Unit - Responsive Rectangle */}
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
              </div>
            )}

            {/* Grid Layout Selector */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" />
                  Layout Options
                </h3>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setGridSize(num)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition-all ${
                        gridSize === num 
                          ? 'border-blue-500 bg-blue-50 text-blue-600' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-medium">{num} per page</span>
                      <div className={`grid gap-1 mt-1 w-12 h-12 p-1 ${getGridPreviewClass(num)}`}>
                        {Array(num).fill(0).map((_, i) => (
                          <div 
                            key={i} 
                            className={`rounded-sm ${
                              gridSize === num ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700 text-center">
                    {totalPages} page{totalPages !== 1 ? 's' : ''} • {files.length} photo{files.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <button
                  onClick={handleProcess}
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaFilePdf /> Create PDF
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            {files.length === 0 ? (
              <div className="bg-gray-100 rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="max-w-md mx-auto">
                  <FaImage className="text-gray-300 text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">No Photos Added Yet</h3>
                  <p className="text-gray-400 mb-6">Upload images to preview the PDF layout</p>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Select Photos
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-700">PDF Preview</h3>
                </div>
                
                <div className="p-4">
                  <div className="space-y-6">
                    {Array(totalPages).fill(0).map((_, pageIndex) => (
                      <div key={pageIndex} className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                        <div className="text-center text-sm text-gray-500 mb-4">
                          Page {pageIndex + 1} of {totalPages}
                        </div>
                        
                        <div className={`grid gap-4 ${getGridClass(gridSize)}`}>
                          {files
                            .slice(pageIndex * gridSize, (pageIndex + 1) * gridSize)
                            .map((file, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                  <img
                                    src={file.preview}
                                    alt={`Preview ${imgIndex + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                  {file.name}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
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

      {/* Download Modal */}
      {showDownloadModal && downloadUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-pop-in">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaCheck className="text-green-500" />
                  PDF Ready!
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
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <a
                href={downloadUrl.url}
                download={downloadUrl.name}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                onClick={() => {
                  setShowDownloadModal(false);
                }}
              >
                <FaDownload /> Download PDF
              </a>
              
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  files.forEach(file => URL.revokeObjectURL(file.preview));
                  setFiles([]);
                  setDownloadUrl(null);
                }}
                className="flex-1 py-3 px-4 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Create New
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                {files.length} photo{files.length !== 1 ? 's' : ''} • {totalPages} page{totalPages !== 1 ? 's' : ''} • {gridSize} per page
              </p>
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

// Helper functions for grid layout
function getGridClass(photosPerPage) {
  switch (photosPerPage) {
    case 1: return 'grid-cols-1';
    case 2: return 'grid-cols-2';
    case 3: return 'grid-cols-3';
    case 4: return 'grid-cols-2 md:grid-cols-4';
    default: return 'grid-cols-1';
  }
}

function getGridPreviewClass(photosPerPage) {
  switch (photosPerPage) {
    case 1: return 'grid-cols-1 grid-rows-1';
    case 2: return 'grid-cols-2 grid-rows-1';
    case 3: return 'grid-cols-2 grid-rows-2 [&>*:nth-child(3)]:col-span-full';
    case 4: return 'grid-cols-2 grid-rows-2';
    default: return 'grid-cols-1 grid-rows-1';
  }
}