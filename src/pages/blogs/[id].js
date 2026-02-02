import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import axios from 'axios';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import BlogArticle from '@/app/blog/article/ArticlePage';
import '@/app/globals.css';
import MobileFooterNav from '@/app/components/footer/footerMobile';
import Image from 'next/image';
import Link from 'next/link';

const ServerBlogPage = ({ initialData, error, currentUrl, recentBlogs = [] }) => {
  const router = useRouter();
  
  if (error) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-red-500 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Network Error</h1>
              <p className="text-gray-600 mb-6">
                {error.message || 'Failed to load the blog article. Please check your internet connection and try again.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.reload()}
                  className="bg-[#25609A] text-white px-6 py-3 rounded-lg hover:bg-[#1a4a7a] transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/blogs')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Blogs
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!initialData) {
    return (
      <>
        <NavBar />
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
        <Footer />
      </>
    );
  }

  const { title, subheading, content, image, createdAt, tags } = initialData;

  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '');
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const cleanedContent = truncateText(stripHtmlTags(content), 160);
  const imageUri = image ? `http://localhost:5000/uploads/${image}` : 'https://everestkit.com/default-blog-image.jpg';
  const siteUrl = currentUrl || `https://everestkit.com${router.asPath}`;

  return (
    <>
      <NavBar />
      <Head>
        <title>{title} | EverestKit</title>
        <meta name="description" content={cleanedContent} />
        <meta name="keywords" content={tags ? tags.join(', ') : ''} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={cleanedContent} />
        <meta property="og:image" content={imageUri} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="EverestKit" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={cleanedContent} />
        <meta name="twitter:image" content={imageUri} />
        <meta name="twitter:site" content="@everestkit" />
        
        {/* Article Meta */}
        <meta property="article:published_time" content={createdAt} />
        {tags && tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        
        <link rel="canonical" href={siteUrl} />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:flex lg:items-start lg:gap-4 xl:gap-6">
          <main className="flex-1 min-w-0">
            <BlogArticle initialData={initialData} />
          </main>

          <aside className="w-full lg:w-80 shrink-0 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Latest Articles</h3>
              {!recentBlogs || recentBlogs.length === 0 ? (
                <div className="p-4 border-2 border-dashed border-gray-200 rounded text-gray-500 text-sm">No recent articles</div>
              ) : (
                <ul className="space-y-4">
                  {recentBlogs.map((b) => (
                    <li 
                      key={b._id} 
                      className="flex items-start gap-3 pb-3 border-b border-gray-100 last:pb-0 last:border-0 hover:bg-gray-50 p-2 rounded transition"
                    >
                      <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                        {b.image ? (
                          <Image 
                            src={`http://localhost:5000/uploads/${b.image}`} 
                            alt={b.title || 'img'} 
                            width={160} 
                            height={120} 
                            className="object-cover w-full h-full" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link 
                          href={`/blogs/${b._id}`} 
                          className="block font-semibold text-sm text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {b.title}
                        </Link>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>

      <MobileFooterNav />
      <Footer />
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { id } = context.params;
  const { req } = context;
  
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const currentUrl = `${protocol}://${host}${req.url}`;

  if (!id || id.length !== 24) {
    return { notFound: true };
  }

  try {
    const response = await axios.get(
      `http://localhost:5000/api/blogs/${id}`,
      {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const blogData = response.data?.data || null;

    if (!blogData) {
      return { notFound: true };
    }

    let recentBlogs = [];
    try {
      const recentRes = await axios.get('http://localhost:5000/api/blogs/latest', { timeout: 8000 });
      recentBlogs = recentRes.data?.data || [];
    } catch (e) {
      recentBlogs = [];
    }

    return {
      props: {
        initialData: blogData,
        currentUrl,
        recentBlogs: recentBlogs.slice(0, 12),
      },
    };
    
  } catch (error) {
    console.error('Error fetching blog data:', error);
    
    if (error.response?.status === 404) {
      return { notFound: true };
    }
    
    return {
      props: {
        initialData: null,
        currentUrl,
        error: {
          message: error.response?.data?.message || 
                  error.message || 
                  'Failed to load blog article. Please try again later.'
        }
      },
    };
  }
};

export default ServerBlogPage;