'use client'

import { useState, useRef, useEffect } from 'react';
import { FaFilePowerpoint, FaFilePdf, FaDownload, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function PowerpointToPdf() {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [adsLoaded, setAdsLoaded] = useState(false); // Track AdSense script loading
  const [conversionOptions, setConversionOptions] = useState({
    slideLayout: 'one-slide-per-page',
    includeNotes: false,
    includeHiddenSlides: false,
    quality: 'high'
  });
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile({
      file: selectedFile,
      name: selectedFile.name,
      size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(selectedFile)
    });
    setDownloadUrl('');
  };

  // Handle option changes
  const handleOptionChange = (option, value) => {
    setConversionOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Simulate conversion process
  const handleConvert = async () => {
    if (!file) {
      alert('Please select a PowerPoint file first');
      return;
    }

    setIsConverting(true);
    
    // Simulate API call delay based on file size
    const fileSizeMB = parseFloat(file.size);
    const delay = fileSizeMB > 10 ? 3500 : fileSizeMB > 5 ? 2500 : 1500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Mock implementation for demo:
    const mockBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(mockBlob);
    setDownloadUrl(url);
    setIsConverting(false);
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
    };
  }, [file, downloadUrl]);

  return (
    <>
    <NavBar/>
   
    <div className="p-6 bg-gray-100 ">
      <Head>
        <title>PowerPoint to PDF Converter - PDF Tools</title>
        <meta name="description" content="Convert PowerPoint presentations to high-quality PDF files" />
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
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              <FaFilePowerpoint className="text-orange-500 text-3xl mr-2" />
              <FaExchangeAlt className="text-gray-400 mx-2" />
              <FaFilePdf className="text-red-500 text-3xl ml-2" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 ml-4">PowerPoint to PDF</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            Convert your PowerPoint presentations to PDF files while preserving animations, transitions, and layouts.
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
                accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" 
                onChange={handleFileChange}
              />
              <p className="text-gray-500 mb-2">
                <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-400">PPT or PPTX files (max 50MB)</p>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-50 flex items-center justify-center rounded mr-3">
                  <FaFilePowerpoint className="text-orange-500" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.size}</p>
                </div>
                <button 
                  onClick={() => {
                    URL.revokeObjectURL(file.preview);
                    setFile(null);
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
                    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual AdSense publisher ID
                    data-ad-slot="YOUR_MIDDLE_AD_SLOT" // Replace with your actual middle ad unit slot ID
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                  ></ins>
                </div>
              )}
              
              {/* Conversion Options */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Conversion Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-medium">Slide Layout</label>
                    <select
                      value={conversionOptions.slideLayout}
                      onChange={(e) => handleOptionChange('slideLayout', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="one-slide-per-page">One slide per page</option>
                      <option value="two-slides-per-page">Two slides per page</option>
                      <option value="three-slides-per-page">Three slides per page</option>
                      <option value="six-slides-per-page">Six slides per page (handout)</option>
                      <option value="notes-pages">Include notes pages</option>
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={conversionOptions.includeNotes}
                        onChange={(e) => handleOptionChange('includeNotes', e.target.checked)}
                        className="mr-2"
                      />
                      <span>Include speaker notes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={conversionOptions.includeHiddenSlides}
                        onChange={(e) => handleOptionChange('includeHiddenSlides', e.target.checked)}
                        className="mr-2"
                      />
                      <span>Include hidden slides</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Output Quality</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={conversionOptions.quality === 'high'}
                          onChange={() => handleOptionChange('quality', 'high')}
                          className="mr-2"
                        />
                        <span>High</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={conversionOptions.quality === 'medium'}
                          onChange={() => handleOptionChange('quality', 'medium')}
                          className="mr-2"
                        />
                        <span>Medium</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={conversionOptions.quality === 'low'}
                          onChange={() => handleOptionChange('quality', 'low')}
                          className="mr-2"
                        />
                        <span>Low</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Convert Button */}
          {file && !downloadUrl && (
            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className={`px-6 py-3 rounded-lg font-medium text-white bg-[#4caf4f] hover:bg-[#3e8e40] transition-colors flex items-center`}
              >
                {isConverting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Converting...
                  </>
                ) : (
                  <>
                    <FaExchangeAlt className="mr-2" />
                    Convert to PDF
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
                download={`${file.name.replace(/\.pptx?$/, '')}.pdf`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <FaDownload className="mr-2" />
                Download PDF
              </a>
              <div className="mt-4">
                <button
                  onClick={() => {
                    URL.revokeObjectURL(file.preview);
                    setFile(null);
                    setDownloadUrl('');
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Convert another file
                </button>
              </div>
            </div>
          )}
          
          {/* Conversion Tips */}
          {!file && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-500" />
                Presentation Conversion Tips:
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Supports PPT and PPTX file formats</li>
                <li>Preserves slide layouts, fonts, and colors</li>
                <li>Converts animations to static images</li>
                <li>Maintains hyperlinks and embedded media</li>
                <li>Output PDFs are print-ready and shareable</li>
              </ul>
            </div>
          )}
          
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