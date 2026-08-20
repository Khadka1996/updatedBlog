'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import Head from 'next/head'
import NavBar from '@/app/components/header/navbar'
import Footer from '@/app/components/footer/footer'
import { toolsAdsConfig } from '@/config/tools-adsense.config'
import {
  FaCalendarAlt,
  FaCopy,
  FaGlobeAsia,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaCheck
} from 'react-icons/fa'

// ─── Free public API — Nepali Datetime (Bikram Sambat) ────────────────
// Docs: https://ndt.amitgaru.com.np/docs
const API_BASE = 'https://ndt.amitgaru.com.np'

const nepaliMonths = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
].map((name, i) => ({ value: i + 1, name }))

const englishMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
].map((name, i) => ({ value: i + 1, name }))

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const pad = (n) => String(n).padStart(2, '0')
const bsKey = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`

// Small in-memory cache so repeated conversions don't keep hammering the API
const cache = new Map()

async function apiConvert(direction, dateStr, signal) {
  const cacheKey = `${direction}:${dateStr}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)
  const endpoint = direction === 'bs-to-ad'
    ? `${API_BASE}/date/convert/bs-ad?bs_date=${dateStr}&format=%Y-%m-%d`
    : `${API_BASE}/date/convert/ad-bs?ad_date=${dateStr}&format=%Y-%m-%d`
  const res = await fetch(endpoint, { signal })
  if (!res.ok) throw new Error(`API error (${res.status})`)
  const json = await res.json()
  if (!json?.data) throw new Error('Unexpected API response')
  cache.set(cacheKey, json.data)
  return json.data
}

