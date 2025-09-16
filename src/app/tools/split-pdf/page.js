'use client'
import { useState, useRef, useEffect } from 'react';
import { FaFilePdf, FaCut, FaDownload } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function SplitPDF() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageRanges, setPageRanges] = useState(['']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [adsLoaded, setAdsLoaded] = useState(false); // Track AdSense script loading
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setError('');
      setDownloadUrl('');
      
      // Basic validation
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('File size exceeds 50MB limit');
      }

      // Read file for page count (client-side)
      const reader = new FileReader();
      const arrayBuffer = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(selectedFile);
      });

      // Simple PDF header check (doesn't load full document)
      const header = new Uint8Array(arrayBuffer.slice(0, 4));
      if (String.fromCharCode(...header) !== '%PDF') {
        throw new Error('Invalid PDF file');
      }

      // For actual page count, we'd need server-side processing
      // This is a placeholder - you might want to:
      // 1. Send to your API for page count, or
      // 2. Use PDF-lib only in development (as it's large)
      const estimatedPages = Math.max(1, Math.floor(selectedFile.size / 50000)); // Rough estimate
      
      setPageCount(estimatedPages);
      setFile({
        file: selectedFile,
        name: selectedFile.name,
        size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        preview: URL.createObjectURL(selectedFile)
      });
      
      setPageRanges(['']);
    } catch (err) {
      console.error('File error:', err);
      setError(err.message);
      setFile(null);
      setPageCount(0);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle range changes
  const handleRangeChange = (index, value) => {
    const newRanges = [...pageRanges];
    newRanges[index] = value.replace(/\s/g, ''); // Remove spaces
    setPageRanges(newRanges);
  };

  const addRange = () => setPageRanges([...pageRanges, '']);
  const removeRange = (index) => pageRanges.length > 1 && setPageRanges(pageRanges.filter((_, i) => i !== index));

  // Validate ranges format
  const validateRanges = () => {
    if (!pageRanges.some(range => range.trim())) return false;
    
    return pageRanges.every(range => {
      if (!range.trim()) return true;
      
      return range.split(',').every(part => {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          return !isNaN(start) && !isNaN(end) && 
                 start > 0 && end > 0 && 
                 start <= end && 
                 end <= pageCount;
        }
        const num = Number(part);
        return !isNaN(num) && num > 0 && num <= pageCount;
      });
    });
  };

  // Handle PDF splitting
  const handleSplit = async () => {
    if (!validateRanges()) {
      setError('Please enter valid page ranges (e.g., "1-3,5-7"). Max pages: ' + pageCount);
      return;
    }
  
    setIsProcessing(true);
    setError('');
    setDownloadUrl('');
  
    try {
      const formData = new FormData();
      formData.append('pdfFile', file.file);
      formData.append('ranges', pageRanges.filter(r => r.trim()).join(';'));
      formData.append('splitMode', 'custom');

      const response = await fetch('/api/pdf/split', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/zip' // Explicitly expect ZIP
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      // Verify response is ZIP
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/zip')) {
        throw new Error('Invalid response format from server');
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Received empty file');

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

    } catch (err) {
      console.error('Split error:', err);
      setError(err.message || 'Failed to process PDF. Please try again.');
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

  // Clean up
  useEffect(() => {
    return () => {
      if (file?.preview) URL.revokeObjectURL(file.preview);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [file, downloadUrl]);

  return (
    <>
      <NavBar/>
      <div className="p-6 bg-gray-100">
        <Head>
          <title>Split PDF - PDF Tools</title>
          <meta name="description" content="Extract pages from PDF documents" />
          {/* Google AdSense Script */}
        </Head>
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
              <FaCut className="text-green-500 text-3xl mr-3" />
              <h1 className="text-2xl font-bold">Split PDF</h1>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                {error}
              </div>
            )}

            {!file ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors mb-6"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                />
                <p className="text-gray-600 mb-1">
                  <span className="text-blue-500 font-medium">Click to upload</span> a PDF file
                </p>
                <p className="text-sm text-gray-400">Max 50MB • PDF only</p>
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-4">
                  <FaFilePdf className="text-red-500 mr-3" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.size} • {pageCount} pages</p>
                  </div>
                  <button 
                    onClick={() => {
                      setFile(null);
                      setPageCount(0);
                      setPageRanges(['']);
                      setError('');
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Pages to extract:</h3>
                  {pageRanges.map((range, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={range}
                        onChange={(e) => handleRangeChange(index, e.target.value)}
                        placeholder="e.g., 1-3,5-7"
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                      {pageRanges.length > 1 && (
                        <button
                          onClick={() => removeRange(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                          aria-label="Remove range"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addRange}
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    + Add another range
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
              </div>
            )}

            {file && (
              <div className="flex justify-center">
                <button
                  onClick={handleSplit}
                  disabled={isProcessing || !validateRanges()}
                  className={`px-5 py-2 rounded-md font-medium text-white flex items-center gap-2 ${
                    isProcessing || !validateRanges() 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600'
                  } transition-colors`}
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCut size={14} />
                      Split PDF
                    </>
                  )}
                </button>
              </div>
            )}

            {downloadUrl && (
              <div className="mt-6 text-center">
                <a 
                  href={downloadUrl} 
                  download={`split_${file?.name.replace('.pdf', '') || 'document'}.zip`}
                  className="px-5 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                >
                  <FaDownload size={14} />
                  Download Results
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