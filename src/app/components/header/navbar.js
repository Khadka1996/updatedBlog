'use client'
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AiOutlineUser } from "react-icons/ai";
import Link from 'next/link';
import Image from 'next/image';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const pathname = usePathname();

  // Simulating authentication state (replace with your actual auth logic)
  useEffect(() => {
    // Check if user is logged in (this is just a simulation)
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const name = localStorage.getItem('userName') || '';
    
    setIsLoggedIn(loggedIn);
    setUserName(name);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Simulate logout
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserName('');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white text-black sticky top-0 left-0 w-full z-50 shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <Image 
                src="/logos.png" 
                alt="Logo" 
                width={85} 
                height={64} 
                className="h-16 w-20" 
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/' ? 'text-[#4caf4f] bg-gray-100' : 'text-gray-700 hover:text-[#4caf4f] hover:bg-gray-50'
              } transition-colors`}
            >
              Home
            </Link>

            <Link
              href="/blog"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/blog' ? 'text-[#4caf4f] bg-gray-100' : 'text-gray-700 hover:text-[#4caf4f] hover:bg-gray-50'
              } transition-colors`}
            >
              Blog
            </Link>

            <Link
              href="/tools"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/tools' ? 'text-[#4caf4f] bg-gray-100' : 'text-gray-700 hover:text-[#4caf4f] hover:bg-gray-50'
              } transition-colors`}
            >
              Tools
            </Link>

            <Link
              href="/services"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/services' ? 'text-[#4caf4f] bg-gray-100' : 'text-gray-700 hover:text-[#4caf4f] hover:bg-gray-50'
              } transition-colors`}
            >
              Our Services
            </Link>

            <Link
              href="/contact"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/contact' ? 'text-[#4caf4f] bg-gray-100' : 'text-gray-700 hover:text-[#4caf4f] hover:bg-gray-50'
              } transition-colors`}
            >
              Contact Us
            </Link>

            {/* Conditional rendering based on login status */}
            {isLoggedIn ? (
              <div className="relative group ml-2">
                <button className="flex items-center justify-center w-9 h-9 bg-[#4caf4f] text-white rounded-full font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#4caf4f] text-white py-2 px-4 rounded-md flex items-center space-x-1 hover:bg-[#3d8b40] transition-colors duration-300 text-sm font-medium"
              >
                <AiOutlineUser className="mr-1" /> Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu} 
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-gray-700 hover:text-[#4caf4f] transition-colors"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden bg-white text-black shadow-lg rounded-lg mt-1 border border-gray-200">
            <div className="flex flex-col space-y-1 p-2">
              <Link
                href="/"
                className={`px-4 py-3 rounded-md text-base font-medium ${
                  pathname === '/' ? 'text-[#4caf4f] bg-gray-50' : 'text-gray-700'
                } hover:text-[#4caf4f] hover:bg-gray-50 transition-colors`}
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                href="/blog"
                className={`px-4 py-3 rounded-md text-base font-medium ${
                  pathname === '/blog' ? 'text-[#4caf4f] bg-gray-50' : 'text-gray-700'
                } hover:text-[#4caf4f] hover:bg-gray-50 transition-colors`}
                onClick={toggleMenu}
              >
                Blog
              </Link>
              
              <Link
                href="/tools"
                className={`px-4 py-3 rounded-md text-base font-medium ${
                  pathname === '/tools' ? 'text-[#4caf4f] bg-gray-50' : 'text-gray-700'
                } hover:text-[#4caf4f] hover:bg-gray-50 transition-colors`}
                onClick={toggleMenu}
              >
                Tools
              </Link>
              <Link
                href="/services"
                className={`px-4 py-3 rounded-md text-base font-medium ${
                  pathname === '/services' ? 'text-[#4caf4f] bg-gray-50' : 'text-gray-700'
                } hover:text-[#4caf4f] hover:bg-gray-50 transition-colors`}
                onClick={toggleMenu}
              >
                Our Services
              </Link>
              <Link
                href="/contact"
                className={`px-4 py-3 rounded-md text-base font-medium ${
                  pathname === '/contact' ? 'text-[#4caf4f] bg-gray-50' : 'text-gray-700'
                } hover:text-[#4caf4f] hover:bg-gray-50 transition-colors`}
                onClick={toggleMenu}
              >
               Contact Us
              </Link>

              {/* Mobile user section */}
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-[#4caf4f] text-white rounded-full font-semibold text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 text-left text-gray-700 hover:bg-gray-50 text-base font-medium border-t border-gray-100"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-[#4caf4f] text-white py-3 px-6 rounded-md flex items-center justify-center space-x-2 hover:bg-[#3d8b40] transition-colors duration-300 text-base font-medium border-t border-gray-100"
                  onClick={toggleMenu}
                >
                  <AiOutlineUser className="mr-2" /> Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;