"use client";

import React, { useState, useEffect } from 'react';
import { FaFacebook, FaWhatsapp, FaPinterest, FaInstagram, FaLink, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import CommentSection from './CommentSection';
import Image from 'next/image';

const BlogArticle = ({ initialData }) => {
  const [googleAds, setGoogleAds] = useState(null);
  const [copyStatus, setCopyStatus] = useState('idle');
  const [currentUrl, setCurrentUrl] = useState('');
  
  useEffect(() => {
    // Set current URL only on client side to avoid hydration mismatch
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const ads = {
          top: { __html: '<div class="ad-placeholder">Advertisement</div>' },
          left: { __html: '<div class="ad-placeholder">Advertisement</div>' },
          right: { __html: '<div class="ad-placeholder">Advertisement</div>' },
          bottom: { __html: '<div class="ad-placeholder">Advertisement</div>' },
        };
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setGoogleAds(Math.random() > 0.5 ? ads : null);
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    };
    
    fetchAds();
  }, []);

  // Handle copy URL functionality
  const handleCopyUrl = async () => {
    try {
      const shareUrl = currentUrl || `https://everestkit.com/blogs/${initialData?._id || initialData?.id}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('copied');
      
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      setCopyStatus('error');
      
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    }
  };

  // Get copy button icon based on status
  const getCopyIcon = () => {
    switch (copyStatus) {
      case 'copied':
        return <FaCheck className="h-5 w-5 text-green-600" />;
      case 'error':
        return <FaExclamationTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <FaLink className="h-5 w-5" />;
    }
  };

  // Get copy button tooltip text
  const getCopyTooltip = () => {
    switch (copyStatus) {
      case 'copied':
        return 'Copied!';
      case 'error':
        return 'Failed to copy';
      default:
        return 'Copy link';
    }
  };

  // If no blog data, show loading or error
  if (!initialData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h2>
          <p className="text-gray-600 mb-6">The blog article you're looking for doesn't exist or may have been removed.</p>
          <a 
            href="/blogs" 
            className="inline-block bg-[#25609A] text-white px-6 py-3 rounded-lg hover:bg-[#1a4a7a] transition-colors"
          >
            Back to Blogs
          </a>
        </div>
      </div>
    );
  }

  const blog = initialData;
  
  // Use current URL when available, otherwise fallback
  const shareUrl = currentUrl || `https://everestkit.com/blogs/${blog._id || blog.id}`;
  const shareTitle = encodeURIComponent(blog.title);
    
  // Simple social share links - all work the same way
  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${blog.title} ${shareUrl}`)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${shareTitle}`,
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`,
  };

  const renderAdPlaceholder = (position) => (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 rounded-lg ${
      position === 'top' || position === 'bottom' ? 'h-32' : 'h-96'
    }`}>
      Advertisement - {position.charAt(0).toUpperCase() + position.slice(1)}
    </div>
  );

  const renderHTML = (htmlString) => (
    <div 
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlString }} 
    />
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Ad */}
      <div className="mb-8">
        {googleAds?.top ? <div dangerouslySetInnerHTML={googleAds.top} /> : renderAdPlaceholder('top')}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Ad */}
        <div className="hidden lg:block lg:w-1/6">
          {googleAds?.left ? <div dangerouslySetInnerHTML={googleAds.left} /> : renderAdPlaceholder('left')}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <article className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {blog.title}
              </h1>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 00.293.707l2 2a1 1 0 101.414-1.414L11 9.586V7z" clipRule="evenodd" />
                  </svg>
                  <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>

                {/* Social Sharing Icons - All work the same simple way */}
                {currentUrl && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 mr-2 hidden sm:block">Share:</span>
                    
                    {/* Facebook */}
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-[#1877F2] transition duration-300 transform hover:scale-110"
                      aria-label="Share on Facebook"
                      title="Share on Facebook"
                    >
                      <FaFacebook className="h-5 w-5" />
                    </a>
                    
                    {/* Twitter */}
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-black transition duration-300 transform hover:scale-110"
                      aria-label="Share on Twitter"
                      title="Share on Twitter"
                    >
                      <FaXTwitter className="h-5 w-5" />
                    </a>
                    
                    {/* WhatsApp */}
                    <a
                      href={socialLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-[#25D366] transition duration-300 transform hover:scale-110"
                      aria-label="Share on WhatsApp"
                      title="Share on WhatsApp"
                    >
                      <FaWhatsapp className="h-5 w-5" />
                    </a>
                    
                    {/* Pinterest */}
                    <a
                      href={socialLinks.pinterest}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-[#BD081C] transition duration-300 transform hover:scale-110"
                      aria-label="Share on Pinterest"
                      title="Share on Pinterest"
                    >
                      <FaPinterest className="h-5 w-5" />
                    </a>
                    
                    {/* Instagram */}
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-[#E4405F] transition duration-300 transform hover:scale-110"
                      aria-label="Share on Instagram"
                      title="Share on Instagram"
                    >
                      <FaInstagram className="h-5 w-5" />
                    </a>
                    
                    {/* Copy URL Button */}
                    <button
                      onClick={handleCopyUrl}
                      className={`text-gray-500 hover:text-blue-600 transition duration-300 transform hover:scale-110 ${
                        copyStatus === 'copied' ? 'text-green-600' : 
                        copyStatus === 'error' ? 'text-red-600' : ''
                      }`}
                      aria-label={getCopyTooltip()}
                      title={getCopyTooltip()}
                      disabled={copyStatus === 'copied'}
                    >
                      {getCopyIcon()}
                    </button>
                  </div>
                )}
              </div>

              <hr className="border-t border-gray-200 mb-6" />
              
              {blog.subheading && (
                <h2 className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                  {blog.subheading}
                </h2>
              )}
            </header>

            {/* Blog Image */}
            {blog.image && (
              <div className="relative h-64 md:h-96 w-full mb-8 rounded-xl overflow-hidden shadow-md">
                <Image
                  src={`/uploads/${blog.image}`}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}

            {/* Blog Content */}
            <div className="mb-8">
              {renderHTML(blog.content)}
            </div>

            {/* YouTube Video */}
            {blog.youtubeLink && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-md">
                <iframe
                  src={blog.youtubeLink}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-64 md:h-96"
                />
              </div>
            )}

            {/* Tags (if available) */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Comments Section */}
          <CommentSection blog={blog} />

          
        </div>

        {/* Right Sidebar Ad */}
        <div className="hidden lg:block lg:w-1/6">
          {googleAds?.right ? <div dangerouslySetInnerHTML={googleAds.right} /> : renderAdPlaceholder('right')}
        </div>
      </div>

      {/* Bottom Ad */}
      <div className="mt-8">
        {googleAds?.bottom ? <div dangerouslySetInnerHTML={googleAds.bottom} /> : renderAdPlaceholder('bottom')}
      </div>
    </div>
  );
};

export default BlogArticle;