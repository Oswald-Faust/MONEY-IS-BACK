'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';


const Cloud = ({ className, duration = 20, delay = 0 }: { className?: string, duration?: number, delay?: number }) => (
  <motion.div
    className={`absolute opacity-60 pointer-events-none ${className}`}
    animate={{ 
      x: [0, 50, 0],
      y: [0, -20, 0],
    }}
    transition={{ 
      duration, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay
    }}
  >
    <svg width="200" height="120" viewBox="0 0 200 120" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 60C50 43.4315 63.4315 30 80 30C82.1627 30 84.2621 30.2292 86.2913 30.6696C90.3592 13.0807 106.124 0 125 0C147.091 0 165 17.9086 165 40C165 40.9168 164.969 41.8252 164.909 42.7238C184.675 44.9701 200 61.6496 200 82.5C200 103.211 183.211 120 162.5 120H50C22.3858 120 0 97.6142 0 70C0 42.3858 22.3858 20 50 20V60Z" fill="currentColor"/>
    </svg>
  </motion.div>
);

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#E6F0FF] via-[#F0F6FF] to-white">
      {/* Background Elements */}
      <Cloud className="top-20 left-[10%] w-32 h-20 text-blue-100/50 blur-sm" duration={25} />
      <Cloud className="top-40 right-[15%] w-48 h-32 text-blue-100/40 blur-md" duration={30} delay={5} />
      <Cloud className="bottom-40 left-[20%] w-64 h-40 text-blue-50/60 blur-xl" duration={35} delay={2} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-blue-100 text-blue-600 text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            New: Client Portal & Invoicing
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]"
          >
            Run your freelance <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">business like a pro</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            All-in-one platform to manage clients, projects, finances, and everything in between. Designed specifically for freelancers and solo founders.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link 
              href="/signup" 
              className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 transform hover:-translate-y-1 duration-200 text-center"
            >
              Try Dreelio free
            </Link>
            <Link 
              href="#features" 
              className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 border border-gray-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-200 text-center flex items-center justify-center gap-2"
            >
              See features
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </Link>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 50 }}
          className="mt-20 relative mx-auto max-w-6xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 bottom-0 h-40"></div>
          <div className="rounded-3xl border border-gray-200/60 shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm ring-1 ring-gray-900/5">
            <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            {/* Simple Dashboard Placeholder */}
            <div className="p-6 md:p-10 grid grid-cols-12 gap-6 bg-white/50">
              <div className="col-span-12 md:col-span-3 space-y-4">
                 <div className="h-20 bg-blue-50/50 rounded-2xl animate-pulse"></div>
                 <div className="h-40 bg-indigo-50/30 rounded-2xl animate-pulse delay-75"></div>
                 <div className="h-60 bg-gray-50/50 rounded-2xl animate-pulse delay-100"></div>
              </div>
              <div className="col-span-12 md:col-span-9 space-y-6">
                <div className="flex gap-4">
                  <div className="h-32 flex-1 bg-white border border-gray-100 shadow-sm rounded-2xl animate-pulse delay-150"></div>
                  <div className="h-32 flex-1 bg-white border border-gray-100 shadow-sm rounded-2xl animate-pulse delay-200"></div>
                  <div className="h-32 flex-1 bg-white border border-gray-100 shadow-sm rounded-2xl animate-pulse delay-300"></div>
                </div>
                <div className="h-96 bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                    <div className="w-1/3 h-8 bg-gray-100 rounded-lg mb-6"></div>
                    <div className="space-y-4">
                        <div className="w-full h-12 bg-gray-50 rounded-xl"></div>
                        <div className="w-full h-12 bg-gray-50 rounded-xl"></div>
                        <div className="w-full h-12 bg-gray-50 rounded-xl"></div>
                        <div className="w-full h-12 bg-gray-50 rounded-xl"></div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
