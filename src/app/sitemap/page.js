// app/sitemap/page.js 

'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaSitemap, 
  FaHome, 
  FaBlog, 
  FaTools, 
  FaServer, 
  FaEnvelope, 
  FaUser,
  FaCog,
  FaLock,
  FaFileContract,
  FaExclamationTriangle,
  FaCookie,
  FaSearch,
  FaDownload,
  FaExternalLinkAlt,
  FaChevronRight,
  FaCopy,
  FaCheck
} from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

const Sitemap = () => {
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLastUpdatedDate(new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    }
  }, []);

  const companyInfo = {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'EverestKit',
    website: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://everestkit.com',
  };

  // Fixed: Removed TypeScript type annotation
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(`${companyInfo.website}${url}`);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  // Main navigation sections
  const mainSections = [
    {
      title: 'Main Pages',
      icon: <FaHome className="text-[#52aa4d]" />,
      pages: [
        { name: 'Home', path: '/', description: 'Welcome to EverestKit - Your business solution partner' },
        { name: 'About Us', path: '/about', description: 'Learn about our mission, vision, and team' },
        { name: 'Contact Us', path: '/contact', description: 'Get in touch with our team' },
      ]
    },
    {
      title: 'Services',
      icon: <FaServer className="text-[#52aa4d]" />,
      pages: [
        { name: 'Our Services', path: '/services', description: 'Comprehensive business solutions and services' },
        { name: 'Service Details', path: '/services/digital-marketing', description: 'Digital marketing strategies' },
        { name: 'Service Details', path: '/services/web-development', description: 'Custom web development' },
        { name: 'Service Details', path: '/services/seo-optimization', description: 'SEO and optimization services' },
      ]
    },
    {
      title: 'Tools & Resources',
      icon: <FaTools className="text-[#52aa4d]" />,
      pages: [
        { name: 'Tools Hub', path: '/tools', description: 'Free business tools and calculators' },
        { name: 'SEO Tools', path: '/tools/seo-analyzer', description: 'SEO analysis tools' },
        { name: 'Business Calculators', path: '/tools/calculators', description: 'Financial and business calculators' },
        { name: 'Templates', path: '/tools/templates', description: 'Downloadable business templates' },
      ]
    },
    {
      title: 'Blog & Content',
      icon: <FaBlog className="text-[#52aa4d]" />,
      pages: [
        { name: 'Blog Home', path: '/blog', description: 'Latest articles and insights' },
        { name: 'Business Tips', path: '/blog/category/business-tips', description: 'Business strategy articles' },
        { name: 'Digital Marketing', path: '/blog/category/digital-marketing', description: 'Marketing guides and tips' },
        { name: 'Technology', path: '/blog/category/technology', description: 'Tech news and updates' },
        { name: 'Case Studies', path: '/blog/category/case-studies', description: 'Success stories and studies' },
      ]
    },
    {
      title: 'User Account',
      icon: <FaUser className="text-[#52aa4d]" />,
      pages: [
        { name: 'Login', path: '/login', description: 'Access your account' },
        { name: 'Register', path: '/register', description: 'Create new account' },
        { name: 'Profile', path: '/profile', description: 'Your personal profile' },
        { name: 'Dashboard', path: '/dashboard', description: 'User dashboard' },
        { name: 'Settings', path: '/settings', description: 'Account settings' },
      ]
    },
  ];

  // Legal & Policy pages
  const legalSections = [
    {
      title: 'Legal Documents',
      icon: <FaLock className="text-[#52aa4d]" />,
      pages: [
        { name: 'Privacy Policy', path: '/privacy-policy', description: 'How we protect your data' },
        { name: 'Terms & Conditions', path: '/terms-and-conditions', description: 'Website usage terms' },
        { name: 'Disclaimer', path: '/disclaimer', description: 'Legal disclaimers and limitations' },
        { name: 'Cookies Policy', path: '/cookies-policy', description: 'Cookie usage information' },
        { name: 'Acceptable Use Policy', path: '/acceptable-use-policy', description: 'Rules for using our services' },
        { name: 'Affiliate Disclosure', path: '/affiliate-disclosure', description: 'Affiliate relationships disclosure' },
      ]
    },
  ];

  // SEO Metadata
  const seoSections = [
    {
      title: 'SEO Pages',
      icon: <FaSearch className="text-[#52aa4d]" />,
      pages: [
        { name: 'Sitemap (XML)', path: '/sitemap.xml', description: 'XML sitemap for search engines', external: true },
        { name: 'Robots.txt', path: '/robots.txt', description: 'Robots exclusion protocol', external: true },
      ]
    },
  ];

  // Utility pages
  const utilitySections = [
    {
      title: 'Utility Pages',
      icon: <FaCog className="text-[#52aa4d]" />,
      pages: [
        { name: '404 Error', path: '/404', description: 'Page not found' },
        { name: '500 Error', path: '/500', description: 'Server error' },
        { name: 'Maintenance', path: '/maintenance', description: 'Site maintenance page' },
        { name: 'Coming Soon', path: '/coming-soon', description: 'Upcoming features' },
      ]
    },
  ];

  // Downloadable resources
  const resourceSections = [
    {
      title: 'Resources',
      icon: <FaDownload className="text-[#52aa4d]" />,
      pages: [
        { name: 'E-books', path: '/resources/ebooks', description: 'Free e-books and guides' },
        { name: 'Whitepapers', path: '/resources/whitepapers', description: 'Research and whitepapers' },
        { name: 'Checklists', path: '/resources/checklists', description: 'Business checklists' },
        { name: 'Toolkits', path: '/resources/toolkits', description: 'Complete business toolkits' },
      ]
    },
  ];

  // All sections combined for search
  const allSections = [
    ...mainSections,
    ...legalSections,
    ...seoSections,
    ...utilitySections,
    ...resourceSections,
  ];

  // Count total pages
  const totalPages = allSections.reduce((total, section) => total + section.pages.length, 0);

  return (
    <>
      <Head>
        <title>Website Sitemap | {companyInfo.name}</title>
        <meta
          name="description"
          content={`Complete sitemap of ${companyInfo.name} - Navigate through all pages and sections of our website easily.`}
        />
        <meta
          name="keywords"
          content="sitemap, website navigation, site structure, page index, website map, EverestKit pages"
        />
        <meta property="og:title" content={`Website Sitemap | ${companyInfo.name}`} />
        <meta
          property="og:description"
          content={`Explore all pages and sections of ${companyInfo.name} website.`}
        />
        <meta property="og:url" content={`${companyInfo.website}/sitemap`} />
        <meta property="og:image" content={`${companyInfo.website}/og-image.jpg`} />
        <meta name="robots" content="index, follow" />
      </Head>

      <NavBar />

      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <FaSitemap className="text-6xl text-[#25609A] animate-pulse" />
                <div className="absolute -top-2 -right-2 bg-[#52aa4d] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {totalPages}
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#25609A] mb-4 tracking-tight">
              Website Sitemap
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Last Updated: {lastUpdatedDate} • {totalPages} Total Pages
            </p>
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-700 mb-4">
                Welcome to the complete sitemap of {companyInfo.name}. This page provides an organized overview of all pages available on our website. Use this sitemap to navigate through our content easily.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  <FaExternalLinkAlt className="mr-2" /> View XML Sitemap
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-[#52aa4d] text-white rounded-lg hover:bg-[#428a3d] transition-colors duration-300"
                >
                  <FaHome className="mr-2" /> Back to Home
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-[#25609A]">{mainSections.reduce((t, s) => t + s.pages.length, 0)}</div>
              <div className="text-sm text-gray-600">Main Pages</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-[#25609A]">{legalSections.reduce((t, s) => t + s.pages.length, 0)}</div>
              <div className="text-sm text-gray-600">Legal Pages</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-[#25609A]">{resourceSections.reduce((t, s) => t + s.pages.length, 0)}</div>
              <div className="text-sm text-gray-600">Resources</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-[#25609A]">{totalPages}</div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Main Navigation Sections */}
            <section>
              <h2 className="text-3xl font-bold text-[#25609A] mb-8 pb-3 border-b border-gray-300">
                Main Navigation
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {mainSections.map((section, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className="text-2xl mr-3">{section.icon}</div>
                      <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
                      <span className="ml-auto bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                        {section.pages.length} pages
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {section.pages.map((page, pageIdx) => (
                        <li key={pageIdx} className="group">
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center">
                              <FaChevronRight className="text-[#52aa4d] mr-3 text-sm" />
                              <div>
                                <Link
                                  href={page.path}
                                  className="font-medium text-gray-800 group-hover:text-[#25609A] transition-colors"
                                >
                                  {page.name}
                                </Link>
                                <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(page.path)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-[#52aa4d] transition-all duration-200"
                              aria-label={`Copy ${page.name} URL`}
                            >
                              {copiedUrl === page.path ? (
                                <FaCheck className="text-green-500" />
                              ) : (
                                <FaCopy />
                              )}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Legal & Policy Sections */}
            <section>
              <h2 className="text-3xl font-bold text-[#25609A] mb-8 pb-3 border-b border-gray-300">
                Legal & Policy Pages
              </h2>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">{legalSections[0].icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800">{legalSections[0].title}</h3>
                  <span className="ml-auto bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                    Important
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {legalSections[0].pages.map((page, idx) => (
                    <div key={idx} className="group">
                      <div className="border border-gray-200 rounded-xl p-4 hover:border-[#52aa4d] hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <Link
                            href={page.path}
                            className="font-medium text-gray-800 group-hover:text-[#25609A] transition-colors flex items-center"
                          >
                            {idx === 0 && <FaFileContract className="mr-2 text-[#52aa4d]" />}
                            {idx === 1 && <FaFileContract className="mr-2 text-[#52aa4d]" />}
                            {idx === 2 && <FaExclamationTriangle className="mr-2 text-[#52aa4d]" />}
                            {idx === 3 && <FaCookie className="mr-2 text-[#52aa4d]" />}
                            {page.name}
                          </Link>
                          <span className="text-xs text-gray-500">
                            {idx === 0 && '🔒'}
                            {idx === 1 && '📄'}
                            {idx === 2 && '⚠️'}
                            {idx === 3 && '🍪'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{page.description}</p>
                        <button
                          onClick={() => copyToClipboard(page.path)}
                          className="text-xs text-gray-500 hover:text-[#52aa4d] transition-colors flex items-center"
                        >
                          {copiedUrl === page.path ? (
                            <>
                              <FaCheck className="mr-1 text-green-500" /> Copied!
                            </>
                          ) : (
                            <>
                              <FaCopy className="mr-1" /> Copy URL
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Resources Section */}
            <section>
              <h2 className="text-3xl font-bold text-[#25609A] mb-8 pb-3 border-b border-gray-300">
                Resources & Tools
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {resourceSections.map((section, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className="text-2xl mr-3">{section.icon}</div>
                      <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {section.pages.map((page, pageIdx) => (
                        <li key={pageIdx} className="group">
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center">
                              <FaDownload className="text-[#52aa4d] mr-3" />
                              <div>
                                <Link
                                  href={page.path}
                                  className="font-medium text-gray-800 group-hover:text-[#25609A] transition-colors"
                                >
                                  {page.name}
                                </Link>
                                <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                              </div>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Free
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {seoSections.map((section, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className="text-2xl mr-3">{section.icon}</div>
                      <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {section.pages.map((page, pageIdx) => (
                        <li key={pageIdx} className="group">
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center">
                              <FaSearch className="text-[#52aa4d] mr-3" />
                              <div>
                                {page.external ? (
                                  <a
                                    href={page.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-gray-800 group-hover:text-[#25609A] transition-colors flex items-center"
                                  >
                                    {page.name} <FaExternalLinkAlt className="ml-2 text-sm" />
                                  </a>
                                ) : (
                                  <Link
                                    href={page.path}
                                    className="font-medium text-gray-800 group-hover:text-[#25609A] transition-colors"
                                  >
                                    {page.name}
                                  </Link>
                                )}
                                <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Utility Pages */}
            <section>
              <h2 className="text-3xl font-bold text-[#25609A] mb-8 pb-3 border-b border-gray-300">
                Utility & System Pages
              </h2>
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {utilitySections[0].pages.map((page, idx) => (
                    <div key={idx} className="group">
                      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3 group-hover:bg-[#52aa4d] group-hover:text-white transition-colors duration-300">
                          <FaCog />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">{page.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{page.description}</p>
                        <Link
                          href={page.path}
                          className="inline-block text-sm text-[#52aa4d] hover:text-[#428a3d] font-medium"
                        >
                          View Page →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sitemap Info & XML Section */}
          <div className="mt-16 bg-gradient-to-r from-[#25609A] to-[#1a4a7a] rounded-2xl shadow-xl text-white p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">XML Sitemap for Search Engines</h3>
                <p className="mb-4 opacity-90">
                  Our XML sitemap helps search engines like Google, Bing, and Yahoo discover and index all pages on our website efficiently.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <FaCheck className="mr-2 text-[#52aa4d]" />
                    Automatically updated when new pages are added
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="mr-2 text-[#52aa4d]" />
                    Includes page priority and update frequency
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="mr-2 text-[#52aa4d]" />
                    Submitted to Google Search Console
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="mr-2 text-[#52aa4d]" />
                    Compressed for faster loading
                  </li>
                </ul>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-3 bg-white text-[#25609A] font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  <FaExternalLinkAlt className="mr-2" /> View XML Sitemap
                </a>
              </div>
              <div className="bg-white/10 p-6 rounded-xl">
                <h4 className="text-xl font-semibold mb-4">SEO Information</h4>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm opacity-80">Total Pages Indexed</div>
                    <div className="text-2xl font-bold">{totalPages}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Last Updated</div>
                    <div className="text-lg">{lastUpdatedDate}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Sitemap Format</div>
                    <div className="flex items-center space-x-2">
                      <code className="bg-black/20 px-2 py-1 rounded text-sm">XML</code>
                      <code className="bg-black/20 px-2 py-1 rounded text-sm">HTML</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Engine Submission */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-[#25609A] mb-6">Submit to Search Engines</h3>
            <p className="text-gray-700 mb-6">
              You can manually submit our sitemap to major search engines to ensure faster indexing:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-300 rounded-xl p-4 hover:border-[#52aa4d] hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">G</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Google</div>
                    <div className="text-xs text-gray-500">Search Console</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Submit to Google for faster indexing</p>
                <div className="text-[#52aa4d] text-sm font-medium group-hover:underline">
                  Submit Sitemap →
                </div>
              </a>
              <a
                href="https://www.bing.com/webmasters"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-300 rounded-xl p-4 hover:border-[#52aa4d] hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">B</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Bing</div>
                    <div className="text-xs text-gray-500">Webmaster Tools</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Submit to Bing/Yahoo search engines</p>
                <div className="text-[#52aa4d] text-sm font-medium group-hover:underline">
                  Submit Sitemap →
                </div>
              </a>
              <a
                href="https://webmaster.yandex.com"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-300 rounded-xl p-4 hover:border-[#52aa4d] hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-red-600 font-bold">Y</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Yandex</div>
                    <div className="text-xs text-gray-500">Webmaster</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Submit to Yandex search engine</p>
                <div className="text-[#52aa4d] text-sm font-medium group-hover:underline">
                  Submit Sitemap →
                </div>
              </a>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
            <h4 className="text-lg font-semibold text-[#25609A] mb-4">Quick Navigation</h4>
            <div className="flex flex-wrap gap-4">
              {mainSections.flatMap(section => 
                section.pages.slice(0, 2).map((page, idx) => (
                  <Link
                    key={`${section.title}-${idx}`}
                    href={page.path}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-[#52aa4d] hover:text-white transition-colors duration-300 border border-gray-200 hover:border-[#52aa4d]"
                  >
                    {page.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Sitemap;