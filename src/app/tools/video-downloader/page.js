'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaDownload,
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaFacebook,
  FaLink,
  FaCheck,
  FaSpinner,
  FaTimes,
  FaExclamationTriangle,
  FaCopy,
  FaMusic,
} from 'react-icons/fa';
import Script from 'next/script';
import Link from 'next/link';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import { toolsAdsConfig } from '@/config/tools-adsense.config';

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: <FaYoutube className="text-red-600" /> },
  { id: 'tiktok', name: 'TikTok', icon: <FaTiktok className="text-gray-900" /> },
  { id: 'instagram', name: 'Instagram', icon: <FaInstagram className="text-pink-600" /> },
  { id: 'facebook', name: 'Facebook', icon: <FaFacebook className="text-blue-600" /> },
  { id: 'other', name: 'Direct Media', icon: <FaLink className="text-blue-500" /> },
];

function detectPlatform(url) {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/facebook\.com|fb\.watch/.test(url)) return 'facebook';
  return 'other';
}

function isLikelyUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function getDirectMediaType(url) {
  const pathname = new URL(url).pathname.toLowerCase();
  const extension = pathname.split('.').pop();
  const mediaTypes = {
    mp4: 'MP4',
    webm: 'WebM',
    mov: 'MOV',
    m4v: 'M4V',
    mp3: 'MP3',
    wav: 'WAV',
    ogg: 'OGG',
  };
  return mediaTypes[extension] || null;
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

async function getDirectMediaMetadata(url) {
  const extFormat = getDirectMediaType(url);
  try {
    let response = await fetch(url, { method: 'HEAD' });
    // Some servers reject HEAD, try a tiny GET range
    if (!response.ok && response.status !== 405 && response.status !== 501) {
      response = await fetch(url, { headers: { Range: 'bytes=0-0' } });
    }
    const contentType = response.headers.get('content-type') || '';
    const contentLength = Number(response.headers.get('content-length'));
    const contentRange = response.headers.get('content-range');
    const size = contentRange ? Number(contentRange.split('/')[1]) : contentLength || null;
    const mime = contentType.split(';')[0].trim().toLowerCase();
    let format = extFormat;
    if (!format && mime.startsWith('video/')) format = mime.split('/')[1].toUpperCase();
    else if (!format && mime.startsWith('audio/')) format = mime.split('/')[1].toUpperCase();
    else if (!format) format = mime.split('/')[1]?.toUpperCase() || 'FILE';
    return {
      format,
      size,
      contentType: mime || 'application/octet-stream',
      isAudio: mime.startsWith('audio/'),
    };
  } catch {
    return {
      format: extFormat || 'FILE',
      size: null,
      contentType: extFormat
        ? extFormat.toLowerCase() === 'mp3' || extFormat.toLowerCase() === 'wav' || extFormat.toLowerCase() === 'ogg'
          ? `audio/${extFormat.toLowerCase()}`
          : `video/${extFormat.toLowerCase()}`
        : 'application/octet-stream',
      isAudio: extFormat ? ['mp3', 'wav', 'ogg'].includes(extFormat.toLowerCase()) : false,
    };
  }
}

async function downloadDirect(url, fileName, onProgress) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!response.body) {
      // Fallback to direct anchor if streaming not available
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      onProgress(100);
      return;
    }
    const contentLength = Number(response.headers.get('content-length')) || 0;
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (contentLength) onProgress(Math.min(99, Math.round((received / contentLength) * 100)));
    }
    const blob = new Blob(chunks, {
      type: response.headers.get('content-type') || 'application/octet-stream',
    });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
    onProgress(100);
  } catch {
    // CORS or fetch failure – open the direct link as a last resort
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'download';
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    onProgress(100);
    throw new Error('Direct download blocked by browser. Opening the link instead.');
  }
}

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloadOptions, setDownloadOptions] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [error, setError] = useState('');
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const inputRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setPlatform(detectPlatform(newUrl));
    if (error) setError('');
  };

  const handleReset = () => {
    setUrl('');
    setPlatform(null);
    setVideoInfo(null);
    setDownloadOptions([]);
    setError('');
    setSelectedQuality('');
    setDownloadProgress(0);
    inputRef.current?.focus();
  };

  const fetchVideoInfo = useCallback(async () => {
    if (!url) {
      setError('Please enter a video URL');
      inputRef.current?.focus();
      return;
    }
    if (!isLikelyUrl(url)) {
      setError('That doesn’t look like a valid URL');
      inputRef.current?.focus();
      return;
    }

    setIsFetching(true);
    setVideoInfo(null);
    setDownloadOptions([]);
    setSelectedQuality('');
    setError('');

    const detectedPlatform = detectPlatform(url);
    setPlatform(detectedPlatform);

    try {
      if (detectedPlatform !== 'other') {
        // Social platform URL → call backend API (see backend code below)
        const res = await fetch(`/api/video-info?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to fetch video info');
        const data = json.data;
        setVideoInfo({
          ...data,
          platform: detectedPlatform,
          directUrl: null,
          fileName: data.formats?.[0]
            ? `${data.title}.${data.formats[0].format}`
            : `${data.title}.mp4`,
        });
        setDownloadOptions(data.formats || []);
        setSelectedQuality(data.formats?.[0]?.quality || '');
        showToast('Video info loaded', 'success');
      } else {
        // Direct media URL → real metadata + direct download
        const meta = await getDirectMediaMetadata(url);
        const parsedUrl = new URL(url);
        const fileName = decodeURIComponent(
          parsedUrl.pathname.split('/').pop() || `download.${meta.format.toLowerCase()}`
        );
        const info = {
          title: fileName,
          duration: 'Direct media file',
          platform: 'other',
          directUrl: url,
          fileName,
          isAudio: meta.isAudio,
          formats: [
            {
              quality: 'Original',
              format: meta.format,
              size: meta.size ? formatBytes(meta.size) : 'Unknown size',
              mimeType: meta.contentType,
              isAudio: meta.isAudio,
              itag: null,
            },
          ],
        };
        setVideoInfo(info);
        setDownloadOptions(info.formats);
        setSelectedQuality('Original');
        showToast('Media ready', 'success');
      }
    } catch (err) {
      console.error(err);
      setError(
        detectedPlatform !== 'other'
          ? err.message || 'Could not fetch video info. Make sure your backend API is running.'
          : err.message || 'Could not prepare that media URL for download.'
      );
      showToast('Error loading video', 'error');
    } finally {
      setIsFetching(false);
    }
  }, [url, showToast]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isFetching) fetchVideoInfo();
  };

  const handleCopyLink = async () => {
    if (!videoInfo?.directUrl) return;
    try {
      await navigator.clipboard.writeText(videoInfo.directUrl);
      showToast('Link copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleDownload = async () => {
    if (!selectedQuality || !videoInfo) return;
    const selected = downloadOptions.find((opt) => opt.quality === selectedQuality);
    if (!selected) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      if (videoInfo.directUrl) {
        await downloadDirect(videoInfo.directUrl, videoInfo.fileName, setDownloadProgress);
        showToast('Download complete', 'success');
      } else if (selected.itag) {
        // Backend download endpoint
        const link = document.createElement('a');
        link.href = `/api/download?url=${encodeURIComponent(url)}&formatId=${selected.itag}`;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('Download started', 'success');
        setDownloadProgress(100);
      } else {
        throw new Error('No downloadable format found');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Download failed', 'error');
      setDownloadProgress(0);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(0), 2000);
    }
  };

  useEffect(() => {
    if (adsLoaded && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        window.adsbygoogle.push({});
        if (videoInfo) window.adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded, videoInfo]);

  const adsConfigured = toolsAdsConfig.isConfigured();

  return (
    <>
      <Head>
        <title>Video Downloader | Download Online Videos</title>
        <meta name="description" content="Download videos and audio from supported online platforms for personal use with EverestKit's video downloader." />
        <link rel="canonical" href="https://everestkit.com/tools/video-downloader" />
        <meta property="og:title" content="Video Downloader | Download Online Videos" />
        <meta property="og:description" content="Download videos and audio from supported online platforms for personal use." />
        <meta property="og:url" content="https://everestkit.com/tools/video-downloader" />
      </Head>
      <NavBar />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 relative">
        {adsConfigured && (
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
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="transition hover:text-[#3A9D44]">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li>
                <Link href="/tools" className="transition hover:text-[#3A9D44]">
                  Tools
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li aria-current="page" className="font-semibold text-[#3A9D44]">
                Video Downloader
              </li>
            </ol>
          </nav>

          {/* Top Ad */}
          {adsConfigured && (
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

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3A9D44] to-[#4DB154] px-6 py-8 md:px-10 text-white">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 p-3 rounded-xl mr-4">
                  <FaDownload className="text-2xl" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Video Downloader</h1>
              </div>
              <p className="text-white/90 max-w-2xl">
                Paste a direct media URL or a supported social platform link. Direct files
                download instantly; social links require the backend API.
              </p>
            </div>

            <div className="p-6 md:p-10">
              {/* URL Input */}
              <div className="mb-8">
                <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <input
                      id="video-url"
                      type="text"
                      ref={inputRef}
                      value={url}
                      onChange={handleUrlChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Paste video URL here…"
                      aria-label="Video URL"
                      className="w-full p-4 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4DB154] focus:border-transparent text-gray-900 transition-shadow"
                    />
                    {url && (
                      <button
                        onClick={handleReset}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        aria-label="Clear URL"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={fetchVideoInfo}
                    disabled={isFetching || !url}
                    className={`px-6 py-4 rounded-xl font-semibold text-white transition-all ${
                      isFetching || !url
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#3A9D44] hover:bg-[#4DB154] hover:shadow-lg active:scale-95'
                    }`}
                  >
                    {isFetching ? (
                      <span className="flex items-center gap-2 justify-center">
                        <FaSpinner className="animate-spin" />
                        Analyzing…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        <FaDownload />
                        Get Video
                      </span>
                    )}
                  </button>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Platform Indicators */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <span
                      key={p.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        platform === p.id
                          ? 'border-[#4DB154] bg-[#4DB154]/10 text-gray-900 shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {p.icon}
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Middle Ad */}
              {adsConfigured && videoInfo && (
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

              {/* Loading Skeleton */}
              {isFetching && (
                <div className="animate-pulse space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 lg:w-1/4">
                      <div className="aspect-video bg-gray-200 rounded-xl"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Info */}
              {videoInfo && !isFetching && (
                <div className="mb-8 border-t border-gray-100 pt-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Preview */}
                    <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                      <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-md">
                        {videoInfo.directUrl ? (
                          videoInfo.isAudio ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                              <FaMusic className="text-white text-4xl mb-4" />
                              <audio
                                controls
                                src={videoInfo.directUrl}
                                className="absolute bottom-0 left-0 right-0 w-full"
                                aria-label={`Preview ${videoInfo.title}`}
                              />
                            </div>
                          ) : (
                            <video
                              controls
                              preload="metadata"
                              src={videoInfo.directUrl}
                              className="absolute inset-0 h-full w-full object-contain bg-black"
                              aria-label={`Preview ${videoInfo.title}`}
                            />
                          )
                        ) : (
                          <img
                            src={videoInfo.thumbnail}
                            alt={videoInfo.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                          {videoInfo.duration}
                        </div>
                      </div>
                      {videoInfo.directUrl && (
                        <button
                          onClick={handleCopyLink}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                          <FaCopy />
                          Copy Direct Link
                        </button>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-grow">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 break-words">
                        {videoInfo.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 text-gray-600 capitalize">
                        {PLATFORMS.find((p) => p.id === videoInfo.platform)?.icon}
                        <span>{videoInfo.platform}</span>
                        {videoInfo.author && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{videoInfo.author}</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-semibold mt-6 mb-3 text-sm text-gray-700 uppercase tracking-wide">
                        Choose quality
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {downloadOptions.map((option) => (
                          <button
                            key={option.quality}
                            onClick={() => setSelectedQuality(option.quality)}
                            className={`text-left p-4 border rounded-xl transition-all ${
                              selectedQuality === option.quality
                                ? 'border-[#4DB154] bg-[#4DB154]/10 ring-2 ring-[#4DB154] shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <div
                                className={`w-5 h-5 rounded-full border mr-2 flex items-center justify-center flex-shrink-0 ${
                                  selectedQuality === option.quality
                                    ? 'border-[#3A9D44] bg-[#3A9D44]'
                                    : 'border-gray-300'
                                }`}
                              >
                                {selectedQuality === option.quality && (
                                  <FaCheck className="text-white" size={10} />
                                )}
                              </div>
                              <span className="font-medium text-gray-900">{option.quality}</span>
                            </div>
                            <div className="text-sm text-gray-500 ml-7">
                              {option.format} • {option.size}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                {videoInfo ? (
                  <>
                    <button
                      onClick={handleDownload}
                      disabled={!selectedQuality || isDownloading}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#3A9D44] px-8 py-3 font-semibold text-white transition-all hover:bg-[#4DB154] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 min-w-[180px]"
                    >
                      {isDownloading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Downloading… {downloadProgress > 0 && `${downloadProgress}%`}
                        </>
                      ) : (
                        <>
                          <FaDownload />
                          Download Now
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-8 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Try Another Link
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-500 text-sm py-4">
                    Paste a link above to get started.
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isDownloading && downloadProgress > 0 && (
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#4DB154] h-full rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
              )}

              {videoInfo && (
                <p className="mt-6 text-center text-xs text-gray-500 max-w-xl mx-auto">
                  Downloads work for direct media URLs that your browser can access. Social
                  platform page URLs are processed through the backend API if configured.
                </p>
              )}
            </div>

            {/* Bottom Ad */}
            {adsConfigured && (
              <div className="px-6 md:px-10 pb-8">
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

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg text-sm z-50 flex items-center gap-2 ${
              toastType === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toastType === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
            {toast}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}