'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HiHome, 
  HiBookOpen, 
  HiWrenchScrewdriver, 
  HiServerStack, 
  HiChatBubbleLeftRight,
  HiUser 
} from "react-icons/hi2";

const MobileFooterNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: HiHome,
    },
    {
      name: 'Blog',
      path: '/blog',
      icon: HiBookOpen,
    },
    {
      name: 'Tools',
      path: '/tools',
      icon: HiWrenchScrewdriver,
    },
    {
      name: 'Services',
      path: '/services',
      icon: HiServerStack,
    },
    {
      name: 'Contact',
      path: '/contact',
      icon: HiChatBubbleLeftRight,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive 
                  ? 'text-[#4caf4f] bg-gray-50' 
                  : 'text-gray-600 hover:text-[#4caf4f]'
              } transition-all duration-200`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-green-50' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              </div>
              <span className="text-xs font-medium mt-1">{item.name}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 w-1/5 h-1 bg-[#4caf4f] rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for mobile devices with notches */}
      <div className="h-4 bg-white" />
    </div>
  );
};

export default MobileFooterNav;