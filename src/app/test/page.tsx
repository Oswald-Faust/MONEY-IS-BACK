'use client';

import { Urbanist } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowUpRight, 
  Check, 
  ChevronDown, 
  CreditCard, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe, 
  Layers, 
  PieChart, 
  Wallet, 
  ArrowRight,
  FileText
} from 'lucide-react';
import { useState } from 'react';

// --- Font ---
const urbanist = Urbanist({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-urbanist',
});

// --- Constants ---
const COLORS = {
  black: '#000000',
  lime: '#D7FE03',
  purple: '#8478F0',
  surface: '#242424',
  textMain: '#FFFFFF',
  textMuted: '#A8A8A8',
};

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6 px-4">
    <div className="bg-[#1A1A1A]/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">Bombon</span>
      </div>
      
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#A8A8A8]">
        <a href="#" className="hover:text-white transition-colors">Products</a>
        <a href="#" className="hover:text-white transition-colors">Solutions</a>
        <a href="#" className="hover:text-white transition-colors">Resources</a>
        <a href="#" className="hover:text-white transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-3 pl-4 border-l border-white/10">
        <button className="text-white text-sm font-medium hover:text-[#D7FE03] transition-colors">Log in</button>
        <button className="bg-[#D7FE03] text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-[#c2e503] transition-colors">
          Get Started
        </button>
      </div>
    </div>
  </nav>
);

const Hero = () => {
  return (
    <section className="pt-40 pb-20 px-4 max-w-[1400px] mx-auto min-h-screen flex flex-col justify-center">
      <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-[120px] md:text-[160px] font-medium text-white leading-[0.9] tracking-tighter mb-6">
                Finance
            </h1>
            <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
                <span className="text-[120px] md:text-[160px] font-medium text-[#A8A8A8] leading-[0.9] tracking-tighter font-serif italic">
                    Simple
                </span>
                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#D7FE03] rounded-full flex items-center justify-center -rotate-12 mt-4 animate-pulse">
                    <ArrowUpRight className="w-12 h-12 md:w-16 md:h-16 text-black" />
                </div>
            </div>
          </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Text */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111111] rounded-[32px] p-12 flex flex-col justify-between h-[500px] border border-white/5 relative overflow-hidden group hover:border-[#D7FE03]/30 transition-all duration-500"
          >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-[#D7FE03] rounded-full flex items-center justify-center">
                     <ArrowUpRight className="w-6 h-6 text-black" />
                  </div>
              </div>

              <div>
                  <div className="inline-block px-4 py-1 rounded-full border border-white/10 text-[#D7FE03] text-xs font-bold uppercase tracking-widest mb-6">
                      Smart Management
                  </div>
                  <h3 className="text-5xl text-white font-medium leading-tight mb-6">
                      Track your money <br/>
                      <span className="text-[#A8A8A8]">real-time.</span>
                  </h3>
              </div>
              <div className="mt-auto">
                 <div className="flex -space-x-4 mb-6">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-2 border-[#111111] bg-gray-600" />
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-[#111111] bg-[#242424] flex items-center justify-center text-white text-xs font-bold">
                        +2k
                    </div>
                 </div>
                 <p className="text-[#A8A8A8] text-lg">Join over 2,000+ companies managing their finance with Bombon.</p>
              </div>
          </motion.div>

          {/* Card 2: Visual */}
          <motion.div 
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.4 }}
             className="bg-[#242424] rounded-[32px] p-8 h-[500px] border border-white/5 relative overflow-hidden group hover:border-[#8478F0]/30 transition-all duration-500"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-[#8478F0]/10 to-transparent opacity-50" />
             
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-12">
                     <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                        <Wallet className="w-8 h-8 text-[#8478F0]" />
                     </div>
                     <div className="px-4 py-2 bg-black/40 rounded-full text-white font-mono text-sm border border-white/10">
                        Total Balance
                     </div>
                </div>
                
                <div className="mt-auto">
                    <div className="text-6xl text-white font-medium tracking-tight mb-2">$124,500.00</div>
                    <div className="flex items-center gap-2 text-[#D7FE03]">
                        <div className="px-2 py-0.5 bg-[#D7FE03]/10 rounded text-sm font-bold">+12.5%</div>
                        <span className="text-[#A8A8A8] text-sm">vs last month</span>
                    </div>

                    {/* Fake Chart */}
                    <div className="mt-8 flex items-end gap-2 h-32 opacity-80">
                        {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                            <div 
                                key={i} 
                                className="flex-1 bg-[#8478F0] rounded-t-lg transition-all duration-500 hover:bg-[#D7FE03]" 
                                style={{ height: `${h}%`, opacity: 0.3 + (i * 0.1) }} 
                            />
                        ))}
                    </div>
                </div>
             </div>
          </motion.div>
      </div>
    </section>
  );
};

