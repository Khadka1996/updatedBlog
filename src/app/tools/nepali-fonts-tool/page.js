'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaFont, FaCopy, FaDownload, FaLanguage, FaSyncAlt } from 'react-icons/fa';
import Script from 'next/script';
import Head from 'next/head';
import Footer from '@/app/components/footer/footer';
import NavBar from '@/app/components/header/navbar';
import { toolsAdsConfig } from '@/config/tools-adsense.config';
import ToolBreadcrumbs from '@/app/tools/ToolBreadcrumbs';

/* ------------------------------------------------------------------ *
 * Rule-based Roman -> Devanagari (Nepali) transliteration.
 * Runs entirely in the browser, instantly, with no network calls.
 * It is phonetic and forgiving: type the way the word sounds.
 * ITRANS-style capitals are also understood (T D N -> retroflex,
 * aa/ii/uu -> long vowels, M -> anusvara, .n -> anusvara, ~ -> chandrabindu).
 * ------------------------------------------------------------------ */

const HALANT = '्';
const ANUSVARA = 'ं';
const CHANDRABINDU = 'ँ';

// [independent form, matra form]  (matra for "a" is empty = inherent vowel)
const VOWELS = {
  a: ['अ', ''],
  aa: ['आ', 'ा'], A: ['आ', 'ा'],
  i: ['इ', 'ि'],
  ii: ['ई', 'ी'], ee: ['ई', 'ी'], I: ['ई', 'ी'],
  u: ['उ', 'ु'],
  uu: ['ऊ', 'ू'], oo: ['ऊ', 'ू'], U: ['ऊ', 'ू'],
  RRi: ['ऋ', 'ॄ'], Ri: ['ऋ', 'ॄ'],
  e: ['ए', 'े'],
  ai: ['ऐ', 'ै'],
  o: ['ओ', 'ो'],
  au: ['औ', 'ौ'],
};

// Longest keys first so digraphs win over single letters
const CONSONANTS = {
  kSh: 'क्ष', ksh: 'क्ष', x: 'क्ष',
  gy: 'ज्ञ', jn: 'ज्ञ',
  shr: 'श्र',
  chh: 'छ', Ch: 'छ',
  kh: 'ख', gh: 'घ', ng: 'ङ',
  ch: 'च', jh: 'झ', yn: 'ञ', JN: 'ञ',
  Th: 'ठ', Dh: 'ढ', T: 'ट', D: 'ड', N: 'ण',
  th: 'थ', dh: 'ध',
  ph: 'फ', f: 'फ', bh: 'भ',
  sh: 'श', Sh: 'ष', S: 'ष',
  k: 'क', g: 'ग', j: 'ज',
  t: 'त', d: 'द', n: 'न',
  p: 'प', b: 'ब', m: 'म',
  y: 'य', r: 'र', l: 'ल',
  v: 'व', w: 'व', h: 'ह',
  s: 'स', z: 'ज',
};

const DIGITS = { 0: '०', 1: '१', 2: '२', 3: '३', 4: '४', 5: '५', 6: '६', 7: '७', 8: '८', 9: '९' };

const CONSONANT_KEYS = Object.keys(CONSONANTS).sort((a, b) => b.length - a.length);
const VOWEL_KEYS = Object.keys(VOWELS).sort((a, b) => b.length - a.length);

function matchAt(text, i, keys) {
  for (const key of keys) {
    if (text.startsWith(key, i)) return key;
  }
  return null;
}

function transliterate(input) {
  let out = '';
  let i = 0;
  // true once a consonant is emitted and still waiting for its vowel
  let pendingConsonant = false;

  while (i < input.length) {
    const ch = input[i];

    // Explicit anusvara / chandrabindu helpers
    if (ch === 'M' || (ch === '.' && input[i + 1] === 'n')) {
      out += ANUSVARA;
      i += ch === '.' ? 2 : 1;
      pendingConsonant = false;
      continue;
    }
    if (ch === '~') {
      out += CHANDRABINDU;
      i += 1;
      pendingConsonant = false;
      continue;
    }

    const cons = matchAt(input, i, CONSONANT_KEYS);
    if (cons) {
      if (pendingConsonant) out += HALANT; // consonant cluster
      out += CONSONANTS[cons];
      pendingConsonant = true;
      i += cons.length;
      continue;
    }

    const vow = matchAt(input, i, VOWEL_KEYS);
    if (vow) {
      const [independent, matra] = VOWELS[vow];
      out += pendingConsonant ? matra : independent;
      pendingConsonant = false;
      i += vow.length;
      continue;
    }

    // Anything else: flush the pending consonant (keeps its inherent "a",
    // which is correct for Nepali) and pass the character through.
    if (ch >= '0' && ch <= '9') {
      out += DIGITS[ch];
    } else if (ch === '.') {
      out += '।'; // danda
    } else {
      out += ch;
    }
    pendingConsonant = false;
    i += 1;
  }

  return out;
}

