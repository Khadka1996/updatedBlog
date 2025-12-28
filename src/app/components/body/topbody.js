'use client'
import React from 'react';
import Image from 'next/image';
import image from '../assets/image.png';
import { AiOutlineArrowRight } from 'react-icons/ai'; // Import the arrow icon

const TopBody = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center justify-center text-center p-8 space-y-8 lg:space-y-0 lg:space-x-12">
        
        {/* Left Side - Text Content */}
        <div className="mx-3 md:mx-10 lg:mx-18">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-5xl font-bold text-black leading-tight">
            Place for your<br />One Step 
          </h1>

          {/* Sub Heading */}
          <h2 className="text-3xl md:text-6xl font-semibold text-[#4caf4f] mt-4">
            Solutions
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-[600px] mx-auto">
            A Vibrant hub for tools, content & services
          </p>

          {/* Contact Button */}
          <a
            href="/contact"
            className="group bg-[#4caf4f] text-white py-3 px-8 rounded-lg mt-6 inline-flex items-center justify-center space-x-2 text-lg hover:bg-[#6a9b52] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4caf4f] focus:ring-offset-2"
          >
            <span>Contact Us</span>
            <AiOutlineArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Right Side - Image */}
        <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center">
          <Image
            src={image}
            alt="Digital Service"
            width={400}
            height={300}
            className="rounded-lg object-cover w-full max-w-[300px] md:max-w-[350px] lg:max-w-[400px] h-auto shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default TopBody;
