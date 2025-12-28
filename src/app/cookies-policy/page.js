// app/cookies-policy/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaCookie, 
  FaShieldAlt, 
  FaUserLock, 
  FaCog, 
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
  FaQuestionCircle,
  FaEnvelope,
  FaSpinner,
  FaExclamationTriangle,
  FaList
} from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

const CookiesPolicy = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeHash, setActiveHash] = useState('');
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true
  });

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
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Kathmandu, Nepal',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@everestkit.com',
  };

  const sections = [
    { id: 'what-are-cookies', title: 'What Are Cookies?', icon: <FaCookie /> },
    { id: 'how-we-use', title: 'How We Use Cookies', icon: <FaCog /> },
    { id: 'types-cookies', title: 'Types of Cookies We Use', icon: <FaList /> },
    { id: 'third-party', title: 'Third-Party Cookies', icon: <FaShieldAlt /> },
    { id: 'google-adsense', title: 'Google AdSense Cookies', icon: <FaCookie /> },
    { id: 'manage-cookies', title: 'Managing Cookies', icon: <FaUserLock /> },
    { id: 'your-choices', title: 'Your Cookie Choices', icon: <FaCheck /> },
    { id: 'changes', title: 'Changes to Cookie Policy', icon: <FaCog /> },
    { id: 'contact', title: 'Contact Us', icon: <FaQuestionCircle /> },
  ];

  const cookieTypes = [
    {
      id: 'necessary',
      name: 'Strictly Necessary Cookies',
      description: 'Essential for the website to function properly. These cookies enable basic functions like page navigation and access to secure areas.',
      required: true,
      examples: ['Session cookies', 'Security tokens', 'Authentication cookies']
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.',
      required: false,
      examples: ['Language preferences', 'Region settings', 'User interface choices']
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      required: false,
      examples: ['Google Analytics', 'Visitor tracking', 'Page performance']
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to track visitors across websites to display relevant advertisements. These cookies may share information with other organizations.',
      required: false,
      examples: ['Google AdSense', 'Social media pixels', 'Retargeting cookies']
    }
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
        body: JSON.stringify({ ...formData, subject: 'Cookies Policy Inquiry' }),
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

  const handleCookieToggle = (cookieId) => {
    if (cookieId === 'necessary') return; // Can't disable necessary cookies
    setCookiePreferences(prev => ({
      ...prev,
      [cookieId]: !prev[cookieId]
    }));
  };

  const saveCookiePreferences = () => {
    // In a real implementation, save to localStorage and update cookie settings
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
      alert('Cookie preferences saved! These will be applied on your next visit.');
    }
  };

  const clearAllCookies = () => {
    if (typeof window !== 'undefined') {
      // Clear cookies from the current domain
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      localStorage.removeItem('cookiePreferences');
      alert('All cookies cleared! Please refresh the page.');
    }
  };

  return (
    <>
      <Head>
        <title>Cookies Policy | {companyInfo.name}</title>
        <meta
          name="description"
          content={`Learn how ${companyInfo.name} uses cookies to enhance your browsing experience, including Google AdSense cookies and your privacy choices.`}
        />
        <meta
          name="keywords"
          content="cookies policy, cookie consent, Google AdSense cookies, privacy settings, cookie management, data tracking"
        />
        <meta property="og:title" content={`Cookies Policy | ${companyInfo.name}`} />
        <meta
          property="og:description"
          content={`Information about how ${companyInfo.name} uses cookies and tracking technologies on our website.`}
        />
        <meta property="og:url" content={`${companyInfo.website}/cookies-policy`} />
        <meta property="og:image" content={`${companyInfo.website}/og-image.jpg`} />
        <meta name="robots" content="index, follow" />
      </Head>

      <NavBar />

      <div className="bg-gray-100 min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <FaCookie className="text-5xl text-[#25609A] animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#25609A] mb-4 tracking-tight">
              Cookies Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last Updated: {lastUpdatedDate}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sticky Table of Contents */}
            <div className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-[#25609A] mb-4">In This Policy</h3>
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

                {/* Cookie Control Panel */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-[#25609A] mb-3">Cookie Settings</h4>
                  {cookieTypes.map((cookie) => (
                    <div key={cookie.id} className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-gray-700">{cookie.name}</div>
                        <div className="text-xs text-gray-500">{cookie.required ? 'Required' : 'Optional'}</div>
                      </div>
                      <button
                        onClick={() => handleCookieToggle(cookie.id)}
                        disabled={cookie.required}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                          cookiePreferences[cookie.id] ? 'bg-[#52aa4d]' : 'bg-gray-300'
                        } ${cookie.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        aria-label={`Toggle ${cookie.name}`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                            cookiePreferences[cookie.id] ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={saveCookiePreferences}
                    className="mt-3 w-full bg-[#52aa4d] text-white py-2 rounded-lg hover:bg-[#428a3d] transition-colors text-sm"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 space-y-8">
              {/* What Are Cookies? Section */}
              <div
                id="what-are-cookies"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaCookie className="mr-3 text-[#52aa4d]" /> What Are Cookies?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cookies are small text files that are placed on your computer, smartphone, or other device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cookies do lots of different jobs, like letting you navigate between pages efficiently, remembering your preferences, and generally improving the user experience. They can also help ensure that ads you see online are more relevant to you and your interests.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Under the <strong>Electronic Transactions Act, 2063 (2008)</strong> of Nepal and international privacy standards, we are required to inform you about our use of cookies and obtain your consent where applicable.
                </p>
              </div>

              {/* How We Use Cookies Section */}
              <div
                id="how-we-use"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaCog className="mr-3 text-[#52aa4d]" /> How We Use Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies for several important reasons:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li><strong>Essential Operation:</strong> To enable basic functions of the website</li>
                  <li><strong>Performance:</strong> To understand how visitors interact with our website</li>
                  <li><strong>Functionality:</strong> To remember your preferences and settings</li>
                  <li><strong>Personalization:</strong> To provide personalized content and recommendations</li>
                  <li><strong>Advertising:</strong> To show relevant advertisements (with your consent)</li>
                  <li><strong>Security:</strong> To protect against fraud and maintain website security</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Some cookies are essential and cannot be turned off, while others are optional and require your consent. You can manage your cookie preferences at any time.
                </p>
              </div>

              {/* Types of Cookies We Use Section */}
              <div
                id="types-cookies"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaList className="mr-3 text-[#52aa4d]" /> Types of Cookies We Use
                </h2>
                <div className="space-y-6">
                  {cookieTypes.map((cookie) => (
                    <div key={cookie.id} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-[#25609A]">{cookie.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cookie.required 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {cookie.required ? 'Always Active' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{cookie.description}</p>
                      <div className="text-sm text-gray-600">
                        <strong>Examples:</strong> {cookie.examples.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Third-Party Cookies Section */}
              <div
                id="third-party"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaShieldAlt className="mr-3 text-[#52aa4d]" /> Third-Party Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the website, deliver advertisements on and through the website, and so on.
                </p>
                
                <h3 className="text-xl font-medium text-[#25609A] mb-3">What Are Third-Party Cookies?</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Third-party cookies are cookies that are set by a website other than the one you are currently on. For example, we might use Google Analytics to analyze traffic to our website, which sets cookies on your device.
                </p>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Our Third-Party Partners</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-800">Google Analytics</div>
                    <div className="text-sm text-gray-600">Website analytics and traffic measurement</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-800">Social Media Platforms</div>
                    <div className="text-sm text-gray-600">Facebook, Twitter, Instagram integration</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-800">Payment Processors</div>
                    <div className="text-sm text-gray-600">Stripe, PayPal for transactions</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-800">Cloud Services</div>
                    <div className="text-sm text-gray-600">AWS, Cloudflare for performance</div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  These third parties have their own privacy policies and cookie policies. We recommend you review them.
                </p>
              </div>

              {/* Google AdSense Cookies Section */}
              <div
                id="google-adsense"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-[#52aa4d]"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaCookie className="mr-3 text-[#52aa4d]" /> Google AdSense Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads based on a user&apos;s prior visits to our website or other websites.
                </p>

                <div className="bg-blue-50 p-5 rounded-xl mb-4">
                  <h3 className="text-lg font-semibold text-[#25609A] mb-2">How Google AdSense Cookies Work</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>Google uses cookies to make advertising more engaging to users</li>
                    <li>Cookies help show ads that are more relevant to you</li>
                    <li>They help measure the effectiveness of advertisements</li>
                    <li>Cookies prevent you from seeing the same ads repeatedly</li>
                  </ul>
                </div>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Opting Out of Personalized Ads</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may opt out of personalized advertising by visiting{' '}
                  <a 
                    href="https://www.google.com/settings/ads" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#52aa4d] hover:underline font-medium"
                  >
                    Google&apos;s Ads Settings
                  </a>
                  . You can also opt out of third-party vendor use of cookies for personalized advertising by visiting{' '}
                  <a 
                    href="https://www.aboutads.info" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#52aa4d] hover:underline font-medium"
                  >
                    www.aboutads.info
                  </a>.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  <strong>Note:</strong> Opting out of personalized ads does not mean you will not see ads. It means the ads you see may be less relevant to your interests.
                </p>
              </div>

              {/* Managing Cookies Section */}
              <div
                id="manage-cookies"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaUserLock className="mr-3 text-[#52aa4d]" /> Managing Cookies
                </h2>
                
                <h3 className="text-xl font-medium text-[#25609A] mb-3">Browser Settings</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Most web browsers allow you to control cookies through their settings preferences. However, limiting the ability of websites to set cookies may worsen your overall user experience.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-800 mb-2">Google Chrome</div>
                    <div className="text-sm text-gray-600">Settings → Privacy and Security → Cookies</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-800 mb-2">Mozilla Firefox</div>
                    <div className="text-sm text-gray-600">Options → Privacy & Security → Cookies</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-800 mb-2">Safari</div>
                    <div className="text-sm text-gray-600">Preferences → Privacy → Cookies</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-800 mb-2">Microsoft Edge</div>
                    <div className="text-sm text-gray-600">Settings → Cookies and Site Permissions</div>
                  </div>
                </div>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Cookie Management Tools</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can also manage cookies using various browser extensions and privacy tools:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Privacy Badger (Electronic Frontier Foundation)</li>
                  <li>Ghostery</li>
                  <li>uBlock Origin</li>
                  <li>Cookie AutoDelete</li>
                </ul>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={clearAllCookies}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                    aria-label="Clear all cookies"
                  >
                    <FaTrash className="mr-2" /> Clear All Cookies
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                    aria-label="Refresh page"
                  >
                    <FaEye className="mr-2" /> Refresh Page
                  </button>
                </div>
              </div>

              {/* Your Cookie Choices Section */}
              <div
                id="your-choices"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaCheck className="mr-3 text-[#52aa4d]" /> Your Cookie Choices
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have several options to manage cookies on our website:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <FaCheck className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Accept All Cookies</h4>
                      <p className="text-sm text-gray-600">Allow all cookies for the best user experience</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                      <FaCog className="text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Customize Settings</h4>
                      <p className="text-sm text-gray-600">Choose which types of cookies to allow</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-red-100 p-2 rounded-lg mr-3">
                      <FaTimes className="text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Reject Non-Essential Cookies</h4>
                      <p className="text-sm text-gray-600">Only allow cookies necessary for website function</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    <FaExclamationTriangle className="inline mr-2 text-yellow-500" />
                    <strong>Important:</strong> Blocking all cookies may affect the functionality of our website. Some features may not work properly without cookies.
                  </p>
                </div>
              </div>

              {/* Changes to Cookie Policy Section */}
              <div
                id="changes"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaCog className="mr-3 text-[#52aa4d]" /> Changes to Cookie Policy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. We will notify you of any material changes by posting the new Cookie Policy on this page.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We will update the &quot;Last Updated&quot; date at the top of this Cookie Policy when we make changes. We encourage you to review this Cookie Policy periodically to stay informed about how we are using cookies.
                </p>
              </div>

              {/* Contact Section */}
              <div
                id="contact"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaQuestionCircle className="mr-3 text-[#52aa4d]" /> Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <p className="text-gray-700">
                    <strong>Email:</strong> {companyInfo.email}<br />
                    <strong>Address:</strong> {companyInfo.address}
                  </p>
                </div>
                <button
                  onClick={openContactModal}
                  className="px-6 py-3 bg-[#25609A] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors duration-300 flex items-center"
                  aria-label="Open cookies policy inquiry form"
                >
                  <FaEnvelope className="mr-2" /> Contact About Cookies
                </button>
              </div>

              {/* Mobile Cookie Control Panel */}
              <div className="lg:hidden bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-[#25609A] mb-4">Cookie Settings</h3>
                {cookieTypes.map((cookie) => (
                  <div key={cookie.id} className="flex items-center justify-between mb-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{cookie.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{cookie.description.substring(0, 80)}...</div>
                    </div>
                    <button
                      onClick={() => handleCookieToggle(cookie.id)}
                      disabled={cookie.required}
                      className={`w-12 h-6 flex items-center rounded-full p-1 ml-3 ${
                        cookiePreferences[cookie.id] ? 'bg-[#52aa4d]' : 'bg-gray-300'
                      } ${cookie.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                          cookiePreferences[cookie.id] ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={saveCookiePreferences}
                    className="flex-1 bg-[#52aa4d] text-white py-2 rounded-lg hover:bg-[#428a3d] transition-colors"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={clearAllCookies}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Cookies
                  </button>
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
                  <h2 className="text-2xl font-bold text-[#25609A]">Cookies Inquiry</h2>
                  <p className="text-gray-600 mt-2">We&apos;ll respond to your inquiry promptly.</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close cookies inquiry form"
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

export default CookiesPolicy;