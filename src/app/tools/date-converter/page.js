'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { toolsAdsConfig } from '@/config/tools-adsense.config'
import NepaliDate from 'nepali-date'
import {
  FaCalendarAlt,
  FaCopy,
  FaGlobeAsia,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'

const nepaliMonths = [
  { value: 1, name: 'Baisakh' }, { value: 2, name: 'Jestha' }, { value: 3, name: 'Asar' },
  { value: 4, name: 'Shrawan' }, { value: 5, name: 'Bhadra' }, { value: 6, name: 'Aswin' },
  { value: 7, name: 'Kartik' }, { value: 8, name: 'Mangsir' }, { value: 9, name: 'Poush' },
  { value: 10, name: 'Magh' }, { value: 11, name: 'Falgun' }, { value: 12, name: 'Chaitra' }
]

const englishMonths = [
  { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
  { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
  { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
  { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
]

export default function NepaliDateConverter() {
  const todayAD = useMemo(() => new Date(), [])
  const todayBS = useMemo(() => new NepaliDate(), [])

  const [direction, setDirection] = useState('bs-to-ad') // 'bs-to-ad' | 'ad-to-bs'
  const [calendarView, setCalendarView] = useState('ad') // 'ad' | 'bs'

  const [bsDate, setBsDate] = useState({
    year: todayBS.getYear().toString(),
    month: (todayBS.getMonth() + 1).toString(),
    day: todayBS.getDate().toString()
  })

  const [adDate, setAdDate] = useState({
    year: todayAD.getFullYear().toString(),
    month: (todayAD.getMonth() + 1).toString(),
    day: todayAD.getDate().toString()
  })

  const [daysInMonth, setDaysInMonth] = useState(30)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)
  const [quickInput, setQuickInput] = useState('')
  const [adsLoaded, setAdsLoaded] = useState(false)

  // ─── Helpers ───────────────────────────────────────────────────────
  const getDaysInNepaliMonth = useCallback((y, m) => {
    try {
      const year = Number(y)
      const month = Number(m)
      if (!year || !month) return 30
      const d = new NepaliDate(year, month - 1, 1)
      return d.getDaysInMonth?.() ?? 30
    } catch {
      return 30
    }
  }, [])

  const bsToAd = useCallback((y, m, d) => {
    try {
      const year = Number(y), month = Number(m), day = Number(d)
      if (!year || !month || !day) return null
      const nd = new NepaliDate(year, month - 1, day)
      const eng = nd.toEnglishDate?.() || nd.toAD?.()
      return eng instanceof Date && !isNaN(eng) ? eng : null
    } catch {
      return null
    }
  }, [])

  const adToBs = useCallback((y, m, d) => {
    try {
      const year = Number(y), month = Number(m), day = Number(d)
      if (!year || !month || !day) return null
      const greg = new Date(year, month - 1, day)
      if (isNaN(greg.getTime())) return null
      const nd = new NepaliDate(greg)
      return {
        year: nd.getYear().toString(),
        month: (nd.getMonth() + 1).toString(),
        day: nd.getDate().toString()
      }
    } catch {
      return null
    }
  }, [])

  // ─── Auto conversion & validation ─────────────────────────────────
  useEffect(() => {
    setError('')
    setResult('')

    let dim = 30
    let converted = null

    if (direction === 'bs-to-ad') {
      dim = getDaysInNepaliMonth(bsDate.year, bsDate.month)
      const dayNum = Number(bsDate.day)
      if (dayNum < 1 || dayNum > dim) {
        setError(`Day must be between 1 and ${dim}`)
      }

      const engDate = bsToAd(bsDate.year, bsDate.month, bsDate.day)
      if (engDate) {
        setAdDate({
          year: engDate.getFullYear().toString(),
          month: (engDate.getMonth() + 1).toString(),
          day: engDate.getDate().toString()
        })
        converted = `${engDate.getDate()} ${englishMonths[engDate.getMonth()].name} ${engDate.getFullYear()}`
      }
    } else {
      dim = new Date(Number(adDate.year), Number(adDate.month), 0).getDate() || 31
      const dayNum = Number(adDate.day)
      if (dayNum < 1 || dayNum > dim) {
        setError(`Day must be between 1 and ${dim}`)
      }

      const bsObj = adToBs(adDate.year, adDate.month, adDate.day)
      if (bsObj) {
        setBsDate(bsObj)
        converted = `${bsObj.day} ${nepaliMonths[Number(bsObj.month) - 1].name} ${bsObj.year}`
      }
    }

    setDaysInMonth(dim)
    if (converted) setResult(converted)
  }, [
    direction,
    bsDate.year, bsDate.month, bsDate.day,
    adDate.year, adDate.month, adDate.day,
    getDaysInNepaliMonth, bsToAd, adToBs
  ])

  // Set initial selected day
  useEffect(() => {
    setSelectedDay(Number(direction === 'bs-to-ad' ? bsDate.day : adDate.day))
  }, [direction])

  // Initialize ads when script is loaded
  useEffect(() => {
    if (adsLoaded && typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {
        // ignore
      }
    }
  }, [adsLoaded])

  // ─── Change handlers – allow full editing ─────────────────────────
  const updateBs = (field, value) => {
    if (value === '' || /^\d{0,4}$/.test(value)) {
      setBsDate(prev => ({ ...prev, [field]: value }))
    }
  }

  const updateAd = (field, value) => {
    if (value === '' || /^\d{0,4}$/.test(value)) {
      setAdDate(prev => ({ ...prev, [field]: value }))
    }
  }

  // Clamp on blur (optional – improves UX)
  const clampOnBlurBs = (field) => {
    setBsDate(prev => {
      let val = prev[field]
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
      let val = prev[field]
      if (val === '') return prev
      let num = Number(val)
      if (field === 'year') num = Math.max(1910, Math.min(2050, num))
      if (field === 'month') num = Math.max(1, Math.min(12, num))
      if (field === 'day') num = Math.max(1, Math.min(daysInMonth, num))
      return { ...prev, [field]: num.toString() }
    })
  }

  // ─── Quick input parse ────────────────────────────────────────────
  const applyQuickInput = () => {
    const s = quickInput.trim()
    const match = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/) ||
                  s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)

    if (!match) {
      alert('Format: YYYY-MM-DD  or  DD-MM-YYYY')
      return
    }

    let y, m, d
    if (match[1].length === 4) {
      [y, m, d] = [match[1], match[2], match[3]]
    } else {
      [d, m, y] = [match[1], match[2], match[3]]
    }

    if (direction === 'bs-to-ad') {
      updateBs('year', y)
      updateBs('month', m)
      updateBs('day', d)
    } else {
      updateAd('year', y)
      updateAd('month', m)
      updateAd('day', d)
    }
    setQuickInput('')
  }

  // ─── Calendar logic ───────────────────────────────────────────────
  const changeMonth = (delta) => {
    if (calendarView === 'ad') {
      let m = Number(adDate.month) + delta
      let y = Number(adDate.year)
      if (m > 12) { m = 1; y += 1 }
      if (m < 1) { m = 12; y -= 1 }
      setAdDate(p => ({ ...p, month: m.toString(), year: y.toString() }))
    } else {
      let m = Number(bsDate.month) + delta
      let y = Number(bsDate.year)
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
      const first = new Date(y, m - 1, 1)
      const firstDow = first.getDay()
      const daysInMonth = new Date(y, m, 0).getDate()
      const prevLast = new Date(y, m - 2, 0).getDate()

      for (let i = firstDow - 1; i >= 0; i--) {
        cells.push({ day: prevLast - i, type: 'prev' })
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const isToday =
          d === todayAD.getDate() &&
          m === todayAD.getMonth() + 1 &&
          y === todayAD.getFullYear()
        cells.push({ day: d, type: 'current', isToday })
      }
    } else {
      const y = Number(bsDate.year) || todayBS.getYear()
      const m = Number(bsDate.month) || (todayBS.getMonth() + 1)
      const days = getDaysInNepaliMonth(y, m)
      const firstAd = bsToAd(y, m, 1)
      const firstDow = firstAd ? firstAd.getDay() : 0

      for (let i = 0; i < firstDow; i++) {
        cells.push({ day: '', type: 'prev' })
      }

      for (let d = 1; d <= days; d++) {
        const isToday =
          d === todayBS.getDate() &&
          m === todayBS.getMonth() + 1 &&
          y === todayBS.getYear()
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

  const handleSelectDay = (cell) => {
    if (cell.type !== 'current' || !cell.day) return
    setSelectedDay(cell.day)

    if (calendarView === 'ad') {
      setAdDate(p => ({ ...p, day: cell.day.toString() }))
    } else {
      setBsDate(p => ({ ...p, day: cell.day.toString() }))
    }
  }

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      alert('Copied to clipboard!')
    }
  }

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

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

        <div className="mb-6">
          <Link href="/tools" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <span className="inline-block transform -translate-x-1">◀</span>
            Back to tools
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <FaGlobeAsia className="text-green-600" />
            Nepali Date Converter
          </h1>
          <p className="mt-3 text-lg text-gray-700">
            Bikram Sambat (BS) ↔ Gregorian (AD)
          </p>
          <p className="mt-2 text-gray-600">
            Today: <span className="font-medium text-green-700">
              {todayBS.format('YYYY-MM-DD')} BS
            </span>
          </p>
        </div>

        {/* Top Ad Unit */}
        {toolsAdsConfig.isConfigured() && (
          <div className="mb-6">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={toolsAdsConfig.getPublisherId()}
              data-ad-slot={toolsAdsConfig.getSlotId('top')}
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        )}

        {/* Direction buttons */}
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          <button
            onClick={() => setDirection('bs-to-ad')}
            className={`px-8 py-3 rounded-full font-semibold shadow transition-all ${
              direction === 'bs-to-ad'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            BS → AD
          </button>
          <button
            onClick={() => setDirection('ad-to-bs')}
            className={`px-8 py-3 rounded-full font-semibold shadow transition-all ${
              direction === 'ad-to-bs'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            AD → BS
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 max-w-xl mx-auto">
            <FaExclamationTriangle className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">

          {/* Input section */}
          <div className="bg-white rounded-2xl shadow-xl p-7 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FaCalendarAlt className="text-green-600" />
              {direction === 'bs-to-ad' ? 'Bikram Sambat (BS)' : 'Gregorian (AD)'}
            </h2>

            <div className="space-y-6">

              {/* Quick input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick entry (YYYY-MM-DD or DD-MM-YYYY)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={e => setQuickInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyQuickInput()}
                    placeholder={direction === 'bs-to-ad' ? '2082-01-15' : '2025-04-28'}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                  <button
                    onClick={applyQuickInput}
                    className="px-5 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={direction === 'bs-to-ad' ? bsDate.year : adDate.year}
                  onChange={e => {
                    const handler = direction === 'bs-to-ad' ? updateBs : updateAd
                    handler('year', e.target.value)
                  }}
                  onBlur={() => {
                    const clamp = direction === 'bs-to-ad' ? clampOnBlurBs : clampOnBlurAd
                    clamp('year')
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg"
                  placeholder="YYYY"
                />
              </div>

              {/* Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={direction === 'bs-to-ad' ? bsDate.month : adDate.month}
                  onChange={e => {
                    const handler = direction === 'bs-to-ad' ? updateBs : updateAd
                    handler('month', e.target.value)
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg"
                >
                  {(direction === 'bs-to-ad' ? nepaliMonths : englishMonths).map(m => (
                    <option key={m.value} value={m.value.toString()}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day (max {daysInMonth})
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={direction === 'bs-to-ad' ? bsDate.day : adDate.day}
                  onChange={e => {
                    const handler = direction === 'bs-to-ad' ? updateBs : updateAd
                    handler('day', e.target.value)
                  }}
                  onBlur={() => {
                    const clamp = direction === 'bs-to-ad' ? clampOnBlurBs : clampOnBlurAd
                    clamp('day')
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg"
                  placeholder="DD"
                />
              </div>
            </div>

            {result && (
              <div className="mt-10 p-5 bg-green-50 rounded-xl border border-green-200">
                <div className="text-green-800 font-medium mb-2">Converted:</div>
                <div className="flex items-center justify-between text-xl font-bold text-green-900">
                  <span>{result}</span>
                  <button
                    onClick={copyResult}
                    className="p-3 hover:bg-green-100 rounded-full transition"
                    title="Copy to clipboard"
                  >
                    <FaCopy className="text-green-700 text-xl" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Calendar section */}
          <div className="bg-white rounded-2xl shadow-xl p-7 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FaCalendarAlt className="text-green-600" />
                {calendarView === 'ad' ? 'Gregorian Calendar' : 'Bikram Sambat Calendar'}
              </h2>
              <div className="flex gap-2 bg-gray-100 p-1.5 rounded-lg">
                <button
                  onClick={() => setCalendarView('ad')}
                  className={`px-5 py-2 rounded-md font-medium transition ${
                    calendarView === 'ad' ? 'bg-white shadow text-green-700' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  AD
                </button>
                <button
                  onClick={() => setCalendarView('bs')}
                  className={`px-5 py-2 rounded-md font-medium transition ${
                    calendarView === 'bs' ? 'bg-white shadow text-green-700' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  BS
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-xl text-xl font-bold text-gray-900">
              <button
                onClick={() => changeMonth(-1)}
                className="p-3 hover:bg-gray-200 rounded-full transition"
              >
                <FaChevronLeft />
              </button>
              <span>
                {calendarView === 'ad'
                  ? `${englishMonths[Number(adDate.month) - 1]?.name} ${adDate.year}`
                  : `${nepaliMonths[Number(bsDate.month) - 1]?.name} ${bsDate.year}`}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-3 hover:bg-gray-200 rounded-full transition"
              >
                <FaChevronRight />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div
                  key={d}
                  className={`py-3 text-sm font-semibold ${i === 6 ? 'text-red-600' : 'text-gray-700'}`}
                >
                  {d}
                </div>
              ))}

              {calendarDays.map((cell, idx) => {
                const isWeekend = idx % 7 === 6
                const isSelected = cell.type === 'current' && cell.day === selectedDay
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectDay(cell)}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-base font-medium cursor-pointer transition
                      ${cell.type !== 'current' ? 'text-gray-300 pointer-events-none' : 'hover:bg-gray-100 border border-transparent'}
                      ${cell.isToday ? 'bg-green-100 border-2 border-green-400 font-bold text-green-800' : ''}
                      ${isSelected ? 'bg-blue-100 border-2 border-blue-500 font-bold' : ''}
                      ${isWeekend && cell.type === 'current' ? 'text-red-600' : ''}
                    `}
                  >
                    {cell.day || ''}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Ad Unit */}
        {toolsAdsConfig.isConfigured() && (
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
        )}
      </div>
    </div>
  )
}