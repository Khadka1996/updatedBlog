'use client'
import { useState, useRef, useEffect } from 'react';
import { FaFilePdf, FaCompressAlt, FaDownload, FaTimes } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function CompressPDF() {
  const [file, setFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [isCompressing, setIsCompressing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const fileInputRef = useRef(null);

  // Compression level options
  const compressionLevels = [
    { value: 'low', label: 'Low Compression', description: 'Better quality, larger file size' },
    { value: 'medium', label: 'Medium Compression', description: 'Good balance of quality and size' },
    { value: 'high', label: 'High Compression', description: 'Smaller file size, reduced quality' }
  ];

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Reset previous state
    setError('');
    setDownloadUrl('');
    
    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file');
      return;
    }

    const sizeInMB = selectedFile.size / (1024 * 1024);
    setOriginalSize(sizeInMB);
    setCompressedSize(sizeInMB * 0.7); // Initial estimate
    
    setFile({
      file: selectedFile,
      name: selectedFile.name,
      size: sizeInMB.toFixed(2) + ' MB',
      preview: URL.createObjectURL(selectedFile)
    });
  };

  // Handle compression level change
  const handleLevelChange = (level) => {
    setCompressionLevel(level);
  };

  // Real compression process with backend API
  const handleCompress = async () => {
    if (!file) return;
    
    setIsCompressing(true);
    setError('');
    setDownloadUrl('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('pdfFile', file.file);
      formData.append('compressionLevel', compressionLevel);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/pdf/compress', true);

      // Progress tracking
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.responseType = 'blob';
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const url = URL.createObjectURL(blob);
          const compressedSizeMB = blob.size / (1024 * 1024);
          
          setDownloadUrl(url);
          setCompressedSize(compressedSizeMB);
          setError('');
        } else {
          setError('Compression failed. Please try again.');
        }
        setIsCompressing(false);
        setUploadProgress(0);
      };

      xhr.onerror = () => {
        setError('Network error. Please check your connection.');
        setIsCompressing(false);
        setUploadProgress(0);
      };

      xhr.send(formData);

    } catch (err) {
      console.error('Compression error:', err);
      setError('An unexpected error occurred');
      setIsCompressing(false);
      setUploadProgress(0);
    }
  };

  // Initialize all ad units
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        // Push top ad
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        // Push bottom ad
        window.adsbygoogle.push({});
        // Push middle ad if file is uploaded
        if (file) {
          window.adsbygoogle.push({});
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
    };
  }, [file, downloadUrl]);

  return (
    <>
    <NavBar/>
    <div className="p-6 bg-gray-100 ">
      <Head>
        <title>Compress PDF - PDF Tools</title>
        <meta name="description" content="Reduce PDF file size while preserving quality" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        <div className="flex items-center mb-6">
          <a href="/tools" className="text-blue-600 hover:underline">← Back to all tools</a>
        </div>
        
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
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <FaCompressAlt className="text-[#4caf4f] text-4xl mr-4" />
            <h1 className="text-3xl font-bold text-gray-900">Compress PDF</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            Reduce PDF file size while optimizing for maximum PDF quality. Select your compression level below.
          </p>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}
          
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
              <p className="text-sm text-gray-400">PDF files only (max 100MB)</p>
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
                    setOriginalSize(0);
                    setCompressedSize(0);
                    setDownloadUrl('');
                    setError('');
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  <FaTimes />
                </button>
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
              
              {/* Compression Level Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Compression Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {compressionLevels.map((level) => (
                    <div 
                      key={level.value}
                      onClick={() => handleLevelChange(level.value)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${compressionLevel === level.value ? 'border-[#4caf4f] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-5 h-5 rounded-full border mr-2 flex items-center justify-center ${compressionLevel === level.value ? 'border-[#4caf4f] bg-[#4caf4f]' : 'border-gray-300'}`}>
                          {compressionLevel === level.value && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium">{level.label}</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-7">{level.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Size Comparison */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Original Size:</span>
                  <span>{originalSize.toFixed(2)} MB</span>
                </div>
                {downloadUrl && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Compressed Size:</span>
                      <span className="text-[#4caf4f] font-semibold">{compressedSize.toFixed(2)} MB</span>
                    </div>
                    <div className="mt-3 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-[#4caf4f] h-2.5 rounded-full" 
                        style={{ width: `${(compressedSize / originalSize) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-right">
                      {((1 - (compressedSize / originalSize)) * 100).toFixed(0)}% reduction
                    </p>
                  </>
                )}
              </div>
              
              {/* Upload progress */}
              {isCompressing && uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading: {uploadProgress}%</span>
                    <span>Compressing...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Compress Button */}
          {file && !downloadUrl && (
            <div className="flex justify-center">
              <button
                onClick={handleCompress}
                disabled={isCompressing}
                className={`px-6 py-3 rounded-lg font-medium text-white bg-[#4caf4f] hover:bg-[#3e8e40] transition-colors flex items-center ${isCompressing ? 'opacity-75' : ''}`}
              >
                {isCompressing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Compressing...
                  </>
                ) : (
                  <>
                    <FaCompressAlt className="mr-2" />
                    Compress PDF
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Download Link */}
          {downloadUrl && (
            <div className="mt-6 text-center">
              <a 
                href={downloadUrl} 
                download={`compressed_${file.name}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <FaDownload className="mr-2" />
                Download Compressed PDF
              </a>
              <div className="text-sm text-gray-500 mt-2">
                <p>Your file is ready! Reduced from {originalSize.toFixed(2)} MB to {compressedSize.toFixed(2)} MB</p>
                <p className="text-[#4caf4f] font-medium">
                  {((1 - (compressedSize / originalSize)) * 100).toFixed(0)}% smaller
                </p>
              </div>
            </div>
          )}
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
       
    </div>
    
    <Footer/>
    </>
  );
}