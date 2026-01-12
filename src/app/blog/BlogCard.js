'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaEye, FaHeart, FaComments } from 'react-icons/fa';
import axios from 'axios';
import { useState, useEffect } from 'react';

const BlogCard = ({ blog }) => {
  const [isClient, setIsClient] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(blog.likes?.length || 0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if current user has liked this blog
    const checkUserLike = () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Get user ID from localStorage or decode from token
          const userId = localStorage.getItem('userId');
          // Check if user ID exists in likes array
          if (userId && blog.likes?.includes(userId)) {
            setIsLiked(true);
          } else {
            setIsLiked(false);
          }
        } else {
          setIsLiked(false);
        }
      } catch (error) {
        console.log('Error checking like status:', error);
        setIsLiked(false);
      }
    };
    
    checkUserLike();
  }, [blog.likes]); // Add blog.likes as dependency

  const generateFingerprint = () => {
    if (!isClient) return '';
    
    const userAgent = navigator.userAgent || '';
    const language = navigator.language || '';
    const platform = navigator.platform || '';
    
    const data = userAgent + language + platform;
    let hash = 0;
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).slice(0, 8);
  };

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isClient || isLoading) return;

    const token = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');
    const fingerprint = generateFingerprint();

    if (!token) {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }

    setIsLoading(true);

    try {
      // Optimistic UI update
      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
      
      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);

      const response = await axios.post(
        `/api/blogs/${blog._id}/like`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Session-ID': sessionId || '',
            'X-Client-Fingerprint': fingerprint,
          },
          withCredentials: true,
          timeout: 8000,
        }
      );

      // Update with actual server response
      if (response.data.data) {
        setIsLiked(response.data.data.isLiked);
        setLikeCount(response.data.data.likeCount);
        
        // Store like status in localStorage for persistence
        if (response.data.data.isLiked) {
          localStorage.setItem(`liked_${blog._id}`, 'true');
        } else {
          localStorage.removeItem(`liked_${blog._id}`);
        }
      }

    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikeCount(likeCount);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('sessionId');
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Failed to like blog. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Image URL handling
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/fallback-image.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `/uploads/${imagePath}`;
  };

  // Click handler for card navigation
  const handleCardClick = (e) => {
    // If click is on like button, don't navigate
    if (e.target.closest('button')) {
      return;
    }
    window.location.href = `/blogs/${blog._id}`;
  };

  // SSR-safe rendering
  if (!isClient) {
    return (
      <article 
        className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Clickable Image */}
        <div className="relative h-48 w-full">
          <Image
            src={getImageUrl(blog.image)}          
            alt={blog.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>

        <div className="p-6">
          {/* Clickable Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 cursor-pointer">
            {blog.title}
          </h2>
          
          {/* Engagement Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {/* Views */}
              <div className="flex items-center space-x-1">
                <FaEye className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{blog.viewCount || 0}</span>
              </div>

              {/* Likes */}
              <div className="flex items-center space-x-1">
                <FaHeart className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">{likeCount}</span>
              </div>

              {/* Comments */}
              <div className="flex items-center space-x-1">
                <FaComments className="w-4 h-4 text-green-500" />
                <span className="font-semibold">{blog.comments?.length || 0}</span>
              </div>
            </div>

            {/* Date */}
            <span className="text-sm text-gray-500">
              {new Date(blog.createdAt).toLocaleDateString('en', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </article>
    );
  }

  const hasToken = !!localStorage.getItem('accessToken');

  return (
    <article 
      className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Clickable Image */}
      <div className="relative h-48 w-full">
        <Image
          src={getImageUrl(blog.image)}          
          alt={blog.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      </div>

      <div className="p-6">
        {/* Clickable Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 cursor-pointer">
          {blog.title}
        </h2>
        
        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {/* Views */}
            <div className="flex items-center space-x-1">
              <FaEye className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">{blog.viewCount || 0}</span>
            </div>

            {/* Likes */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center space-x-1 ${
                isLiked 
                  ? 'text-red-500' 
                  : hasToken 
                    ? 'text-gray-600' 
                    : 'text-gray-400 cursor-not-allowed'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={hasToken ? "Like this post" : "Please login to like"}
              disabled={!hasToken || isLoading}
            >
              <FaHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-semibold">{likeCount}</span>
            </button>

            {/* Comments */}
            <div className="flex items-center space-x-1">
              <FaComments className="w-4 h-4 text-green-500" />
              <span className="font-semibold">{blog.comments?.length || 0}</span>
            </div>
          </div>

          {/* Date */}
          <span className="text-sm text-gray-500">
            {new Date(blog.createdAt).toLocaleDateString('en', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;