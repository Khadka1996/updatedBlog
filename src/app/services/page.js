"use client";

import { useState, useEffect } from 'react';
import {
  // Technology
  FaDesktop, FaLaptop, FaServer, FaDatabase, FaCode,
  FaMicrochip, FaRobot, FaNetworkWired, FaCloud,
  // Mobile/Web
  FaMobileAlt, FaTabletAlt, FaGlobe, FaChrome,
  // Design/Creative
  FaPaintBrush, FaPalette, FaImage, FaPhotoVideo,
  // Marketing
  FaBullhorn, FaChartLine, FaChartBar, FaChartPie,
  FaSearchDollar, FaAd, FaHashtag,
  // E-commerce
  FaShoppingCart, FaStore, FaBoxOpen, FaShippingFast, FaMoneyBillWave,
  // Content
  FaEdit, FaKeyboard, FaFileAlt, FaBlog,
  // Security
  FaLock, FaShieldAlt, FaUserLock,
  // AI/Data
  FaBrain,
  // Communication
  FaComments, FaEnvelope, FaPhoneAlt, FaVideo,
  // Specialized
  FaMedal, FaCertificate, FaRocket, FaLightbulb, FaMagic,
  FaCogs, FaToolbox, FaPuzzlePiece,
  // UI Icons
  FaCheck, FaSpinner, FaTimes, FaCheckCircle, FaArrowDown
} from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';

