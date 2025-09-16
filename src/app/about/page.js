import React from 'react';
import { 
  FaSearch, 
  FaChartLine, 
  FaLaptopCode, 
  FaUsers, 
  FaCommentAlt,
  FaLightbulb, 
  FaHandshake, 
  FaRocket, 
  FaLinkedin, 
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileImage,
  FaFileAlt,
  FaVideo,
  FaImage,
  FaPen,
  FaTint,
  FaBlog
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Image from 'next/image';
import { FaFacebook } from "react-icons/fa";
import OurteamBg from '../components/assets/our-team.png';
import AbiskarImage from '../components/assets/Abiskar.jpg';
import Abiskar2Image from '../components/assets/abiskar2.jpg';
import Manish from '../components/assets/Manissh.jpeg';
import Footer from '../components/footer/footer';
import NavBar from '../components/header/navbar';

const AboutUs = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Abiskar Poudel',
      position: 'CEO & Founder',
      bio: 'Inspiring leader for strategic growth, innovation and global business excellence.',
      linkedin: 'https://www.linkedin.com/in/abiskar-poudel-1a4a28365?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      twitter: 'https://www.facebook.com/share/1CjLjcW62f/',
      image: AbiskarImage
    },
    // {
    //   id: 2,
    //   name: 'Abiskar Poudel',
    //   position: 'CTO',
    //   bio: 'Tech visionary specializing in web solutions',
    //   linkedin: '#',
    //   twitter: '#',
    //   image: Abiskar2Image
    // },
    {
      id: 3,
      name: 'Manish Khadka',
      position: 'Lead Developer',
      bio: 'Full-stack developer with passion for clean code with 5+ of experience.',
      linkedin: 'https://www.linkedin.com/in/manishkhadka1996/',
      twitter: 'https://www.facebook.com/manishkhadka13',
      image: Manish
    },
    // {
    //   id: 4,
    //   name: 'Abiskar Poudel',
    //   position: 'Content Strategist',
    //   bio: 'SEO and content writing specialist',
    //   linkedin: '#',
    //   twitter: '#',
    //   image: Abiskar2Image
    // }
  ];

  const pdfTools = [
    { name: 'Merge PDF', icon: <FaFilePdf />, desc: 'Combine PDFs in the order you want' },
    { name: 'Split PDF', icon: <FaFilePdf />, desc: 'Separate pages into independent files' },
    { name: 'Compress PDF', icon: <FaFilePdf />, desc: 'Reduce file size while maintaining quality' },
    { name: 'PDF to Word', icon: <FaFileWord />, desc: 'Convert to editable DOC/DOCX files' },
    { name: 'PDF to PowerPoint', icon: <FaFilePowerpoint />, desc: 'Turn PDFs into PPT slides' },
    { name: 'PDF to Excel', icon: <FaFileExcel />, desc: 'Extract data to spreadsheets' },
    { name: 'Photo to PDF', icon: <FaFileImage />, desc: 'Convert images to PDF documents' },
    { name: 'Word to PDF', icon: <FaFileWord />, desc: 'Convert DOC files to PDF' },
    { name: 'PowerPoint to PDF', icon: <FaFilePowerpoint />, desc: 'Convert PPT to PDF' },
    { name: 'Excel to PDF', icon: <FaFileExcel />, desc: 'Convert spreadsheets to PDF' },
    { name: 'Edit PDF', icon: <FaPen />, desc: 'Add text, images or annotations' },
    { name: 'PDF to JPG', icon: <FaFileImage />, desc: 'Convert pages to images' },
    { name: 'Watermark', icon: <FaTint />, desc: 'Add image or text watermark' },
    { name: 'Video Downloader', icon: <FaVideo />, desc: 'Download videos from platforms' },
    { name: 'Photo Size Reducer', icon: <FaImage />, desc: 'Reduce image file size' },
    { name: 'Photo Cropper', icon: <FaImage />, desc: 'Crop images with precision' }
  ];

  return (
    <>
      <NavBar />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Hero Section */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-5xl font-bold text-[#25609A] mb-4'>About Our Company</h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            We combine innovation, expertise, and passion to deliver exceptional digital solutions that drive real results.
          </p>
        </div>

        {/* Our Story */}
        <div className='mx-3 md:mx-10 lg:mx-18'>
          <div className='flex flex-col lg:flex-row items-center gap-12 mb-20'>
            <div className='lg:w-1/2'>
              <h2 className='text-3xl font-bold text-[#25609A] mb-6'>Our Story</h2>
              <p className='text-gray-600 mb-4'>
                Founded in 2020, we began as a small team of digital enthusiasts with a shared vision: to help businesses thrive in the online world. What started as a passion project has grown into a full-service digital agency serving clients across multiple industries.
              </p>
              <p className='text-gray-600 mb-4'>
                Over the years, we’ve evolved our services to meet the changing needs of the digital landscape, but our core commitment remains the same — delivering measurable results through strategic, creative solutions.
              </p>
              <div className='bg-[#52aa4d] text-white p-4 rounded-lg inline-block'>
                <span className='font-bold'>100+</span> Successful Projects Delivered
              </div>
            </div>
            <div className='lg:w-1/2'>
              <img 
                src={OurteamBg.src} 
                alt='Our team working together' 
                className='rounded-xl w-full h-auto'
              />
            </div>
          </div>

          {/* Our Services */}
          <div className='mb-20'>
            <h2 className='text-3xl font-bold text-[#25609A] mb-12 text-center'>Our Services</h2>
            
            {/* Digital Services */}
            <h3 className='text-2xl font-semibold text-[#25609A] mb-6'>Digital Solutions</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12'>
              <div className='group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-[#25609A] hover:border-[#52aa4d]'>
                <FaSearch className='text-3xl text-[#52aa4d] mb-3 group-hover:scale-110 transition-transform' />
                <h3 className='font-semibold text-lg text-center text-gray-800 mb-2'>SEO Content Writing</h3>
                <p className='text-gray-600 text-sm text-center mb-3'>High-quality, optimized content</p>
                <a href='/services/seo-content-writing' className='mt-auto px-4 py-2 bg-[#25609A] text-white rounded-md hover:bg-[#52aa4d] transition-colors duration-300 text-sm font-medium'>
                  Learn More
                </a>
              </div>
              <div className='group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-[#25609A] hover:border-[#52aa4d]'>
                <FaChartLine className='text-3xl text-[#52aa4d] mb-3 group-hover:scale-110 transition-transform' />
                <h3 className='font-semibold text-lg text-center text-gray-800 mb-2'>Digital Marketing</h3>
                <p className='text-gray-600 text-sm text-center mb-3'>Comprehensive online strategies</p>
                <a href='/services/digital-marketing' className='mt-auto px-4 py-2 bg-[#25609A] text-white rounded-md hover:bg-[#52aa4d] transition-colors duration-300 text-sm font-medium'>
                  Learn More
                </a>
              </div>
              <div className='group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-[#25609A] hover:border-[#52aa4d]'>
                <FaLaptopCode className='text-3xl text-[#52aa4d] mb-3 group-hover:scale-110 transition-transform' />
                <h3 className='font-semibold text-lg text-center text-gray-800 mb-2'>Website Development</h3>
                <p className='text-gray-600 text-sm text-center mb-3'>Custom, responsive websites</p>
                <a href='/services/website-development' className='mt-auto px-4 py-2 bg-[#25609A] text-white rounded-md hover:bg-[#52aa4d] transition-colors duration-300 text-sm font-medium'>
                  Learn More
                </a>
              </div>
              <div className='group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-[#25609A] hover:border-[#52aa4d]'>
                <FaUsers className='text-3xl text-[#52aa4d] mb-3 group-hover:scale-110 transition-transform' />
                <h3 className='font-semibold text-lg text-center text-gray-800 mb-2'>Lead Capture</h3>
                <p className='text-gray-600 text-sm text-center mb-3'>Convert visitors to customers</p>
                <a href='/services/lead-capture' className='mt-auto px-4 py-2 bg-[#25609A] text-white rounded-md hover:bg-[#52aa4d] transition-colors duration-300 text-sm font-medium'>
                  Learn More
                </a>
              </div>
              <div className='group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-b-4 border-[#25609A] hover:border-[#52aa4d]'>
                <FaBlog className='text-3xl text-[#52aa4d] mb-3 group-hover:scale-110 transition-transform' />
                <h3 className='font-semibold text-lg text-center text-gray-800 mb-2'>Blog Writing</h3>
                <p className='text-gray-600 text-sm text-center mb-3'>Engaging, informative articles</p>
                <a href='/services/blog-writing' className='mt-auto px-4 py-2 bg-[#25609A] text-white rounded-md hover:bg-[#52aa4d] transition-colors duration-300 text-sm font-medium'>
                  Learn More
                </a>
              </div>
            </div>

            {/* PDF Tools */}
            <h3 className='text-2xl font-semibold text-[#25609A] mb-6'>PDF Tools (100% Free)</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {pdfTools.map((tool, index) => (
                <div key={index} className='group flex flex-col p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-[#25609A] hover:border-[#52aa4d]'>
                  <div className='flex items-center mb-2'>
                    <span className='text-[#52aa4d] mr-3 text-xl'>{tool.icon}</span>
                    <h3 className='font-semibold text-gray-800'>{tool.name}</h3>
                  </div>
                  <p className='text-gray-600 text-sm'>{tool.desc}</p>
                  <a href={`/tools/${tool.name.toLowerCase().replace(/\s+/g, '-')}`} className='mt-2 text-[#25609A] text-sm hover:text-[#52aa4d] hover:underline self-end'>
                    Try Now
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Our Values */}
          <div className='mb-20'>
            <h2 className='text-3xl font-bold text-[#25609A] mb-12 text-center'>Our Core Values</h2>
            <div className='grid md:grid-cols-3 gap-8'>
              <div className='bg-white p-6 rounded-xl shadow-md border-t-4 border-[#25609A] hover:border-[#52aa4d] transition-all'>
                <div className='text-[#52aa4d] text-3xl mb-4'>
                  <FaLightbulb />
                </div>
                <h3 className='text-xl font-semibold mb-3'>Innovation</h3>
                <p className='text-gray-600'>
                  We stay ahead of trends and constantly explore new approaches to solve our clients’ challenges.
                </p>
              </div>
              <div className='bg-white p-6 rounded-xl shadow-md border-t-4 border-[#25609A] hover:border-[#52aa4d] transition-all'>
                <div className='text-[#52aa4d] text-3xl mb-4'>
                  <FaHandshake />
                </div>
                <h3 className='text-xl font-semibold mb-3'>Integrity</h3>
                <p className='text-gray-600'>
                  We build trust through transparency, honesty, and delivering on our promises.
                </p>
              </div>
              <div className='bg-white p-6 rounded-xl shadow-md border-t-4 border-[#25609A] hover:border-[#52aa4d] transition-all'>
                <div className='text-[#52aa4d] text-3xl mb-4'>
                  <FaRocket />
                </div>
                <h3 className='text-xl font-semibold mb-3'>Results-Driven</h3>
                <p className='text-gray-600'>
                  Every strategy we implement is measured against concrete business objectives.
                </p>
              </div>
            </div>
          </div>

          {/* Meet the Team */}
          <div className='mb-20 '>
            <h2 className='text-3xl font-bold text-[#25609A] mb-12 text-center'>Meet Our Team</h2>
            <div className='grid sm:grid-cols-2 md:grid-cols-4 gap-6'>
              {teamMembers.map((member) => (
                <div key={member.id} className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    width={256} 
                    height={256} 
                    className='w-full h-64 object-cover'
                    unoptimized // Avoids server-side optimization issues
                  />
                  <div className='p-4'>
                    <h3 className='font-bold text-lg text-[#25609A]'>{member.name}</h3>
                    <p className='text-[#52aa4d] text-sm mb-2'>{member.position}</p>
                    <p className='text-gray-600 text-sm'>{member.bio}</p>
                    <div className='flex mt-3  space-x-2'>
                      <a href={member.linkedin} className='text-[#25609A] hover:text-[#52aa4d]'>
                        <FaLinkedin />
                      </a>
                      <a href={member.facebook} className='text-[#25609A] hover:text-[#52aa4d]'>
                        <FaFacebook />

                      </a>
                      <a href={member.twitter} className='text-[#25609A] hover:text-[#52aa4d]'>
                        <FaFacebook />

                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className='bg-gradient-to-r from-[#25609A] to-[#52aa4d] rounded-xl p-8 text-center text-white'>
            <h2 className='text-2xl md:text-3xl font-bold mb-4'>Ready to Grow Your Business?</h2>
            <p className='mb-6 max-w-2xl mx-auto'>
              Let’s discuss how we can help you achieve your digital goals and take your business to the next level.
            </p>
            <a 
              href='/contact' 
              className='inline-block bg-white text-[#25609A] px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors'
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;