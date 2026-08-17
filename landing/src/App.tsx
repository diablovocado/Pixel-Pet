import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Download,
  Github,
  Twitter,
  Disc as Discord,
  Check,
  ChevronDown,
  ArrowUp,
  Menu,
  X,
  Terminal,
  Zap,
  ShieldCheck,
  Heart,
  Cat
} from 'lucide-react';

const BONGO_FRAMES = Array.from(
  { length: 12 },
  (_, i) => `/assets/bongo_cat_frames/tyoe_frame_${i}.png`
);

export default function App() {
  const [bongoFrameIdx, setBongoFrameIdx] = useState(0);
  const [keystrokesCount, setKeystrokesCount] = useState(0);
  const [lastKeyTyped, setLastKeyTyped] = useState('N');
  const [kps, setKps] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const keystrokeTimestampsRef = useRef<number[]>([]);

  // Bongo animation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBongoFrameIdx(prev => (prev + 1) % BONGO_FRAMES.length);
    }, 90);
    return () => clearInterval(interval);
  }, []);

  // Global typing listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
      const now = Date.now();
      keystrokeTimestampsRef.current.push(now);
      const keyChar = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      setLastKeyTyped(keyChar);

      keystrokeTimestampsRef.current = keystrokeTimestampsRef.current.filter(t => now - t <= 1000);
      setKps(keystrokeTimestampsRef.current.length);
      setKeystrokesCount(prev => prev + 1);
      setBongoFrameIdx(prev => (prev + 1) % BONGO_FRAMES.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // KPS Decay Ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = Date.now();
      keystrokeTimestampsRef.current = keystrokeTimestampsRef.current.filter(t => now - t <= 1000);
      setKps(keystrokeTimestampsRef.current.length);
    }, 200);
    return () => clearInterval(ticker);
  }, []);

  // Scroll to Top Listener
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownload = (platform: 'mac' | 'windows') => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FF3366', '#FFFFFF', '#00D9FF']
    });
    window.open('https://github.com/diablovocado/Pixel-Pet', '_blank');
  };

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f1f1f1] font-mono relative selection:bg-[#FF3366] selection:text-white overflow-x-hidden">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-[#1f1f24] py-4">
        <div className="max-w-[1120px] mx-auto w-full px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 font-['Press_Start_2P'] text-sm tracking-wider text-[#f1f1f1]">
            <img src="/assets/pepperino.png" alt="Pixel Pet" className="w-6 h-6 rendering-pixelated" />
            <span>PIXEL PET</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-[#888894]">
            <a href="#overview" onClick={scrollToSection('overview')} className="hover:text-white transition-colors">Features</a>
            <a href="#sandbox" onClick={scrollToSection('sandbox')} className="hover:text-white transition-colors">Live Preview</a>
            <a href="#specs" onClick={scrollToSection('specs')} className="hover:text-white transition-colors">Specs</a>
            <a href="#faq" onClick={scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</a>
            <a 
              href="https://github.com/diablovocado/Pixel-Pet" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownload('mac')}
              className="bg-[#FF3366] hover:bg-[#e62e5c] text-white border border-[#FF3366] px-4 py-2 text-xs font-['Press_Start_2P'] uppercase transition-all shadow-[2px_2px_0px_#000]"
            >
              Get App
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded bg-[#121216] border border-[#22222a] text-[#888894]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 px-6 py-4 border-t border-[#1f1f24] bg-[#09090b] flex flex-col gap-3 text-xs font-mono text-[#888894]">
            <a href="#overview" onClick={(e) => { scrollToSection('overview')(e); setMobileMenuOpen(false); }}>Features</a>
            <a href="#sandbox" onClick={(e) => { scrollToSection('sandbox')(e); setMobileMenuOpen(false); }}>Live Preview</a>
            <a href="#specs" onClick={(e) => { scrollToSection('specs')(e); setMobileMenuOpen(false); }}>Specs</a>
            <a href="#faq" onClick={(e) => { scrollToSection('faq')(e); setMobileMenuOpen(false); }}>FAQ</a>
          </div>
        )}
      </header>

      {/* HERO SECTION MATCHING SCREENSHOT EXACTLY */}
      <section className="max-w-[1120px] mx-auto w-full px-6 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-mono tracking-[0.2em] text-[#888894] uppercase">
              DESKTOP COMPANION • V1.0.4
            </div>

            <h1 className="font-['Press_Start_2P'] text-3xl sm:text-4xl md:text-5xl leading-[1.3] text-[#f1f1f1] tracking-wide">
              PIXEL PET — A PIXEL CAT THAT LIVES ON YOUR DESKTOP
            </h1>

            <p className="text-[#888894] text-base leading-relaxed font-mono max-w-xl">
              She sits on your wallpaper, chases your cursor, taps along when you type, and curls up by the dock when the room goes quiet. No windows, no notifications, no keystrokes stored. Just a small creature keeping you company inside a serious machine.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => handleDownload('mac')}
                className="bg-[#FF3366] hover:bg-[#e62e5c] text-white border border-[#FF3366] px-6 py-4 font-['Press_Start_2P'] text-xs uppercase tracking-wider transition-all shadow-[3px_3px_0px_#000]"
              >
                DOWNLOAD FOR MAC
              </button>

              <button
                onClick={() => handleDownload('windows')}
                className="bg-[#09090b] hover:bg-[#121216] text-[#f1f1f1] border border-[#33333e] px-6 py-4 font-['Press_Start_2P'] text-xs uppercase tracking-wider transition-all shadow-[3px_3px_0px_#000]"
              >
                DOWNLOAD FOR WINDOWS
              </button>
            </div>

            <div className="text-xs font-mono text-[#555560] pt-1">
              v1.0.4 • 4.2 MB • macOS 12+ / Windows 10+
            </div>
          </div>

          {/* Right Hero Terminal Window Showcase (DESKTOP.LIVE) */}
          <div className="lg:col-span-5">
            <div className="bg-[#121216] border border-[#22222a] rounded-lg p-5 shadow-2xl relative space-y-4">
              
              {/* Window Header */}
              <div className="flex items-center justify-between text-xs font-mono border-b border-[#1f1f24] pb-3">
                <span className="text-[#888894] uppercase tracking-wider">DESKTOP.LIVE</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#33333e] inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#33333e] inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] inline-block" />
                </div>
              </div>

              {/* Command Prompt */}
              <div className="text-xs font-mono text-[#888894]">
                $ pixelpet --watch
              </div>

              {/* Center Bongo Cat Animated Box */}
              <div className="bg-[#18181f] border border-[#22222a] h-64 rounded flex flex-col items-center justify-center relative overflow-hidden">
                <img 
                  src={BONGO_FRAMES[bongoFrameIdx]} 
                  alt="Tapping Bongo Cat" 
                  className="w-36 h-36 rendering-pixelated object-contain transform hover:scale-105 transition-transform" 
                />
              </div>

              {/* Bottom Live Indicator */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#888894] pt-1">
                <span className="w-2 h-2 rounded-full bg-[#FF3366] animate-pulse inline-block" />
                <span>tapping along while you type</span>
              </div>

            </div>
          </div>

        </div>

        {/* Dashed Separator Line */}
        <div className="w-full border-b border-dashed border-[#22222a] mt-16" />
      </section>



      {/* BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded bg-[#121216] border border-[#FF3366] text-[#FF3366] hover:bg-[#FF3366] hover:text-white transition-all shadow-lg"
          title="Back to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* MINIMAL FOOTER MATCHING SCREENSHOT */}
      <footer className="border-t border-[#1f1f24] py-8 text-xs text-[#555560] font-mono">
        <div className="max-w-[1120px] mx-auto w-full px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/assets/pepperino.png" alt="Pixel Pet" className="w-4 h-4 rendering-pixelated" />
            <span>© {new Date().getFullYear()} Pixel Pet • Open Source under MIT License</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://github.com/diablovocado/Pixel-Pet" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Twitter className="w-3.5 h-3.5" /> Twitter
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Discord className="w-3.5 h-3.5" /> Discord
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
