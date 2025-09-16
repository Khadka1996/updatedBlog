"use client";

import React, { useState, useEffect } from 'react';
import { FaSearch, FaChartLine, FaRocket, FaLightbulb, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';

const DigitalMarketing = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    message: ''
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = '9779823153502';
    const message = 'Hello! I have a question about your digital marketing services.';
    
    if (isMobile) {
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const phoneNumber = '9779823153502';
    const whatsappMessage = `New Digital Marketing Inquiry:
    
Name: ${formData.name}
Email: ${formData.email}
Website: ${formData.website || 'Not provided'}
Message: ${formData.message}

I'm interested in your digital marketing services. Please contact me.`;

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`,
      '_blank'
    );

    setFormData({
      name: '',
      email: '',
      website: '',
      message: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Head>
        <title>Expert Digital Marketing Services | [Your Company]</title>
        <meta name="description" content="Drive traffic and boost conversions with our comprehensive digital marketing services, including SEO, PPC, social media, and more." />
        <meta name="keywords" content="digital marketing, SEO, PPC, social media marketing, content marketing, email marketing" />
        <meta property="og:title" content="Expert Digital Marketing Services | [Your Company]" />
        <meta property="og:description" content="Comprehensive digital marketing strategies to grow your brand and maximize ROI." />
      </Head>
      
      <NavBar />

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isMobile ? (
          <button
            className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg cursor-pointer hover:bg-green-600 transition-all"
            onClick={handleWhatsAppClick}
            aria-label="Chat with us on WhatsApp"
          >
            <FaWhatsapp className="w-8 h-8" />
          </button>
        ) : (
          <button
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg cursor-pointer hover:bg-green-600 transition-all"
            onClick={handleWhatsAppClick}
          >
            <FaWhatsapp className="w-5 h-5" />
            <span className="font-medium">Chat on WhatsApp</span>
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Digital Marketing Services</h1>
          <p className="text-xl mb-8">
            Comprehensive strategies to grow your brand, drive traffic, and maximize ROI with SEO, PPC, social media, and more.
          </p>
          <a 
            href="#contact" 
            className="bg-white text-[#25609A] px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors inline-block"
          >
            Get Your Free Marketing Audit
          </a>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
          Why Choose Our Digital Marketing Services
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaSearch className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Data-Driven Strategies</h3>
            <p>
              We use analytics and market research to create campaigns that target the right audience with precision.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaChartLine className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Maximized ROI</h3>
            <p>
              Our campaigns are designed to optimize your budget, delivering measurable results and higher conversions.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaRocket className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Multi-Channel Expertise</h3>
            <p>
              From SEO to social media and PPC, we integrate multiple channels for a cohesive and impactful strategy.
            </p>
          </div>
        </div>
      </div>

      {/* Our Process */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
            Our Digital Marketing Process
          </h2>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Discovery & Analysis</h3>
                <p>
                  We assess your business goals, audience, and competitors to craft a tailored digital marketing strategy.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Campaign Development</h3>
                <p>
                  Our team designs campaigns across SEO, PPC, social media, and content to drive engagement and results.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Execution & Optimization</h3>
                <p>
                  We launch campaigns, monitor performance, and optimize in real-time to ensure maximum effectiveness.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Reporting & Growth</h3>
                <p>
                  We provide detailed reports and insights, refining strategies to scale your success over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Types */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
          Our Digital Marketing Services
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Search Engine Optimization (SEO)",
            "Pay-Per-Click Advertising (PPC)",
            "Social Media Marketing",
            "Content Marketing",
            "Email Marketing",
            "Conversion Rate Optimization (CRO)",
            "Online Reputation Management",
            "Influencer Marketing",
            "Video Marketing",
            "Local SEO",
            "E-commerce Marketing",
            "Analytics & Reporting"
          ].map((type, index) => (
            <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
              <FaCheckCircle className="text-[#52aa4d] mt-1 flex-shrink-0" />
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Case Studies/Testimonials */}
      <div className="bg-[#25609A] text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Success Stories from Our Clients
          </h2>
          
          <div className="space-y-8">
            <div className="bg-white/10 p-6 rounded-lg">
              <FaLightbulb className="text-3xl text-[#52aa4d] mb-3" />
              <p className="italic mb-4">
                "Their PPC campaigns doubled our leads in just 3 months. The team’s expertise and responsiveness are unmatched."
              </p>
              <p className="font-bold">— Marketing Manager, Retail Brand</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg">
              <FaLightbulb className="text-3xl text-[#52aa4d] mb-3" />
              <p className="italic mb-4">
                "Our social media engagement soared by 150% thanks to their targeted campaigns and creative content."
              </p>
              <p className="font-bold">— Founder, Tech Startup</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with WhatsApp Form */}
      <div id="contact" className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#25609A] mb-6">
          Ready to Elevate Your Brand?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Let’s create a digital marketing strategy that drives results and grows your business.
        </p>
        
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input 
                type="text" 
                name="name"
                placeholder="Your Name" 
                className="p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
                required
                value={formData.name}
                onChange={handleChange}
              />
              <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                className="p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <input 
              type="text" 
              name="website"
              placeholder="Website URL (optional)" 
              className="p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
              value={formData.website}
              onChange={handleChange}
            />
            <textarea 
              name="message"
              placeholder="Tell us about your marketing goals..." 
              rows="4"
              className="p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
              required
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            <button 
              type="submit" 
              className="bg-[#25609A] text-white px-8 py-3 rounded-md font-bold hover:bg-[#1a4a7a] transition-colors w-full sm:w-auto"
            >
              Get My Free Strategy Session
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DigitalMarketing;