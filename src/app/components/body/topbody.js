import React from 'react';
import Image from 'next/image';
import image from '../assets/image.png';
import { AiOutlineArrowRight } from 'react-icons/ai';

const TopBody = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center justify-center text-center p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-0 lg:space-x-12">

        {/* Left Side - Text Content */}
        <div className="mx-2 sm:mx-6 md:mx-10 lg:mx-18">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl font-bold text-black leading-tight">
            Place for your<br />One Step
          </h1>
          {/* Sub Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold text-[#4caf4f] mt-2 sm:mt-4">
            Solutions
          </h2>
          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mt-2 sm:mt-4 max-w-[600px] mx-auto">
            A vibrant hub for tools, content & services
          </p>
          {/* Contact Button */}
          <a
            href="/contact"
            className="group bg-[#4caf4f] text-white py-3 px-7 rounded-lg mt-4 sm:mt-6 inline-flex items-center justify-center space-x-2 text-base sm:text-lg hover:bg-[#3e8e40] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4caf4f] focus:ring-offset-2"
          >
            <span>Contact Us</span>
            <AiOutlineArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Right Side - Image */}
        <div className="lg:w-1/2 mt-1 sm:mt-3 lg:mt-0 flex justify-center">
          <Image
            src={image}
            alt="Everestkit — digital services and online tools"
            width={400}
            height={300}
            priority
            className="rounded-lg object-cover w-full max-w-[270px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[400px] h-auto shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default TopBody;
