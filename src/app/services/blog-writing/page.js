"use client";

import React, { useState, useEffect } from 'react';
import { FaPen, FaComments, FaChartLine, FaLightbulb, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';

const BlogWriting = () => {
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
    const message = 'Hello! I have a question about your blog writing services.';
    
    if (isMobile) {
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const phoneNumber = '9779823153502';
    const whatsappMessage = `New Blog Writing Inquiry:
    
Name: ${formData.name}
Email: ${formData.email}
Website: ${formData.website || 'Not provided'}
Message: ${formData.message}

I'm interested in your blog writing services. Please contact me.`;

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
        <title>Engaging Blog Writing Services | [Your Company]</title>
        <meta name="description" content="Boost your brand with engaging, informative blog articles crafted by experts to drive traffic and connect with your audience." />
        <meta name="keywords" content="blog writing, content marketing, blog articles, SEO blogs, engaging content" />
        <meta property="og:title" content="Engaging Blog Writing Services | [Your Company]" />
        <meta property="og:description" content="High-quality blog content that captivates readers and enhances your online presence." />
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog Writing Services</h1>
          <p className="text-xl mb-8">
            Create engaging, informative blog articles that captivate your audience, drive traffic, and boost your brand’s authority.
          </p>
          <a 
            href="#contact" 
            className="bg-white text-[#25609A] px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors inline-block"
          >
            Get Your Free Content Strategy
          </a>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
          Why Our Blog Writing Services Stand Out
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaPen className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Compelling Storytelling</h3>
            <p>
              Our writers craft engaging narratives that resonate with your audience and keep them coming back for more.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaComments className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">Audience Engagement</h3>
            <p>
              We create content that sparks conversation, encourages sharing, and builds a loyal community around your brand.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d]">
            <FaChartLine className="text-4xl text-[#25609A] mb-4" />
            <h3 className="text-xl font-bold mb-3">SEO-Optimized Content</h3>
            <p>
              Our blogs are optimized for search engines to drive organic traffic while maintaining readability and value.
            </p>
          </div>
        </div>
      </div>

      {/* Our Process */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
            Our Blog Writing Process
          </h2>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Research & Planning</h3>
                <p>
                  We analyze your audience, industry, and goals to create a content plan that aligns with your brand.
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
                  Our writers produce high-quality, engaging articles tailored to your audience and optimized for SEO.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-[#25609A] text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Editing & Optimization</h3>
                <p>
                  We refine content for clarity, tone, and SEO, ensuring it meets your brand standards and goals.
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
                  We monitor blog performance and provide insights to optimize future content for maximum impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Types */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#25609A] mb-12">
          Types of Blog Content We Create
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "How-To Guides",
            "Listicles",
            "Industry Insights",
            "Case Studies",
            "Tutorials",
            "Thought Leadership",
            "Product Reviews",
            "News Updates",
            "Interviews",
            "Tips & Tricks",
            "Trend Reports",
            "FAQs"
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
                "Their blog articles tripled our website traffic in just 3 months. The content is engaging and perfectly aligned with our brand."
              </p>
              <p className="font-bold">— Marketing Manager, Tech Startup</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg">
              <FaLightbulb className="text-3xl text-[#52aa4d] mb-3" />
              <p className="italic mb-4">
                "The thought leadership blogs established us as industry experts, driving more leads and engagement."
              </p>
              <p className="font-bold">— CEO, Consulting Firm</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with WhatsApp Form */}
      <div id="contact" className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#25609A] mb-6">
          Ready to Elevate Your Blog Content?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Let’s create engaging, informative articles that connect with your audience and grow your brand.
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
              placeholder="Tell us about your blog content needs..." 
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
              Get My Free Content Strategy
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogWriting;