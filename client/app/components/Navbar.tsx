'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Orbitron } from 'next/font/google';
import Image from "next/image";
import { modal } from "@/app/config/wagmi";

const orbitron = Orbitron({ subsets: ['latin'] });

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center z-70 px-4 pt-4">
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`
          max-w-[1300px] w-full rounded-[100px] border border-white/10
          ${isScrolled 
            ? 'bg-black/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]' 
            : 'bg-[#0D0E12]/40 backdrop-blur-sm'}
          transition-all duration-500
        `}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#6E54FF]/20 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className={`text-white font-semibold text-xl tracking-wider bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent ${orbitron.className}`}>
                InfinityX
              </span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                ['Trade', '/trade'],
                ['Agents', '/agents'],
                ['Docs', '/docs'],
                ['GitHub', 'https://github.com/yourusername/infinityx']
              ].map(([title, url]) => (
                <Link
                  key={title}
                  href={url}
                  className="relative px-4 py-2 text-sm text-white/80 hover:text-white transition-colors rounded-xl hover:bg-white/10 font-medium"
                >
                  {title}
                </Link>
              ))}
            </div>
            
            {/* Connect Wallet Button */}
            <div className="flex items-center space-x-4">
            
            <appkit-button  />

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl
                  hover:bg-white/5 transition-colors"
              >
                <div className={`transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`}>
                  <span className={`block w-5 h-0.5 bg-white mb-1.5 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-0' : ''}`} />
                  <span className={`block w-5 h-0.5 bg-white mb-1.5 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-90 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: isMobileMenuOpen ? 'auto' : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
          className="md:hidden overflow-hidden bg-[#0D0E12]/80 border-t border-white/5 rounded-b-2xl"
        >
          <div className="px-4 py-4 space-y-2">
            {[
              ['Trade', '/trade'],
              ['Agents', '/agents'],
              ['Docs', '/docs'],
              ['GitHub', 'https://github.com/yourusername/infinityx']
            ].map(([title, url]) => (
              <Link
                key={title}
                href={url}
                className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors font-medium"
              >
                {title}
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.nav>
    </div>
  );
};

export default Navbar; 