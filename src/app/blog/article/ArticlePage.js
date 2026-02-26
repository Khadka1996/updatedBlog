"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaFacebook, FaWhatsapp, FaPinterest, FaInstagram, FaLink, 
  FaCheck, FaExclamationTriangle 
} from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import CommentSection from './CommentSection.js';
import Image from 'next/image';
import Script from 'next/script';

const BlogArticle = ({ initialData, recentBlogs = [] }) => {
  const [googleAdsReady, setGoogleAdsReady] = useState(false);
  const [copyStatus, setCopyStatus] = useState('idle');
  const [currentUrl, setCurrentUrl] = useState('');

  const adsEnabled = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED === 'true';
  const publisherId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
  
  const adUnitIds = {
    top:    process.env.NEXT_PUBLIC_AD_TOP_SLOT    || '',
    left:   process.env.NEXT_PUBLIC_AD_LEFT_SLOT   || '',
    right:  process.env.NEXT_PUBLIC_AD_RIGHT_SLOT  || '',
    bottom: process.env.NEXT_PUBLIC_AD_BOTTOM_SLOT || '',
  };

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (adsEnabled && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setGoogleAdsReady(true);
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    }
  }, [adsEnabled]);

  const handleCopyUrl = async () => {
    try {
      const url = currentUrl || `https://everestkit.com/blogs/${initialData?._id}`;
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2200);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2200);
    }
  };

  if (!initialData) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Article not found</h2>
        <p className="text-gray-600 mb-8">It may have been removed or the link is incorrect.</p>
        <a href="/blogs" className="inline-flex items-center px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800">
          ← Back to all articles
        </a>
      </div>
    );
  }

  const blog = initialData;
  const shareUrl = currentUrl || `https://everestkit.com/blogs/${blog._id}`;
  const shareTitle = encodeURIComponent(blog.title);

  const socialLinks = {
    facebook:  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter:   `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`,
    whatsapp:  `https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + shareUrl)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${shareTitle}&media=`,
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`, // note: IG doesn't have direct web share
  };

  const hasAd = (pos) => adsEnabled && publisherId && !!adUnitIds[pos];

  const renderAd = (position) => {
    if (!hasAd(position)) {
      return null;
    }

    const isHorizontal = position === 'top' || position === 'bottom';
    const margin = isHorizontal ? 'my-4' : 'my-4';

    return (
      <div className={margin}>
        <ins
          className="adsbygoogle block w-full"
          data-ad-client={publisherId}
          data-ad-slot={adUnitIds[position]}
          data-ad-format={isHorizontal ? "auto" : "vertical"}
          data-full-width-responsive="true"
        />
      </div>
    );
  };

  const renderContent = (html) => (
    <div
      dangerouslySetInnerHTML={{
        __html: html
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/<img([^>]+)>/g, '<img$1 style="max-width:100%;height:auto;display:block;margin:1.5rem auto;border-radius:0.75rem;" />')
          .replace(/<iframe/g, '<iframe style="width:100%;aspect-ratio:16/9;" ')
          .replace(/<table/g, '<div style="overflow-x:auto;"><table')
          .replace(/<\/table>/g, '</table></div>')
      }}
    />
  );

  return (
    <>
      {adsEnabled && publisherId && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
          strategy="afterInteractive"
          onLoad={() => window.adsbygoogle?.push({})}
        />
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Top advertisement */}
        {renderAd('top')}

        <div className="flex flex-col lg:flex-row lg:gap-4 xl:gap-5">
          
          {/* ======================== MAIN ARTICLE ======================== */}
          <main className="flex-1 min-w-0 order-1 lg:order-1 w-full">
            <article className="w-full">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-1 sm:mb-2 text-gray-900">
                {blog.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-3 text-gray-600 text-sm sm:text-base pb-2 border-b border-gray-200" suppressHydrationWarning>
                <div className="flex items-center">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 00.293.707l2 2a1 1 0 101.414-1.414L11 9.586V7z" clipRule="evenodd" />
                  </svg>
                  <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 hidden sm:inline">Share:</span>
                  <SocialIcon href={socialLinks.facebook} icon={<FaFacebook />} color="#1877F2" label="Facebook" />
                  <SocialIcon href={socialLinks.twitter}   icon={<FaXTwitter />} color="#000"     label="X/Twitter" />
                  <SocialIcon href={socialLinks.whatsapp}  icon={<FaWhatsapp />} color="#25D366"  label="WhatsApp" />
                  <SocialIcon href={socialLinks.pinterest} icon={<FaPinterest />} color="#E60023" label="Pinterest" />
                  <SocialIcon href={socialLinks.instagram} icon={<FaInstagram />} color="#E4405F" label="Instagram" />
                  
                  <button
                    onClick={handleCopyUrl}
                    className={`p-1.5 rounded-full hover:bg-gray-100 transition ${copyStatus === 'copied' ? 'text-green-600' : copyStatus === 'error' ? 'text-red-600' : 'text-gray-500 hover:text-blue-600'}`}
                    title={copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Copy failed' : 'Copy link'}
                  >
                    {copyStatus === 'copied' ? <FaCheck className="w-5 h-5" /> :
                     copyStatus === 'error' ? <FaExclamationTriangle className="w-5 h-5" /> :
                     <FaLink className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {blog.subheading && (
                <p className="text-lg sm:text-xl text-gray-700 mb-3 sm:mb-4 leading-relaxed border-l-4 border-blue-500 pl-3 sm:pl-5 italic mt-2">
                  {blog.subheading}
                </p>
              )}

              {blog.image && (
                <div className="relative aspect-video sm:aspect-[16/9] md:aspect-[21/9] my-3 sm:my-4 rounded-lg sm:rounded-xl overflow-hidden shadow">
                  <Image
                    src={`/uploads/${blog.image}`}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                    priority
                  />
                </div>
              )}

              <div className="mb-5 sm:mb-6">
                {renderContent(blog.content)}
              </div>

              {blog.youtubeLink && (
                <div className="aspect-video rounded-lg sm:rounded-xl overflow-hidden shadow-lg mb-5 sm:mb-6">
                  <iframe
                    src={blog.youtubeLink.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/').split('?')[0]}
                    title="YouTube video"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 sm:pt-4 border-t border-gray-200 mt-5 sm:mt-6">
                  {blog.tags.map((tag) => (
                    <span key={tag} className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-200 transition">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-200">
              <CommentSection blog={blog} />
            </div>

            {/* Bottom ad */}
            {renderAd('bottom')}
          </main>

          {/* ======================== SIDEBAR ======================== */}
          {recentBlogs?.length > 0 && (
            <aside className="w-full lg:w-80 shrink-0 order-2 lg:order-2 mt-3 lg:mt-0">
              <div className="bg-white rounded-lg p-2 sm:p-3 sticky top-20 sm:top-24 border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">Latest Articles</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {recentBlogs.map((post) => (
                    <li key={post._id} className="group">
                      <a href={`/blogs/${post._id}`} className="flex gap-2 sm:gap-3 hover:opacity-90 transition">
                        <div className="w-14 sm:w-16 h-10 sm:h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          {post.image ? (
                            <Image
                              src={`/uploads/${post.image}`}
                              alt={post.title}
                              width={80}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 group-hover:text-blue-700">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

        </div>
      </div>
    </>
  );
};

// Tiny helper component
function SocialIcon({ href, icon, color, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-500 hover:text-[var(--color)] transition duration-300 transform hover:scale-110"
      style={{ '--color': color }}
      aria-label={`Share on ${label}`}
      title={`Share on ${label}`}
    >
      {React.cloneElement(icon, { className: "h-6 w-6" })}
    </a>
  );
}

export default BlogArticle;