"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Contents = ({ searchParams }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use a more robust fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const res = await fetch('https://api.everestkit.com/api/blogs/latest', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          mode: 'cors', // Explicitly set CORS mode
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }

        const blogData = await res.json();
        
        if (!blogData || blogData.success === false) {
          throw new Error('Invalid response from server');
        }

        setBlogs(blogData.data || []);
        
      } catch (err) {
        console.error('Error fetching blogs:', err);
        if (err.name === 'AbortError') {
          setError('Request timeout. Please check your internet connection and try again.');
        } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          setError('Network error. Please check your internet connection or try again later.');
        } else {
          setError(err.message || 'Failed to load content. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 w-full bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-10 h-10 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Unable to Load Content
          </h2>
          <p className="text-gray-600 text-lg mb-4 max-w-md mx-auto">
            {error}
          </p>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            If this problem persists, please contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-[#25609A] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors font-medium"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Latest Blogs Heading */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Latest Blogs
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover our latest articles, insights, and updates on various topics
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="max-w-md mx-auto">
            <svg 
              className="w-16 h-16 text-gray-400 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Articles Yet</h3>
            <p className="text-gray-500 mb-6">
              We&apos;re working on creating amazing content for you. Check back soon!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {blogs.map((blog, index) => (
            <article
              key={blog._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col border border-gray-100"
            >
              {/* Blog Image with responsive height */}
              {blog.image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={`https://api.everestkit.com/uploads/${blog.image}`}
                    alt={blog.title || 'Blog image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={index < 4}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Blog Content */}
              <div className="p-6 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                  {blog.title || 'Untitled'}
                </h2>

                {/* Description/Excerpt */}
                {blog.subheading && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {blog.subheading}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {blog.viewCount || 0}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {blog.likeCount || blog.likes?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Read More Button */}
                <Link
                  href={`/blog/${blog._id}`}
                  className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-[#25609A] to-[#51A94C] text-white rounded-lg hover:from-[#1a4a7a] hover:to-[#4A8E45] transition-all duration-300 text-center font-medium shadow-md hover:shadow-lg"
                  aria-label={`Read more about ${blog.title || 'this article'}`}
                >
                  Read Full Article
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {blogs.length > 0 && (
        <div className="text-center mt-12">
          <button 
            className="px-8 py-3 border-2 border-[#25609A] text-[#25609A] rounded-lg hover:bg-[#25609A] hover:text-white transition-all duration-300 font-semibold"
            onClick={handleRetry}
          >
            Load More Articles
          </button>
        </div>
      )}
    </div>
  );
};

export default Contents;