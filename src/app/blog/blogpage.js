import React, { Suspense } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaArrowDown, FaHeart, FaEye, FaComments } from 'react-icons/fa';
import BlogSearch from './BlogSearch';
import BlogSkeleton from './BlogSkeleton';
import BlogCard from './BlogCard';
import API_URL from '../config.js'

const ITEMS_PER_PAGE = 12;

const BlogPage = async ({ searchParams = {} }) => {
  const page = parseInt(searchParams.page) || 1;
  const searchQuery = searchParams.search || '';

  try {
    // Build API URL with pagination and search parameters
    const apiUrl = new URL('/api/blogs', API_URL);
    apiUrl.searchParams.set('page', page);
    apiUrl.searchParams.set('limit', ITEMS_PER_PAGE);
    if (searchQuery) {
      apiUrl.searchParams.set('search', searchQuery);
    }

    const res = await fetch(apiUrl.toString(), {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const blogData = await res.json();
    const blogs = blogData.data || [];
    const totalPages = Math.ceil(blogData.total / ITEMS_PER_PAGE);

    return (
      <div>
       

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search Bar */}
          <div className="mt-8">
            <BlogSearch />
          </div>

          {/* Search Results Header */}
          {searchQuery && (
            <div className="mb-8 text-center mt-8">
              <h2 className="text-2xl font-bold text-gray-800">
                Search Results for: <span className="text-[#194da6]">{searchQuery}</span>
              </h2>
              <p className="text-gray-500 mt-2">
                Found {blogData.count} articles
              </p>
            </div>
          )}

          <Suspense fallback={<BlogSkeleton count={ITEMS_PER_PAGE} />}>
            {blogs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">
                  {searchQuery
                    ? `No articles found for "${searchQuery}"`
                    : 'No articles available. Check back later!'}
                </p>
                {searchQuery && (
                  <Link
                    href="/blog"
                    className="group mt-6 inline-flex items-center px-6 py-3 bg-[#194da6] text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <span>Clear Search</span>
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div id="blog" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                  {blogs.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}
                </div>
                {blogs.length > 0 && (
                  <Pagination page={page} totalPages={totalPages} searchQuery={searchQuery} />
                )}
              </>
            )}
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-6">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Content</h2>
          <p className="text-gray-600 mb-6">We could not load the blog posts.</p>
          <Link
            href="/blog"
            className="group inline-flex items-center px-6 py-3 bg-[#194da6] text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <span>Retry</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    );
  }
};

// Pagination Component (Server Component)
const Pagination = ({ page, totalPages, searchQuery }) => {
  const getPageUrl = (pageNum) => {
    const params = new URLSearchParams();
    params.set('page', pageNum);
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    return `/blog?${params.toString()}`;
  };

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, page - half);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      if (start > 1) pages.push(1);
      if (start > 2) pages.push('...');

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push('...');
      if (end < totalPages) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="mt-12 flex justify-center">
      <div className="flex items-center space-x-2">
        {page > 1 && (
          <Link
            href={getPageUrl(page - 1)}
            className="group inline-flex items-center px-4 py-2 bg-blue-50 text-[#194da6] font-semibold rounded-full hover:bg-[#194da6] hover:text-white transition-all duration-300"
          >
            <FaArrowRight className="mr-2 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Previous</span>
          </Link>
        )}
        {getPageNumbers().map((pageNum, index) =>
          pageNum === '...' ? (
            <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-600">
              ...
            </span>
          ) : (
            <Link
              key={pageNum}
              href={getPageUrl(pageNum)}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                page === pageNum
                  ? 'bg-[#194da6] text-white'
                  : 'bg-blue-50 text-[#194da6] hover:bg-[#194da6] hover:text-white'
              }`}
            >
              {pageNum}
            </Link>
          )
        )}
        {page < totalPages && (
          <Link
            href={getPageUrl(page + 1)}
            className="group inline-flex items-center px-4 py-2 bg-blue-50 text-[#194da6] font-semibold rounded-full hover:bg-[#194da6] hover:text-white transition-all duration-300"
          >
            <span>Next</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default BlogPage;