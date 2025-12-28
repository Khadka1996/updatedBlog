"use client";

import React, { useState, useEffect } from 'react';
import { FaCode, FaDesktop, FaMobileAlt, FaLightbulb, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';

const WebsiteDevelopment = () => {
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
    const message = 'Hello! I have a question about your website development services.';
    
    if (isMobile) {
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const phoneNumber = '9779823153502';
    const whatsappMessage = `New Website Development Inquiry:
    
Name: ${formData.name}
Email: ${formData.email}
Website: ${formData.website || 'Not provided'}
Message: ${formData.message}

I'm interested in your website development services. Please contact me.`;

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
        <title>Professional Website Development Services | [Your Company]</title>
        <meta name="description" content="Build stunning, responsive, and high-performance websites with our expert website development services tailored to your business needs." />
        <meta name="keywords" content="website development, web design, responsive websites, e-commerce websites, custom web development" />
        <meta property="og:title" content="Professional Website Development Services | [Your Company]" />
        <meta property="og:description" content="Custom-built websites that enhance your brand and drive business growth." />
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Website Development Services</h1>
          <p className="text-xl mb-8">
            Create stunning, responsive, and high-performance websites that elevate your brand and drive business growth.
          </p>
          <a 
            href="#contact" 
            className="bg-white text-[#25609A] px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors inline-block"
          >
            Get Your Free Website Audit
          </a>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
          Why Our Website Development Stands Out
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaCode className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Custom Development</h3>
            <p>
              We build tailored websites that align with your brand and business goals, using the latest technologies.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaMobileAlt className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Responsive Design</h3>
            <p>
              Our websites are optimized for all devices, ensuring a seamless user experience on mobile, tablet, and desktop.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaDesktop className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Performance & SEO</h3>
            <p>
              We create fast-loading, SEO-optimized websites to boost your search rankings and user engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Our Process */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
            Our Website Development Process
          </h2>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Discovery & Planning</h3>
                <p>
                  We understand your goals, target audience, and requirements to create a detailed project roadmap.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Design & Prototyping</h3>
                <p>
                  Our designers create visually appealing mockups and prototypes to ensure your vision comes to life.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Development & Testing</h3>
                <p>
                  We code your website using modern frameworks, rigorously testing for functionality and performance.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Launch & Support</h3>
                <p>
                  We deploy your website and provide ongoing support to ensure it stays secure and up-to-date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Types */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
          Types of Websites We Build
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Business Websites",
            "E-commerce Stores",
            "Portfolio Websites",
            "Blog Websites",
            "Landing Pages",
            "Corporate Websites",
            "Nonprofit Websites",
            "Educational Platforms",
            "Custom Web Applications",
            "Booking Platforms",
            "Membership Sites",
            "Event Websites"
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
                "Their team built us a stunning e-commerce website that increased our sales by 180% in just 4 months."
              </p>
              <p className="font-bold">— Owner, Online Retail</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg">
              <FaLightbulb className="text-3xl text-[#52aa4d] mb-3" />
              <p className="italic mb-4">
                "The responsive design and fast load times of our new website have significantly improved user engagement."
              </p>
              <p className="font-bold">— Marketing Director, Tech Company</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with WhatsApp Form */}
      <div id="contact" className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#25609A] mb-6">
          Ready to Build Your Dream Website?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Let’s create a website that showcases your brand and drives results.
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
              placeholder="Tell us about your website needs..." 
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
              Get My Free Consultation
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WebsiteDevelopment;