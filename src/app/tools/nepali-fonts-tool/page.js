'use client';

import { useState, useEffect, useRef } from 'react';
import { FaFont, FaExchangeAlt, FaCopy, FaDownload, FaLanguage, FaSyncAlt } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';
import { toolsAdsConfig } from '@/config/tools-adsense.config';

function NepaliFontTool() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [transliterationReady, setTransliterationReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);
  const transliterationRef = useRef(null);

 

  // Enhanced rule-based Roman-to-Nepali mapping
  const romanToNepaliMap = {
    'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ee': 'ई', 'u': 'उ', 'oo': 'ऊ', 'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ',
    'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ng': 'ङ',
    'ch': 'च', 'chh': 'छ', 'j': 'ज', 'jh': 'झ', 'yn': 'ञ',
    't': 'त', 'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न',
    'p': 'प', 'ph': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म',
    'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व',
    'sh': 'श', 'shh': 'ष', 's': 'स', 'h': 'ह',
    'ksh': 'क्ष', 'tr': 'त्र', 'gy': 'ज्ञ',
    'ri': 'ृ', 'rh': 'ॠ', 
    '.': '।', // Devanagari danda
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', 
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
  };

  // Fallback rule-based Roman-to-Nepali conversion
  const fallbackRomanToNepali = (text) => {
    let result = text.toLowerCase();
    
    // Replace multi-character sequences first
    Object.keys(romanToNepaliMap)
      .sort((a, b) => b.length - a.length) // Sort by length descending to match longer sequences first
      .forEach(key => {
        const regex = new RegExp(key, 'g');
        result = result.replace(regex, romanToNepaliMap[key]);
      });
    
    return result;
  };

  // Handle input changes
  const handleInput = (e) => {
    const value = e.target.value;
    setInputText(value);
    
    if (!transliterationReady) {
      setIsProcessing(true);
      try {
        const result = fallbackRomanToNepali(value);
        setOutputText(result);
      } catch (err) {
        setError('Conversion failed.');
        setOutputText('');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // For transliteration, sync to output
      setOutputText(value);
    }
  };

  // Initialize transliteration when script loads
  const initializeTransliteration = () => {
    if (textareaRef.current && window.enableTransliteration) {
      try {
        window.enableTransliteration(textareaRef.current, 'ne');
        transliterationRef.current = true;
        setTransliterationReady(true);
      } catch (err) {
        console.error('Transliteration init error:', err);
        setError('Transliteration setup failed. Using fallback.');
        transliterationRef.current = false;
        setTransliterationReady(false);
      }
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Download text
  const downloadText = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nepali-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear all text
  const clearText = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  // Insert phrase
  const insertPhrase = (phrase) => {
    const newInput = inputText ? `${inputText} ${phrase.roman}` : phrase.roman;
    setInputText(newInput);
    
    // Also update output if we're not using transliteration
    if (!transliterationReady) {
      const result = fallbackRomanToNepali(newInput);
      setOutputText(result);
    }
  };

  // Initialize ads
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        if (outputText) window.adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded, outputText]);

  // Initialize transliteration when component mounts
  useEffect(() => {
    if (window.enableTransliteration) {
      initializeTransliteration();
    }
  }, []);

  return (
    <>
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Head>
          <title>Nepali Transliteration Tool - Roman to Devanagari Converter</title>
          <meta name="description" content="Convert Romanized Nepali to Devanagari script using Google's transliteration logic" />
          <style jsx>{`
            .font-devnagari { font-family: 'Noto Sans Devanagari', sans-serif; }
          `}</style>
        </Head>

        {toolsAdsConfig.isConfigured() && (
          <Script
            id="ads-script"
            strategy="afterInteractive"
            src={toolsAdsConfig.getScriptUrl()}
            crossOrigin="anonymous"
            onLoad={() => setAdsLoaded(true)}
          />
        )}

        {/* Transliteration Library Script */}
        <Script
          id="transliteration-script"
          src="/js/transliteration-input.bundle.js"
          onLoad={() => {
            setTransliterationReady(true);
            initializeTransliteration();
          }}
          onError={() => {
            setError('Failed to load transliteration library. Using fallback.');
            setTransliterationReady(false);
          }}
        />

        <div className="py-10">
          <div className="flex items-center mb-6">
            <a href="/tools" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to all tools
            </a>
          </div>

          {/* Top Ad */}
          <div className="mb-8 rounded-lg overflow-hidden">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={toolsAdsConfig.getPublisherId()}
              data-ad-slot={toolsAdsConfig.getSlotId("top")}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>

          <div className="mb-8">
            <div className="p-6 border-b-2 border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaFont className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Nepali Transliteration Tool</h1>
                    <p className="text-gray-600">Convert Romanized Nepali to Devanagari script</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
                  <FaLanguage className="mr-2" />
                  <span className="font-devnagari mr-1">नेपाली</span> (Nepali)
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-700">Text Conversion</h2>
                <button
                  onClick={clearText}
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <FaSyncAlt className="mr-2" />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Input Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Romanized Text</h3>
                  </div>

                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={handleInput}
                      placeholder="Type Romanized text (e.g., 'namaste dhanyabad') - Converts in real-time"
                      className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none shadow-sm"
                    />
                    {isProcessing && (
                      <div className="absolute bottom-3 right-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>

                 
                </div>

                {/* Output Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Nepali Text</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(outputText)}
                        disabled={!outputText}
                        className={`p-2 rounded-lg ${outputText ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed'}`}
                        title="Copy to clipboard"
                      >
                        <FaCopy />
                      </button>
                      <button
                        onClick={downloadText}
                        disabled={!outputText}
                        className={`p-2 rounded-lg ${outputText ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
                        title="Download as text file"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="w-full h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-auto whitespace-pre-wrap shadow-sm font-devnagari">
                      {outputText || (
                        <div className="text-gray-400 italic">
                          Converted text will appear here...
                        </div>
                      )}
                    </div>
                    {copied && (
                      <div className="absolute bottom-3 right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Copied!
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>
                      Tip: Type Romanized Nepali text to see it converted to Devanagari script.
                    </p>
                  </div>
                </div>
              </div>

              {/* Conversion Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">About This Tool</h4>
                <p className="text-blue-700 text-sm">
                  This tool helps you convert Romanized Nepali (Latin script) to Devanagari script. 
                  Type Romanized text as you would speak it, and see it converted to Nepali script in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Middle Ad */}
          {outputText && (
            <div className="my-6 rounded-lg overflow-hidden">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={toolsAdsConfig.getPublisherId()}
                data-ad-slot={toolsAdsConfig.getSlotId("middle")}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          )}

          {/* CTA Section */}
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

          {/* Bottom Ad */}
          <div className="rounded-lg overflow-hidden">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={toolsAdsConfig.getPublisherId()}
              data-ad-slot={toolsAdsConfig.getSlotId("bottom")}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default NepaliFontTool;