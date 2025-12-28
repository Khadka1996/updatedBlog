import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import WhatsAppButton from './components/WhatsAppButton.js';
import MobileFooterNav from './components/footer/footerMobile';
const inter = Inter({ subsets: ["latin"] });

// Define your base URL
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://everestkit.com';

export const metadata = {
  title: {
    default: "Everestkit",
    template: "%s | Everestkit",
  },
  description: "Everestkit is your one-stop platform offering powerful tools like PDF merging, splitting, and image cropping, alongside digital services, blogs, and advertising solutions to help you work smarter.",
  keywords: [
    "Blogs",
    "Digital Marketing",
    "PDF tools",
    "Merge PDF",
    "Split PDF",
    "Compress PDF",
    "Crop images",
    "Digital services",
    "Advertising partners",
    "Document tools",
    "Online tools",
    "Everest Kit"
  ],
  verification: {
    google: "uR6uIZhkkV6qUHOZoHisH_MwJphdQ-NYiosHp3k2Yoc"
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Everestkit - Your All-in-One Digital Toolbox",
    description: "Powerful tools for PDF manipulation, image editing, and digital services to boost your productivity.",
    url: baseUrl,
    siteName: "Everestkit",
    images: [
      {
        url: new URL('/next.svg', baseUrl).toString(), // Absolute URL for OG image
        width: 1200,
        height: 630,
        alt: "Everestkit - Digital Tools Platform",
        type: "image/png",
      },
      {
        url: new URL('/next.svg', baseUrl).toString(), // Larger version if available
        width: 1600,
        height: 900,
        alt: "Everestkit - Digital Tools Platform",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Everestkit - Your All-in-One Digital Toolbox",
    description: "Powerful tools for PDF manipulation, image editing, and digital services to boost your productivity.",
    images: [
      {
        url: new URL('/next.svg', baseUrl).toString(), 
        width: 1200,
        height: 630,
        alt: "Everestkit - Digital Tools Platform",
      }
    ],
    creator: "@MNZ",
    site: "@everestkit",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/next.svg',
    apple: '/next.svg',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/next.svg',
    },
  },
  manifest: `${baseUrl}/site.webmanifest`,
  category: 'technology',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon links */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Google Tag Manager */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-HCTQX5RSTS`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HCTQX5RSTS', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        
        {/* Structured Data / Schema.org */}
        <Script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Everestkit",
              "url": "${baseUrl}",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "${baseUrl}/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </Script>
      </head>
      <body className={inter.className}>
        {children}
        
        {/* Additional scripts that need to load after the page is interactive */}
     
      <WhatsAppButton />
       <MobileFooterNav />
      </body>
    </html>
  );
}