const Logos = () => {
    return (
        <section className="py-20 border-y border-white/5 overflow-hidden bg-black relative">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black via-transparent to-black z-10" />
            <motion.div 
                animate={{ x: "-50%" }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                className="flex gap-20 whitespace-nowrap opacity-50 grayscale"
            >
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 text-2xl font-bold text-white">
                        <div className="w-8 h-8 bg-white/20 rounded-full" />
                        COMPANY {i}
                    </div>
                ))}
            </motion.div>
        </section>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, color = COLORS.lime }: any) => (
    <div className="bg-[#151515] p-8 rounded-[32px] border border-white/5 flex flex-col h-[320px] group hover:bg-[#1A1A1A] transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
            <Plus className="w-5 h-5" />
        </div>
        
        <div className="w-14 h-14 rounded-2xl bg-[#242424] flex items-center justify-center mb-auto group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7" style={{ color }} />
        </div>

        <div>
            <h3 className="text-2xl text-white font-medium mb-3">{title}</h3>
            <p className="text-[#A8A8A8] leading-relaxed">{desc}</p>
        </div>
    </div>
);

const Features = () => {
    return (
        <section className="py-32 px-4 max-w-[1400px] mx-auto">
            <div className="flex justify-between items-end mb-20">
                <h2 className="text-6xl md:text-[80px] font-medium text-white leading-[0.9]">
                    Powerpack <br/>
                    <span className="text-[#A8A8A8]">features.</span>
                </h2>
                <div className="hidden md:block max-w-sm text-[#A8A8A8] text-lg">
                    Everything you need to manage your finances, expenses, and team budgets in one place.
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard 
                    icon={CreditCard} 
                    title="Smart Cards" 
                    desc="Issue physical and virtual cards for your team instantly."
                    color={COLORS.lime}
                />
                 <FeatureCard 
                    icon={BarChart3} 
                    title="Analytics" 
                    desc="Get real-time insights into your spending patterns."
                    color={COLORS.purple}
                />
                 <FeatureCard 
                    icon={Shield} 
                    title="Secure Vault" 
                    desc="Bank-grade security for all your assets and data."
                    color="#FF5D5D"
                />
                 <FeatureCard 
                    icon={Zap} 
                    title="Instant Transfers" 
                    desc="Send money globally with zero hidden fees."
                    color="#FFB84C"
                />
                 <FeatureCard 
                    icon={Layers} 
                    title="Budget Control" 
                    desc="Set limits and approvals for team expenses."
                    color="#00C4FF"
                />
                 <FeatureCard 
                    icon={Globe} 
                    title="Multi-currency" 
                    desc="Hold and exchange 30+ currencies at real rates."
                    color="#FF9CDA"
                />
            </div>
        </section>
    );
};

const TAB_CONTENT = [
    {
        id: 'cards',
        title: 'Corporate Cards',
        desc: 'Issue cards for your team with built-in controls and real-time tracking.',
        icon: CreditCard,
        gradient: 'from-blue-500/20 to-purple-500/20',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=2070'
    },
    {
        id: 'expenses',
        title: 'Expense Mgt',
        desc: 'Automate expense reporting and approvals. No more paper receipts.',
        icon: PieChart,
        gradient: 'from-orange-500/20 to-red-500/20',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=2070'
    },
    {
        id: 'invoices',
        title: 'Invoicing',
        desc: 'Create professional invoices and get paid faster with automated reminders.',
        icon: FileText,
        gradient: 'from-green-500/20 to-emerald-500/20',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2070'
    }
];

