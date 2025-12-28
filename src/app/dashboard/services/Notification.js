// app/dashboard/services/Notification.js
'use client'
import { useEffect } from 'react'

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg border-l-4 ${
      type === 'success' 
        ? 'bg-green-100 border-green-500 text-green-700' 
        : 'bg-red-100 border-red-500 text-red-700'
    }`}>
      <div className="flex items-center">
        <span className="mr-2">
          {type === 'success' ? '✅' : '❌'}
        </span>
        <p>{message}</p>
        <button 
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  )
}