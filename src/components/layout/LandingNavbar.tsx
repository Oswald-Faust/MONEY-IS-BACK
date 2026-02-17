'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu,
  X,
  Layout,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

import { ThemeToggle } from '@/components/ThemeToggle';

export const LandingNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, logout } = useAuthStore();
    
    const [isMobile, setIsMobile] = useState(false);
    
    // Mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <motion.nav 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none"
            >
                <motion.div 
                    initial={false}
                    animate={{ 
                        width: isMobile ? "100%" : (scrolled ? "90%" : "100%"), 
                        maxWidth: isMobile ? "100%" : (scrolled ? "800px" : "1100px"),
                        y: isMobile ? 0 : (scrolled ? 10 : 0),
                        padding: isMobile ? "12px 16px" : (scrolled ? "10px 24px" : "16px 32px"),
                        borderRadius: scrolled ? "24px" : "9999px"
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30,
                    }}
                    className="bg-bg-secondary/80 backdrop-blur-xl border border-glass-border flex items-center justify-between shadow-2xl shadow-black/50 overflow-hidden pointer-events-auto"
                >
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center border border-glass-border group-hover:border-[#00FFB2]/50 transition-colors">
                            <span className="text-text-main font-bold text-xs font-mono">M</span>
                        </div>
                        <AnimatePresence initial={false}>
                            {!scrolled && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-lg font-bold text-text-main tracking-tight hidden sm:block whitespace-nowrap overflow-hidden"
                                >
                                    MONEY IS BACK
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-text-dim mx-4">
                        <Link href="/#features" className="hover:text-text-main transition-colors">Produit</Link>
                        <Link href="/about" className="hover:text-text-main transition-colors">À propos</Link>
                        <Link href="/blog" className="hover:text-text-main transition-colors">Blog</Link>
                        <Link href="/#pricing" className="hover:text-text-main transition-colors">Tarifs</Link>
                        <Link href="/contact" className="hover:text-text-main transition-colors">Contact</Link>
                    </div>

                    {/* Auth / Mobile Toggle */}
                    <div className="flex items-center gap-3 shrink-0">
                        <ThemeToggle />
                        
                        {isAuthenticated ? (
                             <>
                                <Link 
                                    href="/dashboard"
                                    className="hidden md:flex px-4 py-2 rounded-full bg-glass-bg text-text-main text-xs font-bold hover:bg-glass-hover border border-glass-border transition-all items-center gap-2"
                                >   
                                    <Layout className="w-3 h-3" />
                                    <AnimatePresence initial={false}>
                                        {!scrolled && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden whitespace-nowrap"
                                            >
                                                Dashboard
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                                <button onClick={() => logout()} className="hidden md:flex w-8 h-8 rounded-full bg-red-500/10 text-red-400 items-center justify-center hover:bg-red-500/20 transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </button>
                             </>
                        ) : (
                            <div 
                                className={`hidden md:flex items-center gap-3 ${!scrolled ? "pl-4 border-l border-glass-border" : ""}`}
                            >
                                <Link href="/login" className="text-text-main text-sm font-medium hover:text-[#00FFB2] transition-colors">
                                    Connexion
                                </Link>
                                <Link 
                                    href="/#pricing" 
                                    className="bg-accent-primary text-white px-5 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                >
                                    Commencer
                                </Link>
                            </div>
                        )}

                        <button className="md:hidden text-text-main" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </motion.div>
            </motion.nav>

             {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-40 flex flex-col pt-32 px-6 gap-8 md:hidden"
                    >
                        <div className="flex flex-col gap-6 items-center text-center">
                            <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Produit</Link>
                            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">À propos</Link>
                            <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Blog</Link>
                            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Contact</Link>
                            <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Tarifs</Link>
                            <hr className="w-20 border-white/10" />
                            {isAuthenticated ? (
                                <Link href="/dashboard" className="text-xl font-bold text-[#00FFB2]">Accéder au Dashboard</Link>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl text-zinc-400">Connexion</Link>
                                    <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-[#00FFB2]">Commencer</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
