'use client'
import { useState, useEffect, useCallback } from 'react';
import { FaClock, FaSyncAlt, FaCopy, FaCheck, FaGlobe, FaPlus, FaTrash } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import { toolsAdsConfig } from '@/config/tools-adsense.config';

const TIMEZONES = [
  'UTC', 'GMT',
  'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Kolkata',
  'Australia/Sydney', 'Australia/Melbourne',
  'Pacific/Auckland', 'Pacific/Honolulu',
];

const WORLD_CLOCK_ZONES = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];

/**
 * Offset (ms) of `timeZone` from UTC at the instant `date` represents.
 */
function getTimeZoneOffsetMs(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = dtf.formatToParts(date).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUTC = Date.UTC(
    parts.year, parts.month - 1, parts.day,
    parts.hour, parts.minute, parts.second
  );
  return asUTC - date.getTime();
}

/**
 * Turns a wall-clock date/time that's meant to represent a moment
 * *in `timeZone`* into the correct UTC instant (a real Date object).
 */
function zonedTimeToUtc(year, month, day, hours, minutes, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hours, minutes);
  const offset = getTimeZoneOffsetMs(new Date(guess), timeZone);
  return new Date(guess - offset);
}

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
  const [copiedId, setCopiedId] = useState(null);

  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Set sensible defaults once, on mount only.
  useEffect(() => {
    const now = new Date();
    setBaseTime(now.toTimeString().slice(0, 5));
    setBaseDate(now.toISOString().split('T')[0]);
    setBaseTimezone(currentTimezone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live clock — separate from the defaults above, no churn.
  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date().toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const convertTime = useCallback(() => {
    setIsProcessing(true);
    setError('');

    try {
      if (!baseTime || !baseDate) {
        throw new Error('Please enter both a time and a date.');
      }

      const [hours, minutes] = baseTime.split(':').map(Number);
      const [year, month, day] = baseDate.split('-').map(Number);

      // Correctly interpret the entered time as belonging to baseTimezone.
      const baseInstant = zonedTimeToUtc(year, month, day, hours, minutes, baseTimezone);

      const updated = convertedTimezones.map((tz) => {
        try {
          const time = baseInstant.toLocaleTimeString('en-US', {
            timeZone: tz.zone, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit',
          });
          const date = baseInstant.toLocaleDateString('en-US', {
            timeZone: tz.zone, year: 'numeric', month: '2-digit', day: '2-digit',
          });
          return { ...tz, time, date };
        } catch (err) {
          console.error(`Error converting to ${tz.zone}:`, err);
          return { ...tz, time: 'Error', date: 'Error' };
        }
      });

      setConvertedTimezones(updated);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err.message || 'Failed to convert time. Please check your input.');
    } finally {
      setIsProcessing(false);
    }
  }, [baseTime, baseDate, baseTimezone, convertedTimezones]);

  const addTimezone = () => {
    setConvertedTimezones((prev) => [
      ...prev,
      { id: Date.now(), zone: 'UTC', time: '', date: '' },
    ]);
  };

  const removeTimezone = (id) => {
    setConvertedTimezones((prev) => (prev.length > 1 ? prev.filter((tz) => tz.id !== id) : prev));
  };

  const updateTimezone = (id, zone) => {
    setConvertedTimezones((prev) => prev.map((tz) => (tz.id === id ? { ...tz, zone } : tz)));
  };

  const setToCurrentTime = () => {
    const now = new Date();
    setBaseTime(now.toTimeString().slice(0, 5));
    setBaseDate(now.toISOString().split('T')[0]);
    setBaseTimezone(currentTimezone);
  };

  const copyToClipboard = async (id, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Ads
  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        window.adsbygoogle.push({});
        if (convertedTimezones.some((tz) => tz.time)) {
          window.adsbygoogle.push({});
        }
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded, convertedTimezones]);

  return (
    <>
      <NavBar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <Head>
          <title>Time Zone Converter - World Clock Tool</title>
          <meta name="description" content="Convert times between different time zones around the world" />
        </Head>

        {toolsAdsConfig.isConfigured() && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            src={toolsAdsConfig.getScriptUrl()}
            crossOrigin="anonymous"
            onLoad={() => setAdsLoaded(true)}
            onError={(e) => console.error('AdSense script failed to load', e)}
          />
        )}

        <div className="mx-3 md:mx-10 lg:mx-18">
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <li><Link href="/" className="transition hover:text-[#3A9D44]">Home</Link></li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li><Link href="/tools" className="transition hover:text-[#3A9D44]">Tools</Link></li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li aria-current="page" className="font-semibold text-[#3A9D44]">Time Zone Converter</li>
            </ol>
          </nav>

          <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="major-world-times">
            <div className="mb-4 flex items-center gap-3">
              <FaGlobe className="text-xl text-[#4DB154]" />
              <h2 id="major-world-times" className="text-xl font-bold text-gray-900">Major World Times</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {WORLD_CLOCK_ZONES.map((zone) => {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('en-US', {
                  timeZone: zone, hour12: true, hour: '2-digit', minute: '2-digit',
                });
                const dayStr = now.toLocaleDateString('en-US', {
                  timeZone: zone, weekday: 'short',
                });

                return (
                  <div key={zone} className="rounded-xl bg-[#F6F7F9] p-3 text-center">
                    <div className="text-sm font-medium text-gray-700">{zone.split('/')[1].replace('_', ' ')}</div>
                    <div className="text-lg font-bold text-[#3A9D44]">{timeStr}</div>
                    <div className="text-xs text-gray-500">{dayStr}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {toolsAdsConfig.isConfigured() && (
            <div className="mb-8">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={toolsAdsConfig.getPublisherId()}
                data-ad-slot={toolsAdsConfig.getSlotId('top')}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <FaClock className="text-[#4DB154] text-3xl" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Time Zone Converter</h1>
                <p className="text-gray-500">Convert times between different time zones</p>
              </div>
              <div className="ml-auto flex items-center text-sm text-gray-500">
                <FaGlobe className="mr-1" />
                Local time: {currentTime} ({currentTimezone})
              </div>
            </div>

            {error && (
              <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              {/* Base Time */}
              <div className="space-y-6">
                <h2 className="font-bold text-lg text-gray-700">Base Time</h2>

                <div>
                  <label htmlFor="base-time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    id="base-time"
                    type="time"
                    value={baseTime}
                    onChange={(e) => setBaseTime(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 outline-none focus:border-[#4DB154] focus:ring-2 focus:ring-[#4DB154]/20"
                  />
                </div>

                <div>
                  <label htmlFor="base-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    id="base-date"
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 outline-none focus:border-[#4DB154] focus:ring-2 focus:ring-[#4DB154]/20"
                  />
                </div>

                <div>
                  <label htmlFor="base-tz" className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <select
                    id="base-tz"
                    value={baseTimezone}
                    onChange={(e) => setBaseTimezone(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 outline-none focus:border-[#4DB154] focus:ring-2 focus:ring-[#4DB154]/20"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={convertTime}
                    disabled={isProcessing}
                    className={`flex-1 px-4 py-2 rounded-md font-medium text-white flex items-center justify-center gap-2 transition-colors ${
                      isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3A9D44] hover:bg-[#4DB154]'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

              {/* Converted Times */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg text-gray-700">Converted Times</h2>
                  <button
                    onClick={addTimezone}
                    className="flex items-center gap-1 rounded bg-[#3A9D44] px-3 py-1 text-sm text-white hover:bg-[#4DB154]"
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
                          className="flex-1 rounded border border-gray-300 p-2 text-sm font-medium outline-none focus:border-[#4DB154] focus:ring-2 focus:ring-[#4DB154]/20"
                        >
                          {TIMEZONES.map((zone) => (
                            <option key={zone} value={zone}>{zone}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => removeTimezone(tz.id)}
                          disabled={convertedTimezones.length === 1}
                          className={`ml-2 rounded p-2 ${
                            convertedTimezones.length === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                          aria-label={`Remove ${tz.zone}`}
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
                          onClick={() => copyToClipboard(tz.id, `${tz.time} ${tz.date} (${tz.zone})`)}
                          disabled={!tz.time}
                          className={`rounded p-2 ${tz.time ? 'text-[#3A9D44] hover:bg-[#4DB154]/10' : 'text-gray-300'}`}
                          aria-label={`Copy ${tz.zone} time`}
                        >
                          {copiedId === tz.id ? <FaCheck className="text-[#4DB154]" /> : <FaCopy />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {toolsAdsConfig.isConfigured() && convertedTimezones.some((tz) => tz.time) && (
              <div className="my-6">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client={toolsAdsConfig.getPublisherId()}
                  data-ad-slot={toolsAdsConfig.getSlotId('middle')}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            )}

            {/* About */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="font-bold text-lg text-gray-700 mb-4">About Time Zones</h2>
              <div className="prose max-w-none text-gray-600">
                <p>Time zones are regions of the Earth that share the same standard time. The world is divided into 24 time zones, each roughly 15 degrees of longitude apart.</p>
                <ul className="list-disc pl-5">
                  <li>UTC (Coordinated Universal Time) is the primary time standard</li>
                  <li>GMT (Greenwich Mean Time) is often used interchangeably with UTC</li>
                  <li>Time zones east of UTC are ahead, west of UTC are behind</li>
                  <li>Some regions observe Daylight Saving Time, shifting clocks by 1 hour</li>
                </ul>
              </div>
            </div>
          </div>

          {toolsAdsConfig.isConfigured() && (
            <div className="mt-8">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={toolsAdsConfig.getPublisherId()}
                data-ad-slot={toolsAdsConfig.getSlotId('bottom')}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}