'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaFileContract, 
  FaUserCheck, 
  FaShieldAlt, 
  FaGavel, 
  FaBalanceScale,
  FaExclamationTriangle,
  FaHandshake,
  FaBook,
  FaEnvelope,
  FaQuestionCircle,
  FaCheck,
  FaSpinner,
  FaTimes
} from 'react-icons/fa';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

const TermsAndConditions = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeHash, setActiveHash] = useState('');
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);

  // Initialize states on client side
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
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'admin@everestkit.com',
    legalEmail: process.env.NEXT_PUBLIC_LEGAL_EMAIL || 'admin@everestkit.com',
  };

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: <FaUserCheck /> },
    { id: 'services', title: 'Our Services', icon: <FaHandshake /> },
    { id: 'user-accounts', title: 'User Accounts', icon: <FaShieldAlt /> },
    { id: 'content-ownership', title: 'Content Ownership & Intellectual Property', icon: <FaBook /> },
    { id: 'user-responsibilities', title: 'User Responsibilities', icon: <FaGavel /> },
    { id: 'prohibited-activities', title: 'Prohibited Activities', icon: <FaExclamationTriangle /> },
    { id: 'google-adsense', title: 'Google AdSense & Third-Party Services', icon: <FaShieldAlt /> },
    { id: 'termination', title: 'Termination', icon: <FaTimes /> },
    { id: 'limitation-liability', title: 'Limitation of Liability', icon: <FaBalanceScale /> },
    { id: 'disclaimer', title: 'Disclaimer', icon: <FaExclamationTriangle /> },
    { id: 'governing-law', title: 'Governing Law (Nepal)', icon: <FaGavel /> },
    { id: 'changes', title: 'Changes to Terms', icon: <FaFileContract /> },
    { id: 'contact', title: 'Contact Information', icon: <FaQuestionCircle /> },
  ];

  // Handle form operations (same as privacy policy)
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
        body: JSON.stringify({ ...formData, subject: 'Terms and Conditions Inquiry' }),
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

  const handleAgreement = () => {
    setHasAgreed(!hasAgreed);
    // Store agreement in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('termsAgreed', 'true');
    }
  };

  return (
    <>
      <Head>
        <title>Terms and Conditions | {companyInfo.name}</title>
        <meta
          name="description"
          content={`Terms and Conditions governing the use of ${companyInfo.name}'s services, including Google AdSense compliance, user responsibilities, and legal terms under Nepal's jurisdiction.`}
        />
        <meta
          name="keywords"
          content="terms and conditions, user agreement, legal terms, Nepal law, Google AdSense compliance, website terms, service agreement"
        />
        <meta property="og:title" content={`Terms and Conditions | ${companyInfo.name}`} />
        <meta
          property="og:description"
          content={`Legal terms governing your use of ${companyInfo.name}'s services and compliance requirements.`}
        />
        <meta property="og:url" content={`${companyInfo.website}/terms-and-conditions`} />
        <meta property="og:image" content={`${companyInfo.website}/og-image.jpg`} />
      </Head>

      <NavBar />

      <div className="bg-gray-100 min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <FaFileContract className="text-5xl text-[#25609A] animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#25609A] mb-4 tracking-tight">
              Terms and Conditions
            </h1>
            <p className="text-lg text-gray-600">
              Last Updated: {lastUpdatedDate}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sticky Table of Contents */}
            <div className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-[#25609A] mb-4">In This Document</h3>
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
                
                {/* Agreement Checkbox */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={hasAgreed}
                      onChange={handleAgreement}
                      className="mt-1 text-[#52aa4d] focus:ring-[#52aa4d]"
                    />
                    <span className="text-sm text-gray-700">
                      I have read and agree to these Terms and Conditions
                    </span>
                  </label>
                  <button
                    onClick={() => router.back()}
                    className="mt-4 w-full bg-[#52aa4d] text-white py-2 rounded-lg hover:bg-[#428a3d] transition-colors"
                  >
                    Continue to Site
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 space-y-8">
              {/* Acceptance of Terms Section */}
              <div
                id="acceptance"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaUserCheck className="mr-3 text-[#52aa4d]" /> Acceptance of Terms
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By accessing and using {companyInfo.website} (&quot;the Website&quot;) operated by {companyInfo.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you disagree with any part of these Terms, you must not use our Website.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  These Terms constitute a legally binding agreement between you and {companyInfo.name} under the laws of Nepal. Your continued use of the Website constitutes acceptance of any modifications to these Terms.
                </p>
              </div>

              {/* Our Services Section */}
              <div
                id="services"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaHandshake className="mr-3 text-[#52aa4d]" /> Our Services
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {companyInfo.name} provides digital tools, business resources, educational content, and online services (&quot;Services&quot;) through our Website. We reserve the right to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Modify, suspend, or discontinue any Service at any time</li>
                  <li>Limit access to certain features or content</li>
                  <li>Update, change, or remove content without notice</li>
                  <li>Charge fees for previously free services with advance notice</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  All Services are provided &quot;as is&quot; without warranties of any kind, express or implied.
                </p>
              </div>

              {/* User Accounts Section */}
              <div
                id="user-accounts"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaShieldAlt className="mr-3 text-[#52aa4d]" /> User Accounts
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Immediately notifying us of any unauthorized use of your account</li>
                  <li>Ensuring you log out at the end of each session</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.
                </p>
              </div>

              {/* Content Ownership Section */}
              <div
                id="content-ownership"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaBook className="mr-3 text-[#52aa4d]" /> Content Ownership & Intellectual Property
                </h2>
                <h3 className="text-xl font-medium text-[#25609A] mb-3">Our Content</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All content on this Website, including text, graphics, logos, images, software, and code, is the property of {companyInfo.name} or its content suppliers and is protected by copyright and intellectual property laws of Nepal and international treaties.
                </p>
                
                <h3 className="text-xl font-medium text-[#25609A] mb-3">Your Content</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By submitting content to our Website, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, publish, and distribute your content in connection with our Services.
                </p>
                
                <h3 className="text-xl font-medium text-[#25609A] mb-3">Third-Party Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may display content from third parties, including advertisements. We are not responsible for the accuracy or legality of third-party content.
                </p>
              </div>

              {/* User Responsibilities Section */}
              <div
                id="user-responsibilities"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaGavel className="mr-3 text-[#52aa4d]" /> User Responsibilities
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree to use our Services responsibly and in compliance with all applicable laws, including:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>The Electronic Transactions Act, 2063 (2008) of Nepal</li>
                  <li>The Individual Privacy Act, 2018 of Nepal</li>
                  <li>Copyright and intellectual property laws</li>
                  <li>Export control laws and regulations</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You are solely responsible for any content you post and any consequences thereof.
                </p>
              </div>

              {/* Prohibited Activities Section */}
              <div
                id="prohibited-activities"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaExclamationTriangle className="mr-3 text-[#52aa4d]" /> Prohibited Activities
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may not use our Services to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Violate any local, national, or international law or regulation</li>
                  <li>Infringe upon intellectual property rights</li>
                  <li>Harass, abuse, or harm another person</li>
                  <li>Submit false or misleading information</li>
                  <li>Transmit viruses or malicious code</li>
                  <li>Collect or track personal information of others</li>
                  <li>Spam or send unsolicited communications</li>
                  <li>Interfere with or disrupt our Services or servers</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Engage in any fraudulent activity</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Violation of these prohibitions may result in termination of your access and legal action under Nepalese law.
                </p>
              </div>

              {/* Google AdSense Section (CRITICAL FOR ADSENSE) */}
              <div
                id="google-adsense"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-[#52aa4d]"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaShieldAlt className="mr-3 text-[#52aa4d]" /> Google AdSense & Third-Party Services
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our Website uses Google AdSense to display advertisements. By using our Website, you acknowledge and agree to the following:
                </p>
                
                <h3 className="text-xl font-medium text-[#25609A] mb-3">AdSense Compliance</h3>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>We comply with Google AdSense Program Policies</li>
                  <li>Advertisements are served by Google and third-party vendors</li>
                  <li>We use cookies to serve ads based on user visits</li>
                  <li>Users may opt out of personalized advertising by visiting Google&apos;s Ads Settings</li>
                  <li>We are not responsible for ad content, claims, or offers</li>
                </ul>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Third-Party Links & Services</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our Website may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
                </p>
              </div>

              {/* Termination Section */}
              <div
                id="termination"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaTimes className="mr-3 text-[#52aa4d]" /> Termination
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may terminate or suspend your account and access to our Services immediately, without prior notice or liability, for any reason, including but not limited to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Breach of these Terms</li>
                  <li>Violation of applicable laws</li>
                  <li>Requests by law enforcement or government agencies</li>
                  <li>Technical or security issues</li>
                  <li>Extended periods of inactivity</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, your right to use our Services will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive.
                </p>
              </div>

              {/* Limitation of Liability Section */}
              <div
                id="limitation-liability"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaBalanceScale className="mr-3 text-[#52aa4d]" /> Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To the maximum extent permitted by applicable law in Nepal, {companyInfo.name} shall not be liable for:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                  <li>Damages resulting from your access to or use of our Services</li>
                  <li>Unauthorized access to or alteration of your transmissions or data</li>
                  <li>Statements or conduct of any third party on our Services</li>
                  <li>Any other matter relating to our Services</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Our total liability shall not exceed the amount you have paid us in the last six months, or NPR 1000, whichever is greater.
                </p>
              </div>

              {/* Disclaimer Section */}
              <div
                id="disclaimer"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaExclamationTriangle className="mr-3 text-[#52aa4d]" /> Disclaimer
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>No Warranties:</strong> Our Services are provided &quot;as is&quot; and &quot;as available&quot; without any warranties, express or implied. We do not warrant that:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Our Services will be uninterrupted, timely, secure, or error-free</li>
                  <li>The results obtained from using our Services will be accurate or reliable</li>
                  <li>The quality of any products, services, information, or content will meet your expectations</li>
                  <li>Any errors will be corrected</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Professional Advice Disclaimer:</strong> Content on our Website is for informational purposes only and should not be considered professional advice. Always seek the advice of qualified professionals.
                </p>
              </div>

              {/* Governing Law Section */}
              <div
                id="governing-law"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaGavel className="mr-3 text-[#52aa4d]" /> Governing Law (Nepal)
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms shall be governed and construed in accordance with the laws of Nepal, without regard to its conflict of law provisions. You agree to submit to the exclusive jurisdiction of the courts located in Kathmandu, Nepal for the resolution of any disputes.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  These Terms are subject to the following Nepalese laws:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>Contract Act, 2056 (2000)</li>
                  <li>Electronic Transactions Act, 2063 (2008)</li>
                  <li>Individual Privacy Act, 2018</li>
                  <li>Copyright Act, 2059 (2002)</li>
                </ul>
              </div>

              {/* Changes to Terms Section */}
              <div
                id="changes"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaFileContract className="mr-3 text-[#52aa4d]" /> Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. Your continued use of our Services after any changes constitutes acceptance of the new Terms.
                </p>
              </div>

              {/* Contact Information Section */}
              <div
                id="contact"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaQuestionCircle className="mr-3 text-[#52aa4d]" /> Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For questions or concerns about these Terms and Conditions, please contact us at:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <p className="text-gray-700">
                    <strong>Legal Department:</strong> {companyInfo.legalEmail}<br />
                    <strong>General Inquiries:</strong> {companyInfo.email}<br />
                    <strong>Address:</strong> {companyInfo.address}
                  </p>
                  {companyInfo.phone && (
                    <p className="text-gray-700 mt-2">
                      <strong>Phone:</strong> {companyInfo.phone}
                    </p>
                  )}
                </div>
                <button
                  onClick={openContactModal}
                  className="px-6 py-3 bg-[#25609A] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors duration-300 flex items-center"
                  aria-label="Open terms inquiry form"
                >
                  <FaEnvelope className="mr-2" /> Contact Legal Department
                </button>
              </div>

              {/* Mobile Agreement Section */}
              <div className="lg:hidden bg-white p-6 rounded-2xl shadow-lg mt-8">
                <h3 className="text-xl font-semibold text-[#25609A] mb-4">Agreement</h3>
                <label className="flex items-start space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={hasAgreed}
                    onChange={handleAgreement}
                    className="mt-1 text-[#52aa4d] focus:ring-[#52aa4d]"
                  />
                  <span className="text-gray-700">
                    I have read, understood, and agree to be bound by these Terms and Conditions.
                  </span>
                </label>
                <button
                  onClick={() => router.back()}
                  className="w-full bg-[#52aa4d] text-white py-3 rounded-lg hover:bg-[#428a3d] transition-colors font-medium"
                >
                  Continue to Website
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal (same as privacy policy) */}
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
                  <h2 className="text-2xl font-bold text-[#25609A]">Legal Inquiry</h2>
                  <p className="text-gray-600 mt-2">Contact our legal department</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close legal inquiry form"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              {submitSuccess ? (
                <div className="bg-green-50 border border-[#52aa4d] rounded-xl p-6 text-center">
                  <FaCheck className="text-4xl text-[#52aa4d] mb-4 mx-auto" />
                  <h3 className="text-lg font-semibold text-[#25609A] mb-2">Message Sent</h3>
                  <p className="text-gray-700">We&apos;ll respond to your legal inquiry promptly.</p>
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
                      Full Name
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
                      Email Address
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
                      Your Legal Inquiry
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
                        'Send Inquiry'
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

export default TermsAndConditions;