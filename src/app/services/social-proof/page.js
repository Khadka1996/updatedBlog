"use client";

import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaUsers, FaStar, FaQuoteLeft, FaCheckCircle } from "react-icons/fa";
import Head from "next/head";
import Footer from "@/app/components/footer/footer";
import NavBar from "@/app/components/header/navbar";

const SocialProof = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const phoneNumber = "9779823153502";

  const handleWhatsAppClick = () => {
    const message = "Hi! I’m interested in your services after seeing your client success stories.";
    const url = isMobile
      ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappMessage = `New Social Proof Inquiry:

Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company || "Not provided"}
Message: ${formData.message}

I’m impressed by your client success stories and want to know more.`;

    const url = isMobile
      ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;

    window.open(url, "_blank");

    setFormData({ name: "", email: "", company: "", message: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Head>
        <title>Trusted by Clients Worldwide | Social Proof | [Your Company]</title>
        <meta
          name="description"
          content="Discover why clients trust us. See real success stories, testimonials, and reviews showcasing our impact."
        />
        <meta
          name="keywords"
          content="social proof, testimonials, client reviews, success stories, trusted services"
        />
        <meta property="og:title" content="Trusted by Clients Worldwide | Social Proof | [Your Company]" />
        <meta
          property="og:description"
          content="See real client testimonials and success stories that prove our commitment to delivering results."
        />
      </Head>

      <NavBar />

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isMobile ? (
          <button
            aria-label="Chat with us on WhatsApp"
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition"
          >
            <FaWhatsapp className="w-8 h-8" />
          </button>
        ) : (
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition"
          >
            <FaWhatsapp className="w-5 h-5" />
            <span className="font-medium">Chat on WhatsApp</span>
          </button>
        )}
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Trusted by Hundreds of Satisfied Clients</h1>
          <p className="text-xl mb-8">
            See real testimonials and success stories from businesses that grew with our help.
          </p>
          <a
            href="#contact"
            className="bg-white text-[#25609A] px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition"
          >
            Join Our Happy Clients
          </a>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-[#25609A] text-center mb-12">What Our Clients Say</h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              quote:
                "Working with [Your Company] was a game changer. Our traffic tripled and conversions doubled within 3 months!",
              name: "Emily R.",
              role: "Marketing Manager",
              company: "Retail Corp"
            },
            {
              quote:
                "Their team delivered beyond expectations. Clear communication and measurable results made all the difference.",
              name: "James T.",
              role: "CEO",
              company: "Tech Solutions"
            },
            {
              quote:
                "Thanks to [Your Company], we now rank #1 for several key terms. Highly recommend their expertise!",
              name: "Sophia L.",
              role: "Founder",
              company: "Startup Hub"
            }
          ].map((testimonial, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d] flex flex-col"
            >
              <FaQuoteLeft className="text-4xl text-[#25609A] mb-4" />
              <p className="flex-grow italic mb-6">"{testimonial.quote}"</p>
              <p className="font-bold text-[#25609A]">{testimonial.name}</p>
              <p className="text-sm text-gray-600">
                {testimonial.role} at {testimonial.company}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#25609A] mb-12">Our Impact in Numbers</h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d] flex flex-col items-center">
              <FaUsers className="text-5xl text-[#25609A] mb-3" />
              <span className="text-5xl font-extrabold text-[#25609A]">100+</span>
              <span className="mt-1 text-gray-700">Happy Clients</span>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d] flex flex-col items-center">
              <FaStar className="text-5xl text-[#25609A] mb-3" />
              <span className="text-5xl font-extrabold text-[#25609A]">4.9/5</span>
              <span className="mt-1 text-gray-700">Average Client Rating</span>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#52aa4d] flex flex-col items-center">
              <FaCheckCircle className="text-5xl text-[#25609A] mb-3" />
              <span className="text-5xl font-extrabold text-[#25609A]">500+</span>
              <span className="mt-1 text-gray-700">Projects Delivered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section
        id="contact"
        className="max-w-4xl mx-auto px-4 py-16 text-center"
      >
        <h2 className="text-3xl font-bold text-[#25609A] mb-6">
          Interested in Achieving Similar Results?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Reach out to us to learn how we can help grow your business with proven strategies.
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
              name="company"
              placeholder="Company (optional)"
              className="p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
              value={formData.company}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Tell us what you want to achieve..."
              rows="4"
              className="p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#52aa4d]"
              required
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            <button
              type="submit"
              className="bg-[#25609A] text-white px-8 py-3 rounded-md font-bold hover:bg-[#1a4a7a] transition w-full sm:w-auto"
            >
              Contact Us Now
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default SocialProof;
