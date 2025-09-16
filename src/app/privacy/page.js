'use client';

import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaUserLock, FaCookie, FaQuestionCircle, FaEnvelope, FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

const PrivacyPolicy = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeHash, setActiveHash] = useState('');
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');

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
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'mail@everestkit.com',
  };

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: <FaUserLock /> },
    { id: 'information-we-collect', title: 'Information We Collect', icon: <FaShieldAlt /> },
    { id: 'use-of-information', title: 'Use of Your Information', icon: <FaShieldAlt /> },
    { id: 'disclosure', title: 'Disclosure of Your Information', icon: <FaShieldAlt /> },
    { id: 'data-protection', title: 'Data Protection in Nepal', icon: <FaShieldAlt /> },
    { id: 'your-rights', title: 'Your Privacy Rights', icon: <FaShieldAlt /> },
    { id: 'security', title: 'Security of Your Information', icon: <FaShieldAlt /> },
    { id: 'children-privacy', title: 'Childrens Privacy', icon: <FaShieldAlt /> },
    { id: 'changes', title: 'Changes to This Privacy Policy', icon: <FaShieldAlt /> },
    { id: 'contact', title: 'Contact Us', icon: <FaQuestionCircle /> },
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

    // Basic client-side validation
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
        body: JSON.stringify({ ...formData, subject: 'Privacy Policy Inquiry' }),
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
      setError(err.message || 'Something went wrong. Please try again later or contact us directly at ' + companyInfo.email);
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
        <title>Privacy Policy | {companyInfo.name}</title>
        <meta
          name="description"
          content={`Learn how ${companyInfo.name} protects your privacy in compliance with Nepal's Individual Privacy Act, 2018, and the Constitution of Nepal.`}
        />
        <meta
          name="keywords"
          content="privacy policy, data protection, Nepal cyber law, Individual Privacy Act, Electronic Transactions Act, personal information"
        />
        <meta property="og:title" content={`Privacy Policy | ${companyInfo.name}`} />
        <meta
          property="og:description"
          content={`Understand ${companyInfo.name}'s commitment to protecting your personal information under Nepal's legal framework.`}
        />
        <meta property="og:url" content={`${companyInfo.website}/privacy-policy`} />
        <meta property="og:image" content={`${companyInfo.website}/og-image.jpg`} />
      </Head>

      <NavBar />

      <div className="bg-gray-100 min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <FaShieldAlt className="text-5xl text-[#25609A] animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#25609A] mb-4 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last Updated: {lastUpdatedDate}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sticky Table of Contents (Desktop) */}
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
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 space-y-8">
              {/* Introduction Section */}
              <div
                id="introduction"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaUserLock className="mr-3 text-[#52aa4d]" /> Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  At {companyInfo.name}, we are committed to protecting your privacy in accordance with the{' '}
                  <strong>Individual Privacy Act, 2018</strong>, the{' '}
                  <strong>Electronic Transactions Act, 2063 (2008)</strong>, and{' '}
                  <strong>Article 28 of the Constitution of Nepal</strong>, which guarantees your right to
                  privacy of body, residence, property, documents, data, correspondence, and character. This
                  Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                  you visit our website {companyInfo.website} or use our services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By accessing our site or services, you agree to this Privacy Policy. If you do not agree,
                  please do not use our services.
                </p>
              </div>

              {/* Information We Collect Section */}
              <div
                id="information-we-collect"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">Information We Collect</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Under the <strong>Individual Privacy Act, 2018</strong>, we collect personal information
                  only with your explicit consent or as permitted by law. We may collect:
                </p>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Personal Data</h3>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>Name, email address, phone number, and postal address</li>
                  <li>Demographic information (e.g., age, gender, location)</li>
                  <li>Payment details for transactions</li>
                  <li>Account credentials for our services</li>
                </ul>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Derivative Data</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Automatically collected data, such as IP address, browser type, operating system, access
                  times, and pages viewed, as permitted under the{' '}
                  <strong>Electronic Transactions Act, 2063</strong>.
                </p>

                <h3 className="text-xl font-medium text-[#25609A] mb-3 flex items-center">
                  <FaCookie className="mr-3 text-[#52aa4d]" /> Cookies and Tracking Technologies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar technologies to enhance user experience and analyze traffic.
                  We obtain your consent for non-essential cookies as required by law. You may disable
                  cookies in your browser, but this may limit site functionality.
                </p>
              </div>

              {/* Use of Information Section */}
              <div
                id="use-of-information"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">Use of Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use your information for purposes disclosed at the time of collection, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Providing and improving our services</li>
                  <li>Personalizing user experience</li>
                  <li>Processing transactions and sending confirmations</li>
                  <li>Communicating updates, promotions, or support messages with your consent</li>
                  <li>Ensuring compliance with legal obligations</li>
                  <li>Preventing fraud and enhancing security</li>
                </ul>
              </div>

              {/* Disclosure Section */}
              <div
                id="disclosure"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">Disclosure of Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We disclose your information only with your consent or as permitted by law:
                </p>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Service Providers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We share data with third-party vendors (e.g., payment processors, hosting services) who
                  comply with Nepal's privacy laws and are contractually obligated to protect your data.
                </p>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Legal Requirements</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may disclose information to comply with court orders, investigations, or legal
                  obligations under Nepalese law.
                </p>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Business Transfers</h3>
                <p className="text-gray-700 leading-relaxed">
                  In case of a merger, acquisition, or asset sale, your information may be transferred, with
                  safeguards to protect your privacy.
                </p>
              </div>

              {/* Data Protection Section */}
              <div
                id="data-protection"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">Data Protection in Nepal</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As per the <strong>Individual Privacy Act, 2018</strong>, we:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Collect personal data only with your informed consent, specifying the purpose.</li>
                  <li>Prohibit unauthorized access, processing, or disclosure of your data.</li>
                  <li>Ensure data is used only for the intended purpose and protected against breaches.</li>
                  <li>
                    Note that Nepal lacks a central data protection authority; complaints must be filed with
                    district courts within three months of a violation, as per Section 29.
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Under the <strong>Electronic Transactions Act, 2063</strong>, unauthorized access or
                  alteration of data is a cybercrime, punishable by fines up to NPR 100,000 or imprisonment
                  up to two years (Section 47).
                </p>
              </div>

              {/* Your Rights Section */}
              <div
                id="your-rights"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">Your Privacy Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Under the <strong>Individual Privacy Act, 2018</strong> and{' '}
                  <strong>Article 28 of the Constitution of Nepal</strong>, you have the following rights:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Right to be informed about the use of your personal data.</li>
                  <li>Right to access your personal data held by us.</li>
                  <li>Right to correct inaccurate or incomplete data.</li>
                  <li>Right to seek legal recourse for unauthorized data use or breaches.</li>
                  <li>
                    Right to privacy of your body, residence, property, documents, data, correspondence, and
                    character.
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise these rights, contact us as outlined in the "Contact Us" section. Complaints
                  regarding data misuse can be filed with the district court within three months, as per
                  Section 29 of the Individual Privacy Act, 2018.
                </p>
              </div>

              {/* Security Section */}
              <div
                id="security"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">Security of Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement technical and organizational measures, such as encryption, access controls,
                  and secure storage, to protect your data as required by the{' '}
                  <strong>Individual Privacy Act, 2018</strong>. However, no system is completely secure,
                  and you are responsible for safeguarding your account credentials.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Unauthorized access or data breaches are subject to penalties under the{' '}
                  <strong>Electronic Transactions Act, 2063</strong>, including fines up to NPR 100,000 or
                  imprisonment up to two years (Section 47).
                </p>
              </div>

              {/* Children's Privacy Section */}
              <div
                id="children-privacy"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are not intended for children under 16, as per the{' '}
                  <strong>Individual Privacy Act, 2018</strong>. We do not knowingly collect personal data
                  from children under 16. If such data is collected inadvertently, we will delete it
                  immediately upon discovery.
                </p>
              </div>

              {/* Changes Section */}
              <div
                id="changes"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">Changes to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy to reflect changes in our practices or legal
                  requirements. Updates will be posted on this page with a revised "Last Updated" date. We
                  encourage you to review this policy periodically.
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
                  For questions or concerns about this Privacy Policy or to exercise your rights, please
                  contact us at:
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  <span className="font-medium">Email:</span> {companyInfo.email}<br />
                  <span className="font-medium">Address:</span> {companyInfo.address}<br />
                  {companyInfo.phone && (
                    <>
                      <span className="font-medium">Phone:</span> {companyInfo.phone}
                    </>
                  )}
                </p>
                <button
                  onClick={openContactModal}
                  className="px-6 py-3 bg-[#25609A] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors duration-300 flex items-center"
                  aria-label="Open privacy inquiry form"
                >
                  <FaEnvelope className="mr-2" /> Send a Privacy Inquiry
                </button>
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
                  <h2 className="text-2xl font-bold text-[#25609A]">Privacy Inquiry</h2>
                  <p className="text-gray-600 mt-2">We'll respond to your inquiry promptly.</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close privacy inquiry form"
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

export default PrivacyPolicy;