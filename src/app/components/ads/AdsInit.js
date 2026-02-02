'use client'

import { useEffect } from 'react'

export default function AdsInit() {
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      if (window.adsbygoogle) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch {}
      }
    } catch {}
  }, [])

  return null
}
