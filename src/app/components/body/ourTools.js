import React from "react";
import { FaFilePdf, FaCropAlt, FaCompress } from "react-icons/fa";
import { FaScissors, FaArrowRight } from "react-icons/fa6";

const OurTools = () => {
  const tools = [
    {
      name: "Merge PDF",
      description: "Combine PDFs in the order you want with the easiest PDF merger available.",
      icon: <FaFilePdf className="text-white" size="1.75rem" />,
      color: "bg-[#4CAF4F]",
      href: "/tools/merge-pdf"
    },
    {
      name: "Split PDF",
      description: "Separate one PDF into multiple smaller files quickly and efficiently.",
      icon: <FaScissors className="text-white" size="1.75rem" />,
      color: "bg-[#4CAF4F]",
      href: "/tools/split-pdf"
    },
    {
      name: "Photo Cropper",
      description: "Crop and resize your images with precision in just a few clicks.",
      icon: <FaCropAlt className="text-white" size="1.75rem" />,
      color: "bg-[#4CAF4F]",
      href: "/tools/photo-cropper"
    },
    {
      name: "Compress PDF",
      description: "Reduce file size of your PDFs while maintaining quality and clarity.",
      icon: <FaCompress className="text-white" size="1.75rem" />,
      color: "bg-[#4CAF4F]",
      href: "/tools/compress-pdf"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-[#f8fafc] to-[#eef2f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Tools at Your Fingertips
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your document workflow with our intuitive, feature-rich tools designed for professionals.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-2"
            >
              <a href={tool.href} className="absolute inset-0 z-10" aria-label={tool.name} />

              {/* Tool icon */}
              <div className={`${tool.color} h-32 flex items-center justify-center`}>
                <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  {tool.icon}
                </div>
              </div>

              {/* Tool content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#1f4e7a] mb-2">{tool.name}</h3>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <div className="flex items-center text-[#4CAF4F] font-medium group-hover:text-[#1a4a7a] transition-colors">
                  <span>Get Started</span>
                  <FaArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Border hover effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#25609a] rounded-xl pointer-events-none transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTools;
