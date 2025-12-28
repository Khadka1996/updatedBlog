'use client'
import { useState, useRef, useEffect } from 'react';
import { MdMergeType, MdDelete, MdArrowUpward, MdArrowDownward, MdCloudUpload, MdClose } from 'react-icons/md';
import Head from 'next/head';
import Script from 'next/script';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function MergePDF() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Initialize as false
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  // Process selected files
  const processFiles = (selectedFiles) => {
    // Reset previous state
    setError('');
    setDownloadUrl('');
    
    // Validate files
    const invalidFiles = selectedFiles.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      setError('Please upload only PDF files');
      return;
    }

    // Check total size (max 200MB)
    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 200 * 1024 * 1024) {
      setError('Total file size should not exceed 200MB');
      return;
    }

    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    }));
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  // Remove a file
  const removeFile = (index) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setError('');
  };

  // Move file up in order
  const moveUp = (index) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
    setFiles(newFiles);
  };

  // Move file down in order
  const moveDown = (index) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setFiles(newFiles);
  };

  // Clear all files
  const clearAllFiles = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setError('');
    setDownloadUrl('');
  };

  // Fixed merge process with better error handling
  const handleMerge = async () => {
    if (files.length < 2) return;
    
    setIsMerging(true);
    setError('');
    setDownloadUrl('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('pdfFiles', file.file);
      });

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/pdf/merge', true);

      // Progress tracking
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.responseType = 'blob';
      
      xhr.onload = () => {
        setIsMerging(false);
        setUploadProgress(0);
        
        // Check content type to determine if it's an error
        const contentType = xhr.getResponseHeader('content-type');
        
        if (xhr.status === 200 && contentType && contentType.includes('application/pdf')) {
          // Success - it's a PDF
          const blob = xhr.response;
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
          setError('');
        } else {
          // Error - try to parse as JSON
          const reader = new FileReader();
          reader.onload = () => {
            try {
              // Try to parse as JSON first
              const text = reader.result;
              // Check if it looks like JSON (starts with { or [)
              if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                const errorResponse = JSON.parse(text);
                setError(errorResponse.message || 'Merge failed. Please try again.');
              } else {
                // Not JSON, check if it's HTML
                if (text.includes('<html') || text.includes('<!DOCTYPE')) {
                  setError('Server error. Please try again later.');
                } else {
                  setError(text || 'Merge failed. Please try again.');
                }
              }
            } catch (parseError) {
              // If parsing fails, show generic error
              setError('Merge failed. Please check your files and try again.');
            }
          };
          reader.onerror = () => {
            setError('Failed to read error response.');
          };
          reader.readAsText(xhr.response);
        }
      };

      xhr.onerror = () => {
        setIsMerging(false);
        setUploadProgress(0);
        setError('Network error. Please check your connection.');
      };

      xhr.ontimeout = () => {
        setIsMerging(false);
        setUploadProgress(0);
        setError('Request timeout. Please try again.');
      };

      // Set timeout for the request
      xhr.timeout = 300000; // 5 minutes
      xhr.send(formData);

    } catch (err) {
      console.error('Merge error:', err);
      setError('An unexpected error occurred');
      setIsMerging(false);
      setUploadProgress(0);
    }
  };

  // Initialize all ad units when adsbygoogle is available
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        // Push ads only if they haven't been loaded yet
        setTimeout(() => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }, 100);
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded]);

  // Check for mobile on client side only
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check immediately
    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [files, downloadUrl]);

  return (
    <>
      <Head>
        <title>Merge PDF - Free PDF Tools</title>
        <meta name="description" content="Combine multiple PDFs into one file in seconds. Free online PDF merger tool." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#4caf4f" />
      </Head>
      
      {/* Google AdSense Script */}
      <Script 
        id="adsbygoogle-init"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX`}
        crossOrigin="anonymous"
        onLoad={() => setAdsLoaded(true)}
        onError={(e) => console.error('AdSense script failed to load', e)}
      />
      
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-3 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-4 md:mb-6">
            <a href="/tools" className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline text-sm md:text-base">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all tools
            </a>
          </div>
          
          {/* Top Ad Unit - Mobile responsive */}
          <div className="mb-6">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', textAlign: 'center', minHeight: '90px' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="YOUR_TOP_AD_SLOT"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
          
          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center">
                  <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                    <MdMergeType className="text-[#4caf4f] text-3xl md:text-4xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Merge PDF</h1>
                    <p className="text-gray-600 mt-1">Combine multiple PDF files into one document</p>
                  </div>
                </div>
                <div className="md:ml-auto bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-[#4caf4f]">{files.length}</div>
                  <div className="text-sm text-gray-500">PDF{files.length !== 1 ? 's' : ''} selected</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 md:p-8">
              {/* Error message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button 
                      onClick={() => setError('')}
                      className="ml-auto text-red-500 hover:text-red-700"
                      aria-label="Dismiss error"
                    >
                      <MdClose size={20} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* File Upload Area */}
              <div 
                ref={dropRef}
                className={`border-3 border-dashed rounded-2xl p-6 text-center mb-8 transition-all duration-300 cursor-pointer ${
                  isDragging 
                    ? 'border-[#4caf4f] bg-green-50' 
                    : 'border-gray-300 hover:border-[#4caf4f] hover:bg-gray-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                aria-label="Upload PDF files area. Click or drag and drop PDF files here."
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf,application/pdf" 
                  multiple 
                  onChange={handleFileChange}
                  aria-label="Select PDF files to merge"
                />
                <div className="max-w-md mx-auto">
                  <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MdCloudUpload className="text-blue-500 text-3xl" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isDragging ? 'Drop PDF files here' : 'Upload PDF files'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    <span className="text-blue-600 font-medium">Click to browse</span> or drag and drop
                  </p>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>• PDF files only (max 50MB each)</p>
                    <p>• Select 2 or more files to merge</p>
                  </div>
                </div>
              </div>
              
              {/* File List */}
              {files.length > 0 && (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Your PDFs</h3>
                      <button
                        onClick={clearAllFiles}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center"
                        aria-label="Clear all files"
                      >
                        <MdClose size={16} className="mr-1" aria-hidden="true" />
                        Clear all
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {files.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                          role="listitem"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-red-50 flex items-center justify-center rounded-lg mr-4">
                            <MdMergeType className="text-red-500 text-xl" aria-hidden="true" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <span>{file.size}</span>
                              <span className="mx-2" aria-hidden="true">•</span>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                Page {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!isMobile && (
                              <>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveUp(index);
                                  }}
                                  disabled={index === 0}
                                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Move up"
                                  aria-label={`Move ${file.name} up in order`}
                                >
                                  <MdArrowUpward size={18} aria-hidden="true" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveDown(index);
                                  }}
                                  disabled={index === files.length - 1}
                                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Move down"
                                  aria-label={`Move ${file.name} down in order`}
                                >
                                  <MdArrowDownward size={18} aria-hidden="true" />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove"
                              aria-label={`Remove ${file.name}`}
                            >
                              <MdDelete size={18} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Mobile-specific reorder button */}
                    {isMobile && files.length > 1 && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            // Simple reorder for mobile - move first item to last
                            const newFiles = [...files];
                            const first = newFiles.shift();
                            if (first) newFiles.push(first);
                            setFiles(newFiles);
                          }}
                          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center"
                          aria-label="Reorder files"
                        >
                          <MdArrowUpward className="mr-2" />
                          Reorder
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center"
                          aria-label="Add more PDF files"
                        >
                          <MdCloudUpload className="mr-2" />
                          Add More
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Middle Ad Unit - Mobile responsive */}
                  <div className="my-6">
                    <ins
                      className="adsbygoogle"
                      style={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
                      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                      data-ad-slot="YOUR_MIDDLE_AD_SLOT"
                      data-ad-format="auto"
                      data-full-width-responsive="true"
                    ></ins>
                  </div>
                </>
              )}
              
              {/* Upload progress */}
              {isMerging && uploadProgress > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading files...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                      role="progressbar"
                      aria-valuenow={uploadProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Please keep this page open until the merge is complete
                  </p>
                </div>
              )}
              
              {/* Merge Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isMerging}
                  className={`px-8 py-4 rounded-xl font-medium text-white text-lg transition-all duration-300 w-full sm:w-auto min-h-[56px] flex items-center justify-center ${
                    files.length < 2 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#4caf4f] to-[#52aa4d] hover:from-[#3e8e40] hover:to-[#3e8e40] shadow-lg hover:shadow-xl active:scale-[0.98]'
                  } ${isMerging ? 'opacity-90' : ''}`}
                  aria-label={`Merge ${files.length} PDF files`}
                  aria-busy={isMerging}
                >
                  {isMerging ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Merging {files.length} PDF{files.length !== 1 ? 's' : ''}...
                    </>
                  ) : (
                    `Merge ${files.length} PDF${files.length !== 1 ? 's' : ''}`
                  )}
                </button>
                
                {files.length > 0 && !isMerging && !isMobile && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-4 rounded-xl font-medium text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors w-full sm:w-auto min-h-[56px] flex items-center justify-center"
                    aria-label="Add more PDF files"
                  >
                    Add More PDFs
                  </button>
                )}
              </div>
              
              {/* Download Link */}
              {downloadUrl && (
                <div className="mt-8 text-center animate-fadeIn">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Merge Complete!</h3>
                    <p className="text-gray-600 mb-4">Your PDF file is ready to download</p>
                    <a 
                      href={downloadUrl} 
                      download={`merged_${new Date().getTime()}.pdf`}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                      aria-label="Download merged PDF file"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Download Merged PDF
                    </a>
                    <button
                      onClick={clearAllFiles}
                      className="block mx-auto mt-4 text-sm text-gray-500 hover:text-gray-700"
                      aria-label="Start new PDF merge"
                    >
                      Start new merge
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Ad Unit */}
          <div className="mt-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', textAlign: 'center', minHeight: '90px' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="YOUR_BOTTOM_AD_SLOT"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
          
          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] mt-8 rounded-2xl p-6 md:p-8 text-center text-white overflow-hidden">
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">Ready to Grow Your Business?</h2>
              <p className="mb-6 max-w-2xl mx-auto relative z-10 text-white/90">
                Let&apos;s discuss how we can help you achieve your digital goals and take your business to the next level.
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-white text-[#25609A] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}