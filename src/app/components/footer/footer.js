// frontend/src/app/components/footer/footer.js
'use client'
import React from "react";
import Link from "next/link";
import { FaFacebook, FaTiktok, FaInstagram } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center">
              <img 
                src="/logos.png" 
                alt="EverestKit Logo - Business Solutions Provider" 
                className="h-12 w-auto" 
              />
              <span className="ml-2 text-xl font-bold">EverestKit</span>
            </div>
            <p className="mt-4 text-gray-400">
              Empowering businesses with innovative digital solutions and tools.
            </p>
            <div className="mt-4">
              <p className="text-gray-400 text-sm">
                📧 <a href="mailto:support@everestkit.com" className="hover:text-white transition-colors">support@everestkit.com</a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors block py-1"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-gray-400 hover:text-white transition-colors block py-1"
                >
                  Our Services
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-white transition-colors block py-1"
                >
                  Blog & Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/tools"
                  className="text-gray-400 hover:text-white transition-colors block py-1"
                >
                  Free Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Important Links (REQUIRED FOR ADSENSE) */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors block py-1"
                >
                   Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-gray-400 hover:text-white transition-colors block py-1"
                >
                   Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-gray-400 hover:text-white transition-colors block py-1"
                >
                   Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies-policy"
                  className="text-gray-400 hover:text-white transition-colors block py-1"
                >
                   Cookies Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors block py-1"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            
            {/* Social Media Links */}
            <div className="flex space-x-4 mb-6">
              <a 
                href="https://www.facebook.com/share/1As145MKwz/" 
                target="_blank" 
                rel="noopener noreferrer nofollow" 
                aria-label="Follow us on Facebook"
                className="text-gray-400 hover:text-blue-500 transition-colors transform hover:scale-110"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a 
                href="https://www.tiktok.com/@everestkit?lang=en" 
                target="_blank" 
                rel="noopener noreferrer nofollow" 
                aria-label="Follow us on TikTok"
                className="text-gray-400 hover:text-black transition-colors transform hover:scale-110"
              >
                <FaTiktok className="w-6 h-6" />
              </a>
              <a 
                href="https://youtube.com/@everestkit?si=HOzRe-5ao8ghh2C6" 
                target="_blank" 
                rel="noopener noreferrer nofollow" 
                aria-label="Subscribe to our YouTube channel"
                className="text-gray-400 hover:text-red-600 transition-colors transform hover:scale-110"
              >
                <IoLogoYoutube className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/everestkit1/" 
                target="_blank" 
                rel="noopener noreferrer nofollow" 
                aria-label="Follow us on Instagram"
                className="text-gray-400 hover:text-pink-600 transition-colors transform hover:scale-110"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
            </div>

            {/* Newsletter Subscription */}
            <h4 className="text-sm font-semibold mb-2 text-gray-300">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">
              Get latest tips, tools, and business insights.
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d] text-gray-900 placeholder-gray-500"
                required
                aria-label="Email for newsletter subscription"
              />
              <button
                type="submit"
                className="bg-[#52aa4d] text-white px-4 py-2 rounded-lg hover:bg-[#428a3d] transition-colors font-medium"
                aria-label="Subscribe to newsletter"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>

        {/* Copyright & Powered By Section */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              <p>
                © {currentYear} EverestKit. All rights reserved. 
                <span className="block md:inline md:ml-2 mt-1 md:mt-0">
                  Registered in Nepal.
                </span>
              </p>
            </div>

            {/* Additional Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/sitemap"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sitemap
              </Link>
              <Link
                href="/affiliate-disclosure"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Affiliate Disclosure
              </Link>
              <Link
                href="/acceptable-use-policy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Acceptable Use Policy
              </Link>
            </div>

            {/* Powered By */}
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                Developed by{" "}
                <a
                  href="https://khadka-manish.com.np"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-[#52aa4d] hover:text-[#428a3d] transition-colors font-medium"
                  aria-label="Visit developer's website"
                >
                  MNZ
                </a>
              </p>
            </div>
          </div>

          {/* SEO & Compliance Note */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              EverestKit provides business tools and digital solutions. All trademarks and logos belong to their respective owners.
              <span className="block mt-1">
                This site uses cookies to enhance user experience. By continuing to browse, you agree to our <Link href="/cookies-policy" className="text-gray-400 hover:text-white">Cookie Policy</Link>.
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;