const Services = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <section className="py-32 px-4 max-w-[1400px] mx-auto">
            <div className="bg-[#111] rounded-[48px] p-8 md:p-16 border border-white/5 flex flex-col md:flex-row gap-16 min-h-[600px]">
                {/* Left: Tabs */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="text-[#D7FE03] font-bold uppercase tracking-widest mb-8">Services</div>
                    <div className="space-y-4">
                        {TAB_CONTENT.map((tab, i) => (
                            <button 
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`w-full text-left p-6 rounded-[24px] border transition-all duration-300 flex items-center justify-between group ${
                                    activeTab === i 
                                    ? 'bg-[#1F1F1F] border-[#333] text-white' 
                                    : 'bg-transparent border-transparent text-[#666] hover:bg-[#151515]'
                                }`}
                            >
                                <span className={`text-xl font-medium ${activeTab === i ? 'text-white' : 'group-hover:text-[#A8A8A8]'}`}>
                                    {tab.title}
                                </span>
                                {activeTab === i && (
                                    <div className="w-8 h-8 bg-[#D7FE03] rounded-full flex items-center justify-center">
                                        <ArrowRight className="w-4 h-4 text-black" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-2/3 relative rounded-[32px] overflow-hidden bg-[#1A1A1A] border border-white/5">
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 p-12 flex flex-col"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0 opacity-40">
                                <img src={TAB_CONTENT[activeTab].image} className="w-full h-full object-cover grayscale mix-blend-overlay" />
                                <div className={`absolute inset-0 bg-gradient-to-br ${TAB_CONTENT[activeTab].gradient} mix-blend-soft-light`} />
                            </div>

                            <div className="relative z-10 mt-auto">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                    <Zap className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-4xl text-white font-medium mb-4">{TAB_CONTENT[activeTab].title}</h3>
                                <p className="text-[#A8A8A8] text-lg max-w-md mb-8">{TAB_CONTENT[activeTab].desc}</p>
                                <button className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#D7FE03] transition-colors">
                                    Explore Feature
                                </button>
                            </div>
                        </motion.div>
                     </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

const PricingCard = ({ plan, price, highlight = false }: any) => (
    <div className={`
        p-10 rounded-[40px] border flex flex-col h-full transition-all duration-300
        ${highlight 
            ? 'bg-[#1A1A1A] border-[#D7FE03]/50 shadow-[0_0_40px_rgba(215,254,3,0.1)]' 
            : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'
        }
    `}>
        <div className="mb-8">
            <h3 className="text-2xl text-white font-medium mb-2">{plan}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-5xl font-medium text-white">${price}</span>
                <span className="text-[#666]">/mo</span>
            </div>
        </div>

        <div className="space-y-4 mb-10 flex-1">
            {['Unlimited transactions', 'Analytics dashboard', 'Support 24/7', 'Virtual cards'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-[#A8A8A8]">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlight ? 'bg-[#D7FE03] text-black' : 'bg-[#242424] text-white'}`}>
                        <Check className="w-3 h-3" />
                    </div>
                    {f}
                </div>
            ))}
        </div>

        <button className={`
            w-full py-4 rounded-[20px] font-bold text-lg transition-all
            ${highlight 
                ? 'bg-[#D7FE03] text-black hover:bg-[#c2e503]' 
                : 'bg-[#242424] text-white hover:bg-white hover:text-black'
            }
        `}>
            Choose Plan
        </button>
    </div>
);

const Pricing = () => {
    return (
        <section className="py-32 px-4 max-w-[1400px] mx-auto">
            <div className="text-center mb-20">
                <h2 className="text-[60px] text-white font-medium mb-6">Simple Pricing</h2>
                
                {/* Toggle */}
                <div className="inline-flex items-center p-1 bg-[#1A1A1A] rounded-full border border-white/5">
                    <button className="px-8 py-3 rounded-full bg-[#333] text-white font-bold text-sm shadow-lg">Monthly</button>
                    <button className="px-8 py-3 rounded-full text-[#666] font-bold text-sm hover:text-white">Yearly (-20%)</button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <PricingCard plan="Basic" price="0" />
                <PricingCard plan="Pro" price="29" highlight={true} />
                <PricingCard plan="Enterprise" price="99" />
            </div>
        </section>
    );
};

const FaqItem = ({ question }: { question: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/5 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-8 flex items-center justify-between text-left group"
            >
                <span className="text-2xl text-white font-medium group-hover:text-[#D7FE03] transition-colors">{question}</span>
                <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white text-black' : 'text-white'}`}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-8 text-[#A8A8A8] text-lg leading-relaxed max-w-2xl">
                            Yes, absolutely. We use bank-grade encryption and specialized security vaults to ensure your data is always safe and private.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => (
    <section className="py-32 px-4 max-w-[1400px] mx-auto grid md:grid-cols-2 gap-20">
        <div>
            <div className="inline-block px-4 py-1 rounded-full border border-white/10 text-[#D7FE03] text-xs font-bold uppercase tracking-widest mb-6">
                Support
            </div>
            <h2 className="text-[60px] text-white font-medium leading-[1.1] mb-8">
                Frequently <br/> asked questions.
            </h2>
            <button className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-[#D7FE03] transition-colors">
                Contact Support
            </button>
        </div>
        <div>
            <FaqItem question="Is Bombon secure?" />
            <FaqItem question="Can I cancel anytime?" />
            <FaqItem question="Do you offer global transfers?" />
            <FaqItem question="How do I get a card?" />
        </div>
    </section>
);

const Footer = () => (
    <footer className="py-20 px-4 bg-[#0A0A0A] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <h2 className="text-[100px] md:text-[180px] font-medium text-[#1A1A1A] tracking-tighter hover:text-white transition-colors cursor-default select-none">
                Bombon
            </h2>
            <div className="flex gap-8 text-[#666]">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
                <a href="#" className="hover:text-white">Sitemap</a>
            </div>
        </div>
    </footer>
);

export default function BombonPage() {
  return (
    <div className={`${urbanist.variable} font-sans bg-black min-h-screen text-white selection:bg-[#D7FE03] selection:text-black`}>
      <Navbar />
      <Hero />
      <Logos />
      <Features />
      <Services />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
