import React from "react";
import { FaFacebook, FaTiktok, FaInstagram } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center">
              <img src="/logos.png" alt="Company Logo" className="h-12 w-auto" />
              <span className="ml-2 text-xl font-bold">EverestKit</span>
            </div>
            <p className="mt-4 text-gray-400">
              Empowering businesses with innovative solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["About Us", "Services", "Contact Us", "Privacy Policy"].map((link, idx) => (
                <li key={idx}>
                  <a
                    href={`/${link.toLowerCase().replace(/\s/g, "")}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/1As145MKwz/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="https://www.tiktok.com/@everestkit?lang=en" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaTiktok className="w-6 h-6" />
              </a>
              <a href="https://youtube.com/@everestkit?si=HOzRe-5ao8ghh2C6" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <IoLogoYoutube className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/everestkit1/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Subscribe</h3>
            <p className="text-gray-400 mb-4">
              Stay updated with our latest news and offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52aa4d] text-gray-900"
              />
              <button
                type="submit"
                className="bg-[#52aa4d] text-white px-4 py-2 rounded-lg hover:bg-[#428a3d] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Powered By Section */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400">
            Powered by{" "}
            <a
              href="https://khadka-manish.com.np"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#52aa4d] hover:text-[#428a3d] transition-colors"
            >
              MNZ
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
