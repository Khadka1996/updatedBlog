import React from 'react'
import NavBar from '../components/header/navbar'
import Footer from '../components/footer/footer'
import Tools from './Tools'
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
     
     <Tools/>
      
      <Footer/>
    </div>
  )
}

export default page
