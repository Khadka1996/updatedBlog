// app/acceptable-use-policy/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, 
  FaBan, 
  FaExclamationTriangle, 
  FaGavel, 
  FaUserCheck,
  FaQuestionCircle,
  FaEnvelope,
  FaCheck,
  FaSpinner,
  FaTimes,
  FaTools,
  FaFilePdf,
  FaGlobe,
  FaUsers,
  FaChartLine
} from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

const AcceptableUsePolicy = () => {
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
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@everestkit.com',
    legalEmail: process.env.NEXT_PUBLIC_LEGAL_EMAIL || 'legal@everestkit.com',
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Kathmandu, Nepal',
  };

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: <FaShieldAlt /> },
    { id: 'free-tools-usage', title: 'Free Tools Usage', icon: <FaTools /> },
    { id: 'acceptable-behavior', title: 'Acceptable Behavior', icon: <FaUserCheck /> },
    { id: 'prohibited-uses', title: 'Prohibited Uses', icon: <FaBan /> },
    { id: 'content-restrictions', title: 'Content Restrictions', icon: <FaFilePdf /> },
    { id: 'system-security', title: 'System Security', icon: <FaShieldAlt /> },
    { id: 'commercial-use', title: 'Commercial & Business Use', icon: <FaChartLine /> },
    { id: 'user-responsibilities', title: 'User Responsibilities', icon: <FaUsers /> },
    { id: 'enforcement', title: 'Policy Enforcement', icon: <FaGavel /> },
    { id: 'legal-compliance', title: 'Legal Compliance', icon: <FaGavel /> },
    { id: 'changes', title: 'Changes to Policy', icon: <FaExclamationTriangle /> },
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
        body: JSON.stringify({ ...formData, subject: 'Acceptable Use Policy Inquiry' }),
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
        <title>Acceptable Use Policy | {companyInfo.name}</title>
        <meta
          name="description"
          content={`Rules and guidelines for using ${companyInfo.name}'s free tools, services, and website in compliance with Nepal's Electronic Transactions Act.`}
        />
        <meta
          name="keywords"
          content="acceptable use policy, terms of use, website usage rules, Nepal cyber law, Electronic Transactions Act, prohibited activities"
        />
        <meta property="og:title" content={`Acceptable Use Policy | ${companyInfo.name}`} />
        <meta
          property="og:description"
          content={`Learn the rules for using ${companyInfo.name}'s free tools and services responsibly.`}
        />
        <meta property="og:url" content={`${companyInfo.website}/acceptable-use-policy`} />
        <meta property="og:image" content={`${companyInfo.website}/og-image.jpg`} />
        <meta name="robots" content="index, follow" />
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
              Acceptable Use Policy
            </h1>
            <p className="text-lg text-gray-600">
              Guidelines for responsible use of our free tools and services
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
                  <FaShieldAlt className="mr-3 text-[#52aa4d]" /> Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This Acceptable Use Policy (AUP) governs your use of {companyInfo.name}&apos;s website 
                  ({companyInfo.website}) and all related services, including our free PDF tools, photo 
                  editors, converters, and other utilities. By accessing or using our services, you agree 
                  to comply with this policy and all applicable laws.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This policy is designed to ensure the security, reliability, and integrity of our services 
                  while protecting our users and infrastructure. Violations may result in suspension or 
                  termination of access, and may be reported to relevant authorities under Nepal&apos;s 
                  <strong> Electronic Transactions Act, 2063 (2008)</strong>.
                </p>
              </div>

              {/* Free Tools Usage Section */}
              <div
                id="free-tools-usage"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaTools className="mr-3 text-[#52aa4d]" /> Free Tools Usage Guidelines
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-[#25609A] mb-2">Permitted Usage</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Personal, educational, and non-commercial use of all free tools</li>
                      <li>Reasonable file processing for individual needs</li>
                      <li>Testing and evaluation for personal projects</li>
                      <li>Educational demonstrations and learning purposes</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-[#25609A] mb-2">Usage Limitations</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Maximum file size: 100MB per upload (subject to change)</li>
                      <li>Maximum files per session: 20 files (for batch operations)</li>
                      <li>Rate limits: 100 operations per hour per IP address</li>
                      <li>Concurrent sessions: 3 active sessions per user</li>
                    </ul>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mt-4">
                  These limits ensure fair access for all users and prevent system abuse. We reserve the 
                  right to adjust limits based on system capacity and usage patterns.
                </p>
              </div>

              {/* Acceptable Behavior Section */}
              <div
                id="acceptable-behavior"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaUserCheck className="mr-3 text-[#52aa4d]" /> Acceptable Behavior
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <span className="text-green-600">✓</span>
                      </div>
                      <h4 className="font-medium text-gray-800">Respectful Use</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Use tools as intended without attempting to bypass limitations
                    </p>
                  </div>

                  <div className="bg-white border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <span className="text-green-600">✓</span>
                      </div>
                      <h4 className="font-medium text-gray-800">Legal Compliance</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Use tools only for lawful purposes and content you have rights to
                    </p>
                  </div>

                  <div className="bg-white border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <span className="text-green-600">✓</span>
                      </div>
                      <h4 className="font-medium text-gray-800">System Protection</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Avoid actions that could harm our infrastructure or other users
                    </p>
                  </div>

                  <div className="bg-white border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <span className="text-green-600">✓</span>
                      </div>
                      <h4 className="font-medium text-gray-800">Privacy Respect</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Respect others&apos; privacy and don&apos;t attempt to access unauthorized data
                    </p>
                  </div>
                </div>
              </div>

              {/* Prohibited Uses Section */}
              <div
                id="prohibited-uses"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-500"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaBan className="mr-3 text-red-500" /> Prohibited Uses
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium text-[#25609A] mb-3">System Abuse</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        <strong>Automated Access:</strong> Using bots, scrapers, or automated tools to 
                        access our services without permission
                      </li>
                      <li>
                        <strong>Denial of Service:</strong> Attempting to overload or disrupt our services
                      </li>
                      <li>
                        <strong>Reverse Engineering:</strong> Attempting to decompile, disassemble, or 
                        reverse engineer any aspect of our services
                      </li>
                      <li>
                        <strong>Circumvention:</strong> Attempting to bypass security measures or access 
                        restricted areas
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-[#25609A] mb-3">Illegal Activities</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Processing illegal, stolen, or unauthorized content</li>
                      <li>Violating intellectual property rights</li>
                      <li>Distributing malware, viruses, or harmful code</li>
                      <li>Engaging in fraud, phishing, or identity theft</li>
                      <li>Violating Nepal&apos;s <strong>Electronic Transactions Act</strong> or other laws</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-[#25609A] mb-3">Content Violations</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Processing obscene, pornographic, or sexually explicit material</li>
                      <li>Content promoting violence, hate speech, or discrimination</li>
                      <li>Harassing, threatening, or defamatory content</li>
                      <li>Content violating others&apos; privacy or confidentiality</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Content Restrictions Section */}
              <div
                id="content-restrictions"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaFilePdf className="mr-3 text-[#52aa4d]" /> Content Restrictions for Tools
                </h2>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  When using our PDF and image processing tools, you are responsible for ensuring your 
                  content complies with these restrictions:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800">Copyrighted Material</h4>
                      <p className="text-gray-600 text-sm">
                        Only process content you own or have explicit permission to use. We respond to 
                        valid DMCA takedown notices.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800">Sensitive Information</h4>
                      <p className="text-gray-600 text-sm">
                        Do not upload documents containing sensitive personal information (SSN, credit 
                        card numbers, passwords) without proper encryption.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800">Malicious Content</h4>
                      <p className="text-gray-600 text-sm">
                        Files containing viruses, malware, or scripts designed to harm systems are strictly 
                        prohibited and will result in immediate account termination.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mt-4">
                  We automatically scan uploaded files for viruses and malware. Suspicious files may be 
                  quarantined and reported to authorities.
                </p>
              </div>

              {/* System Security Section */}
              <div
                id="system-security"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">System Security Requirements</h2>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                  <p className="text-gray-700">
                    <strong>Warning:</strong> Attempting to compromise our system security violates 
                    Nepal&apos;s <strong>Electronic Transactions Act, 2063</strong> and may result in 
                    criminal prosecution under Section 47 (Cybercrime provisions).
                  </p>
                </div>

                <ul className="list-disc pl-6 space-y-3 text-gray-700">
                  <li>
                    <strong>No Unauthorized Access:</strong> Do not attempt to access accounts, data, or 
                    systems you are not authorized to access
                  </li>
                  <li>
                    <strong>No Vulnerability Testing:</strong> Do not attempt to probe, scan, or test the 
                    vulnerability of our systems without written permission
                  </li>
                  <li>
                    <strong>No Network Interference:</strong> Do not interfere with service to any user, 
                    host, or network
                  </li>
                  <li>
                    <strong>No Password Attacks:</strong> Do not attempt to obtain passwords or security 
                    information through any means
                  </li>
                  <li>
                    <strong>No Spoofing:</strong> Do not attempt to impersonate {companyInfo.name} or its 
                    representatives
                  </li>
                </ul>
              </div>

              {/* Commercial Use Section */}
              <div
                id="commercial-use"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaChartLine className="mr-3 text-[#52aa4d]" /> Commercial & Business Use
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-[#25609A] mb-2">Small Business Use</h3>
                    <p className="text-gray-700">
                      Small businesses and freelancers may use our free tools for occasional business 
                      needs, subject to the same usage limits as personal users.
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-[#25609A] mb-2">Enterprise & High-Volume Use</h3>
                    <p className="text-gray-700">
                      For regular commercial use, high-volume processing, or API access, please 
                      <button 
                        onClick={openContactModal}
                        className="text-[#52aa4d] hover:underline mx-1 font-medium"
                      >
                        contact us
                      </button> 
                      to discuss commercial licensing options.
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-[#25609A] mb-2">Resale & Redistribution</h3>
                    <p className="text-gray-700">
                      You may not resell, redistribute, or incorporate our tools into your own commercial 
                      services without a written agreement. This includes:
                    </p>
                    <ul className="list-disc pl-5 mt-2 text-gray-700">
                      <li>Rebranding our tools as your own</li>
                      <li>Creating derivative services based on our tools</li>
                      <li>Using our tools to provide commercial services to third parties</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* User Responsibilities Section */}
              <div
                id="user-responsibilities"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaUsers className="mr-3 text-[#52aa4d]" /> User Responsibilities
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm">1</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">Content Responsibility</h4>
                      <p className="text-gray-600 text-sm">
                        You are solely responsible for all content you upload, process, or distribute 
                        using our services.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm">2</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">Legal Compliance</h4>
                      <p className="text-gray-600 text-sm">
                        Ensure your use complies with all applicable laws, including copyright, data 
                        protection, and cybercrime laws.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm">3</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">Security Awareness</h4>
                      <p className="text-gray-600 text-sm">
                        Take reasonable precautions to protect your account and report any security 
                        concerns immediately.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm">4</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-800">Backup Responsibility</h4>
                      <p className="text-gray-600 text-sm">
                        We are not responsible for data loss. Always maintain backups of important files.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enforcement Section */}
              <div
                id="enforcement"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaGavel className="mr-3 text-[#52aa4d]" /> Policy Enforcement
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-[#25609A] mb-2">Monitoring</h3>
                    <p className="text-gray-700 mb-4">
                      We monitor usage patterns to detect violations and ensure system integrity. This 
                      includes automated systems that flag unusual activity.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#25609A] mb-2">Violation Consequences</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        <strong>Warning:</strong> Minor violations may result in a warning and temporary 
                        restrictions
                      </li>
                      <li>
                        <strong>Suspension:</strong> Serious violations may lead to temporary suspension 
                        of access
                      </li>
                      <li>
                        <strong>Termination:</strong> Repeated or severe violations may result in permanent 
                        termination of access
                      </li>
                      <li>
                        <strong>Legal Action:</strong> Illegal activities may be reported to law 
                        enforcement authorities
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#25609A] mb-2">Appeal Process</h3>
                    <p className="text-gray-700">
                      If you believe your access was restricted in error, you may 
                      <button 
                        onClick={openContactModal}
                        className="text-[#52aa4d] hover:underline mx-1 font-medium"
                      >
                        contact us
                      </button> 
                      to appeal the decision. Include relevant details and evidence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Compliance Section */}
              <div
                id="legal-compliance"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4">Legal Compliance Requirements</h2>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <p className="text-gray-700">
                    <strong>Important:</strong> As a Nepali entity, we comply with and enforce compliance 
                    with Nepal&apos;s <strong>Electronic Transactions Act, 2063 (2008)</strong>. Violations 
                    of this Act through use of our services may result in:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>Fines up to NPR 100,000</li>
                    <li>Imprisonment up to 2 years</li>
                    <li>Asset seizure and forfeiture</li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  Specifically prohibited under Nepali law (Section 47):
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Unauthorized access to computer systems</li>
                  <li>Computer fraud and identity theft</li>
                  <li>Distribution of viruses and malware</li>
                  <li>Cyberstalking and online harassment</li>
                  <li>Publication of false or defamatory material</li>
                </ul>
              </div>

              {/* Changes Section */}
              <div
                id="changes"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaExclamationTriangle className="mr-3 text-[#52aa4d]" /> Changes to This Policy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update this Acceptable Use Policy periodically to reflect changes in our services, 
                  legal requirements, or user needs. When we make significant changes, we will:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                  <li>Post the updated policy on this page</li>
                  <li>Update the &quot;Last Updated&quot; date at the top</li>
                  <li>Notify users of significant changes via email (if applicable)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Your continued use of our services after changes constitutes acceptance of the updated 
                  policy. We encourage you to review this policy periodically.
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
                  For questions about this Acceptable Use Policy, to report violations, or to request 
                  clarification on permitted uses:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <p className="text-gray-700">
                    <strong>General Inquiries:</strong> {companyInfo.email}<br />
                    <strong>Legal Department:</strong> {companyInfo.legalEmail}<br />
                    <strong>Violation Reports:</strong> abuse@{companyInfo.website.replace('https://', '')}<br />
                    <strong>Address:</strong> {companyInfo.address}
                  </p>
                </div>
                <button
                  onClick={openContactModal}
                  className="px-6 py-3 bg-[#25609A] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors duration-300 flex items-center"
                  aria-label="Open acceptable use policy inquiry form"
                >
                  <FaEnvelope className="mr-2" /> Contact About Policy
                </button>
              </div>

              {/* Related Legal Documents */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-semibold text-[#25609A] mb-3">Related Legal Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Link
                    href="/terms-and-conditions"
                    className="bg-white p-3 rounded-lg hover:shadow-md transition-shadow text-center"
                  >
                    <div className="text-[#52aa4d] text-sm mb-1">Terms & Conditions</div>
                    <div className="text-xs text-gray-600">Complete terms of service</div>
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className="bg-white p-3 rounded-lg hover:shadow-md transition-shadow text-center"
                  >
                    <div className="text-[#52aa4d] text-sm mb-1">Privacy Policy</div>
                    <div className="text-xs text-gray-600">How we protect your data</div>
                  </Link>
                  <Link
                    href="/affiliate-disclosure"
                    className="bg-white p-3 rounded-lg hover:shadow-md transition-shadow text-center"
                  >
                    <div className="text-[#52aa4d] text-sm mb-1">Affiliate Disclosure</div>
                    <div className="text-xs text-gray-600">Advertising transparency</div>
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
                  <h2 className="text-2xl font-bold text-[#25609A]">AUP Inquiry</h2>
                  <p className="text-gray-600 mt-2">We&apos;ll respond to your inquiry promptly.</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close acceptable use policy inquiry form"
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

export default AcceptableUsePolicy;