async function apiToday(signal) {
  const res = await fetch(`${API_BASE}/date?format=%Y-%m-%d`, { signal })
  if (!res.ok) throw new Error(`API error (${res.status})`)
  const json = await res.json()
  return json?.data
}

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function humanDistance(days) {
  if (days === 0) return 'Today'
  const future = days > 0
  const n = Math.abs(days)
  const years = Math.floor(n / 365.25)
  const remDays = Math.round(n - years * 365.25)
  const months = Math.floor(remDays / 30.44)
  let label
  if (years >= 1) label = `${years} yr${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mo` : ''}`
  else if (months >= 1) label = `${months} mo${months > 1 ? 's' : ''}`
  else label = `${n} day${n > 1 ? 's' : ''}`
  return future ? `${label} from now` : `${label} ago`
}

export default function NepaliDateConverter() {
  const todayAD = useMemo(() => new Date(), [])

  const [direction, setDirection] = useState('bs-to-ad') // 'bs-to-ad' | 'ad-to-bs'
  const [calendarView, setCalendarView] = useState('ad') // 'ad' | 'bs'
  const [todayBsLabel, setTodayBsLabel] = useState('')

  const [bsDate, setBsDate] = useState({ year: '', month: '1', day: '1' })
  const [adDate, setAdDate] = useState({
    year: todayAD.getFullYear().toString(),
    month: (todayAD.getMonth() + 1).toString(),
    day: todayAD.getDate().toString()
  })

  const [daysInMonth, setDaysInMonth] = useState(32)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { adISO, bsISO, weekday }
  const [loading, setLoading] = useState(false)
  const [quickInput, setQuickInput] = useState('')
  const [adsLoaded, setAdsLoaded] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [copied, setCopied] = useState(false)

  // Calendar grid state (computed from API for accuracy)
  const [gridFirstDow, setGridFirstDow] = useState(0)
  const [gridDayCount, setGridDayCount] = useState(31)
  const [gridLoading, setGridLoading] = useState(false)

  const abortRef = useRef(null)
  const yearRef = useRef(null)
  const monthRef = useRef(null)
  const dayRef = useRef(null)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // ─── Bootstrap: fetch today's BS date once ───────────────────────────
  useEffect(() => {
    const controller = new AbortController()
    apiToday(controller.signal)
      .then((data) => {
        const [y, m, d] = data.split('-').map(Number)
        setTodayBsLabel(data)
        setBsDate({ year: y.toString(), month: m.toString(), day: d.toString() })
      })
      .catch(() => setTodayBsLabel(''))
    return () => controller.abort()
  }, [])

  // ─── Core conversion, debounced + abortable ──────────────────────────
  useEffect(() => {
    setError('')

    const y = direction === 'bs-to-ad' ? bsDate.year : adDate.year
    const m = direction === 'bs-to-ad' ? bsDate.month : adDate.month
    const d = direction === 'bs-to-ad' ? bsDate.day : adDate.day

    if (!y || !m || !d || y.length < 4) {
      setResult(null)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const timer = setTimeout(() => {
      setLoading(true)
      apiConvert(direction, bsKey(y, m, d), controller.signal)
        .then((data) => {
          const [ry, rm, rd] = data.split('-').map(Number)
          let adISO, bsISO
          if (direction === 'bs-to-ad') {
            setAdDate({ year: ry.toString(), month: rm.toString(), day: rd.toString() })
            adISO = { year: ry, month: rm, day: rd }
            bsISO = { year: Number(y), month: Number(m), day: Number(d) }
          } else {
            setBsDate({ year: ry.toString(), month: rm.toString(), day: rd.toString() })
            bsISO = { year: ry, month: rm, day: rd }
            adISO = { year: Number(y), month: Number(m), day: Number(d) }
          }
          const weekday = new Date(adISO.year, adISO.month - 1, adISO.day).getDay()
          setResult({ adISO, bsISO, weekday })
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setError('Could not convert that date — check the values and try again.')
            setResult(null)
          }
        })
        .finally(() => setLoading(false))
    }, 350)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [direction, bsDate.year, bsDate.month, bsDate.day, adDate.year, adDate.month, adDate.day])

  // Local day-count for the active input (used to cap the "Day" field)
  useEffect(() => {
    if (direction === 'bs-to-ad') {
      setDaysInMonth(32) // BS months run 29-32 days; API confirms exact value on convert
    } else {
      const y = Number(adDate.year), m = Number(adDate.month)
      setDaysInMonth(new Date(y, m, 0).getDate() || 31)
    }
  }, [direction, adDate.year, adDate.month])

  useEffect(() => {
    if (adsLoaded && typeof window !== 'undefined' && window.adsbygoogle) {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}) } catch { /* ignore */ }
    }
  }, [adsLoaded])

  // ─── Calendar grid: fetch accurate first-weekday + day-count ─────────
  useEffect(() => {
    if (calendarView === 'ad') {
      const y = Number(adDate.year) || todayAD.getFullYear()
      const m = Number(adDate.month) || (todayAD.getMonth() + 1)
      setGridFirstDow(new Date(y, m - 1, 1).getDay())
      setGridDayCount(new Date(y, m, 0).getDate())
      return
    }

    // BS view: derive first weekday + exact day count via two API calls
    const y = Number(bsDate.year), m = Number(bsDate.month)
    if (!y || !m) return

    const controller = new AbortController()
    setGridLoading(true)

    const nextM = m === 12 ? 1 : m + 1
    const nextY = m === 12 ? y + 1 : y

    Promise.all([
      apiConvert('bs-to-ad', bsKey(y, m, 1), controller.signal),
      apiConvert('bs-to-ad', bsKey(nextY, nextM, 1), controller.signal)
    ])
      .then(([firstStr, nextStr]) => {
        const first = new Date(firstStr)
        const next = new Date(nextStr)
        setGridFirstDow(first.getDay())
        setGridDayCount(daysBetween(first, next))
      })
      .catch(() => {})
      .finally(() => setGridLoading(false))

    return () => controller.abort()
  }, [calendarView, bsDate.year, bsDate.month, adDate.year, adDate.month, todayAD])

  // ─── Input handlers with auto-advance (year → month → day) ──────────
  const updateBs = (field, value) => {
    if (value === '' || /^\d{0,4}$/.test(value)) {
      setBsDate(prev => ({ ...prev, [field]: value }))
      if (field === 'year' && value.length === 4) monthRef.current?.focus()
    }
  }

  const updateAd = (field, value) => {
    if (value === '' || /^\d{0,4}$/.test(value)) {
      setAdDate(prev => ({ ...prev, [field]: value }))
      if (field === 'year' && value.length === 4) monthRef.current?.focus()
    }
  }

  const handleMonthChange = (value) => {
    (direction === 'bs-to-ad' ? updateBs : updateAd)('month', value)
    dayRef.current?.focus()
    dayRef.current?.select?.()
  }

  const clampOnBlurBs = (field) => {
    setBsDate(prev => {
      const val = prev[field]
      if (val === '') return prev
      let num = Number(val)
      if (field === 'year') num = Math.max(1970, Math.min(2100, num))
      if (field === 'month') num = Math.max(1, Math.min(12, num))
      if (field === 'day') num = Math.max(1, Math.min(daysInMonth, num))
      return { ...prev, [field]: num.toString() }
    })
  }

  const clampOnBlurAd = (field) => {
    setAdDate(prev => {
      const val = prev[field]
      if (val === '') return prev
      let num = Number(val)
      if (field === 'year') num = Math.max(1910, Math.min(2050, num))
      if (field === 'month') num = Math.max(1, Math.min(12, num))
      if (field === 'day') num = Math.max(1, Math.min(daysInMonth, num))
      return { ...prev, [field]: num.toString() }
    })
  }

  // ─── Quick input parse ────────────────────────────────────────────────
  const applyQuickInput = () => {
    const s = quickInput.trim()
    const match = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/) ||
                  s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
    if (!match) {
      setError('Use format YYYY-MM-DD or DD-MM-YYYY')
      return
    }
    let y, m, d
    if (match[1].length === 4) { [y, m, d] = [match[1], match[2], match[3]] }
    else { [d, m, y] = [match[1], match[2], match[3]] }

    if (direction === 'bs-to-ad') setBsDate({ year: y, month: String(Number(m)), day: String(Number(d)) })
    else setAdDate({ year: y, month: String(Number(m)), day: String(Number(d)) })
    setQuickInput('')
  }

  // ─── Calendar month navigation ────────────────────────────────────────
  const changeMonth = (delta) => {
    if (calendarView === 'ad') {
      let m = Number(adDate.month) + delta, y = Number(adDate.year)
      if (m > 12) { m = 1; y += 1 }
      if (m < 1) { m = 12; y -= 1 }
      setAdDate(p => ({ ...p, month: m.toString(), year: y.toString() }))
    } else {
      let m = Number(bsDate.month) + delta, y = Number(bsDate.year)
      if (m > 12) { m = 1; y += 1 }
      if (m < 1) { m = 12; y -= 1 }
      setBsDate(p => ({ ...p, month: m.toString(), year: y.toString() }))
    }
  }

  const generateCalendarDays = () => {
    const cells = []
    if (calendarView === 'ad') {
      const y = Number(adDate.year) || todayAD.getFullYear()
      const m = Number(adDate.month) || (todayAD.getMonth() + 1)
      const prevLast = new Date(y, m - 1, 0).getDate()
      for (let i = gridFirstDow - 1; i >= 0; i--) cells.push({ day: prevLast - i, type: 'prev' })
      for (let d = 1; d <= gridDayCount; d++) {
        const isToday = d === todayAD.getDate() && m === todayAD.getMonth() + 1 && y === todayAD.getFullYear()
        cells.push({ day: d, type: 'current', isToday })
      }
    } else {
      const [ty, tm, td] = todayBsLabel ? todayBsLabel.split('-').map(Number) : [null, null, null]
      const y = Number(bsDate.year), m = Number(bsDate.month)
      for (let i = 0; i < gridFirstDow; i++) cells.push({ day: '', type: 'prev' })
      for (let d = 1; d <= gridDayCount; d++) {
        const isToday = d === td && m === tm && y === ty
        cells.push({ day: d, type: 'current', isToday })
      }
    }
    while (cells.length < 42) {
      const nextDay = cells.filter(c => c.type === 'current').length + 1
      cells.push({ day: nextDay, type: 'next' })
    }
    return cells
  }

  const calendarDays = generateCalendarDays()

  // What day is "selected" on the calendar that's currently visible —
  // always read from the calendar's own side, never from the input side.
  // This is the fix for the earlier bug where the AD calendar highlighted
  // the BS input's day number instead of the actual converted AD day.
  const selectedOnView = calendarView === 'ad' ? Number(adDate.day) : Number(bsDate.day)
  const selectedYearOnView = calendarView === 'ad' ? Number(adDate.year) : Number(bsDate.year)
  const selectedMonthOnView = calendarView === 'ad' ? Number(adDate.month) : Number(bsDate.month)
  const gridYear = calendarView === 'ad' ? Number(adDate.year) : Number(bsDate.year)
  const gridMonth = calendarView === 'ad' ? Number(adDate.month) : Number(bsDate.month)
  const isSelectedMonthVisible = gridYear === selectedYearOnView && gridMonth === selectedMonthOnView

  const handleSelectDay = (cell) => {
    if (cell.type !== 'current' || !cell.day) return
    if (calendarView === 'ad') {
      setAdDate(p => ({ ...p, day: cell.day.toString() }))
      setDirection('ad-to-bs')
    } else {
      setBsDate(p => ({ ...p, day: cell.day.toString() }))
      setDirection('bs-to-ad')
    }
  }

  const copyResult = () => {
    if (!result) return
    const text = `${result.bsISO.day} ${nepaliMonths[result.bsISO.month - 1].name} ${result.bsISO.year} BS  =  ${result.adISO.day} ${englishMonths[result.adISO.month - 1].name} ${result.adISO.year} AD`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isSaturday = result?.weekday === 6

  // ─── Render ─────────────────────────────────────────────────────────
  const topAdsConfigured = isHydrated && toolsAdsConfig.isConfigured() && toolsAdsConfig.hasSlot('top')
  const bottomAdsConfigured = isHydrated && toolsAdsConfig.isConfigured() && toolsAdsConfig.hasSlot('bottom')

  return (
    <>
      <Head>
        <title>Nepali Date Converter | Bikram Sambat and AD Converter</title>
        <meta name="description" content="Convert dates between Nepali Bikram Sambat and Gregorian calendars with an accurate online date converter." />
        <link rel="canonical" href="https://everestkit.com/tools/date-converter" />
        <meta property="og:title" content="Nepali Date Converter | Bikram Sambat and AD Converter" />
        <meta property="og:description" content="Convert dates between Nepali Bikram Sambat and Gregorian calendars online." />
        <meta property="og:url" content="https://everestkit.com/tools/date-converter" />
      </Head>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-6 sm:py-10 px-3 sm:px-6">
        <div className="max-w-5xl mx-auto">

        {topAdsConfigured && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            src={toolsAdsConfig.getScriptUrl()}
            crossOrigin="anonymous"
            onLoad={() => setAdsLoaded(true)}
          />
        )}

        <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <li>
              <Link href="/" className="font-medium text-gray-500 transition hover:text-emerald-700">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-300">/</li>
            <li>
              <Link href="/tools" className="font-medium text-gray-500 transition hover:text-emerald-700">
                Tools
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-300">/</li>
            <li aria-current="page" className="font-semibold text-emerald-700">
              Date Converter
            </li>
          </ol>
        </nav>

        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 mb-3 sm:mb-4">
            <FaGlobeAsia className="text-xl sm:text-2xl" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Nepali Date Converter
          </h1>
          <p className="mt-2 sm:mt-3 text-base sm:text-lg text-gray-600">
            Bikram Sambat (BS) ↔ Gregorian (AD)
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Today: <span className="font-semibold text-emerald-700">
              {todayBsLabel ? `${todayBsLabel} BS` : 'loading…'}
            </span>
          </p>
        </div>

        {topAdsConfigured && (
          <div className="mb-6">
            <ins className="adsbygoogle" style={{ display: 'block' }}
              data-ad-client={toolsAdsConfig.getPublisherId()}
              data-ad-slot={toolsAdsConfig.getSlotId('top')}
              data-ad-format="auto" data-full-width-responsive="true"></ins>
          </div>
        )}

        {/* Direction toggle */}
        <div className="flex justify-center mb-6 sm:mb-10 px-2">
          <div className="inline-flex w-full sm:w-auto bg-white rounded-full shadow-sm border border-gray-200 p-1.5">
            <button
              onClick={() => setDirection('bs-to-ad')}
              className={`flex-1 sm:flex-none px-5 sm:px-7 py-2.5 rounded-full text-sm font-semibold transition-all ${
                direction === 'bs-to-ad' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              BS → AD
            </button>
            <button
              onClick={() => setDirection('ad-to-bs')}
              className={`flex-1 sm:flex-none px-5 sm:px-7 py-2.5 rounded-full text-sm font-semibold transition-all ${
                direction === 'ad-to-bs' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              AD → BS
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 sm:mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-center gap-3 max-w-xl mx-auto text-sm">
            <FaExclamationTriangle className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">

          {/* Input card */}
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-7 border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 sm:mb-6 flex items-center gap-3">
              <FaCalendarAlt className="text-emerald-600" />
              {direction === 'bs-to-ad' ? 'Bikram Sambat (BS)' : 'Gregorian (AD)'}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Quick entry
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={e => setQuickInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyQuickInput()}
                    placeholder={direction === 'bs-to-ad' ? '2082-01-15' : '2025-04-28'}
                    className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                  />
                  <button
                    onClick={applyQuickInput}
                    className="px-4 sm:px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Year</label>
                  <input
                    ref={yearRef}
                    type="text" inputMode="numeric" pattern="\d*"
                    value={direction === 'bs-to-ad' ? bsDate.year : adDate.year}
                    onChange={e => (direction === 'bs-to-ad' ? updateBs : updateAd)('year', e.target.value)}
                    onBlur={() => (direction === 'bs-to-ad' ? clampOnBlurBs : clampOnBlurAd)('year')}
                    className="w-full px-2 sm:px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-center font-medium"
                    placeholder="YYYY"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Month</label>
                  <select
                    ref={monthRef}
                    value={direction === 'bs-to-ad' ? bsDate.month : adDate.month}
                    onChange={e => handleMonthChange(e.target.value)}
                    className="w-full px-1.5 sm:px-2 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm font-medium"
                  >
                    {(direction === 'bs-to-ad' ? nepaliMonths : englishMonths).map(m => (
                      <option key={m.value} value={m.value.toString()}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Day</label>
                  <input
                    ref={dayRef}
                    type="text" inputMode="numeric" pattern="\d*"
                    value={direction === 'bs-to-ad' ? bsDate.day : adDate.day}
                    onChange={e => (direction === 'bs-to-ad' ? updateBs : updateAd)('day', e.target.value)}
                    onBlur={() => (direction === 'bs-to-ad' ? clampOnBlurBs : clampOnBlurAd)('day')}
                    className="w-full px-2 sm:px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-center font-medium"
                    placeholder="DD"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">Max day this month: {daysInMonth}</p>
            </div>

            <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-emerald-50 rounded-xl border border-emerald-100 min-h-[104px]">
              {loading ? (
                <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium h-full py-4">
                  <FaSpinner className="animate-spin" />
                  Converting…
                </div>
              ) : result ? (
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">Converted</div>
                      <div className="text-lg sm:text-xl font-bold text-emerald-900 break-words">
                        {direction === 'bs-to-ad'
                          ? `${result.adISO.day} ${englishMonths[result.adISO.month - 1].name} ${result.adISO.year}`
                          : `${result.bsISO.day} ${nepaliMonths[result.bsISO.month - 1].name} ${result.bsISO.year}`}
                      </div>
                    </div>
                    <button
                      onClick={copyResult}
                      className="p-2.5 sm:p-3 hover:bg-emerald-100 rounded-full transition flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      {copied ? <FaCheck className="text-emerald-700" /> : <FaCopy className="text-emerald-700" />}
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-emerald-200/60 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-emerald-700">
                    <span className="font-medium">{weekdayNames[result.weekday]}</span>
                    {isSaturday && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                        Saturday · Public holiday in Nepal
                      </span>
                    )}
                    <span>
                      {humanDistance(daysBetween(todayAD, new Date(result.adISO.year, result.adISO.month - 1, result.adISO.day)))}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Enter a date to convert</span>
              )}
            </div>
          </div>

          {/* Calendar card */}
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-7 border border-gray-100">
            <div className="flex justify-between items-center mb-5 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <FaCalendarAlt className="text-emerald-600" />
                <span className="hidden sm:inline">{calendarView === 'ad' ? 'Gregorian' : 'Bikram Sambat'}</span>
                <span className="sm:hidden">{calendarView === 'ad' ? 'AD' : 'BS'}</span>
              </h2>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setCalendarView('ad')}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-semibold transition ${
                    calendarView === 'ad' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'
                  }`}
                >
                  AD
                </button>
                <button
                  onClick={() => setCalendarView('bs')}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-semibold transition ${
                    calendarView === 'bs' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'
                  }`}
                >
                  BS
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4 sm:mb-5 bg-gray-50 p-2.5 sm:p-3 rounded-xl text-sm sm:text-base font-bold text-gray-900">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-2 sm:p-2.5 hover:bg-gray-200 rounded-full transition"
                aria-label="Previous month"
              >
                <FaChevronLeft className="text-xs sm:text-sm" />
              </button>
              <span className="flex items-center gap-2">
                {calendarView === 'ad'
                  ? `${englishMonths[Number(adDate.month) - 1]?.name} ${adDate.year}`
                  : `${nepaliMonths[Number(bsDate.month) - 1]?.name} ${bsDate.year}`}
                {gridLoading && <FaSpinner className="animate-spin text-gray-400 text-xs" />}
              </span>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="p-2 sm:p-2.5 hover:bg-gray-200 rounded-full transition"
                aria-label="Next month"
              >
                <FaChevronRight className="text-xs sm:text-sm" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div key={d} className={`py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold ${i === 6 ? 'text-red-500' : 'text-gray-400'}`}>
                  {d}
                </div>
              ))}

              {calendarDays.map((cell, idx) => {
                const isWeekend = idx % 7 === 6
                const isSelected = isSelectedMonthVisible && cell.type === 'current' && cell.day === selectedOnView
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectDay(cell)}
                    disabled={cell.type !== 'current'}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition
                      ${cell.type !== 'current' ? 'text-gray-200 cursor-default' : 'hover:bg-gray-50 border border-transparent cursor-pointer'}
                      ${cell.isToday ? 'bg-emerald-100 border-2 border-emerald-400 font-bold text-emerald-800' : ''}
                      ${isSelected && !cell.isToday ? 'bg-sky-100 border-2 border-sky-400 font-bold text-sky-800' : ''}
                      ${isWeekend && cell.type === 'current' && !cell.isToday && !isSelected ? 'text-red-500' : ''}
                    `}
                  >
                    {cell.day || ''}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 sm:mt-5 flex items-center justify-center gap-4 text-[11px] text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-100 border-2 border-emerald-400 inline-block" /> Today
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-100 border-2 border-sky-400 inline-block" /> Selected
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-400 text-center">
              Tap a date to convert it instantly
            </p>
          </div>
        </div>


        {bottomAdsConfigured && (
          <div className="mt-8">
            <ins className="adsbygoogle" style={{ display: 'block' }}
              data-ad-client={toolsAdsConfig.getPublisherId()}
              data-ad-slot={toolsAdsConfig.getSlotId('bottom')}
              data-ad-format="auto" data-full-width-responsive="true"></ins>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </>
  )
}