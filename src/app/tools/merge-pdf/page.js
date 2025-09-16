'use client'
import { useState, useRef, useEffect } from 'react';
import { MdMergeType, MdDelete, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
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
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Reset previous state
    setError('');
    setDownloadUrl('');
    
    // Validate files
    const invalidFiles = selectedFiles.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      setError('Please upload only PDF files');
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

  // Real merge process with backend API
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
        if (xhr.status === 200) {
          const blob = xhr.response;
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
          setError('');
        } else {
          try {
            const reader = new FileReader();
            reader.onload = () => {
              const errorResponse = JSON.parse(reader.result);
              setError(errorResponse.message || 'Merge failed');
            };
            reader.readAsText(xhr.response);
          } catch {
            setError('Merge failed. Please try again.');
          }
        }
        setIsMerging(false);
        setUploadProgress(0);
      };

      xhr.onerror = () => {
        setError('Network error. Please check your connection.');
        setIsMerging(false);
        setUploadProgress(0);
      };

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
        // Push top ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        // Push bottom ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        // Push middle ad if files are present
        if (files.length > 0) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
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
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [files, downloadUrl]);

  return (
    <>
      <Head>
        <title>Merge PDF - PDF Tools</title>
        <meta name="description" content="Combine multiple PDFs into one file in seconds" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {/* Google AdSense Script */}
      <Script 
        id="adsbygoogle-init"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX`}
        // Replace 'ca-pub-XXXXXXXXXXXXXXXX' with your actual AdSense publisher ID from your AdSense account
        crossOrigin="anonymous"
        onLoad={() => setAdsLoaded(true)} // Set adsLoaded to true when script loads
        onError={(e) => console.error('AdSense script failed to load', e)}
      />
      
      <NavBar />
      <div className="p-6 bg-gray-100">
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
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <MdMergeType className="text-[#4caf4f] text-4xl mr-4" />
              <h1 className="text-3xl font-bold text-gray-900">Merge PDF</h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Combine multiple PDFs into one file in seconds. Drag and drop your PDFs to reorder them as needed.
            </p>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p>{error}</p>
              </div>
            )}
            
            {/* File Upload Area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-8 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".pdf" 
                multiple 
                onChange={handleFileChange}
              />
              <p className="text-gray-500 mb-2">
                <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-400">PDF files only (max 50MB each)</p>
            </div>
            
            {/* File List */}
            {files.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Your PDFs ({files.length})</h3>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-50 flex items-center justify-center rounded mr-3">
                        <MdMergeType className="text-red-500" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.size}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                          title="Move up"
                        >
                          <MdArrowUpward />
                        </button>
                        <button 
                          onClick={() => moveDown(index)}
                          disabled={index === files.length - 1}
                          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                          title="Move down"
                        >
                          <MdArrowDownward />
                        </button>
                        <button 
                          onClick={() => removeFile(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                          title="Remove"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Middle Ad Unit - Responsive Rectangle */}
            {files.length > 0 && (
              <div className="my-8">
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
            
            {/* Upload progress */}
            {isMerging && uploadProgress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading: {uploadProgress}%</span>
                  <span>Processing...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Merge Button */}
            <div className="flex justify-center">
              <button
                onClick={handleMerge}
                disabled={files.length < 2 || isMerging}
                className={`px-6 py-3 rounded-lg font-medium text-white ${files.length < 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4caf4f] hover:bg-[#3e8e40]'} transition-colors flex items-center`}
              >
                {isMerging ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Merging...
                  </>
                ) : (
                  `Merge ${files.length} PDF${files.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
            
            {/* Download Link */}
            {downloadUrl && (
              <div className="mt-6 text-center">
                <a 
                  href={downloadUrl} 
                  download={`merged_${files[0]?.name || 'document'}.pdf`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
                >
                  Download Merged PDF
                </a>
                <p className="text-sm text-gray-500 mt-2">Your file is ready!</p>
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
      <Footer />
    </>
  );
}