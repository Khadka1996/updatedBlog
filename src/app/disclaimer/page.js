// app/disclaimer/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaExclamationTriangle, 
  FaShieldAlt, 
  FaGavel, 
  FaBalanceScale,
  FaBook,
  FaHandshake,
  FaEnvelope,
  FaQuestionCircle,
  FaCheck,
  FaSpinner,
  FaTimes,
  FaExternalLinkAlt
} from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

const Disclaimer = () => {
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
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Kathmandu, Nepal',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@everestkit.com',
    legalEmail: process.env.NEXT_PUBLIC_LEGAL_EMAIL || 'legal@everestkit.com',
  };

  const sections = [
    { id: 'general-disclaimer', title: 'General Disclaimer', icon: <FaExclamationTriangle /> },
    { id: 'professional-advice', title: 'No Professional Advice', icon: <FaShieldAlt /> },
    { id: 'external-links', title: 'External Links Disclaimer', icon: <FaExternalLinkAlt /> },
    { id: 'affiliate-disclosure', title: 'Affiliate & Advertising Disclosure', icon: <FaHandshake /> },
    { id: 'testimonials', title: 'Testimonials Disclaimer', icon: <FaBook /> },
    { id: 'fair-use', title: 'Fair Use & Copyright', icon: <FaBalanceScale /> },
    { id: 'errors', title: 'Errors & Omissions', icon: <FaExclamationTriangle /> },
    { id: 'views-opinions', title: 'Views & Opinions', icon: <FaGavel /> },
    { id: 'limitation-liability', title: 'Limitation of Liability', icon: <FaBalanceScale /> },
    { id: 'changes', title: 'Changes to Disclaimer', icon: <FaGavel /> },
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
        body: JSON.stringify({ ...formData, subject: 'Disclaimer Inquiry' }),
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
        <title>Disclaimer | {companyInfo.name}</title>
        <meta
          name="description"
          content={`Legal disclaimer for ${companyInfo.name} - Important information about content accuracy, affiliate links, and liability limitations under Nepal law.`}
        />
        <meta
          name="keywords"
          content="disclaimer, legal disclaimer, affiliate disclosure, liability limitation, Nepal law, website disclaimer"
        />
        <meta property="og:title" content={`Disclaimer | ${companyInfo.name}`} />
        <meta
          property="og:description"
          content={`Important legal disclosures and limitations for ${companyInfo.name}'s website and services.`}
        />
        <meta property="og:url" content={`${companyInfo.website}/disclaimer`} />
        <meta property="og:image" content={`${companyInfo.website}/og-image.jpg`} />
        <meta name="robots" content="index, follow" />
      </Head>

      <NavBar />

      <div className="bg-gray-100 min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <FaExclamationTriangle className="text-5xl text-[#25609A] animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#25609A] mb-4 tracking-tight">
              Legal Disclaimer
            </h1>
            <p className="text-lg text-gray-600">
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
              {/* General Disclaimer Section */}
              <div
                id="general-disclaimer"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-[#ff6b6b]"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaExclamationTriangle className="mr-3 text-[#ff6b6b]" /> General Disclaimer
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The information provided by {companyInfo.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) on {companyInfo.website} (the &quot;Site&quot;) is for general informational purposes only. All information on the Site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SITE OR RELIANCE ON ANY INFORMATION PROVIDED ON THE SITE. YOUR USE OF THE SITE AND YOUR RELIANCE ON ANY INFORMATION ON THE SITE IS SOLELY AT YOUR OWN RISK.
                </p>
              </div>

              {/* No Professional Advice Section */}
              <div
                id="professional-advice"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaShieldAlt className="mr-3 text-[#52aa4d]" /> No Professional Advice
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Site cannot and does not contain professional advice. The information is provided for general informational and educational purposes only and is not a substitute for professional advice.
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li><strong>Legal Advice:</strong> We are not a law firm, and nothing on this site constitutes legal advice.</li>
                  <li><strong>Financial Advice:</strong> We are not financial advisors. All financial information is for educational purposes only.</li>
                  <li><strong>Technical Advice:</strong> Technical information may become outdated. Always verify with current standards and professionals.</li>
                  <li><strong>Medical Advice:</strong> We do not provide medical advice. Always consult healthcare professionals.</li>
                  <li><strong>Business Advice:</strong> Business strategies and tools should be evaluated by qualified business consultants.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. We do not provide any kind of professional advice. THE USE OR RELIANCE OF ANY INFORMATION CONTAINED ON THIS SITE IS SOLELY AT YOUR OWN RISK.
                </p>
              </div>

              {/* External Links Disclaimer Section */}
              <div
                id="external-links"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaExternalLinkAlt className="mr-3 text-[#52aa4d]" /> External Links Disclaimer
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Site may contain (or you may be sent through the Site) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR THE ACCURACY OR RELIABILITY OF ANY INFORMATION OFFERED BY THIRD-PARTY WEBSITES LINKED THROUGH THE SITE OR ANY WEBSITE OR FEATURE LINKED IN ANY BANNER OR OTHER ADVERTISING. WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  When you click on links to third-party websites, you will be subject to their own terms, conditions, and privacy policies. We strongly advise you to review the Privacy Policy and Terms of every site you visit.
                </p>
              </div>

              {/* Affiliate & Advertising Disclosure Section */}
              <div
                id="affiliate-disclosure"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-[#52aa4d]"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaHandshake className="mr-3 text-[#52aa4d]" /> Affiliate & Advertising Disclosure
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This Site may contain affiliate links and advertisements. If you click on these links and make a purchase, we may receive a commission at no additional cost to you. This helps support our work and allows us to continue providing free content.
                </p>
                
                <h3 className="text-xl font-medium text-[#25609A] mb-3">Our Affiliate Relationships</h3>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>We only recommend products and services we believe will provide value to our users</li>
                  <li>Our editorial content is not influenced by advertisers or affiliate partnerships</li>
                  <li>Affiliate links are clearly disclosed where applicable</li>
                  <li>We participate in various affiliate programs including Amazon Associates</li>
                </ul>

                <h3 className="text-xl font-medium text-[#25609A] mb-3">Google AdSense & Third-Party Ads</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use Google AdSense to serve advertisements. These ads are served by Google and third-party vendors using cookie technology. These cookies enable ads to be served based on your visits to our Site and other sites on the Internet.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We do not control the content of these advertisements. The appearance of ads does not constitute endorsement or recommendation by {companyInfo.name}.
                </p>
              </div>

              {/* Testimonials Disclaimer Section */}
              <div
                id="testimonials"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaBook className="mr-3 text-[#52aa4d]" /> Testimonials Disclaimer
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Site may contain testimonials by users of our products and/or services. These testimonials reflect the real-life experiences and opinions of such users. However, the experiences are personal to those particular users, and may not necessarily be representative of all users of our products and/or services. We do not claim, and you should not assume, that all users will have the same experiences.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  YOUR INDIVIDUAL RESULTS MAY VARY. The testimonials on the Site are submitted in various forms such as text, audio and/or video, and are reviewed by us before being posted. They appear on the Site verbatim as given by the users, except for the correction of grammar or typing errors. Some testimonials may have been shortened for the sake of brevity where the full testimonial contained extraneous information not relevant to the general public.
                </p>
              </div>

              {/* Fair Use & Copyright Section */}
              <div
                id="fair-use"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaBalanceScale className="mr-3 text-[#52aa4d]" /> Fair Use & Copyright
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This website may contain copyrighted material the use of which has not always been specifically authorized by the copyright owner. We are making such material available in our efforts to advance understanding of various topics. We believe this constitutes a &apos;fair use&apos; of any such copyrighted material as provided for in section 107 of the US Copyright Law.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you wish to use copyrighted material from this site for purposes of your own that go beyond &apos;fair use,&apos; you must obtain permission from the copyright owner.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  For copyright inquiries or to request permission to use our content, please contact us at {companyInfo.legalEmail}.
                </p>
              </div>

              {/* Errors & Omissions Section */}
              <div
                id="errors"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaExclamationTriangle className="mr-3 text-[#52aa4d]" /> Errors & Omissions
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  While we have made every attempt to ensure that the information contained in this site has been obtained from reliable sources, {companyInfo.name} is not responsible for any errors or omissions or for the results obtained from the use of this information. All information in this site is provided &quot;as is,&quot; with no guarantee of completeness, accuracy, timeliness, or of the results obtained from the use of this information, and without warranty of any kind, express or implied, including, but not limited to warranties of performance, merchantability, and fitness for a particular purpose.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  In no event will {companyInfo.name}, its related partnerships or corporations, or the partners, agents, or employees thereof be liable to you or anyone else for any decision made or action taken in reliance on the information in this Site or for any consequential, special, or similar damages, even if advised of the possibility of such damages.
                </p>
              </div>

              {/* Views & Opinions Section */}
              <div
                id="views-opinions"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaGavel className="mr-3 text-[#52aa4d]" /> Views & Opinions
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The views and opinions expressed on this Site are those of the authors and do not necessarily reflect the official policy or position of any other agency, organization, employer, or company, including {companyInfo.name}. Comments published by users are their sole responsibility, and users will take full responsibility, liability, and blame for any libel or litigation that results from something written in or as a direct result of something written in a comment.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We are not liable for any comment published by users and reserve the right to delete any comment for any reason whatsoever.
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
                  To the maximum extent permitted by applicable law in Nepal, we exclude all representations, warranties, and conditions relating to our website and the use of this website. Nothing in this disclaimer will:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                  <li>limit or exclude our or your liability for death or personal injury</li>
                  <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation</li>
                  <li>limit any of our or your liabilities in any way that is not permitted under applicable law</li>
                  <li>exclude any of our or your liabilities that may not be excluded under applicable law</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort, and for breach of statutory duty.
                </p>
              </div>

              {/* Changes to Disclaimer Section */}
              <div
                id="changes"
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-[#25609A] mb-4 flex items-center">
                  <FaGavel className="mr-3 text-[#52aa4d]" /> Changes to Disclaimer
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to make changes to this disclaimer at any time. We will provide notice of any changes by posting the new disclaimer on this page. You are advised to review this disclaimer periodically for any changes. Changes to this disclaimer are effective when they are posted on this page.
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
                  If you have any questions about this Disclaimer, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <p className="text-gray-700">
                    <strong>Email:</strong> {companyInfo.email}<br />
                    <strong>Legal Department:</strong> {companyInfo.legalEmail}<br />
                    <strong>Address:</strong> {companyInfo.address}
                  </p>
                </div>
                <button
                  onClick={openContactModal}
                  className="px-6 py-3 bg-[#25609A] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors duration-300 flex items-center"
                  aria-label="Open disclaimer inquiry form"
                >
                  <FaEnvelope className="mr-2" /> Contact About Disclaimer
                </button>
              </div>

              {/* Related Legal Documents */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-semibold text-[#25609A] mb-3">Related Legal Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  <Link
                    href="/cookies-policy"
                    className="bg-white p-3 rounded-lg hover:shadow-md transition-shadow text-center"
                  >
                    <div className="text-[#52aa4d] text-sm mb-1">Cookies Policy</div>
                    <div className="text-xs text-gray-600">How we use cookies</div>
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
                  <h2 className="text-2xl font-bold text-[#25609A]">Disclaimer Inquiry</h2>
                  <p className="text-gray-600 mt-2">We&apos;ll respond to your inquiry promptly.</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close disclaimer inquiry form"
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

export default Disclaimer;