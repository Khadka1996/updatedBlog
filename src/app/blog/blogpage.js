// app/blog/page.js
import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BlogSearch from './BlogSearch';
import BlogSkeleton from './BlogSkeleton';
import LikeButton from './LikeButton';

const ITEMS_PER_PAGE = 12;

const BlogPage = async ({ searchParams = {} }) => {
  const page = parseInt(searchParams.page) || 1;
  const searchQuery = searchParams.search || '';

  try {
    // Build API URL with pagination and search parameters
    const apiUrl = new URL('https://api.everestkit.com/api/blogs');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogSearch />

        {/* Search results header */}
        {searchQuery && (
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Search Results for: <span className="text-blue-600">"{searchQuery}"</span>
            </h2>
            <p className="text-gray-500 mt-2">
              Found {blogData.count} article{blogData.count !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <Suspense fallback={<BlogSkeleton count={ITEMS_PER_PAGE} />}>
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery
                  ? `No articles found for "${searchQuery}"`
                  : 'No articles available. Check back later!'}
              </p>
              {searchQuery && (
                <Link
                  href="/blog"
                  className="mt-4 inline-block px-4 py-2 bg-[#51A94C] text-white rounded-md hover:bg-[#4A8E45] transition-colors"
                >
                  Clear Search
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Content</h2>
          <p className="text-gray-500">We couldn't load the blog posts. Please try again later.</p>
          <Link
            href="/blog"
            className="mt-4 px-4 py-2 bg-[#51A94C] text-white rounded-md hover:bg-[#4A8E45] transition-colors inline-block"
          >
            Retry
          </Link>
        </div>
      </div>
    );
  }
};

// Blog Card Component
const BlogCard = ({ blog }) => (
  <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
    {blog.image && (
      <div className="relative h-48 w-full">
        <img
          src={`https://api.everestkit.com/uploads/${blog.image}`}
          alt={blog.title}
          className="w-full h-48 object-cover"
        />
      </div>
    )}
    <div className="p-6 flex-grow flex flex-col">
      <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
        {blog.title}
      </h2>
      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4">
        <span>
          {new Date(blog.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <LikeButton blogId={blog._id} initialCount={blog.likeCount || 0} />
        </div>
      </div>
      <Link
        href={`/blog/${blog._id}`}
        className="mt-4 inline-block px-4 py-2 bg-[#51A94C] text-white rounded-md hover:bg-[#4A8E45] transition-colors text-center"
        aria-label={`Read more about ${blog.title}`}
      >
        Read More
      </Link>
    </div>
  </article>
);

// Pagination Component
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
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Previous
          </Link>
        )}
        {getPageNumbers().map((pageNum, index) =>
          pageNum === '...' ? (
            <span key={`ellipsis-${index}`} className="px-4 py-2">
              ...
            </span>
          ) : (
            <Link
              key={pageNum}
              href={getPageUrl(pageNum)}
              className={`px-4 py-2 border rounded-md ${
                page === pageNum ? 'bg-[#4A8E45] text-white' : 'hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </Link>
          )
        )}
        {page < totalPages && (
          <Link
            href={getPageUrl(page + 1)}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
};

export default BlogPage;