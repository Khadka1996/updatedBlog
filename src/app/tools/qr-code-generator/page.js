'use client'
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaQrcode,
  FaDownload,
  FaCopy,
  FaImage,
  FaTrash,
  FaCheck,
  FaLink,
  FaWifi,
  FaEnvelope,
  FaPhone,
  FaSms,
  FaAddressCard,
} from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import NavBar from '@/app/components/header/navbar';
import Footer from '@/app/components/footer/footer';
import { toolsAdsConfig } from '@/config/tools-adsense.config';
import ToolBreadcrumbs from '@/app/tools/ToolBreadcrumbs';

// ── Content types ───────────────────────────────────────────────────────
const TABS = [
  { id: 'url', label: 'URL / Text', icon: <FaLink /> },
  { id: 'wifi', label: 'WiFi', icon: <FaWifi /> },
  { id: 'email', label: 'Email', icon: <FaEnvelope /> },
  { id: 'phone', label: 'Phone', icon: <FaPhone /> },
  { id: 'sms', label: 'SMS', icon: <FaSms /> },
  { id: 'vcard', label: 'Contact', icon: <FaAddressCard /> },
];

const SIZE_PRESETS = [200, 320, 500, 800];

// Escape values for the WIFI: payload ( \ ; , : " are special )
const wifiEscape = (s = '') => s.replace(/([\\;,:"])/g, '\\$1');
// Escape values for vCard fields
const vcardEscape = (s = '') =>
  s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

export default function QrCodeGenerator() {
  // Content
  const [tab, setTab] = useState('url');
  const [text, setText] = useState('https://everestkit.com');
  const [wifi, setWifi] = useState({ ssid: '', password: '', encryption: 'WPA', hidden: false });
  const [email, setEmail] = useState({ to: '', subject: '', body: '' });
  const [phone, setPhone] = useState('');
  const [sms, setSms] = useState({ number: '', message: '' });
  const [vcard, setVcard] = useState({
    firstName: '', lastName: '', org: '', title: '', phone: '', email: '', url: '',
  });

  // Style options
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [ecc, setEcc] = useState('M');
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [transparent, setTransparent] = useState(false);
  const [logo, setLogo] = useState(null); // data URL

  // Output
  const [pngUrl, setPngUrl] = useState('');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [adsLoaded, setAdsLoaded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const logoInputRef = useRef(null);

  useEffect(() => setIsHydrated(true), []);

  // Build the string that gets encoded, based on the active tab
  const buildValue = useCallback(() => {
    switch (tab) {
      case 'url':
        return text.trim();
      case 'wifi': {
        if (!wifi.ssid.trim()) return '';
        const enc = wifi.encryption === 'nopass' ? 'nopass' : wifi.encryption;
        const parts = [
          `T:${enc}`,
          `S:${wifiEscape(wifi.ssid)}`,
          enc !== 'nopass' ? `P:${wifiEscape(wifi.password)}` : '',
          wifi.hidden ? 'H:true' : '',
        ].filter(Boolean);
        return `WIFI:${parts.join(';')};;`;
      }
      case 'email': {
        if (!email.to.trim()) return '';
        const q = new URLSearchParams();
        if (email.subject.trim()) q.set('subject', email.subject.trim());
        if (email.body.trim()) q.set('body', email.body.trim());
        const qs = q.toString();
        return `mailto:${email.to.trim()}${qs ? `?${qs}` : ''}`;
      }
      case 'phone':
        return phone.trim() ? `tel:${phone.trim()}` : '';
      case 'sms': {
        if (!sms.number.trim()) return '';
        return sms.message.trim()
          ? `SMSTO:${sms.number.trim()}:${sms.message.trim()}`
          : `SMSTO:${sms.number.trim()}`;
      }
      case 'vcard': {
        const v = vcard;
        if (!v.firstName.trim() && !v.lastName.trim() && !v.org.trim()) return '';
        const lines = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${vcardEscape(v.lastName)};${vcardEscape(v.firstName)};;;`,
          `FN:${vcardEscape(`${v.firstName} ${v.lastName}`.trim())}`,
          v.org.trim() ? `ORG:${vcardEscape(v.org)}` : '',
          v.title.trim() ? `TITLE:${vcardEscape(v.title)}` : '',
          v.phone.trim() ? `TEL;TYPE=CELL:${vcardEscape(v.phone)}` : '',
          v.email.trim() ? `EMAIL:${vcardEscape(v.email)}` : '',
          v.url.trim() ? `URL:${vcardEscape(v.url)}` : '',
          'END:VCARD',
        ].filter(Boolean);
        return lines.join('\n');
      }
      default:
        return '';
    }
  }, [tab, text, wifi, email, phone, sms, vcard]);

  // A logo needs the highest error correction to stay scannable
  const effectiveEcc = logo ? 'H' : ecc;
  const lightColor = transparent ? '#00000000' : bgColor;

  // Draw the uploaded logo onto the centre of the QR PNG
  const compositeLogo = useCallback((qrDataUrl, logoDataUrl, px) =>
    new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = px;
      canvas.height = px;
      const ctx = canvas.getContext('2d');
      const base = new window.Image();
      base.onload = () => {
        ctx.drawImage(base, 0, 0, px, px);
        const badge = new window.Image();
        badge.onload = () => {
          const box = Math.round(px * 0.22);
          const pad = Math.round(box * 0.14);
          const x = (px - box) / 2;
          const y = (px - box) / 2;
          const r = Math.round(pad * 1.2);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(x - pad + r, y - pad);
          ctx.arcTo(x + box + pad, y - pad, x + box + pad, y + box + pad, r);
          ctx.arcTo(x + box + pad, y + box + pad, x - pad, y + box + pad, r);
          ctx.arcTo(x - pad, y + box + pad, x - pad, y - pad, r);
          ctx.arcTo(x - pad, y - pad, x + box + pad, y - pad, r);
          ctx.closePath();
          ctx.fill();
          ctx.drawImage(badge, x, y, box, box);
          resolve(canvas.toDataURL('image/png'));
        };
        badge.onerror = () => resolve(qrDataUrl);
        badge.src = logoDataUrl;
      };
      base.onerror = () => resolve(qrDataUrl);
      base.src = qrDataUrl;
    }), []);

  // Regenerate whenever the content or styling changes (debounced)
  useEffect(() => {
    const value = buildValue();

    if (!value) {
      setPngUrl('');
      setSvgMarkup('');
      setError('');
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        const opts = {
          errorCorrectionLevel: effectiveEcc,
          margin: Number(margin),
          width: Number(size),
          color: { dark: fgColor, light: lightColor },
        };

        let dataUrl = await QRCode.toDataURL(value, opts);
        const svg = await QRCode.toString(value, { ...opts, type: 'svg' });

        if (logo) dataUrl = await compositeLogo(dataUrl, logo, Number(size));
        if (cancelled) return;

        setPngUrl(dataUrl);
        setSvgMarkup(svg);
        setError('');
      } catch (err) {
        if (cancelled) return;
        setPngUrl('');
        setSvgMarkup('');
        setError(
          /too (big|long)|code length overflow/i.test(err?.message || '')
            ? 'There is too much content for one QR code. Shorten it, or lower the error correction level.'
            : 'Could not generate the QR code. Check your input and try again.'
        );
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [buildValue, size, margin, effectiveEcc, fgColor, lightColor, logo, compositeLogo]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const downloadPng = () => {
    if (!pngUrl) return;
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = 'qr-code.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadSvg = () => {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // data:image/png;base64,.... -> Blob, without fetch() (which the CSP would block)
  const dataUrlToBlob = (dataUrl) => {
    const [head, b64] = dataUrl.split(',');
    const mime = head.match(/:(.*?);/)?.[1] || 'image/png';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  };

  const copyPng = async () => {
    if (!pngUrl || !navigator.clipboard?.write || typeof window.ClipboardItem === 'undefined') return;
    try {
      const blob = dataUrlToBlob(pngUrl);
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard image not supported in this browser */
    }
  };

  // Ads
  useEffect(() => {
    if (adsLoaded && typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        const unfilled = document.querySelectorAll(
          'ins.adsbygoogle:not([data-adsbygoogle-status])'
        );
        unfilled.forEach(() => window.adsbygoogle.push({}));
      } catch (e) {
        console.error('AdSense ad push failed:', e);
      }
    }
  }, [adsLoaded]);

  const adsConfigured = isHydrated && toolsAdsConfig.isConfigured();

  const field =
    'w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf4f]/50 focus:border-[#4caf4f]';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <>
      <NavBar />
      <div className="p-3 sm:p-6 bg-gray-100 min-h-screen">
        <Head>
          <title>QR Code Generator - Free Online Tool</title>
          <meta
            name="description"
            content="Generate free QR codes for URLs, WiFi, email, phone, SMS and contact cards. Download as PNG or SVG."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

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

        <div className="mx-0 sm:mx-3 md:mx-10 lg:mx-18">
          <ToolBreadcrumbs label="QR Code Generator" />

          {/* Top Ad */}
          {adsConfigured ? (
            <div className="mb-8">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={toolsAdsConfig.getPublisherId()}
                data-ad-slot={toolsAdsConfig.getSlotId('top')}
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
            </div>
          ) : (
            <div className="mb-8 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center">
              <p className="text-gray-500">Advertisement Space</p>
            </div>
          )}

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <FaQrcode className="text-[#4caf4f] text-3xl shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">QR Code Generator</h1>
                <p className="text-gray-500 text-sm">
                  Make a QR code for a link, WiFi network, contact and more &mdash; free, no sign-up.
                </p>
              </div>
            </div>

            {/* Type tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                    tab === t.id
                      ? 'bg-[#4caf4f] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xs">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* ── Left: inputs ── */}
              <div>
                {tab === 'url' && (
                  <div>
                    <label className={labelCls}>Website URL or any text</label>
                    <textarea
                      rows={4}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="https://example.com"
                      className={field}
                    />
                  </div>
                )}

                {tab === 'wifi' && (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Network name (SSID)</label>
                      <input
                        className={field}
                        value={wifi.ssid}
                        onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                        placeholder="MyWiFi"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Security</label>
                      <select
                        className={field}
                        value={wifi.encryption}
                        onChange={(e) => setWifi({ ...wifi, encryption: e.target.value })}
                      >
                        <option value="WPA">WPA / WPA2 / WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">No password</option>
                      </select>
                    </div>
                    {wifi.encryption !== 'nopass' && (
                      <div>
                        <label className={labelCls}>Password</label>
                        <input
                          className={field}
                          value={wifi.password}
                          onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                          placeholder="Password"
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={wifi.hidden}
                        onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                      />
                      Hidden network
                    </label>
                  </div>
                )}

                {tab === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>To</label>
                      <input
                        className={field}
                        value={email.to}
                        onChange={(e) => setEmail({ ...email, to: e.target.value })}
                        placeholder="name@example.com"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Subject</label>
                      <input
                        className={field}
                        value={email.subject}
                        onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Message</label>
                      <textarea
                        rows={3}
                        className={field}
                        value={email.body}
                        onChange={(e) => setEmail({ ...email, body: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {tab === 'phone' && (
                  <div>
                    <label className={labelCls}>Phone number</label>
                    <input
                      className={field}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>
                )}

                {tab === 'sms' && (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Phone number</label>
                      <input
                        className={field}
                        value={sms.number}
                        onChange={(e) => setSms({ ...sms, number: e.target.value })}
                        placeholder="+977 98XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Message</label>
                      <textarea
                        rows={3}
                        className={field}
                        value={sms.message}
                        onChange={(e) => setSms({ ...sms, message: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {tab === 'vcard' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>First name</label>
                      <input
                        className={field}
                        value={vcard.firstName}
                        onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Last name</label>
                      <input
                        className={field}
                        value={vcard.lastName}
                        onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Organisation</label>
                      <input
                        className={field}
                        value={vcard.org}
                        onChange={(e) => setVcard({ ...vcard, org: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Job title</label>
                      <input
                        className={field}
                        value={vcard.title}
                        onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input
                        className={field}
                        value={vcard.phone}
                        onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input
                        className={field}
                        value={vcard.email}
                        onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Website</label>
                      <input
                        className={field}
                        value={vcard.url}
                        onChange={(e) => setVcard({ ...vcard, url: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Style options */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <h2 className="font-semibold text-gray-800">Customise</h2>

                  <div>
                    <label className={labelCls}>Size: {size}px</label>
                    <input
                      type="range"
                      min={120}
                      max={1000}
                      step={8}
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full accent-[#4caf4f]"
                    />
                    <div className="flex gap-2 mt-2">
                      {SIZE_PRESETS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setSize(p)}
                          className={`px-2 py-1 rounded text-xs border ${
                            size === p
                              ? 'border-[#4caf4f] bg-green-50 text-[#3e8e40]'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {p}px
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Quiet zone: {margin}</label>
                      <input
                        type="range"
                        min={0}
                        max={8}
                        step={1}
                        value={margin}
                        onChange={(e) => setMargin(Number(e.target.value))}
                        className="w-full accent-[#4caf4f]"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Error correction</label>
                      <select
                        className={field}
                        value={ecc}
                        disabled={!!logo}
                        onChange={(e) => setEcc(e.target.value)}
                      >
                        <option value="L">Low (7%)</option>
                        <option value="M">Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Foreground</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="h-9 w-10 rounded border border-gray-300 bg-white p-0.5"
                        />
                        <input
                          className={field}
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          disabled={transparent}
                          className="h-9 w-10 rounded border border-gray-300 bg-white p-0.5 disabled:opacity-40"
                        />
                        <input
                          className={`${field} disabled:opacity-40`}
                          value={transparent ? 'transparent' : bgColor}
                          disabled={transparent}
                          onChange={(e) => setBgColor(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={transparent}
                      onChange={(e) => setTransparent(e.target.checked)}
                    />
                    Transparent background (PNG)
                  </label>

                  <div>
                    <label className={labelCls}>Centre logo (optional)</label>
                    <div className="flex items-center gap-3">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FaImage /> {logo ? 'Change logo' : 'Upload logo'}
                      </button>
                      {logo && (
                        <button
                          onClick={() => {
                            setLogo(null);
                            if (logoInputRef.current) logoInputRef.current.value = '';
                          }}
                          className="px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <FaTrash /> Remove
                        </button>
                      )}
                    </div>
                    {logo && (
                      <p className="text-xs text-gray-500 mt-1">
                        Error correction locked to High so the code still scans. Logo is added to the PNG only.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Right: preview + downloads ── */}
              <div className="lg:sticky lg:top-4 self-start">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col items-center">
                  <div
                    className="rounded-lg overflow-hidden bg-[length:16px_16px] bg-[position:0_0,8px_8px]"
                    style={{
                      backgroundImage: transparent
                        ? 'linear-gradient(45deg,#e5e7eb 25%,transparent 25%,transparent 75%,#e5e7eb 75%,#e5e7eb),linear-gradient(45deg,#e5e7eb 25%,transparent 25%,transparent 75%,#e5e7eb 75%,#e5e7eb)'
                        : 'none',
                    }}
                  >
                    {pngUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pngUrl}
                        alt="Generated QR code preview"
                        width={260}
                        height={260}
                        className="block w-[260px] h-[260px] object-contain"
                      />
                    ) : (
                      <div className="w-[260px] h-[260px] flex items-center justify-center text-center text-gray-400 text-sm px-6">
                        {error ? error : 'Fill in the fields to preview your QR code'}
                      </div>
                    )}
                  </div>

                  {error && pngUrl === '' && (
                    <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 w-full mt-4">
                    <button
                      onClick={downloadPng}
                      disabled={!pngUrl}
                      className="px-4 py-2.5 rounded-lg font-medium text-white bg-[#4caf4f] hover:bg-[#3e8e40] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FaDownload /> PNG
                    </button>
                    <button
                      onClick={downloadSvg}
                      disabled={!svgMarkup}
                      className="px-4 py-2.5 rounded-lg font-medium text-[#25609A] border border-[#25609A] hover:bg-[#25609A] hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FaDownload /> SVG
                    </button>
                  </div>
                  <button
                    onClick={copyPng}
                    disabled={!pngUrl}
                    className="mt-2 w-full px-4 py-2 rounded-lg text-sm text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {copied ? (
                      <>
                        <FaCheck className="text-[#4caf4f]" /> Copied
                      </>
                    ) : (
                      <>
                        <FaCopy /> Copy image
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Everything runs in your browser. Nothing is uploaded.
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Ad */}
            {adsConfigured ? (
              <div className="my-8">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client={toolsAdsConfig.getPublisherId()}
                  data-ad-slot={toolsAdsConfig.getSlotId('middle')}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
              </div>
            ) : (
              <div className="my-8 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center">
                <p className="text-gray-500">Advertisement Space</p>
              </div>
            )}

            {/* Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="font-bold text-lg text-gray-700 mb-4">About this QR code generator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Encode a URL, plain text, WiFi login, email, phone number, SMS or contact card.</li>
                  <li>Pick your own colours, size and quiet-zone margin.</li>
                  <li>Download a sharp PNG or an infinitely scalable SVG.</li>
                </ul>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Add a centre logo &mdash; error correction is raised automatically so it still scans.</li>
                  <li>Static QR codes never expire and work offline once printed.</li>
                  <li>Generation happens entirely on your device &mdash; no data leaves your browser.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Ad */}
          {adsConfigured ? (
            <div className="mt-8">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={toolsAdsConfig.getPublisherId()}
                data-ad-slot={toolsAdsConfig.getSlotId('bottom')}
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
            </div>
          ) : (
            <div className="mt-8 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center">
              <p className="text-gray-500">Advertisement Space</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] mt-5 rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Let&apos;s discuss how we can help you achieve your digital goals and take your business to the next level.
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
      <Footer />
    </>
  );
}
