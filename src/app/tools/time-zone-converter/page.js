'use client'
import { useState, useEffect } from 'react';
import { FaClock, FaSyncAlt, FaCopy, FaGlobe, FaPlus, FaTrash } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';

export default function TimeZoneConverter() {
  const [baseTime, setBaseTime] = useState('');
  const [baseDate, setBaseDate] = useState('');
  const [baseTimezone, setBaseTimezone] = useState('UTC');
  const [convertedTimezones, setConvertedTimezones] = useState([
    { id: 1, zone: 'America/New_York', time: '', date: '' },
    { id: 2, zone: 'Europe/London', time: '', date: '' },
    { id: 3, zone: 'Asia/Tokyo', time: '', date: '' },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Common timezones
  const timezones = [
    'UTC', 'GMT', 
    'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Kolkata',
    'Australia/Sydney', 'Australia/Melbourne',
    'Pacific/Auckland', 'Pacific/Honolulu'
  ];

  // Update current time display
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      // Set initial base time and date if empty
      if (!baseTime) {
        setBaseTime(now.toTimeString().slice(0, 5));
      }
      if (!baseDate) {
        setBaseDate(now.toISOString().split('T')[0]);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [baseTime, baseDate]);

  // Convert time function
  const convertTime = () => {
    setIsProcessing(true);
    setError('');
    
    try {
      if (!baseTime) {
        throw new Error('Please enter a time');
      }
      
      // Parse base time and date
      const [hours, minutes] = baseTime.split(':').map(Number);
      const [year, month, day] = baseDate.split('-').map(Number);
      
      // Create date object in base timezone
      const baseDateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes));
      
      // Convert to each target timezone
      const updatedTimezones = convertedTimezones.map(tz => {
        const options = { 
          timeZone: tz.zone,
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        };
        
        const dateOptions = {
          timeZone: tz.zone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        };
        
        try {
          const timeStr = baseDateObj.toLocaleTimeString('en-US', options);
          const dateStr = baseDateObj.toLocaleDateString('en-US', dateOptions);
          
          return {
            ...tz,
            time: timeStr,
            date: dateStr
          };
        } catch (err) {
          console.error(`Error converting to ${tz.zone}:`, err);
          return {
            ...tz,
            time: 'Error',
            date: 'Error'
          };
        }
      });
      
      setConvertedTimezones(updatedTimezones);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err.message || 'Failed to convert time. Please check your input.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a new timezone to convert to
  const addTimezone = () => {
    setConvertedTimezones([
      ...convertedTimezones,
      { id: Date.now(), zone: 'UTC', time: '', date: '' }
    ]);
  };

  // Remove a timezone
  const removeTimezone = (id) => {
    if (convertedTimezones.length > 1) {
      setConvertedTimezones(convertedTimezones.filter(tz => tz.id !== id));
    }
  };

  // Update a timezone
  const updateTimezone = (id, zone) => {
    setConvertedTimezones(
      convertedTimezones.map(tz => 
        tz.id === id ? { ...tz, zone } : tz
      )
    );
  };

  // Set to current time
  const setToCurrentTime = () => {
    const now = new Date();
    setBaseTime(now.toTimeString().slice(0, 5));
    setBaseDate(now.toISOString().split('T')[0]);
    setBaseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  };

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert('Copied to clipboard!');
    }
  };

  // Initialize ads
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({}); // Top ad
        window.adsbygoogle.push({}); // Bottom ad
        if (convertedTimezones.some(tz => tz.time)) {
          window.adsbygoogle.push({}); // Middle ad
        }
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded, convertedTimezones]);

  // Get current timezone
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <>
      <NavBar/>
      <div className="p-6 bg-gray-100 min-h-screen">
        <Head>
          <title>Time Zone Converter - World Clock Tool</title>
          <meta name="description" content="Convert times between different time zones around the world" />
        </Head>
        
        <Script 
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX`}
          crossOrigin="anonymous"
          onLoad={() => setAdsLoaded(true)}
          onError={(e) => console.error('AdSense script failed to load', e)}
        />
        
        <div className="mx-3 md:mx-10 lg:mx-18">
          <div className="flex items-center mb-6">
            <a href="/tools" className="text-blue-600 hover:underline">← Back to all tools</a>
          </div>

          {/* Top Ad Unit */}
          <div className="mb-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="YOUR_TOP_AD_SLOT"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <FaClock className="text-blue-500 text-3xl mr-3" />
              <div>
                <h1 className="text-2xl font-bold">Time Zone Converter</h1>
                <p className="text-gray-500">Convert times between different time zones</p>
              </div>
              <div className="ml-auto flex items-center text-sm text-gray-500">
                <FaGlobe className="mr-1" />
                Local Time: {currentTime} ({currentTimezone})
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              {/* Base Time Section */}
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-700">Base Time</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={baseTime}
                    onChange={(e) => setBaseTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <select
                    value={baseTimezone}
                    onChange={(e) => setBaseTimezone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={convertTime}
                    disabled={isProcessing}
                    className={`flex-1 px-4 py-2 rounded-md font-medium text-white flex items-center justify-center gap-2 ${
                      isProcessing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                    } transition-colors`}
                  >
                    {isProcessing ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Converting...
                      </>
                    ) : (
                      <>
                        <FaSyncAlt size={14} />
                        Convert Time
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={setToCurrentTime}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Now
                  </button>
                </div>
              </div>
              
              {/* Converted Times Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-700">Converted Times</h3>
                  <button
                    onClick={addTimezone}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm flex items-center gap-1 hover:bg-green-600"
                  >
                    <FaPlus size={12} />
                    Add Timezone
                  </button>
                </div>
                
                <div className="space-y-4">
                  {convertedTimezones.map((tz) => (
                    <div key={tz.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <select
                          value={tz.zone}
                          onChange={(e) => updateTimezone(tz.id, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium"
                        >
                          {timezones.map((zone) => (
                            <option key={zone} value={zone}>
                              {zone}
                            </option>
                          ))}
                        </select>
                        
                        <button
                          onClick={() => removeTimezone(tz.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded ml-2"
                          title="Remove timezone"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-800">{tz.time || '--:--:--'}</div>
                          <div className="text-sm text-gray-500">{tz.date || '--/--/----'}</div>
                        </div>
                        
                        <button
                          onClick={() => copyToClipboard(`${tz.time} ${tz.date} (${tz.zone})`)}
                          disabled={!tz.time}
                          className={`p-2 rounded ${tz.time ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-300'}`}
                          title="Copy to clipboard"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Ad Unit */}
            {convertedTimezones.some(tz => tz.time) && (
              <div className="my-6">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                  data-ad-slot="YOUR_MIDDLE_AD_SLOT"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
              </div>
            )}

            {/* World Clocks Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-lg text-gray-700 mb-4">Major World Times</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'].map((zone) => {
                  const now = new Date();
                  const options = { 
                    timeZone: zone,
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit'
                  };
                  
                  const timeStr = now.toLocaleTimeString('en-US', options);
                  const dateOptions = {
                    timeZone: zone,
                    weekday: 'short'
                  };
                  const dayStr = now.toLocaleDateString('en-US', dateOptions);
                  
                  return (
                    <div key={zone} className="p-3 bg-gray-50 rounded text-center">
                      <div className="font-medium text-sm text-gray-700">{zone.split('/')[1]}</div>
                      <div className="text-lg font-bold text-gray-800">{timeStr}</div>
                      <div className="text-xs text-gray-500">{dayStr}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Information Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-lg text-gray-700 mb-4">About Time Zones</h3>
              <div className="prose max-w-none">
                <p>Time zones are regions of the Earth that have the same standard time. The world is divided into 24 time zones, each generally 15 degrees of longitude apart.</p>
                <p>Key facts about time zones:</p>
                <ul className="list-disc pl-5">
                  <li>UTC (Coordinated Universal Time) is the primary time standard</li>
                  <li>GMT (Greenwich Mean Time) is often used interchangeably with UTC</li>
                  <li>Time zones east of UTC are ahead, west of UTC are behind</li>
                  <li>Some regions observe Daylight Saving Time, shifting clocks by 1 hour</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Ad Unit */}
          <div className="mt-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="YOUR_BOTTOM_AD_SLOT"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
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
      </div>
      <Footer/>
    </>
  );
}