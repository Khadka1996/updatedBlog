import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BlogPage = async ({ searchParams }) => {
  try {
    // Fetch blog data from backend API
    const res = await fetch('http://116.203.117.20:5000/api/blogs/latest', {
      cache: 'no-store', // Ensure fresh data (optional, added for immediate updates)
    });

    if (!res.ok) {
      throw new Error('Failed to fetch blog data');
    }

    const blogData = await res.json();
    const blogs = blogData.data || [];

    return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Latest Blogs Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Latest Blogs
        </h1>

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base sm:text-lg">
              No articles found. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {blogs.map((blog) => (
              <article
                key={blog._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                {/* Blog Image with responsive height */}
                {blog.image && (
                  <div className="relative h-32 sm:h-36 w-full">
                    <Image
                      src={`http://116.203.117.20:5000/uploads/${blog.image}`}
                      alt={blog.title || 'Blog image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={blogs.indexOf(blog) < 4}
                    />
                  </div>
                )}

                {/* Blog Content */}
                <div className="p-4 flex-grow flex flex-col">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {blog.title || 'Untitled'}
                  </h2>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mt-auto pt-3">
                    <span>
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <span className="flex items-center">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
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
                          className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
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
                    className="mt-3 inline-block px-3 py-1.5 bg-[#51A94C] text-white rounded-md hover:bg-[#4A8E45] transition-colors text-center text-xs sm:text-sm"
                    aria-label={`Read more about ${blog.title || 'this article'}`}
                  >
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Google Ads Integration */}
        {blogs.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <div className="bg-gray-100 p-4 rounded-lg min-h-[200px] sm:min-h-[250px] flex items-center justify-center">
              <p className="text-gray-500 text-sm sm:text-base">Advertisement Space</p>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-lg sm:text-xl font-semibold text-red-600 mb-2">
            Error Loading Content
          </h2>
          <p className="text-gray-500 text-base sm:text-lg">
            We couldn't load the blog posts. Please try again later.
          </p>
          <Link
            href="/blog"
            className="mt-4 px-4 py-2 bg-[#51A94C] text-white rounded-md hover:bg-[#4A8E45] transition-colors inline-block text-sm sm:text-base"
          >
            Retry
          </Link>
        </div>
      </div>
    );
  }
};

export default BlogPage;