'use client';

import { Inter_Tight } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronDown, 
  ArrowRight, 
  Menu, 
  X,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Layers,
  PieChart,
  Wallet,
  Users,
  Search,
  Bell,
  Settings,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { useState, useEffect } from 'react';

// --- Font ---
const interTight = Inter_Tight({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter-tight',
});

// --- Components ---

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300 ${scrolled ? 'translate-y-0' : 'translate-y-0'}`}>
            <div className="bg-[#1A1A1A]/90 backdrop-blur-md text-white rounded-full px-2 py-2 pl-6 flex items-center gap-8 shadow-2xl border border-white/5 max-w-2xl w-full justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF6A00] to-[#FF9047] rounded-full flex items-center justify-center text-white font-bold text-lg">A</div>
                    <span className="font-bold text-lg tracking-tight">Ametrix</span>
                </div>
                
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                    <a href="#" className="hover:text-white transition-colors">Features</a>
                    <a href="#" className="hover:text-white transition-colors">Pricing</a>
                    <a href="#" className="hover:text-white transition-colors">Updates</a>
                    <a href="#" className="hover:text-white transition-colors">Support</a>
                </div>

                <div className="flex items-center gap-2">
                    <button className="px-5 py-2.5 bg-white text-black rounded-full text-xs font-bold hover:bg-gray-200 transition-colors">
                        Start Trial
                    </button>
                </div>
            </div>
        </nav>
    );
};

// Mock Dashboard Component for Hero
const DashboardMock = () => (
    <div className="w-full bg-white rounded-[32px] overflow-hidden border border-gray-200 shadow-2xl shadow-black/5">
        {/* Header */}
        <div className="border-b border-gray-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Search className="w-5 h-5" />
                </div>
                <div className="h-10 px-4 rounded-full bg-gray-50 flex items-center text-sm text-gray-400 w-64">
                    Search transactions...
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                    JS
                </div>
            </div>
        </div>
        
        {/* Content */}
        <div className="p-8 grid grid-cols-3 gap-8">
            {/* Sidebar Mock */}
            <div className="col-span-1 space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                    <BarChart3 className="w-5 h-5" /> Dashboard
                </div>
                <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
                    <Wallet className="w-5 h-5" /> Earnings
                </div>
                <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
                    <Users className="w-5 h-5" /> Team
                </div>
                <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
                    <Settings className="w-5 h-5" /> Settings
                </div>
                
                <div className="mt-8 p-6 bg-[#1A1A1A] rounded-2xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold mb-1">Upload to Pro</h4>
                        <p className="text-xs text-gray-400 mb-4">Unlock all features.</p>
                        <button className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg">Upgrade</button>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="col-span-2 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-[#FF6A00] text-white rounded-3xl relative overflow-hidden">
                         <div className="relative z-10">
                             <div className="text-sm font-medium opacity-80 mb-2">Total Revenue</div>
                             <div className="text-3xl font-bold mb-4">$48,299.00</div>
                             <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg text-xs font-medium">
                                 +12.5% vs last month
                             </div>
                         </div>
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                         <div className="text-sm text-gray-500 font-medium mb-2">Active Users</div>
                         <div className="text-3xl font-bold text-gray-900 mb-4">2,544</div>
                         <div className="flex -space-x-2">
                             {[1,2,3,4].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-300" />
                             ))}
                             <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 text-white flex items-center justify-center text-xs font-bold font-mono">+42</div>
                         </div>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">Recent Transactions</h3>
                        <MoreHorizontal className="text-gray-400 w-5 h-5" />
                    </div>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <div className="w-5 h-5 bg-gray-300 rounded-full" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Apple Inc.</div>
                                        <div className="text-xs text-gray-400">Software & Services</div>
                                    </div>
                                </div>
                                <div className="font-bold text-sm">-$149.00</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Hero = () => {
    return (
        <section className="pt-40 pb-20 px-4 max-w-[1400px] mx-auto min-h-screen flex flex-col items-center justify-center relative">
            {/* Ambient Globs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-orange-200/30 to-purple-200/30 blur-[120px] rounded-full pointer-events-none -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-4xl mx-auto mb-20"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest mb-8 border border-orange-100">
                    <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse" />
                    New Version 2.0
                </div>
                <h1 className="text-6xl md:text-8xl font-bold text-[#1A1A1A] tracking-tight leading-[0.95] mb-8">
                    Metrics that <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-purple-600">matter most.</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Ametrix helps you track, analyze, and optimize your business metrics in real-time. No code required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="px-8 py-4 bg-[#1A1A1A] text-white rounded-full font-bold text-lg hover:bg-black transition-colors shadow-xl shadow-black/10 flex items-center gap-2">
                        Get Started <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="px-8 py-4 bg-white text-[#1A1A1A] rounded-full font-bold text-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        View Demo
                    </button>
                </div>
            </motion.div>

            {/* Dashboard Mockup */}
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="w-full max-w-6xl mx-auto relative"
            >
                <DashboardMock />
                {/* Floating Elements on top of dashboard */}
                <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-12 top-20 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 hidden md:block"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Check className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Payment Received</div>
                            <div className="text-xs text-gray-400">Just now</div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

const FeatureCard = ({ title, desc, icon: Icon, large = false }: any) => (
    <div className={`
        bg-white rounded-[32px] p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300
        ${large ? 'md:col-span-2' : 'md:col-span-1'}
    `}>
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6A00]">
                 <ArrowRight className="w-5 h-5" />
             </div>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-[#FF6A00] group-hover:text-white transition-colors duration-300">
            <Icon className="w-7 h-7" />
        </div>

        <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">{title}</h3>
        <p className="text-gray-500 leading-relaxed text-lg">{desc}</p>
    </div>
);

const Features = () => {
    return (
        <section className="py-32 px-4 max-w-[1400px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-5xl font-bold text-[#1A1A1A] mb-6 tracking-tight">Everything you need to grow.</h2>
                <p className="text-xl text-gray-500">Powerful features to help you manage your entire business from one simple dashboard.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard 
                    title="Real-time Analytics" 
                    desc="Track your revenue, expenses, and growth in real-time with our powerful analytics engine." 
                    icon={BarChart3}
                    large={true}
                />
                <FeatureCard 
                    title="Smart Reports" 
                    desc="Generate detailed reports in seconds." 
                    icon={PieChart}
                />
                <FeatureCard 
                    title="Team Management" 
                    desc="Manage your team's access and roles with ease." 
                    icon={Users}
                />
                <FeatureCard 
                    title="Global Payments" 
                    desc="Accept payments from anywhere in the world." 
                    icon={Globe}
                />
                 <FeatureCard 
                    title="Automated Workflows" 
                    desc="Connect your favorite tools and automate repetitive tasks to save time and reduce errors." 
                    icon={Zap}
                    large={true}
                />
            </div>
        </section>
    );
};

const PricingCard = ({ plan, price, features, popular = false }: any) => (
    <div className={`
        relative p-10 rounded-[32px] border flex flex-col h-full
        ${popular 
            ? 'bg-[#1A1A1A] text-white border-transparent shadow-2xl scale-105 z-10' 
            : 'bg-white text-[#1A1A1A] border-gray-100 hover:border-gray-200'
        }
    `}>
        {popular && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#FF6A00] text-white text-xs font-bold uppercase rounded-full tracking-widest">
                Most Popular
            </div>
        )}

        <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">{plan}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">${price}</span>
                <span className={`text-sm ${popular ? 'text-gray-400' : 'text-gray-500'}`}>/month</span>
            </div>
        </div>

        <button className={`
            w-full py-4 rounded-full font-bold text-sm mb-10 transition-colors
            ${popular
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-[#1A1A1A] text-white hover:bg-black'
            }
        `}>
            Get Started
        </button>

        <div className="space-y-4 flex-1">
            {features.map((feature: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                    <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5
                        ${popular ? 'bg-white/10 text-[#FF6A00]' : 'bg-orange-50 text-[#FF6A00]'}
                    `}>
                        <Check className="w-3 h-3" />
                    </div>
                    <span className={`text-sm ${popular ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                </div>
            ))}
        </div>
    </div>
);

const Pricing = () => {
    return (
        <section className="py-32 px-4 max-w-[1400px] mx-auto bg-gray-50 rounded-[48px]">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-5xl font-bold text-[#1A1A1A] mb-6 tracking-tight">Simple, transparent pricing.</h2>
                <p className="text-xl text-gray-500">Choose the plan that's right for your business. No hidden fees.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                <PricingCard 
                    plan="Starter" 
                    price="0" 
                    features={['Up to 3 projects', 'Basic analytics', '24/7 Support', '1 Team member']}
                />
                <PricingCard 
                    plan="Professional" 
                    price="29" 
                    popular={true}
                    features={['Unlimited projects', 'Advanced analytics', 'Priority Support', '5 Team members', 'Custom domain', 'API Access']}
                />
                <PricingCard 
                    plan="Business" 
                    price="99" 
                    features={['Everything in Pro', 'Dedicated account manager', 'SSO & SAML', 'Unlimited team members', 'Audit logs']}
                />
            </div>
        </section>
    );
};

const FAQ = () => {
    const questions = [
        { q: "Can I cancel my subscription at any time?", a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period." },
        { q: "Do you offer a free trial?", a: "Yes, we offer a 14-day free trial on all paid plans. No credit card required to start." },
        { q: "How secure is my data?", a: "We use bank-level encryption (AES-256) to protect your data. We are also SOC2 Type II compliant." },
        { q: "Can I upgrade or downgrade my plan?", a: "Absolutely. You can change your plan at any time from your account settings. Prorated charges will apply." }
    ];

    return (
        <section className="py-32 px-4 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-12 text-center text tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {questions.map((item, i) => (
                    <div key={i} className="border border-gray-100 rounded-2xl bg-white overflow-hidden">
                        <button className="w-full px-8 py-6 text-left flex items-center justify-between font-bold text-lg text-[#1A1A1A] hover:bg-gray-50 transition-colors">
                            {item.q}
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </button>
                         {/* Static open for visual - typically would toggle */}
                        <div className="px-8 pb-6 text-gray-500 leading-relaxed hidden">
                            {item.a}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const Footer = () => (
    <footer className="py-20 px-4 bg-[#1A1A1A] text-white">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
                 <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF6A00] to-[#FF9047] rounded-full flex items-center justify-center text-white font-bold text-lg">A</div>
                    <span className="font-bold text-lg tracking-tight">Ametrix</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Building the future of business analytics. One metric at a time.
                </p>
            </div>
            
            <div>
                <h4 className="font-bold mb-6">Product</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                </ul>
            </div>
             <div>
                <h4 className="font-bold mb-6">Company</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
            </div>
             <div>
                <h4 className="font-bold mb-6">Legal</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            &copy; 2026 Ametrix Inc. All rights reserved.
        </div>
    </footer>
);

export default function AmetrixPage() {
  return (
    <div className={`${interTight.variable} font-sans bg-[#F5F5F5] min-h-screen text-[#1A1A1A] selection:bg-[#FF6A00] selection:text-white`}>
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
