"use client"; // Mark this as a Client Component
import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa"; // Import WhatsApp icon

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const whatsappId = "9779815817938"; 

  // Function to send message via WhatsApp
  const handleSendMessage = () => {
    const encodedMessage = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    );
    const whatsappUrl = `https://wa.me/${whatsappId}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-stretch bg-white rounded-xl shadow-lg overflow-hidden">
          
          {/* Contact Form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center md:text-left">
              Contact Us
            </h2>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
              />
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
              />
            </div>

            {/* Message Input */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="5"
                placeholder="Enter your message"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
              />
            </div>

            {/* WhatsApp Button */}
            <button
              onClick={handleSendMessage}
              className="w-full bg-[#52aa4d] text-white py-3 rounded-lg hover:bg-[#428a3d] transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <FaWhatsapp className="text-xl" />
              <span>Send Message via WhatsApp</span>
            </button>
          </div>

          {/* Map Section */}
          <div className="w-full md:w-1/2 h-80 md:h-auto">
            <iframe
              title="Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.150681931219!2d-77.0368736844035!3d38.89767627957071!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7b7bcdecbb1df%3A0x715969d6d1b8c7a1!2sWhite%20House%2C%20Washington%2C%20DC%2C%20USA!5e0!3m2!1sen!2sin!4v1698765432105!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-r-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
