"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import img from './logo.png';
import {  
  Phone, 
  Globe2, 
  Zap, 
  ShieldCheck, 
  Volume2, 
  ArrowRight,
  Headphones,
  Menu,
  X,
  PhoneCall,
  UserCheck,
  Smartphone,
  Mic
} from 'lucide-react';

const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <img 
    src={img.src}
    alt="Dubify Logo" 
    className={className}
    referrerPolicy="no-referrer"
  />
);

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Logo className="w-12 h-12" />
            <span className="text-xl font-bold tracking-tight text-zinc-900">Dubify</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-zinc-600 hover:text-orange-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-zinc-600 hover:text-orange-600 transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-zinc-600 hover:text-orange-600 transition-colors">Pricing</a>
            <a href="/TranslatePhoneCall" className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all">
              Start Free Call
            </a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-zinc-100 px-4 py-4 space-y-4"
        >
          <a href="#features" className="block text-base font-medium text-zinc-600">Features</a>
          <a href="#how-it-works" className="block text-base font-medium text-zinc-600">How it Works</a>
          <a href="#pricing" className="block text-base font-medium text-zinc-600">Pricing</a>
          <button className="w-full bg-orange-500 text-white px-5 py-3 rounded-xl text-base font-medium">
            Get Started
          </button>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-orange-600 uppercase bg-orange-50 rounded-full">
            Real-Time Phone Call Translation
          </span>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-zinc-900 mb-8 max-w-4xl mx-auto leading-[1.1]">
            Speak Any Language on <span className="text-orange-500">Every Call</span>
          </h1>
          <p className="text-lg lg:text-xl text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Dubify translates your phone calls in real-time. Call anyone, anywhere, and speak your native language while they hear you in theirs—and vice versa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/login" className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 group">
              Start a Translated Call
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto bg-white text-zinc-900 border border-zinc-200 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
              <PhoneCall className="w-5 h-5" />
              How it Works
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-16 lg:mt-24 relative max-w-md mx-auto"
        >
          {/* Phone UI Mockup */}
          <div className="bg-zinc-900 rounded-[3rem] p-4 shadow-2xl border-[8px] border-zinc-800 aspect-[9/19] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20" />
            
            <div className="h-full w-full bg-zinc-950 rounded-[2rem] overflow-hidden flex flex-col p-6 pt-12">
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 animate-ping opacity-20" />
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-white text-xl font-bold">Calling: Tokyo Office</h3>
                  <p className="text-orange-500 text-sm font-medium mt-1">Live Translation Active</p>
                </div>
                
                <div className="w-full space-y-4 mt-8">
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">You (English)</p>
                    <p className="text-white text-sm">"Hello, I'm calling to confirm the shipment details."</p>
                  </div>
                  <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                    <p className="text-orange-500 text-[10px] uppercase font-bold tracking-wider mb-1">Them (Japanese)</p>
                    <p className="text-white text-sm">"こんにちは、出荷の詳細を確認するためにお電話しています。"</p>
                  </div>
                </div>
              </div>
              
              <div className="pb-8 flex justify-center gap-8">
                <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white rotate-[135deg]" />
                </div>
                <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Accents */}
          <div className="absolute -right-12 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-bold text-zinc-900">0.2s Latency</p>
            </div>
          </div>
          <div className="absolute -left-12 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 hidden lg:block">
            <div className="flex items-center gap-3">
              <Globe2 className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-bold text-zinc-900">Global Routing</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-orange-600" />,
      title: "Ultra-Low Latency",
      description: "Proprietary streaming AI ensures translations happen in under 200ms for natural conversation flow."
    },
    {
      icon: <UserCheck className="w-6 h-6 text-orange-600" />,
      title: "Voice Preservation",
      description: "The person on the other end hears a translated version of YOUR voice, not a generic robot."
    },
    {
      icon: <Globe2 className="w-6 h-6 text-orange-600" />,
      title: "Direct Dialing",
      description: "No app required for the recipient. Call any landline or mobile number globally through Dubify."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-orange-600" />,
      title: "End-to-End Secure",
      description: "Military-grade encryption for all calls. Your private conversations stay private."
    }
  ];

  return (
    <section id="features" className="py-24 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-4">The Future of International Calling</h2>
          <p className="text-zinc-600 max-w-2xl mx-auto">
            Break down borders without leaving your desk. Dubify makes the world your local neighborhood.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm"
            >
              <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
              <p className="text-zinc-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Enter the Number",
      description: "Type the international number you wish to call in the Dubify app."
    },
    {
      number: "02",
      title: "Select Languages",
      description: "Choose your language and the recipient's language."
    },
    {
      number: "03",
      title: "Talk Naturally",
      description: "Start the call. Our AI translates both sides of the conversation instantly."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-zinc-900 mb-6">Seamless Integration</h2>
            <p className="text-lg text-zinc-600 mb-12">
              Dubify acts as a real-time interpreter sitting between you and your call recipient. 
              It's like having a professional translator on every call, 24/7.
            </p>
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6">
                  <span className="text-4xl font-black text-orange-100 leading-none">{step.number}</span>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">{step.title}</h3>
                    <p className="text-zinc-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="bg-orange-500 rounded-[2rem] p-12 text-white aspect-square flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10">
                <blockquote className="text-3xl font-medium italic mb-8">
                  "I closed a deal with a supplier in Brazil without knowing a word of Portuguese. Dubify is a game changer for my business."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-400" />
                  <div>
                    <p className="font-bold">David Miller</p>
                    <p className="text-orange-200 text-sm">CEO, Miller Logistics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-900 rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.15),transparent)] pointer-events-none" />
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8 relative z-10">
            Make your first translated call today
          </h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-2xl mx-auto relative z-10">
            The first 5 minutes are on us. Experience the magic of borderless communication.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-600 transition-all">
              Start Free Trial
            </button>
            <button className="w-full sm:w-auto bg-transparent text-white border border-zinc-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-zinc-800 transition-all">
              View Call Rates
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-zinc-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Logo className="w-10 h-10" />
              <span className="text-xl font-bold tracking-tight text-zinc-900">Dubify</span>
            </div>
            <p className="text-zinc-500 max-w-xs leading-relaxed">
              Connecting the world through real-time AI voice translation.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 mb-6">Product</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><a href="#" className="hover:text-orange-600 transition-colors">Real-Time Translation</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Voice Cloning</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">API for Business</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Global Coverage</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 mb-6">Support</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><a href="#" className="hover:text-orange-600 transition-colors">Call Rates</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Status</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 mb-6">Legal</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><a href="#" className="hover:text-orange-600 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-orange-600 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-10 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-400 text-sm">© 2024 Dubify AI Inc. All rights reserved.</p>
          <div className="flex gap-6 text-zinc-400">
            <Globe2 className="w-5 h-5 hover:text-orange-600 cursor-pointer transition-colors" />
            <Phone className="w-5 h-5 hover:text-orange-600 cursor-pointer transition-colors" />
            <ShieldCheck className="w-5 h-5 hover:text-orange-600 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
