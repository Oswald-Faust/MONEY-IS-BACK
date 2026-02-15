'use client';

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/20' 
              : 'bg-transparent'
          }`}>
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">D</div>
              <span>Dreelio</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">Features</Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">Testimonials</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">Pricing</Link>
            <Link href="#blog" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">Blog</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="hidden sm:block text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-5 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20 transform hover:-translate-y-0.5 duration-200"
            >
              Try Dreelio free
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