// Icon mapping component
const IconComponent = ({ iconName, className }) => {
  const icons = {
    // Technology
    'FaDesktop': <FaDesktop className={className} />,
    'FaLaptop': <FaLaptop className={className} />,
    'FaServer': <FaServer className={className} />,
    'FaDatabase': <FaDatabase className={className} />,
    'FaCode': <FaCode className={className} />,
    'FaMicrochip': <FaMicrochip className={className} />,
    'FaRobot': <FaRobot className={className} />,
    'FaNetworkWired': <FaNetworkWired className={className} />,
    'FaCloud': <FaCloud className={className} />,
    // Mobile/Web
    'FaMobileAlt': <FaMobileAlt className={className} />,
    'FaTabletAlt': <FaTabletAlt className={className} />,
    'FaGlobe': <FaGlobe className={className} />,
    'FaChrome': <FaChrome className={className} />,
    // Design/Creative
    'FaPaintBrush': <FaPaintBrush className={className} />,
    'FaPalette': <FaPalette className={className} />,
    'FaImage': <FaImage className={className} />,
    'FaPhotoVideo': <FaPhotoVideo className={className} />,
    // Marketing
    'FaBullhorn': <FaBullhorn className={className} />,
    'FaChartLine': <FaChartLine className={className} />,
    'FaChartBar': <FaChartBar className={className} />,
    'FaChartPie': <FaChartPie className={className} />,
    'FaSearchDollar': <FaSearchDollar className={className} />,
    'FaAd': <FaAd className={className} />,
    'FaHashtag': <FaHashtag className={className} />,
    // E-commerce
    'FaShoppingCart': <FaShoppingCart className={className} />,
    'FaStore': <FaStore className={className} />,
    'FaBoxOpen': <FaBoxOpen className={className} />,
    'FaShippingFast': <FaShippingFast className={className} />,
    'FaMoneyBillWave': <FaMoneyBillWave className={className} />,
    // Content
    'FaEdit': <FaEdit className={className} />,
    'FaKeyboard': <FaKeyboard className={className} />,
    'FaFileAlt': <FaFileAlt className={className} />,
    'FaBlog': <FaBlog className={className} />,
    // Security
    'FaLock': <FaLock className={className} />,
    'FaShieldAlt': <FaShieldAlt className={className} />,
    'FaUserLock': <FaUserLock className={className} />,
    // AI/Data
    'FaBrain': <FaBrain className={className} />,
    // Communication
    'FaComments': <FaComments className={className} />,
    'FaEnvelope': <FaEnvelope className={className} />,
    'FaPhoneAlt': <FaPhoneAlt className={className} />,
    'FaVideo': <FaVideo className={className} />,
    // Specialized
    'FaMedal': <FaMedal className={className} />,
    'FaCertificate': <FaCertificate className={className} />,
    'FaRocket': <FaRocket className={className} />,
    'FaLightbulb': <FaLightbulb className={className} />,
    'FaMagic': <FaMagic className={className} />,
    'FaCogs': <FaCogs className={className} />,
    'FaToolbox': <FaToolbox className={className} />,
    'FaPuzzlePiece': <FaPuzzlePiece className={className} />
  };
  
  return icons[iconName] || <FaDesktop className={className} />;
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Handle scroll to hide indicator
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to services function
  const scrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch services');
        }
        
        setServices(data.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching services:', err);
      } finally {
        setLoadingServices(false);
      }
    };
    
    fetchServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: selectedService?.name, // Fixed: was .title, should be .name
          serviceId: selectedService?._id || null
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send message');
      }
  
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
      }, 3000);
  
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openContactModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
    setSubmitSuccess(false);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSubmitSuccess(false);
    setError(null);
  };

  const ServiceCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Our Services | [Your Company]</title>
        <meta name="description" content="Explore our professional services, including blog writing, digital marketing, website development, and lead capture, tailored to your business needs." />
        <meta name="keywords" content="services, blog writing, digital marketing, website development, lead capture, professional solutions" />
        <meta property="og:title" content="Our Services | [Your Company]" />
        <meta property="og:description" content="Discover tailored solutions to grow your business with our expert services." />
      </Head>

      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Google Ads Script */}
        <Script 
          strategy="afterInteractive" 
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}`}
          crossOrigin="anonymous"
        />

        {/* Hero Section with Scroll Indicator */}
        <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] text-white py-24 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Our Expert Services</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Discover tailored solutions to grow your business with our professional services.
            </p>
            
            {/* Scroll Down Button - Visible on mobile and desktop */}
            <button
              onClick={scrollToServices}
              className="inline-flex flex-col items-center justify-center text-white hover:text-gray-200 transition-all duration-300 animate-bounce"
              aria-label="Scroll to services"
            >
              <span className="text-sm mb-2 font-medium">Explore Services</span>
              <FaArrowDown className="text-2xl" />
            </button>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay animate-pulse"></div>
            <div className="absolute -bottom-20 -right-10 w-60 h-60 bg-white rounded-full mix-blend-overlay animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white rounded-full mix-blend-overlay animate-pulse delay-500"></div>
          </div>
        </div>

        {/* Scroll Indicator - Only shows on mobile when at top */}
        {showScrollIndicator && (
          <div className="lg:hidden fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
            <button
              onClick={scrollToServices}
              className="bg-[#25609A] text-white p-3 rounded-full shadow-lg hover:bg-[#1a4a7a] transition-colors duration-300"
              aria-label="Scroll to services"
            >
              <FaArrowDown className="text-xl" />
            </button>
          </div>
        )}

        {/* Google Ad - Top Banner (Hidden on mobile) */}
        <div className="max-w-6xl mx-auto px-4 py-8 hidden md:block">
          <ins 
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}`}
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
          <Script id="top-ad">
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </Script>
        </div>

        {/* Services Section */}
        <div id="services-section" className="scroll-mt-20">
          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <ServiceCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-[#25609A] mb-4">Error Loading Services</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#25609A] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div 
                  key={service._id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="p-8 flex flex-col h-full">
                    <div className="flex justify-center mb-6">
                      <IconComponent 
                        iconName={service.icon} 
                        className="text-[#25609A] text-5xl" 
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-[#25609A] mb-4">{service.name}</h2>
                    <p className="text-gray-700 text-center mb-6 flex-grow leading-relaxed">{service.description}</p>
                    
                    <div className="mb-6">
                      <h3 className="font-semibold text-[#25609A] mb-3 text-center">Key Features</h3>
                      <ul className="space-y-3">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <FaCheckCircle className="text-[#52aa4d] mr-2 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => openContactModal(service)}
                      className="w-full bg-[#25609A] hover:bg-[#1a4a7a] text-white py-3 rounded-lg flex items-center justify-center transition-colors duration-300 mt-auto font-medium"
                    >
                      <FaEnvelope className="mr-2" /> Contact Us
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg p-6">
              <p className="text-gray-600 text-lg">No services available at the moment.</p>
            </div>
          )}
        </div>

        {/* Google Ad - Middle Rectangle (Hidden on mobile) */}
        <div className="max-w-6xl mx-auto px-4 py-8 text-center hidden md:block">
          <ins 
            className="adsbygoogle"
            style={{ display: 'inline-block', width: '728px', height: '90px' }}
            data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}`}
            data-ad-slot="0987654321"
          ></ins>
          <Script id="middle-ad">
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </Script>
        </div>

        {/* Contact Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div 
                className="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300" 
                onClick={closeModal}
              />
              
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#25609A]">Contact About {selectedService?.name}</h2>
                    <p className="text-gray-600 mt-2">
                      {selectedService?.contactMessage || "We'll get back to you soon!"}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d] transition-colors duration-200"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d] transition-colors duration-200"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d] transition-colors duration-200"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d] transition-colors duration-200"
                        required
                      />
                    </div>
                    
                    <input type="hidden" name="service" value={selectedService?.name} />
                    
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 order-2 sm:order-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-3 bg-[#25609A] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors duration-200 flex items-center justify-center order-1 sm:order-2 ${
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

        {/* Google Ad - Bottom Banner (Hidden on mobile) */}
        <div className="max-w-6xl mx-auto px-4 py-8 hidden md:block">
          <ins 
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}`}
            data-ad-slot="5678901234"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
          <Script id="bottom-ad">
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </Script>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] mt-8 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="mb-6 max-w-2xl mx-auto text-lg">
            Let's discuss how we can help you achieve your digital goals and take your business to the next level.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-[#25609A] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Get in Touch Today
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
}