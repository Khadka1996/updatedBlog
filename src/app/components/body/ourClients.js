'use client';
import React from 'react';
import Image from 'next/image';
import Facebook from './clientAssets/Facebook ads-1.svg';
import Tiktok from './clientAssets/tiktok.png';
import Instagram from './clientAssets/instagram-ads-logo.webp';
import Youtube from './clientAssets/youtube.jpg';
import Google from './clientAssets/google.webp';
import Bing from './clientAssets/bing.webp';
import X from './clientAssets/x.png';

// JSON Object with external image URLs
const clientsData = {
  clients: [
    { id: 1, src: Tiktok, alt: 'Client 1' },
    { id: 2, src: Instagram, alt: 'Client 2' },
    { id: 3, src: Youtube, alt: 'Client 3' },
    { id: 4, src: Facebook, alt: 'Client 4' },
    { id: 5, src: Google, alt: 'Client 5' },
    { id: 6, src: Bing, alt: 'Client 6' },
    { id: 7, src: X, alt: 'Client 7' },
  ],
};

const OurClients = () => {
  return (
    <div className="bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Advertising Partners
          </h2>
          <p className="text-lg text-gray-600">
            We have been working with top social advertising platforms and third-party networks
          </p>
        </div>

        {/* Marquee Effect */}
        <div className="relative overflow-hidden">
          <div className="flex w-max animate-marqueeSlow">
            {clientsData.clients.map((client) => (
              <div key={client.id} className="mx-8">
                <Image
                  src={client.src}
                  alt={client.alt}
                  width={150}
                  height={80}
                  className="h-20 w-32 object-contain"
                  priority
                />
              </div>
            ))}
            {/* Duplicate for continuous scroll */}
            {clientsData.clients.map((client) => (
              <div key={`duplicate-${client.id}`} className="mx-8">
                <Image
                  src={client.src}
                  alt={client.alt}
                  width={150}
                  height={80}
                  className="h-20 w-32 object-contain"
                  priority
                />
              </div>
            ))}
          </div>
        </div>

        {/* Custom CSS Animation */}
        <style jsx>{`
          @keyframes marqueeSlow {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
          .animate-marqueeSlow {
            animation: marqueeSlow 20s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default OurClients;
