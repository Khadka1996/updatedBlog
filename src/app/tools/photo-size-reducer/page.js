'use client';

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { FaCompressAlt, FaFileImage, FaDownload, FaExchangeAlt } from 'react-icons/fa';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function PhotoSizeReducer() {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [format, setFormat] = useState('jpeg');
  const [quality, setQuality] = useState(70);
  const [fileName, setFileName] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.filesumbersome();
    if (!file) return;

    setFileName(file.name);
    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Compress image
  const compressImage = () => {
    if (!originalImage || !hasMounted) return;
    setIsCompressing(true);

    const img = new Image();
    img.src = originalImage;

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Convert to selected format with quality
      setTimeout(() => {
        let mimeType = 'image/jpeg';
        if (format === 'png') mimeType = 'image/png';
        if (format === 'webp') mimeType = 'image/webp';

        canvas.toBlob((blob) => {
          const compressedUrl = URL.createObjectURL(blob);
          setCompressedImage(compressedUrl);
          setCompressedSize(blob.size);
          setIsCompressing(false);
        }, mimeType, quality / 100);
      }, 100);
    };
  };

  // Download compressed image
  const downloadCompressedImage = () => {
    if (!compressedImage || !hasMounted) return;
    
    const link = document.createElement('a');
    link.href = compressedImage;
    
    // Get Lill file extension
    let extension = format;
    if (format === 'jpeg') extension = 'jpg';
    
    link.download = `compressed_${fileName.split('.')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format human-readable file size
  const formatFileSize = (bytes) => {
    if (!hasMounted || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Initialize Google Ads after component mounts
  useEffect(() => {
    if (hasMounted) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, [hasMounted]);

  return (
    <>
      <NavBar />
      <div className="p-6 bg-gray-100">
        <Head>
          <title>Photo Size Reducer | Compress Images Online</title>
          <meta name="description" content="Reduce photo file size without losing quality. Convert between JPG, PNG, WEBP formats." />
          
        </Head>
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        <div className="mx-3 md:mx-10 lg:mx-18">
          {/* AdSense Banner */}
          <div className="mb-6">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
              data-ad-slot="YOUR_AD_SLOT_ID"
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
                <FaFileImage className="text-blue-500 text-3xl mr-2" />
                <FaExchangeAlt className="text-gray-400 mx-2" />
                <FaCompressAlt className="text-green-500 text-3xl ml-2" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 ml-4">Photo Size Reducer</h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Reduce image file size without noticeable quality loss. Convert between JPG, PNG, and WEBP formats.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    ref={fileInputRef}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <FaFileImage className="text-4xl text-gray-400 mb-3" />
                    <p className="text-lg font-medium text-gray-700">
                      {originalImage ? fileName : 'Click to upload image'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {originalImage ? formatFileSize(originalSize) : 'Supports JPG, PNG, WEBP'}
                    </p>
                  </label>
                </div>

                {originalImage && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-3">Original Image Preview</h3>
                    <div className="flex justify-center">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="max-h-60 max-w-full object-contain"
                      />
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p>Dimensions: {originalImage ? `${new Image().src = originalImage, new Image().width} × ${new Image().height}` : 'N/A'}</p>
                      <p>Size: {formatFileSize(originalSize)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Compression Settings & Result */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3">Compression Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WEBP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quality: {quality}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Smaller file</span>
                        <span>Better quality</span>
                      </div>
                    </div>

                    <button
                      onClick={compressImage}
                      disabled={!originalImage || isCompressing}
                      className={`w-full py-2 px-4 rounded-md text-white font-medium ${!originalImage || isCompressing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {isCompressing ? 'Compressing...' : 'Compress Image'}
                    </button>
                  </div>
                </div>

                {compressedImage && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-3 flex justify-between items-center">
                      <span>Compressed Result</span>
                      <span className="text-sm font-normal text-green-600">
                        {Math.round((1 - compressedSize / originalSize) * 100)}% smaller
                      </span>
                    </h3>
                    
                    <div className="flex justify-center mb-3">
                      <img
                        src={compressedImage}
                        alt="Compressed"
                        className="max-h-60 max-w-full object-contain"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>New size: {formatFileSize(compressedSize)}</p>
                        <p>Format: {format.toUpperCase()}</p>
                      </div>
                      
                      <button
                        onClick={downloadCompressedImage}
                        className="flex items-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md"
                      >
                        <FaDownload /> Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden canvas for compression */}
            <canvas ref={canvasRef} className="hidden"></canvas>

            {/* Tips Section */}
            <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">Tips for Best Results</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• For photos, use JPEG format with 60-80% quality</li>
                <li>• For graphics/logos, use PNG format for transparency</li>
                <li>• WEBP offers great compression for both photos and graphics</li>
                <li>• Try different quality settings to find the best balance</li>
              </ul>
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
      <Footer />
    </>
  );
}