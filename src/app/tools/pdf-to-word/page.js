'use client'
import { useState, useRef, useEffect } from 'react';
import { FaFilePdf, FaFileWord, FaDownload, FaExchangeAlt } from 'react-icons/fa';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';
import AdSlot from '@/app/components/ads/AdSlot';
import ToolBreadcrumbs from '@/app/tools/ToolBreadcrumbs';
import { convertOnServer, swapExtension, MAX_CONVERT_BYTES } from '@/app/tools/convertFile';

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    e.target.value = '';
    if (selectedFile.size > MAX_CONVERT_BYTES) {
      setError('File is too large. Maximum size is 50MB.');
      return;
    }
    setError('');
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);

    setFile({
      file: selectedFile,
      name: selectedFile.name,
      size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(selectedFile)
    });
    setDownloadUrl('');
  };


  // Upload to the server and get the converted file back
  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setError('');
    setProgress(0);
    try {
      const blob = await convertOnServer('pdf-to-word', file.file, setProgress);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConverting(false);
    }
  };



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
    <div className="p-6 bg-gray-100">
      <Head>
        <title>PDF to Word Converter - PDF Tools</title>
        <meta name="description" content="Convert PDF files to editable Word documents with high accuracy" />
      </Head>
      
      <div className="mx-3 md:mx-10 lg:mx-18">
        {/* Top Ad Unit - Responsive Leaderboard */}
        <AdSlot placement="top" className="mb-8" />
        
        <div className="flex items-center mb-6">
          <ToolBreadcrumbs label="PDF to Word" />
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              <FaFilePdf className="text-red-500 text-3xl mr-2" />
              <FaExchangeAlt className="text-gray-400 mx-2" />
              <FaFileWord className="text-blue-500 text-3xl ml-2" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 ml-4">PDF to Word Converter</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            Convert your PDF documents to editable Word files with high accuracy. Perfect for editing or repurposing content.
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
                    setError('');
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  ×
                </button>
              </div>
              
              {/* Middle Ad Unit - Responsive Rectangle */}
              {file && (
                <AdSlot placement="middle" className="my-6" />
              )}
              
              {/* What the conversion produces */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">What you&apos;ll get</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                  <li>You get an editable .docx with text, images and tables rebuilt.</li>
                  <li>Works best with PDFs that contain real text (not scanned photos).</li>
                  <li>Very complex layouts may need small touch-ups in Word.</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Convert Button */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center" role="alert">
              {error}
            </div>
          )}
          {isConverting && (
            <div className="mb-6 max-w-md mx-auto">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#4caf4f] transition-all" style={{ width: `${progress < 100 ? progress : 100}%` }} />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                {progress < 100 ? `Uploading… ${progress}%` : 'Converting on our server — this can take up to a minute for large files…'}
              </p>
            </div>
          )}
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
                    Convert to Word
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
                download={swapExtension(file.name, 'docx')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <FaDownload className="mr-2" />
                Download Word Document
              </a>
              <div className="mt-4">
                <button
                  onClick={() => {
                    URL.revokeObjectURL(file.preview);
                    setFile(null);
                    setError('');
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
              <h3 className="font-semibold text-lg mb-2">Conversion Tips:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>For best results, use PDFs with text (not scanned documents)</li>
                <li>Complex layouts may require additional formatting in Word</li>
                <li>Password-protected PDFs cannot be converted</li>
                <li>Try the OCR tool first if your PDF is scanned</li>
              </ul>
            </div>
          )}
          
          {/* Bottom Ad Unit - Responsive Leaderboard */}
          <AdSlot placement="bottom" className="mt-8" />
        </div>
      </div>
       <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] mt-5 rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Let&apos;s discuss how we can help you achieve your digital goals and take your business to the next level.
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