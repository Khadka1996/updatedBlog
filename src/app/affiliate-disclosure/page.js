// app/affiliate-disclosure/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaHandshake, 
  FaBullhorn, 
  FaShieldAlt, 
  FaLink, 
  FaStar,
  FaQuestionCircle,
  FaEnvelope,
  FaCheck,
  FaSpinner,
  FaTimes,
  FaGoogle,
  FaAmazon,
  FaAdversal,
  FaBalanceScale
} from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

const AffiliateDisclosure = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeHash, setActiveHash] = useState('');
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveHash(window.location.hash);
      setLastUpdatedDate(new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));

      const handleHashChange = () => {
        setActiveHash(window.location.hash);
      };

      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  const companyInfo = {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'EverestKit',
    website: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://everestkit.com',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'mail@everestkit.com',
    affiliateEmail: process.env.NEXT_PUBLIC_AFFILIATE_EMAIL || 'partnerships@everestkit.com',
  };

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: <FaHandshake /> },
    { id: 'free-tools-policy', title: 'Free Tools Policy', icon: <FaShieldAlt /> },
    { id: 'affiliate-programs', title: 'Affiliate Programs', icon: <FaAmazon /> },
    { id: 'advertising-disclosure', title: 'Advertising Disclosure', icon: <FaBullhorn /> },
    { id: 'commission-structure', title: 'Commission Structure', icon: <FaBalanceScale /> },
    { id: 'content-integrity', title: 'Content Integrity', icon: <FaStar /> },
    { id: 'link-disclosure', title: 'Link Disclosure', icon: <FaLink /> },
    { id: 'legal-compliance', title: 'Legal Compliance', icon: <FaShieldAlt /> },
    { id: 'user-impact', title: 'User Impact', icon: <FaShieldAlt /> },
    { id: 'faq', title: 'FAQ', icon: <FaQuestionCircle /> },
    { id: 'contact', title: 'Contact', icon: <FaEnvelope /> },
  ];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.name || formData.name.length < 2) {
      setError('Name must be at least 2 characters long.');
      setIsSubmitting(false);
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.message || formData.message.length < 10) {
      setError('Message must be at least 10 characters long.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, subject: 'Affiliate Disclosure Inquiry' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send message');

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openContactModal = () => {
    setIsModalOpen(true);
    setError(null);
    setSubmitSuccess(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Head>
        <title>Affiliate Disclosure | {companyInfo.name}</title>
        <meta
          name="description"
          content={`Transparent disclosure of affiliate relationships, advertising practices, and how we fund our free tools at ${companyInfo.name}.`}
        />
        <meta
          name="keywords"
          content="affiliate disclosure, advertising disclosure, affiliate links, sponsored content, blog monetization, Nepal affiliate marketing"
        />
        <meta property="og:title" content={`Affiliate Disclosure | ${companyInfo.name}`} />
        <meta
          property="og:description"
          content={`Learn how ${companyInfo.name} maintains transparency in affiliate relationships and advertising.`}
        />
        <meta property="og:url" content={`${companyInfo.website}/affiliate-disclosure`} />
        <meta property="og:image" content={`${companyInfo.website}/og-image.jpg`} />
        <meta name="robots" content="index, follow" />
      </Head>

      <NavBar />

      <div className="bg-gray-100 min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <FaHandshake className="text-5xl text-[#25609A] animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#25609A] mb-4 tracking-tight">
              Affiliate Disclosure
            </h1>
            <p className="text-lg text-gray-600">
              Complete transparency about how we fund our free tools and services
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated: {lastUpdatedDate}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sticky Table of Contents */}
            <div className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-[#25609A] mb-4">Sections</h3>
                <ul className="space-y-3">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="flex items-center text-gray-700 hover:text-[#25609A] transition-colors duration-200"
                        aria-current={activeHash === `#${section.id}` ? 'page' : undefined}
                      >
                        <span className="mr-2 text-[#52aa4d]">{section.icon}</span>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 space-y-8">
              {/* Introduction Section */}
              <div
                id="introduction"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-[#52aa4d]"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaHandshake className="mr-3 text-[#52aa4d]" /> Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  At {companyInfo.name}, we believe in complete transparency. This Affiliate Disclosure 
                  explains how we fund our website, maintain our free tools, and disclose our various 
                  revenue streams.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We provide <strong>100% FREE tools</strong> (PDF utilities, photo editors, converters, etc.) 
                  and generate revenue through affiliate marketing, advertising, and our expert services. 
                  This disclosure complies with FTC guidelines and international advertising standards.
                </p>
              </div>

              {/* Free Tools Policy Section */}
              <div
                id="free-tools-policy"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaShieldAlt className="mr-3 text-[#52aa4d]" /> Our Free Tools Policy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All our utility tools are <strong>completely free with no hidden costs</strong>:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#25609A] mb-2">PDF Tools</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ Merge PDF - No limits</li>
                      <li>✓ Split PDF - 100% free</li>
                      <li>✓ Compress PDF - No watermarks</li>
                      <li>✓ Edit PDF - No registration needed</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#25609A] mb-2">Other Utilities</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ Photo Size Reducer - Unlimited use</li>
                      <li>✓ Photo Cropper - No ads during use</li>
                      <li>✓ Date/Currency Converters</li>
                      <li>✓ Word Counter - Instant results</li>
                    </ul>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  <strong>No commissions or affiliate links are integrated into these free tools.</strong> 
                  They remain free thanks to revenue from other parts of our website.
                </p>
              </div>

              {/* Affiliate Programs Section */}
              <div
                id="affiliate-programs"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaAmazon className="mr-3 text-[#52aa4d]" /> Affiliate Programs We Participate In
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We participate in select affiliate programs to generate revenue that supports our free tools:
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4 py-2">
                    <h3 className="text-lg font-medium text-gray-800">Amazon Associates</h3>
                    <p className="text-gray-600 text-sm">
                      We may earn from qualifying purchases when you click Amazon links in our blog content.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="text-lg font-medium text-gray-800">Digital Product Affiliates</h3>
                    <p className="text-gray-600 text-sm">
                      Software tools, online courses, and digital resources mentioned in our tutorials.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h3 className="text-lg font-medium text-gray-800">Hosting & Service Referrals</h3>
                    <p className="text-gray-600 text-sm">
                      Web hosting, domain registration, and other services recommended in our expert guides.
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mt-4">
                  We only promote products and services we genuinely believe will benefit our users.
                </p>
              </div>

              {/* Advertising Disclosure Section */}
              <div
                id="advertising-disclosure"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaBullhorn className="mr-3 text-[#52aa4d]" /> Advertising & Sponsorship Disclosure
                </h2>

                <h3 className="text-xl font-medium text-[#25609A] mb-3 flex items-center">
                  <FaGoogle className="mr-2" /> Google AdSense
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use Google AdSense to display contextual advertisements. These ads help fund our free 
                  tools. Google uses cookies to serve ads based on user interests and browsing behavior.
                </p>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Sponsored Content</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Occasionally, we publish sponsored articles or reviews. All sponsored content is clearly 
                  labeled with disclosures like Sponsored, Paid Partnership, or #ad.
                </p>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Native Advertising</h3>
                <p className="text-gray-700 leading-relaxed">
                  Some content may be created in partnership with brands. These are always disclosed, and 
                  we maintain editorial control to ensure content quality.
                </p>
              </div>

              {/* Commission Structure Section */}
              <div
                id="commission-structure"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaBalanceScale className="mr-3 text-[#52aa4d]" /> Commission Structure
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Program Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission Model
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Typical Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Amazon Associates
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          Percentage of sale
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          1-10% depending on category
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Digital Products
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          Fixed commission or percentage
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          20-50% of sale
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Service Referrals
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          Fixed bounty or recurring
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          $50-$200 per referral
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-gray-700 leading-relaxed mt-4 text-sm">
                  <strong>Note:</strong> Commissions never affect the price you pay. You pay the same price 
                  whether you use our affiliate link or go directly to the merchant.
                </p>
              </div>

              {/* Content Integrity Section */}
              <div
                id="content-integrity"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaStar className="mr-3 text-[#52aa4d]" /> Our Content Integrity Promise
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">Honest Reviews Only</h4>
                      <p className="text-gray-600 text-sm">
                        We only recommend products/services we&apos;ve tested or genuinely believe in.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">No Pay-to-Play</h4>
                      <p className="text-gray-600 text-sm">
                        We don&apos;t accept payment for positive reviews. All opinions are our own.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">Updated Information</h4>
                      <p className="text-gray-600 text-sm">
                        We regularly review and update our recommendations to ensure accuracy.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">Clear Separation</h4>
                      <p className="text-gray-600 text-sm">
                        Editorial content and sponsored content are clearly distinguished.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Disclosure Section */}
              <div
                id="link-disclosure"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaLink className="mr-3 text-[#52aa4d]" /> How We Disclose Affiliate Links
                </h2>
                
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Our Disclosure Methods:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">#ad</span>
                      <span>For sponsored social media posts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">Affiliate</span>
                      <span>Text label next to affiliate links in articles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-2">Sponsored</span>
                      <span>For paid partnership content</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2">Disclaimer</span>
                      <span>At the beginning/end of articles with affiliate links</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  Every page containing affiliate links includes a clear disclosure statement near the top 
                  or bottom of the content. We comply with FTC guidelines for clear and conspicuous disclosure.
                </p>
              </div>

              {/* Legal Compliance Section */}
              <div
                id="legal-compliance"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">Legal Compliance</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We adhere to multiple legal frameworks:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#25609A] mb-2">FTC Guidelines (USA)</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Clear and conspicuous disclosures</li>
                      <li>• No misleading claims</li>
                      <li>• Truthful endorsement guidelines</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-[#25609A] mb-2">Nepal Regulations</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Electronic Transactions Act compliance</li>
                      <li>• Consumer protection standards</li>
                      <li>• Advertising ethics codes</li>
                    </ul>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  We regularly review our practices to ensure compliance with evolving regulations in all 
                  jurisdictions where our content is accessible.
                </p>
              </div>

              {/* User Impact Section */}
              <div
                id="user-impact"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">How This Affects You</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm">$</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">No Extra Cost</h4>
                      <p className="text-gray-600">
                        You pay the same price whether you use our links or go directly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm">🔒</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">Privacy Protection</h4>
                      <p className="text-gray-600">
                        Your data isn&apos;t shared with affiliates beyond what they collect directly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm">⚡</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">Better Free Tools</h4>
                      <p className="text-gray-600">
                        Affiliate revenue helps us maintain and improve our free utilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div
                id="faq"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaQuestionCircle className="mr-3 text-[#52aa4d]" /> Frequently Asked Questions
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Do affiliate links cost me more money?
                    </h3>
                    <p className="text-gray-600">
                      No. You pay exactly the same price. The merchant pays us a commission from their 
                      marketing budget, not from your purchase price.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Are your free tools really free?
                    </h3>
                    <p className="text-gray-600">
                      Yes! All PDF tools, photo editors, converters, and utilities are 100% free with no 
                      hidden charges, watermarks, or registration requirements.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      How can I tell if a link is an affiliate link?
                    </h3>
                    <p className="text-gray-600">
                      We clearly label affiliate links with text like (affiliate link), #ad, or include 
                      a disclosure statement at the beginning/end of articles.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Can I request removal of affiliate links?
                    </h3>
                    <p className="text-gray-600">
                      While we can&apos;t remove affiliate links from published content (as they fund our free 
                      tools), you can always use ad blockers or go directly to merchants if you prefer not 
                      to use affiliate links.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div
                id="contact"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaEnvelope className="mr-3 text-[#52aa4d]" /> Contact for Affiliate Inquiries
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Have questions about our affiliate relationships or want to partner with us?
                </p>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <p className="text-gray-700">
                    <strong>General Inquiries:</strong> {companyInfo.email}<br />
                    <strong>Affiliate Partnerships:</strong> {companyInfo.affiliateEmail}<br />
                    <strong>Advertising:</strong> ads@{companyInfo.website.replace('https://', '')}
                  </p>
                </div>
                <button
                  onClick={openContactModal}
                  className="px-6 py-3 bg-[#25609A] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors duration-300 flex items-center"
                  aria-label="Open affiliate disclosure inquiry form"
                >
                  <FaEnvelope className="mr-2" /> Send Affiliate Inquiry
                </button>
              </div>

              {/* Related Legal Documents */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-semibold text-[#25609A] mb-3">Related Legal Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Link
                    href="/disclaimer"
                    className="bg-white p-3 rounded-lg hover:shadow-md transition-shadow text-center"
                  >
                    <div className="text-[#52aa4d] text-sm mb-1">Legal Disclaimer</div>
                    <div className="text-xs text-gray-600">Limitations of liability</div>
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className="bg-white p-3 rounded-lg hover:shadow-md transition-shadow text-center"
                  >
                    <div className="text-[#52aa4d] text-sm mb-1">Privacy Policy</div>
                    <div className="text-xs text-gray-600">How we protect your data</div>
                  </Link>
                  <Link
                    href="/terms-and-conditions"
                    className="bg-white p-3 rounded-lg hover:shadow-md transition-shadow text-center"
                  >
                    <div className="text-[#52aa4d] text-sm mb-1">Terms & Conditions</div>
                    <div className="text-xs text-gray-600">Rules for using our site</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div
              className="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300"
              onClick={closeModal}
              aria-hidden="true"
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#25609A]">Affiliate Inquiry</h2>
                  <p className="text-gray-600 mt-2">We&apos;ll respond to your inquiry promptly.</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close affiliate inquiry form"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              {submitSuccess ? (
                <div className="bg-green-50 border border-[#52aa4d] rounded-xl p-6 text-center">
                  <FaCheck className="text-4xl text-[#52aa4d] mb-4 mx-auto" />
                  <h3 className="text-lg font-semibold text-[#25609A] mb-2">Thank You!</h3>
                  <p className="text-gray-700">Your message has been sent successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div
                      className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
                      role="alert"
                      id="form-error"
                    >
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-red-500 mr-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d] transition-colors duration-200"
                      required
                      aria-describedby={error ? 'form-error' : undefined}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d] transition-colors duration-200"
                      required
                      aria-describedby={error ? 'form-error' : undefined}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d] transition-colors duration-200"
                      required
                      aria-describedby={error ? 'form-error' : undefined}
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-3 bg-[#25609A] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors duration-200 flex items-center justify-center ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" /> Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AffiliateDisclosure;