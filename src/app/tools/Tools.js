import { FaFilePdf, FaFileWord, FaDownload, FaFilePowerpoint, FaFileExcel, FaImage, FaEdit, FaFileAlt, FaPaste, FaCropAlt } from "react-icons/fa";
import { MdMergeType, MdCompress } from "react-icons/md";
import { FaCalendarAlt, FaSortAlphaDown, FaCalculator, FaMoneyBillWave, FaClock,FaFont  } from "react-icons/fa"; // Import relevant icons

const tools = [
  { icon: <MdMergeType className="text-[#4caf4f] text-4xl" />, title: "Merge PDF", description: "Combine PDFs in the order you want with the easiest PDF merger available." },
  { icon: <FaFilePdf className="text-[#4caf4f] text-4xl" />, title: "Split PDF", description: "Separate one page or a whole set for easy conversion into independent PDF files." },
  { icon: <FaFileAlt className="text-[#4caf4f] text-4xl" />, title: "Compress PDF", description: "Reduce file size while optimizing for maximal PDF quality." },
  // { icon: <FaFileWord className="text-[#4caf4f] text-4xl" />, title: "PDF to Word", description: "Convert PDFs to easy-to-edit DOC and DOCX documents with high accuracy." },
  // { icon: <FaFilePowerpoint className="text-[#4caf4f] text-4xl" />, title: "PDF to PowerPoint", description: "Turn your PDFs into PPT and PPTX slideshows effortlessly." },
  // { icon: <FaFileExcel className="text-[#4caf4f] text-4xl" />, title: "PDF to Excel", description: "Extract data from PDFs into Excel spreadsheets in seconds." },
  { icon: <FaImage  className="text-[#4caf4f] text-4xl" />, title: "Photo to PDF", description: "Crop your images with precision to highlight the perfect area." },
  // { icon: <FaFileWord className="text-[#4caf4f] text-4xl" />, title: "Word to PDF", description: "Convert DOC and DOCX files to PDF for easier reading." },
  // { icon: <FaFilePowerpoint className="text-[#4caf4f] text-4xl" />, title: "PowerPoint to PDF", description: "Convert PPT and PPTX slideshows to PDF for easy viewing." },
  // { icon: <FaFileExcel className="text-[#4caf4f] text-4xl" />, title: "Excel to PDF", description: "Convert EXCEL spreadsheets to PDF for better readability." },
  { icon: <FaEdit className="text-[#4caf4f] text-4xl" />, title: "Edit PDF", description: "Add text, images, shapes, or freehand annotations to PDFs." },
  { icon: <FaImage className="text-[#4caf4f] text-4xl" />, title: "PDF to JPG", description: "Convert each PDF page into JPG or extract images from PDFs." },
  { icon: <FaPaste className="text-[#4caf4f] text-4xl" />, title: "Watermark", description: "Add an image or text watermark to your PDFs easily." },
  { icon: <FaDownload className="text-[#4caf4f] text-4xl" />, title: "Video Downloader", description: "Download videos from various platforms in different formats and qualities." },
  { icon: <MdCompress className="text-[#4caf4f] text-4xl" />, title: "Photo Size Reducer", description: "Reduce photo file size without losing quality for easy sharing." },
  { icon: <FaCropAlt className="text-[#4caf4f] text-4xl" />, title: "Photo Cropper", description: "Crop your images with precision to highlight the perfect area." },
  {
    icon: <FaCalendarAlt className="text-[#4caf4f] text-4xl" />,
    title: "Date Converter",
    description: "Convert dates between calendars with ease and accuracy.",
  },
  {
    icon: <FaSortAlphaDown className="text-[#4caf4f] text-4xl" />,
    title: "Word Counter",
    description: "Count words and characters in your text instantly.",
  },
  {
    icon: <FaCalculator className="text-[#4caf4f] text-4xl" />,
    title: "Calculator",
    description: "Perform basic and scientific calculations quickly.",
  },
  {
    icon: <FaMoneyBillWave className="text-[#4caf4f] text-4xl" />,
    title: "Currency Converter",
    description: "Convert currencies in real-time using the latest exchange rates.",
  },
  {
    icon: <FaClock className="text-[#4caf4f] text-4xl" />,
    title: "Time Zone Converter",
    description: "Compare time zones and plan meetings across different countries.",
  },
  {
    icon: <FaFont className="text-[#4caf4f] text-4xl" />,
    title: "Nepali Fonts Tool",
    description: "Convert  Unicode and Nepali fonts easily.",
  },
];

export default function Tools() {
  return (
    <div className="pt-20 pb-12">
<div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Every tool you need to work with PDFs in one place
        </h1>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split PDFs Photo Size Reducer and Photo Cropper  with just a few clicks.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tools.map((tool, index) => (
            <a 
              key={index} 
              href={`/tools/${tool.title.toLowerCase().replace(/\s+/g, "-")}`} 
              className="p-6 bg-white shadow-md rounded-lg text-center hover:shadow-lg transition-shadow duration-200 block cursor-pointer"
            >
              <div className="flex justify-center mb-4">{tool.icon}</div>
              <h3 className="text-xl font-semibold">{tool.title}</h3>
              <p className="text-gray-500 mt-2">{tool.description}</p>
            </a>
          ))}
        </div>
         <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] mt-7 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Let's discuss how we can help you achieve your digital goals and take your business to the next level.
        </p>
        <a 
          href="/contact" 
          className="inline-block bg-white text-[#25609A] px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
        >
          Get in Touch
        </a>
      </div>
      </div>
    </div>
  );
}