'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Head from 'next/head';
import Script from 'next/script';
import { FaInfoCircle, FaUpload, FaDownload, FaMobile, FaDesktop, FaFilePowerpoint, FaFilePdf, FaExchangeAlt } from 'react-icons/fa';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function HighQualityCropper() {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [aspect, setAspect] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Check for mobile devices and initialize ads (client-side only)
  useEffect(() => {
    setHasMounted(true);
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    // Initialize Google Ads
    if (window.adsbygoogle && hasMounted) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }

    return () => window.removeEventListener('resize', checkIsMobile);
  }, [hasMounted]);

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e) {
    if (!hasMounted) return;
    
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: 'px',
          width: Math.min(width, height) * 0.8,
        },
        aspect || width / height,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  }

  // High-quality crop rendering
  useEffect(() => {
    if (!hasMounted || !completedCrop || !imgRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const image = imgRef.current;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
  }, [completedCrop, hasMounted]);

  // Premium quality download
  async function handleDownload() {
    if (!previewCanvasRef.current) return;

    try {
      const canvas = previewCanvasRef.current;
      const blob = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/png', 1)
      );
      
      if (!blob) throw new Error('Failed to create image blob');
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'high-quality-crop.png';
      link.href = url;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image. Please try again.');
    }
  }

  return (
    <>
      <NavBar />
      <div className="p-6 bg-gray-100 ">
        <Head>
          <title>Crop your photo</title>
          <meta name="description" content="Crop your images to the perfect size and aspect ratio with high quality." />
          
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
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 ml-4">Crop your photo</h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Upload your image and crop it to the perfect size and aspect ratio
            </p>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Upload and Crop Section */}
              <div className="flex-1">
                {/* Upload Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                  <label className="block mb-4">
                    <span className="text-lg font-semibold text-gray-700 flex items-center">
                      <FaUpload className="mr-2 text-[#4DB154]" />
                      Upload Image
                    </span>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-[#4DB154]/30 rounded-lg p-8 hover:bg-[#4DB154]/5 transition-colors"
                      >
                        <div className="bg-[#4DB154]/10 p-3 rounded-full mb-3">
                          <FaUpload className="text-[#4DB154] text-xl" />
                        </div>
                        <span className="text-[#4DB154] font-medium">Click to browse files</span>
                        <span className="text-gray-500 text-sm mt-1">or drag and drop</span>
                        <span className="text-gray-400 text-xs mt-2">Supports JPG, PNG, WEBP</span>
                      </label>
                    </div>
                  </label>

                  {/* Aspect Ratio Selector */}
                  <div className="mt-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { value: 0, label: 'Free', icon: '⎌' },
                        { value: 1, label: '1:1', icon: '□' },
                        { value: 16/9, label: '16:9', icon: '▭' },
                        { value: 4/3, label: '4:3', icon: '▯' },
                        { value: 9/16, label: '9:16', icon: '▮' }
                      ].map((ratio) => (
                        <button
                          key={ratio.value}
                          onClick={() => {
                            setAspect(ratio.value);
                            if (imgRef.current && imgSrc) {
                              const { naturalWidth: width, naturalHeight: height } = imgRef.current;
                              const newCrop = centerCrop(
                                makeAspectCrop(
                                  {
                                    unit: 'px',
                                    width: Math.min(width, height) * 0.8,
                                  },
                                  ratio.value || width / height,
                                  width,
                                  height
                                ),
                                width,
                                height
                              );
                              setCrop(newCrop);
                            }
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${aspect === ratio.value ? 'border-[#4DB154] bg-[#4DB154]/10 text-[#4DB154]' : 'border-gray-200 hover:border-[#4DB154]/50'}`}
                        >
                          <span className="text-lg mb-1">{ratio.icon}</span>
                          <span className="text-xs">{ratio.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Crop Area */}
                {imgSrc && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-medium text-gray-700 flex items-center">
                        {isMobile ? (
                          <FaMobile className="mr-2 text-[#4DB154]" />
                        ) : (
                          <FaDesktop className="mr-2 text-[#4DB154]" />
                        )}
                        Crop Area {isMobile ? '(Touch Friendly)' : '(Drag to Adjust)'}
                      </h3>
                    </div>
                    <div className="relative bg-gray-900 flex items-center justify-center p-4">
                      <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        onComplete={c => setCompletedCrop(c)}
                        aspect={aspect || undefined}
                        className="max-w-full max-h-[70vh]"
                        ruleOfThirds
                        minWidth={100}
                        minHeight={100}
                      >
                        <img
                          ref={imgRef}
                          alt="Document to crop"
                          src={imgSrc}
                          onLoad={onImageLoad}
                          className="max-w-full max-h-[70vh] object-contain"
                          style={{ display: 'block' }}
                        />
                      </ReactCrop>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Section */}
              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 h-full flex flex-col">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <FaDownload className="mr-2 text-[#4DB154]" />
                      Cropped Result Preview
                    </h3>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
                    {completedCrop ? (
                      <>
                        <div className="w-full mb-6 flex justify-center bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                          <canvas
                            ref={previewCanvasRef}
                            className="max-w-full max-h-[50vh]"
                            style={{
                              display: 'block',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                        
                        <button
                          onClick={handleDownload}
                          className="px-8 py-3 bg-gradient-to-r from-[#3A9D44] to-[#4DB154] hover:from-[#4DB154] hover:to-[#3A9D44] text-white rounded-lg font-semibold text-lg transition-all shadow-md hover:shadow-lg flex items-center"
                        >
                          <FaDownload className="mr-2" />
                          Download High-Res PNG
                        </button>

                        <div className="mt-6 w-full max-w-md">
                          <div className="bg-[#4DB154]/5 p-4 rounded-lg border border-[#4DB154]/20">
                            <h4 className="font-semibold text-sm text-[#4DB154] flex items-center mb-2">
                              <FaInfoCircle className="mr-2" />
                              Cropping Tips
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• {isMobile ? 'Pinch to zoom, drag to move' : 'Drag corners to resize, drag center to move'}</li>
                              <li>• Select aspect ratio for consistent proportions</li>
                              <li>• Download maintains original image quality</li>
                            </ul>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-8">
                        <div className="bg-[#4DB154]/10 p-4 rounded-full mb-4">
                          <svg className="w-12 h-12 text-[#4DB154]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-700 mb-1">No Image Cropped Yet</h4>
                        <p className="text-gray-500 text-sm">
                          Upload an image and select a crop area to see the preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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