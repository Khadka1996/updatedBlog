'use client'

import { useState, useRef, useEffect } from 'react';
import { FaFilePdf, FaFont, FaImage, FaPen, FaShapes, FaSignature, FaTrash, FaDownload } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function EditPDF() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [activeTool, setActiveTool] = useState(null);
  const [adsLoaded, setAdsLoaded] = useState(false); // Track AdSense script loading
  const [editorOptions, setEditorOptions] = useState({
    text: {
      content: '',
      font: 'Helvetica',
      size: 12,
      color: '#000000',
      bold: false,
      italic: false
    },
    image: null,
    shapes: {
      type: 'rectangle',
      color: '#FF0000',
      fill: false
    },
    annotations: {
      type: 'highlight',
      color: '#FFFF00'
    }
  });
  const [elements, setElements] = useState([]);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Tools available in the editor
  const tools = [
    { id: 'text', icon: <FaFont />, label: 'Text' },
    { id: 'image', icon: <FaImage />, label: 'Image' },
    { id: 'draw', icon: <FaPen />, label: 'Draw' },
    { id: 'shapes', icon: <FaShapes />, label: 'Shapes' },
    { id: 'signature', icon: <FaSignature />, label: 'Signature' },
    { id: 'delete', icon: <FaTrash />, label: 'Delete' }
  ];

  // Handle PDF file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile({
      file: selectedFile,
      name: selectedFile.name,
      size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(selectedFile)
    });
    setDownloadUrl('');
    setElements([]);
    setActiveTool(null);
  };

  // Handle image selection for image tool
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditorOptions(prev => ({
        ...prev,
        image: {
          file: selectedFile,
          preview: event.target.result
        }
      }));
      setActiveTool('image');
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handle option changes
  const handleOptionChange = (tool, option, value) => {
    setEditorOptions(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool],
        [option]: value
      }
    }));
  };

  // Simulate save process
  const handleSave = async () => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call delay based on file size
    const fileSizeMB = parseFloat(file.size);
    const delay = fileSizeMB > 10 ? 3000 : fileSizeMB > 5 ? 2000 : 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Mock implementation for demo:
    const mockBlob = new Blob(['Mock edited PDF content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(mockBlob);
    setDownloadUrl(url);
    setIsProcessing(false);
  };

  // Add a new element to the PDF
  const addElement = (type, options) => {
    const newElement = {
      id: Date.now(),
      type,
      options,
      position: { x: 50, y: 50 } // Default position
    };
    setElements([...elements, newElement]);
  };

  // Remove an element
  const removeElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
  };

  // Initialize all ad units
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({}); // Top ad
        window.adsbygoogle.push({}); // Bottom ad
        if (file) {
          window.adsbygoogle.push({}); // Middle ad
        }
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded, file]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (file?.preview) URL.revokeObjectURL(file.preview);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (editorOptions.image?.preview) URL.revokeObjectURL(editorOptions.image.preview);
    };
  }, [file, downloadUrl, editorOptions.image]);

  return (
    <>
    <NavBar/>
    
    <div className="p-6 bg-gray-100 ">
      <Head>
        <title>Edit PDF - PDF Tools</title>
        <meta name="description" content="Edit your PDF documents by adding text, images, and annotations" />
      </Head>

       {/* Google AdSense Script */}
        <Script 
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX`}
          // Replace 'ca-pub-XXXXXXXXXXXXXXXX' with your actual AdSense publisher ID from your AdSense account
          crossOrigin="anonymous"
          onLoad={() => setAdsLoaded(true)}
          onError={(e) => console.error('AdSense script failed to load', e)}
        />
      
      <div className="mx-3 md:mx-10 lg:mx-18">
        {/* Top Ad Unit - Responsive Leaderboard */}
        <div className="mb-8">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual AdSense publisher ID
            data-ad-slot="YOUR_TOP_AD_SLOT" // Replace with your actual top ad unit slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
        
        <div className="flex items-center mb-6">
          <a href="/tools" className="text-blue-600 hover:underline">← Back to all tools</a>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <FaFilePdf className="text-[#4caf4f] text-4xl mr-4" />
            <h1 className="text-3xl font-bold text-gray-900">Edit PDF</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            Add text, images, drawings, and annotations to your PDF documents. Customize and save your changes.
          </p>
          
          {/* File Upload Area */}
          {!file ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-8 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".pdf" 
                onChange={handleFileChange}
              />
              <p className="text-gray-500 mb-2">
                <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-400">PDF files only (max 50MB)</p>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex-shrink-0 w-10 h-10 bg-red-50 flex items-center justify-center rounded mr-3">
                  <FaFilePdf className="text-red-500" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.size}</p>
                </div>
                <button 
                  onClick={() => {
                    URL.revokeObjectURL(file.preview);
                    if (editorOptions.image?.preview) {
                      URL.revokeObjectURL(editorOptions.image.preview);
                    }
                    setFile(null);
                    setElements([]);
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  ×
                </button>
              </div>
              
              {/* Middle Ad Unit - Responsive Rectangle */}
              {file && (
                <div className="my-6">
                  <ins
                    className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual AdSense publisher ID
                    data-ad-slot="YOUR_MIDDLE_AD_SLOT" // Replace with your actual middle ad unit slot ID
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                  ></ins>
                </div>
              )}
              
              {/* Editor Area */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Toolbar */}
                <div className="w-full lg:w-1/6">
                  <h3 className="text-lg font-semibold mb-3">Tools</h3>
                  <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                    {tools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          if (tool.id === 'image') {
                            imageInputRef.current.click();
                          } else {
                            setActiveTool(tool.id);
                          }
                        }}
                        className={`p-3 rounded-lg flex flex-col items-center ${activeTool === tool.id ? 'bg-[#4caf4f] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <span className="text-xl mb-1">{tool.icon}</span>
                        <span className="text-sm">{tool.label}</span>
                      </button>
                    ))}
                    <input 
                      type="file" 
                      ref={imageInputRef}
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange}
                    />
                  </div>
                  
                  {/* Tool Options */}
                  {activeTool === 'text' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">Text Options</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1 text-sm">Text Content</label>
                          <input
                            type="text"
                            value={editorOptions.text.content}
                            onChange={(e) => handleOptionChange('text', 'content', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            placeholder="Enter text..."
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm">Font</label>
                          <select
                            value={editorOptions.text.font}
                            onChange={(e) => handleOptionChange('text', 'font', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="Helvetica">Helvetica</option>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm">Size</label>
                          <input
                            type="range"
                            min="8"
                            max="72"
                            value={editorOptions.text.size}
                            onChange={(e) => handleOptionChange('text', 'size', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-center text-sm">{editorOptions.text.size}px</div>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm">Color</label>
                          <input
                            type="color"
                            value={editorOptions.text.color}
                            onChange={(e) => handleOptionChange('text', 'color', e.target.value)}
                            className="w-full h-8"
                          />
                        </div>
                        <div className="flex space-x-4">
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={editorOptions.text.bold}
                              onChange={(e) => handleOptionChange('text', 'bold', e.target.checked)}
                              className="mr-2"
                            />
                            Bold
                          </label>
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={editorOptions.text.italic}
                              onChange={(e) => handleOptionChange('text', 'italic', e.target.checked)}
                              className="mr-2"
                            />
                            Italic
                          </label>
                        </div>
                        <button
                          onClick={() => addElement('text', editorOptions.text)}
                          className="w-full mt-2 p-2 bg-blue-600 text-white rounded text-sm"
                        >
                          Add Text
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activeTool === 'image' && editorOptions.image && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">Image Preview</h4>
                      <img 
                        src={editorOptions.image.preview} 
                        alt="Selected" 
                        className="max-w-full h-auto mb-3 border"
                      />
                      <button
                        onClick={() => addElement('image', { src: editorOptions.image.preview })}
                        className="w-full p-2 bg-blue-600 text-white rounded text-sm"
                      >
                        Add Image to PDF
                      </button>
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(editorOptions.image.preview);
                          setEditorOptions(prev => ({
                            ...prev,
                            image: null
                          }));
                          setActiveTool(null);
                        }}
                        className="w-full mt-2 p-2 bg-gray-200 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {activeTool === 'shapes' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">Shape Options</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1 text-sm">Shape Type</label>
                          <select
                            value={editorOptions.shapes.type}
                            onChange={(e) => handleOptionChange('shapes', 'type', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="rectangle">Rectangle</option>
                            <option value="circle">Circle</option>
                            <option value="line">Line</option>
                            <option value="arrow">Arrow</option>
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm">Color</label>
                          <input
                            type="color"
                            value={editorOptions.shapes.color}
                            onChange={(e) => handleOptionChange('shapes', 'color', e.target.value)}
                            className="w-full h-8"
                          />
                        </div>
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={editorOptions.shapes.fill}
                            onChange={(e) => handleOptionChange('shapes', 'fill', e.target.checked)}
                            className="mr-2"
                          />
                          Fill Shape
                        </label>
                        <button
                          onClick={() => addElement('shape', editorOptions.shapes)}
                          className="w-full mt-2 p-2 bg-blue-600 text-white rounded text-sm"
                        >
                          Add Shape
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Canvas Area */}
                <div className="w-full lg:w-5/6">
                  <div 
                    ref={canvasRef}
                    className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
                    style={{ height: '600px', position: 'relative', overflow: 'hidden' }}
                  >
                    {/* PDF Preview Placeholder */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      PDF Preview Area
                    </div>
                    
                    {/* Elements would be rendered here in a real implementation */}
                    {elements.length > 0 && (
                      <div className="absolute inset-0 pointer-events-none">
                        {elements.map(element => (
                          <div 
                            key={element.id}
                            style={{
                              position: 'absolute',
                              left: `${element.position.x}px`,
                              top: `${element.position.y}px`,
                              border: '1px dashed #ccc',
                              padding: '5px',
                              background: 'rgba(255,255,255,0.7)'
                            }}
                          >
                            {element.type === 'text' && (
                              <div style={{
                                fontFamily: element.options.font,
                                fontSize: `${element.options.size}px`,
                                color: element.options.color,
                                fontWeight: element.options.bold ? 'bold' : 'normal',
                                fontStyle: element.options.italic ? 'italic' : 'normal'
                              }}>
                                {element.options.content}
                              </div>
                            )}
                            {element.type === 'image' && (
                              <img 
                                src={element.options.src} 
                                alt="Added to PDF" 
                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                              />
                            )}
                            {element.type === 'shape' && (
                              <div style={{
                                width: '100px',
                                height: '60px',
                                border: `2px solid ${element.options.color}`,
                                backgroundColor: element.options.fill ? element.options.color : 'transparent',
                                borderRadius: element.options.type === 'circle' ? '50%' : '0'
                              }}></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Elements List */}
                  {elements.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Added Elements</h4>
                      <div className="space-y-2">
                        {elements.map(element => (
                          <div key={element.id} className="flex justify-between items-center p-2 bg-white rounded border">
                            <div className="flex items-center">
                              {element.type === 'text' && <FaFont className="mr-2" />}
                              {element.type === 'image' && <FaImage className="mr-2" />}
                              {element.type === 'shape' && <FaShapes className="mr-2" />}
                              <span className="capitalize">{element.type}</span>
                            </div>
                            <button
                              onClick={() => removeElement(element.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Save Button */}
          {file && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className={`px-6 py-3 rounded-lg font-medium text-white ${isProcessing ? 'bg-gray-400' : 'bg-[#4caf4f] hover:bg-[#3e8e40]'} transition-colors flex items-center`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Edited PDF'
                )}
              </button>
            </div>
          )}
          
          {/* Download Link */}
          {downloadUrl && (
            <div className="mt-6 text-center">
              <a 
                href={downloadUrl} 
                download={`edited-${file.name}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <FaDownload className="mr-2" />
                Download Edited PDF
              </a>
              <div className="mt-4">
                <button
                  onClick={() => {
                    URL.revokeObjectURL(file.preview);
                    if (editorOptions.image?.preview) {
                      URL.revokeObjectURL(editorOptions.image.preview);
                    }
                    setFile(null);
                    setDownloadUrl('');
                    setElements([]);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit another file
                </button>
              </div>
            </div>
          )}
          
          {/* Bottom Ad Unit - Responsive Leaderboard */}
          <div className="mt-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual AdSense publisher ID
              data-ad-slot="YOUR_BOTTOM_AD_SLOT" // Replace with your actual bottom ad unit slot ID
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] mt-5 rounded-xl p-8 text-center text-white">
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
    <Footer/>
    </>
  );
}