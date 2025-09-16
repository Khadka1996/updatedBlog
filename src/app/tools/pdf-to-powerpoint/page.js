'use client'
import { useState, useRef, useEffect } from 'react';
import { FaFilePdf, FaFilePowerpoint, FaDownload, FaExchangeAlt, FaImage, FaObjectGroup } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';

export default function PdfToPowerpoint() {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [conversionOptions, setConversionOptions] = useState({
    format: 'pptx',
    slidePerPage: true,
    includeImages: true,
    preserveLayout: true
  });
  const [adsLoaded, setAdsLoaded] = useState(false); // Track AdSense script loading
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
      alert('Please select a PDF file first');
      return;
    }

    setIsConverting(true);
    
    // Simulate API call delay based on file size
    const fileSizeMB = parseFloat(file.size);
    const delay = fileSizeMB > 10 ? 3500 : fileSizeMB > 5 ? 2500 : 1500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Mock implementation for demo:
    const mockBlob = new Blob(['Mock PowerPoint content'], { 
      type: conversionOptions.format === 'pptx' 
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
        : 'application/vnd.ms-powerpoint' 
    });
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
        <title>PDF to PowerPoint Converter - PDF Tools</title>
        <meta name="description" content="Convert PDF files to editable PowerPoint presentations" />
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
              <FaFilePdf className="text-red-500 text-3xl mr-2" />
              <FaExchangeAlt className="text-gray-400 mx-2" />
              <FaFilePowerpoint className="text-orange-500 text-3xl ml-2" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 ml-4">PDF to PowerPoint</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            Transform your PDF documents into editable PowerPoint slides. Perfect for presentations and reports.
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
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded mr-3">
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
                    <h4 className="font-medium mb-2 flex items-center">
                      <FaFilePowerpoint className="mr-2 text-orange-500" />
                      Output Format
                    </h4>
                    <label className="flex items-center mb-4">
                      <input
                        type="radio"
                        checked={conversionOptions.format === 'pptx'}
                        onChange={() => handleOptionChange('format', 'pptx')}
                        className="mr-2"
                      />
                      <span>PPTX (PowerPoint 2007+)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={conversionOptions.format === 'ppt'}
                        onChange={() => handleOptionChange('format', 'ppt')}
                        className="mr-2"
                      />
                      <span>PPT (Older PowerPoint format)</span>
                    </label>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <FaObjectGroup className="mr-2 text-blue-500" />
                      Layout Options
                    </h4>
                    <label className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        checked={conversionOptions.slidePerPage}
                        onChange={(e) => handleOptionChange('slidePerPage', e.target.checked)}
                        className="mr-2"
                      />
                      <span>Create separate slide for each page</span>
                    </label>
                    <label className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        checked={conversionOptions.preserveLayout}
                        onChange={(e) => handleOptionChange('preserveLayout', e.target.checked)}
                        className="mr-2"
                      />
                      <span>Preserve original layout</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={conversionOptions.includeImages}
                        onChange={(e) => handleOptionChange('includeImages', e.target.checked)}
                        className="mr-2"
                      />
                      <span>Include images</span>
                    </label>
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
                    Convert to PowerPoint
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
                download={`${file.name.replace('.pdf', '')}.${conversionOptions.format}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <FaDownload className="mr-2" />
                Download PowerPoint File
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
                <FaImage className="mr-2 text-orange-500" />
                Presentation Conversion Tips:
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>For best results, use PDFs created from presentation software</li>
                <li>Each PDF page will become a separate slide by default</li>
                <li>Complex layouts may need adjustment in PowerPoint</li>
                <li>Use our OCR tool first if your PDF contains scanned content</li>
                <li>Charts and vector graphics convert best to editable elements</li>
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