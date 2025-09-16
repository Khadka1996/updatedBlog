"use client";

import React, { useState } from 'react';
import { FaSearch, FaChartLine, FaPenAlt, FaLightbulb, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';

const SEOContentWriting = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    message: ''
  });

  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
const handleWhatsAppClick = () => {
  const phoneNumber = '9779823153502';
  const message = 'Hello! I have a question about your SEO content writing services.';

  if (isMobile) {
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  } else {
    window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, '_blank');
  }
};

const handleSubmit = (e) => {
  e.preventDefault();

  const phoneNumber = '9779823153502';
  const whatsappMessage = `New SEO Content Writing Inquiry:

Name: ${formData.name}
Email: ${formData.email}
Website: ${formData.website || 'Not provided'}
Message: ${formData.message}

I'm interested in your SEO content writing services. Please contact me.`;

  if (isMobile) {
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  } else {
    window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  }

  // Reset form
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
        <title>Professional SEO Content Writing Services | [Your Company]</title>
        <meta name="description" content="Boost your rankings with our expert SEO content writing services. High-quality, keyword-optimized content tailored to your audience and business goals." />
        <meta name="keywords" content="SEO content writing, blog writing, website content, content marketing, SEO articles" />
        <meta property="og:title" content="Professional SEO Content Writing Services | [Your Company]" />
        <meta property="og:description" content="High-quality, optimized content that ranks well and converts visitors." />
      </Head>
      
      <NavBar/>

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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">SEO Content Writing Services</h1>
          <p className="text-xl mb-8">
            High-quality, optimized content that ranks well in search engines and converts visitors into customers.
          </p>
          <a 
            href="#contact" 
            className="bg-white text-[#25609A] px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors inline-block"
          >
            Get Your Free Content Audit
          </a>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
          Why Our SEO Content Stands Out
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaSearch className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Keyword-Optimized</h3>
            <p>
              We research and implement the most effective keywords that your target audience is searching for, without compromising readability.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaChartLine className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Conversion-Focused</h3>
            <p>
              Our content doesn't just rank well—it's crafted to guide visitors through your sales funnel and turn them into customers.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaPenAlt className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Engaging & Authoritative</h3>
            <p>
              We combine expert knowledge with compelling storytelling to establish your brand as an industry leader.
            </p>
          </div>
        </div>
      </div>

      {/* Our Process */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
            Our SEO Content Writing Process
          </h2>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Research & Strategy</h3>
                <p>
                  We analyze your industry, competitors, and target keywords to develop a content strategy that aligns with your business goals.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Content Creation</h3>
                <p>
                  Our expert writers craft high-quality content that incorporates SEO best practices while maintaining natural flow and readability.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Optimization</h3>
                <p>
                  We optimize content structure, meta tags, headings, and internal linking to maximize search visibility.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Performance Tracking</h3>
                <p>
                  We monitor content performance and make data-driven adjustments to continually improve results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Types */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
          Types of SEO Content We Create
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Blog Posts & Articles",
            "Website Content",
            "Product Descriptions",
            "Service Pages",
            "Landing Pages",
            "Buyer's Guides",
            "How-To Articles",
            "Listicles",
            "Industry Reports",
            "Case Studies",
            "FAQ Content",
            "Pillar Pages"
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
            Results We've Achieved for Clients
          </h2>
          
          <div className="space-y-8">
            <div className="bg-white/10 p-6 rounded-lg">
              <FaLightbulb className="text-3xl text-[#52aa4d] mb-3" />
              <p className="italic mb-4">
                "After working with [Your Company], our organic traffic increased by 215% in 6 months. Their SEO content strategy transformed our online presence."
              </p>
              <p className="font-bold">— Marketing Director, E-commerce Brand</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg">
              <FaLightbulb className="text-3xl text-[#52aa4d] mb-3" />
              <p className="italic mb-4">
                "We've seen a 40% increase in conversion rates from their optimized landing pages. The content speaks directly to our ideal customers."
              </p>
              <p className="font-bold">— CEO, SaaS Company</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="contact" className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#25609A] mb-6">
          Ready to Dominate Search Rankings?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Let's create SEO content that drives traffic and grows your business.
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
              placeholder="Tell us about your content needs..." 
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
      <Footer/>
    </>
  );
};

export default SEOContentWriting;