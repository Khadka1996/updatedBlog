import Script from 'next/script';
import ArticlePart from "../components/body/articlePart";
import ContactUs from "../components/body/contactUs";
import Footer from "../components/footer/footer";
import NavBar from "../components/header/navbar";
import BlogPage from "./blogpage";
import { createPageMetadata } from '../seo';
import { toolsAdsConfig } from '@/config/tools-adsense.config';

export const metadata = createPageMetadata({
  title: 'Everestkit Blog',
  description: 'Read practical insights, guides, and updates from the Everestkit team.',
  path: '/blog',
});


const Page = ({ searchParams }) => {
  return (
    <main>
      {/* Single AdSense script load for this page — ArticlePart renders an
          ad unit below and relies on this rather than loading its own. */}
      {toolsAdsConfig.isConfigured() && (
        <Script
          id="blog-listing-adsbygoogle"
          strategy="afterInteractive"
          src={toolsAdsConfig.getScriptUrl()}
          crossOrigin="anonymous"
        />
      )}

      <div className="fixed top-0 left-0 w-full z-50">
        <NavBar/>
      </div>
      <div className="pt-20">
        <BlogPage searchParams={searchParams} />
        <ArticlePart />
        <ContactUs />
        <Footer />
      </div>
    </main>
  );
};

export default Page;
