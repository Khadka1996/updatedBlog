import React from 'react'
import NavBar from '../components/header/navbar'
import Footer from '../components/footer/footer'
import Tools from './Tools'
import AdSlot from '../components/ads/AdSlot';
import { createPageMetadata } from '../seo';

export const metadata = createPageMetadata({
  title: 'Free Online Tools',
  description: 'Use Everestkit online tools for PDFs, images, documents, dates, time zones, and more.',
  path: '/tools',
});
const page = () => {
  return (
    <div>
      <NavBar/>
      <div className="max-w-6xl mx-auto px-4">
        <AdSlot placement="top" className="mt-6" />
      </div>
      <Tools/>
      <div className="max-w-6xl mx-auto px-4">
        <AdSlot placement="bottom" className="mb-8" />
      </div>
      <Footer/>
    </div>
  )
}

export default page
