"use client";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaSearch, FaChartLine, FaLaptopCode, FaUsers, FaCommentAlt } from "react-icons/fa";
import contactBg from "../components/assets/contact-us-banner-1680x500.webp";
import NavBar from "../components/header/navbar";
import Footer from "../components/footer/footer";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const whatsappId = "9717029446";

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleSendMessage = () => {
    const encodedMessage = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    );
    
    const whatsappUrl = isMobile 
      ? `https://wa.me/${whatsappId}?text=${encodedMessage}`
      : `https://web.whatsapp.com/send?phone=${whatsappId}&text=${encodedMessage}`;
      
    window.open(whatsappUrl, "_blank");
  };

  return (
   
    <div>
        <NavBar/>
      {/* New Heading Section with Background */}
<div
  className="relative text-white py-32 px-6 md:px-12 shadow-xl overflow-hidden bg-cover bg-center"
  style={{ backgroundImage: `url(${contactBg.src})` }}
>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-center tracking-tight mt-10">
          Contact Us
        </h1>

        <p className="text-center max-w-5xl mx-auto text-lg md:text-xl text-white/90 mt-2" >
          Have questions or need assistance? We're here to help! Reach out to our team for any inquiries about our services, pricing, or how we can help grow your business.
        </p>
      </div>

      {/* Services Icons Section */}
 <div className="mx-3 md:mx-10 lg:mx-18"> 
     {/* SEO Content Writing */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
  {/* SEO Content Writing */}
  <div className="group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-[#25609A] hover:border-[#52aa4d]">
    <FaSearch className="text-3xl text-[#52aa4d] mb-3 group-hover:scale-110 transition-transform" />
    <h3 className="font-semibold text-lg text-center text-gray-800 mb-2">SEO Content Writing</h3>
    <a href="/services/seo-content-writing" className="mt-auto px-4 py-2 bg-[#25609A] text-white rounded-md hover:bg-[#52aa4d] transition-colors duration-300 text-sm font-medium">
      Learn More
    </a>
  </div>

  {/* Digital Marketing */}
  <div className="group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-[#25609A] hover:border-[#52aa4d]">
    <FaChartLine className="text-3xl text-[#52aa4d] mb-3 group-hover:scale-110 transition-transform" />
    <h3 className="font-semibold text-lg text-center text-gray-800 mb-2">Digital Marketing</h3>
    <a href="/services/digital-marketing" className="mt-auto px-4 py-2 bg-[#25609A] text-white rounded-md hover:bg-[#52aa4d] transition-colors duration-300 text-sm font-medium">
      Learn More
    </a>
  </div>

  {/* Website Development */}
  <div className="group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-[#25609A] hover:border-[#52aa4d]">
    <FaLaptopCode className="text-3xl text-[#52aa4d] mb-3 group-hover:scale-110 transition-transform" />
    <h3 className="font-semibold text-lg text-center text-gray-800 mb-2">Website Development</h3>
    <a href="/services/website-development" className="mt-auto px-4 py-2 bg-[#25609A] text-white rounded-md hover:bg-[#52aa4d] transition-colors duration-300 text-sm font-medium">
      Learn More
    </a>
  </div>

  {/* Lead Capture */}
  <div className="group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-[#25609A] hover:border-[#52aa4d]">
    <FaUsers className="text-3xl text-[#52aa4d] mb-3 group-hover:scale-110 transition-transform" />
    <h3 className="font-semibold text-lg text-center text-gray-800 mb-2">Lead Capture</h3>
    <a href="/services/lead-capture" className="mt-auto px-4 py-2 bg-[#25609A] text-white rounded-md hover:bg-[#52aa4d] transition-colors duration-300 text-sm font-medium">
      Learn More
    </a>
  </div>

  {/* Social Proof */}
  <div className="group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-[#25609A] hover:border-[#52aa4d]">
    <FaCommentAlt className="text-3xl text-[#52aa4d] mb-3 group-hover:scale-110 transition-transform" />
    <h3 className="font-semibold text-lg text-center text-gray-800 mb-2">Social Proof</h3>
    <a href="/services/social-proof" className="mt-auto px-4 py-2 bg-[#25609A] text-white rounded-md hover:bg-[#52aa4d] transition-colors duration-300 text-sm font-medium">
      Learn More
    </a>
  </div>
</div>
</div>


     
     
        {/* Original Contact Form and Map */}
        <div className="flex items-center justify-center p-2 mt-10">
          <div className="bg-white rounded-lg shadow-lg w-full flex flex-col md:flex-row">
            {/* Contact Form Section */}
            <div className="w-full md:w-1/2 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Get In Touch
              </h2>

              {/* Form inputs remain the same */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
                  placeholder="Enter your name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
                  rows="4"
                  placeholder="Enter your message"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendMessage}
                className="w-full bg-[#52aa4d] text-white py-2 px-4 rounded-lg hover:bg-[#428a3d] transition-colors flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="text-xl" />
                <span>Send Message via WhatsApp</span>
              </motion.button>
            </div>
            
            {/* Map Section */}
            <div className="w-full md:w-1/2 h-96 md:h-auto">
              <iframe
                title="Location Map"
                src="https://www.google.com/maps?q=Putalisadak%2C%20Kathmandu%2C%20Nepal&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
        <Footer/>
      </div>
  );
};

export default ContactUs;