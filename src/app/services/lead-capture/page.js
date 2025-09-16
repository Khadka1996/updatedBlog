"use client";

import React, { useState, useEffect } from 'react';
import { FaBullhorn, FaUsers, FaChartBar, FaLightbulb, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';

const LeadCapture = () => {
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
    const message = 'Hello! I have a question about your lead capture services.';
    
    if (isMobile) {
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const phoneNumber = '9779823153502';
    const whatsappMessage = `New Lead Capture Inquiry:
    
Name: ${formData.name}
Email: ${formData.email}
Website: ${formData.website || 'Not provided'}
Message: ${formData.message}

I'm interested in your lead capture services. Please contact me.`;

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
        <title>Effective Lead Capture Services | [Your Company]</title>
        <meta name="description" content="Generate high-quality leads with our expert lead capture strategies, including optimized forms, landing pages, and targeted campaigns." />
        <meta name="keywords" content="lead capture, lead generation, landing pages, conversion optimization, marketing funnels" />
        <meta property="og:title" content="Effective Lead Capture Services | [Your Company]" />
        <meta property="og:description" content="Turn visitors into leads with tailored strategies that drive conversions." />
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Lead Capture Services</h1>
          <p className="text-xl mb-8">
            Turn visitors into high-quality leads with our tailored strategies, optimized forms, and targeted campaigns.
          </p>
          <a 
            href="#contact" 
            className="bg-white text-[#25609A] px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors inline-block"
          >
            Get Your Free Lead Strategy Audit
          </a>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
          Why Our Lead Capture Services Excel
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaBullhorn className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Targeted Campaigns</h3>
            <p>
              We design campaigns that attract and engage your ideal audience, driving them to take action.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaUsers className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Optimized Forms</h3>
            <p>
              Our lead capture forms are user-friendly and strategically designed to maximize conversions.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaChartBar className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Data-Driven Insights</h3>
            <p>
              We analyze user behavior to refine strategies, ensuring higher lead quality and conversion rates.
            </p>
          </div>
        </div>
      </div>

      {/* Our Process */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
            Our Lead Capture Process
          </h2>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Audience Research</h3>
                <p>
                  We identify your target audience and their pain points to craft compelling lead capture strategies.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Campaign & Form Design</h3>
                <p>
                  We create high-converting landing pages, forms, and campaigns tailored to your audience’s needs.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Implementation & Testing</h3>
                <p>
                  We launch campaigns and rigorously test forms to optimize performance and user experience.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Analysis & Optimization</h3>
                <p>
                  We track performance metrics and refine strategies to improve lead quality and conversion rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Types */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
          Our Lead Capture Solutions
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Landing Page Optimization",
            "Lead Magnet Creation",
            "Email Capture Forms",
            "Pop-Up Forms",
            "Social Media Lead Ads",
            "Webinar Registrations",
            "Newsletter Sign-Ups",
            "Free Trial Offers",
            "E-book Downloads",
            "Survey & Quiz Funnels",
            "CRM Integration",
            "A/B Testing"
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
                "Their lead capture strategies increased our email sign-ups by 200% in just 2 months. Truly transformative!"
              </p>
              <p className="font-bold">— Marketing Manager, SaaS Company</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg">
              <FaLightbulb className="text-3xl text-[#52aa4d] mb-3" />
              <p className="italic mb-4">
                "The optimized landing pages and lead magnets doubled our conversion rates. Highly recommend their expertise."
              </p>
              <p className="font-bold">— CEO, E-commerce Brand</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with WhatsApp Form */}
      <div id="contact" className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#25609A] mb-6">
          Ready to Boost Your Lead Generation?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Let’s create lead capture strategies that convert visitors into loyal customers.
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
              placeholder="Tell us about your lead generation goals..." 
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

export default LeadCapture;