export default function NepaliFontTool() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState('');
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const outRef = useRef(null);

  useEffect(() => setIsHydrated(true), []);

  const convert = useCallback((value) => {
    setInputText(value);
    setOutputText(transliterate(value));
  }, []);

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setCopied('');
  };

  const copy = async (text, which) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nepali-text.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

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
  }, [adsLoaded, outputText]);

  const adsConfigured = isHydrated && toolsAdsConfig.isConfigured();

  return (
    <>
      <NavBar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <Head>
          <title>Nepali Font Converter - Roman to Devanagari (Unicode)</title>
          <meta
            name="description"
            content="Type Romanized Nepali and get Devanagari (Unicode) text instantly. Free, works offline in your browser - copy or download the result."
          />
        </Head>
        <style jsx global>{`
          .font-devnagari {
            font-family: 'Noto Sans Devanagari', 'Mangal', system-ui, sans-serif;
          }
        `}</style>

        {adsConfigured && (
          <Script
            id="ads-script"
            strategy="afterInteractive"
            src={toolsAdsConfig.getScriptUrl()}
            crossOrigin="anonymous"
            onLoad={() => setAdsLoaded(true)}
            onError={(e) => console.error('AdSense script failed to load', e)}
          />
        )}

        <div className="py-8 sm:py-10">
          <ToolBreadcrumbs label="Nepali Fonts Tool" />

          {/* Top Ad */}
          {adsConfigured ? (
            <div className="mb-8 rounded-lg overflow-hidden">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={toolsAdsConfig.getPublisherId()}
                data-ad-slot={toolsAdsConfig.getSlotId('top')}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          ) : (
            <div className="mb-8 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center">
              <p className="text-gray-500">Advertisement Space</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md">
            <div className="p-4 sm:p-6 border-b-2 border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-blue-100 p-3 rounded-full shrink-0">
                    <FaFont className="text-blue-600 text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Nepali Font Converter
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Romanized Nepali &rarr; Devanagari (Unicode)
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-full self-start">
                  <FaLanguage className="mr-2" />
                  <span className="font-devnagari mr-1">&#x928;&#x947;&#x092A;&#x093E;&#x0932;&#x0940;</span> (Nepali)
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-700">Text Conversion</h2>
                <button
                  onClick={clearAll}
                  className="flex items-center px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <FaSyncAlt className="mr-2" />
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Romanized text</h3>
                    <button
                      onClick={() => copy(inputText, 'in')}
                      disabled={!inputText}
                      className={`p-2 rounded-lg text-sm ${
                        inputText ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
                      }`}
                      title="Copy input"
                    >
                      {copied === 'in' ? 'Copied' : <FaCopy />}
                    </button>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => convert(e.target.value)}
                    placeholder="Type here, e.g.  namaste, dhanyabaad, kasto chha"
                    className="w-full h-56 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none shadow-sm"
                  />
                </div>

                {/* Output */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Nepali (Devanagari)</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => copy(outputText, 'out')}
                        disabled={!outputText}
                        className={`p-2 rounded-lg ${
                          outputText ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed'
                        }`}
                        title="Copy Nepali text"
                      >
                        {copied === 'out' ? 'Copied' : <FaCopy />}
                      </button>
                      <button
                        onClick={download}
                        disabled={!outputText}
                        className={`p-2 rounded-lg ${
                          outputText ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'
                        }`}
                        title="Download as .txt"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </div>
                  <div
                    ref={outRef}
                    className="w-full h-56 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-auto whitespace-pre-wrap shadow-sm font-devnagari text-lg leading-relaxed"
                  >
                    {outputText || (
                      <span className="text-gray-400 italic text-base">
                        &#x928;&#x947;&#x092A;&#x093E;&#x0932;&#x0940; text will appear here&hellip;
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Ad */}
              {adsConfigured && outputText ? (
                <div className="my-6 rounded-lg overflow-hidden">
                  <ins
                    className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client={toolsAdsConfig.getPublisherId()}
                    data-ad-slot={toolsAdsConfig.getSlotId('middle')}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                  />
                </div>
              ) : null}

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <h4 className="font-semibold mb-2">How to type</h4>
                <ul className="list-disc pl-5 space-y-1 text-blue-700">
                  <li>Spell words the way they sound: <code>namaste</code> &rarr; <span className="font-devnagari">&#x928;&#x092E;&#x0938;&#x094D;&#x0924;&#x0947;</span></li>
                  <li>Long vowels: <code>aa ii uu</code> (or <code>ee oo</code>) &mdash; <code>dhanyabaad</code> &rarr; <span className="font-devnagari">&#x0927;&#x0928;&#x094D;&#x092F;&#x092C;&#x093E;&#x0926;</span></li>
                  <li>Retroflex: capital <code>T D N</code>; aspirated: <code>kh gh chh th dh ph bh</code>; <code>x</code> = <span className="font-devnagari">&#x0915;&#x094D;&#x0937;</span>, <code>gy</code> = <span className="font-devnagari">&#x091C;&#x094D;&#x091E;</span></li>
                  <li>Nasals: <code>M</code> or <code>.n</code> = <span className="font-devnagari">&#x0902;</span>, <code>~</code> = <span className="font-devnagari">&#x0901;</span></li>
                  <li>Everything runs in your browser &mdash; nothing is uploaded, works offline.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-[#25609A] to-[#52aa4d] mt-6 rounded-xl p-8 text-center text-white">
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

          {/* Bottom Ad */}
          {adsConfigured ? (
            <div className="mt-8 rounded-lg overflow-hidden">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={toolsAdsConfig.getPublisherId()}
                data-ad-slot={toolsAdsConfig.getSlotId('bottom')}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          ) : (
            <div className="mt-8 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center">
              <p className="text-gray-500">Advertisement Space</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
