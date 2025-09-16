// blogs/BlogArticle.js

"use client";

import React, { useState, useEffect } from 'react';
import { FaFacebook, FaTwitter, FaWhatsapp, FaPinterest, FaQuora } from 'react-icons/fa';
import CommentSection from './CommentSection';
import Image from 'next/image';

const BlogArticle = ({ initialData }) => {
  const [googleAds, setGoogleAds] = useState(null);
  
  useEffect(() => {
    // Only fetch ads on client side
    const fetchAds = async () => {
      try {
        // Simulate ad fetching (replace with actual ad API)
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

  // If no blog data, show loading or error
  if (!initialData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const blog = initialData;
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/blogs/${blog._id || blog.id}`
    : `https://everestkit.com/blogs/${blog._id || blog.id}`;
    
  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${blog.title} ${shareUrl}`)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(blog.title)}`,
    quora: `https://www.quora.com/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(blog.title)}`,
  };

  const renderAdPlaceholder = (position) => (
    <div className={`bg-gray-200 flex items-center justify-center text-gray-600 ${position === 'top' || position === 'bottom' ? 'h-32' : 'h-96'}`}>
      Placeholder Ad - {position.charAt(0).toUpperCase() + position.slice(1)}
    </div>
  );

  const renderHTML = (htmlString) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        {googleAds?.top ? <div dangerouslySetInnerHTML={googleAds.top} /> : renderAdPlaceholder('top')}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="hidden lg:block lg:w-1/6">
          {googleAds?.left ? <div dangerouslySetInnerHTML={googleAds.left} /> : renderAdPlaceholder('left')}
        </div>

        <div className="flex-1">
          <article className="bg-white rounded-lg shadow-md p-6">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{blog.title}</h1>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 00.293.707l2 2a1 1 0 101.414-1.414L11 9.586V7z" clipRule="evenodd" />
                  </svg>
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-4">
                  {Object.entries(socialLinks).map(([key, url]) => {
                    const Icon = {
                      facebook: FaFacebook,
                      twitter: FaTwitter,
                      whatsapp: FaWhatsapp,
                      pinterest: FaPinterest,
                      quora: FaQuora,
                    }[key];

                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-600 transition duration-300"
                        aria-label={`Share on ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              </div>

              <hr className="border-t border-gray-300 mb-6" />
              {blog.subheading && <h2 className="text-xl text-gray-600 mb-8">{blog.subheading}</h2>}
            </header>

            {blog.image && (
              <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden">
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

            <div className="prose prose-lg max-w-none mb-8">{renderHTML(blog.content)}</div>

            {blog.youtubeLink && (
              <div className="mb-8 aspect-w-16 aspect-h-9">
                <iframe
                  src={blog.youtubeLink}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-64 md:h-96 rounded-lg"
                />
              </div>
            )}
          </article>

          <CommentSection blog={blog} />
        </div>

        <div className="hidden lg:block lg:w-1/6">
          {googleAds?.right ? <div dangerouslySetInnerHTML={googleAds.right} /> : renderAdPlaceholder('right')}
        </div>
      </div>

      <div className="mt-8">
        {googleAds?.bottom ? <div dangerouslySetInnerHTML={googleAds.bottom} /> : renderAdPlaceholder('bottom')}
      </div>
    </div>
  );
};

export default BlogArticle;