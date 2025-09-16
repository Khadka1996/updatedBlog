// pages/not-found.js
'use client'
import { useEffect, useState } from 'react';
import NavBar from './components/header/navbar';

export default function NotFound() {
  const [isClient, setIsClient] = useState(false);

  // This ensures any client-specific code runs only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // You could return a loading spinner or fallback UI if needed
  }

  return (
    <div className="flex flex-col items-center justify-center mt-8 mb-8">
      <h1 className="text-4xl font-bold text-red-500">404</h1>
      <p className="text-xl text-gray-600 mt-4">Oops! Page not found.</p>
      <p className="text-md text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="mt-6 text-blue-500 hover:text-blue-700">Go back to Home</a>
    </div>
  );
}
