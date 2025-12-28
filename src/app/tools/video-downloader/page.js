'use client'

import { useState, useRef, useEffect } from 'react';
import { FaDownload, FaYoutube, FaTiktok, FaInstagram, FaLink } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloadOptions, setDownloadOptions] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [error, setError] = useState('');
  const [adsLoaded, setAdsLoaded] = useState(false); // Track AdSense script loading
  const inputRef = useRef(null);

  // Supported platforms
  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: <FaYoutube className="text-red-600" /> },
    { id: 'tiktok', name: 'TikTok', icon: <FaTiktok className="text-black" /> },
    { id: 'instagram', name: 'Instagram', icon: <FaInstagram className="text-pink-600" /> },
    { id: 'other', name: 'Other', icon: <FaLink className="text-blue-500" /> },
  ];

  // Detect platform from URL
  const detectPlatform = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('instagram.com')) return 'instagram';
    return 'other';
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setPlatform(detectPlatform(newUrl));
    setError('');
  };

  // Mock fetch video info (in real app, this would call your API)
  const fetchVideoInfo = async () => {
    if (!url) {
      setError('Please enter a video URL');
      inputRef.current.focus();
      return;
    }

    setIsFetching(true);
    setVideoInfo(null);
    setDownloadOptions([]);
    setError('');

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response based on platform
      const mockResponses = {
        youtube: {
          title: 'Sample YouTube Video',
          thumbnail: '/youtube-thumbnail.jpg',
          duration: '10:30',
          options: [
            { quality: '1080p', format: 'MP4', size: '45.2 MB' },
            { quality: '720p', format: 'MP4', size: '28.7 MB' },
            { quality: '360p', format: 'MP4', size: '12.4 MB' },
            { quality: 'Audio', format: 'MP3', size: '5.2 MB' },
          ],
        },
        tiktok: {
          title: 'Popular TikTok Video',
          thumbnail: '/tiktok-thumbnail.jpg',
          duration: '0:45',
          options: [
            { quality: 'HD', format: 'MP4', size: '8.2 MB' },
            { quality: 'SD', format: 'MP4', size: '4.7 MB' },
          ],
        },
        instagram: {
          title: 'Instagram Reel',
          thumbnail: '/instagram-thumbnail.jpg',
          duration: '0:30',
          options: [
            { quality: 'High', format: 'MP4', size: '6.5 MB' },
            { quality: 'Standard', format: 'MP4', size: '3.8 MB' },
          ],
        },
        other: {
          title: 'Video from URL',
          thumbnail: '/generic-thumbnail.jpg',
          duration: 'N/A',
          options: [{ quality: 'Best', format: 'MP4', size: 'Varies' }],
        },
      };

      const detectedPlatform = detectPlatform(url) || 'other';
      const response = mockResponses[detectedPlatform];

      setVideoInfo({
        title: response.title,
        thumbnail: response.thumbnail,
        duration: response.duration,
        platform: detectedPlatform,
      });
      setDownloadOptions(response.options);
      setSelectedQuality(response.options[0].quality);
    } catch (err) {
      setError('Failed to fetch video information. Please check the URL and try again.');
    } finally {
      setIsFetching(false);
    }
  };

  // Handle download (mock implementation)
  const handleDownload = () => {
    if (!selectedQuality) return;
    alert(`Downloading ${videoInfo.title} in ${selectedQuality} quality...`);
  };

  // Clear all inputs
  const handleReset = () => {
    setUrl('');
    setPlatform(null);
    setVideoInfo(null);
    setDownloadOptions([]);
    setError('');
    inputRef.current.focus();
  };

  // Initialize all ad units
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({}); // Top ad
        window.adsbygoogle.push({}); // Bottom ad
        if (videoInfo) {
          window.adsbygoogle.push({}); // Middle ad
        }
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded, videoInfo]);

  return (

    <>
    <NavBar/>

    <div className="p-6 bg-gray-100">
      <Head>
        <title>Video Downloader - Online Tools</title>
        <meta name="description" content="Download videos from YouTube, TikTok, Instagram and more" />
        
      </Head>

       <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX`}
          // Replace 'ca-pub-XXXXXXXXXXXXXXXX' with your actual AdSense publisher ID
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
            <FaDownload className="text-[#4caf4f] text-4xl mr-4" />
            <h1 className="text-3xl font-bold text-gray-900">Video Downloader</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Download videos from YouTube, TikTok, Instagram and other platforms. Paste the video URL below.
          </p>

          {/* URL Input */}
          <div className="mb-8">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <input
                type="text"
                ref={inputRef}
                value={url}
                onChange={handleUrlChange}
                placeholder="Paste video URL here..."
                className="flex-grow p-4 outline-none"
              />
              <button
                onClick={fetchVideoInfo}
                disabled={isFetching || !url}
                className={`px-6 py-4 ${
                  isFetching || !url ? 'bg-gray-400' : 'bg-[#4caf4f] hover:bg-[#3e8e40]'
                } text-white font-medium transition-colors`}
              >
                {isFetching ? 'Analyzing...' : 'Continue'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          {/* Platform Indicators */}
          {url && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Supported Platforms:</h3>
              <div className="flex flex-wrap gap-3">
                {platforms.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center px-4 py-2 rounded-full border ${
                      platform === p.id ? 'border-[#4caf4f] bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="mr-2">{p.icon}</span>
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Middle Ad Unit - Responsive Rectangle */}
          {videoInfo && (
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

          {/* Video Info */}
          {videoInfo && (
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Thumbnail */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                  <div className="relative pb-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={videoInfo.thumbnail}
                      alt={videoInfo.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                      {videoInfo.duration}
                    </div>
                  </div>
                </div>

                {/* Video Details */}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2">{videoInfo.title}</h3>
                  <div className="flex items-center mb-4">
                    <span className="mr-3">{platforms.find((p) => p.id === videoInfo.platform)?.icon}</span>
                    <span className="text-gray-600 capitalize">{videoInfo.platform} video</span>
                  </div>

                  {/* Download Options */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Download Options:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {downloadOptions.map((option, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedQuality(option.quality)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedQuality === option.quality
                              ? 'border-[#4caf4f] bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            <div
                              className={`w-5 h-5 rounded-full border mr-2 flex items-center justify-center ${
                                selectedQuality === option.quality
                                  ? 'border-[#4caf4f] bg-[#4caf4f]'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedQuality === option.quality && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <span className="font-medium">{option.quality}</span>
                          </div>
                          <div className="text-sm text-gray-500 ml-7">
                            {option.format} • {option.size}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {videoInfo ? (
              <>
                <button
                  onClick={handleDownload}
                  disabled={!selectedQuality}
                  className="px-6 py-3 bg-[#4caf4f] text-white rounded-lg font-medium hover:bg-[#3e8e40] transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download Now
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Download Another
                </button>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <p>Supported sites: YouTube, TikTok, Instagram, Facebook, Twitter, and more</p>
                <p className="text-sm mt-2">Paste the link above to get started</p>
              </div>
            )}
          </div>

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