import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Cat,
  Heart,
  Fish,
  Download,
  Github,
  Zap,
  RotateCcw,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Star,
  Sparkles,
  ShieldCheck,
  Cpu,
  HardDrive,
  MousePointer,
  Keyboard,
  Bed,
  Smile,
  Send,
  Play
} from 'lucide-react';

// Bongo Cat frame sequence paths
const BONGO_FRAMES = Array.from(
  { length: 12 },
  (_, i) => `/assets/bongo_cat_frames/tyoe_frame_${i}.png`
);

// Randomized Mood Bubble Greetings
const RANDOM_GREETINGS = [
  "hi maith! 👋",
  "meow~ 💕",
  "let's code! 💻",
  "purrrrr~ ✨",
  "more treats please! 🐟",
  "bongo paw time! 🥁",
  "cozy desk vibes! 🌙"
];

// Testimonials Data
const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "Senior Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    quote: "Pluto is literally the highlight of my coding day! When I start slamming out code, seeing Pluto slam her little paws on her bongo drums makes debugging so much less stressful.",
    rating: 5
  },
  {
    name: "Alex Rivera",
    role: "UI/UX Designer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    quote: "The mochi vertical drag stretch animation is ridiculously cute! The boho earthy aesthetic of this SaaS page matches Pluto's cozy vibe perfectly.",
    rating: 5
  },
  {
    name: "Elena Rostova",
    role: "Indie Hacker & Creator",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    quote: "0.1% CPU and ~15MB RAM is no joke. I keep Pluto on my MacBook Air Dock all day while running heavy builds and it uses virtually zero battery.",
    rating: 5
  }
];

// FAQ Accordion Data
const FAQS = [
  {
    q: "How does Pluto track my cursor and typing without lag?",
    a: "Pluto uses hardware-level keystroke identifiers (kVK_ANSI_) and macOS native powerMonitor APIs in Electron. It runs completely locally with 0.1% CPU footprint and zero background network calls."
  },
  {
    q: "Does Pluto interfere with my clicks or window focusing?",
    a: "Not at all! Pluto runs in a transparent, click-through overlay window. Only clicking directly on Pluto's cat body intercepts mouse events (for petting and Mochi stretching); all other clicks pass through to your apps."
  },
  {
    q: "Can I customize Pluto's sprites or add new behaviors?",
    a: "Yes! Pluto is 100% open-source under the MIT license. You can replace PNG frame assets in the assets folder or customize animation speed math inside the renderer loop."
  },
  {
    q: "Is Pluto available for Windows and Linux?",
    a: "Yes! While cursor pursuit and Dock sleeping were tailored for macOS, Pluto builds seamlessly for Windows and Linux platforms via Electron."
  }
];

export default function App() {
  // Navigation & Page View State (SPA Router simulation)
  const [currentPage, setCurrentPage] = useState<'home' | 'features' | 'sandbox' | 'pricing' | 'faq'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [stickyCtaVisible, setStickyCtaVisible] = useState(false);

  // Custom Cursor Effect State
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorVisible, setCursorVisible] = useState(false);

  // Sandbox & Mascot States
  const [activeTab, setActiveTab] = useState<'walk' | 'sleep' | 'bongo' | 'excited' | 'petting'>('bongo');
  const [happiness, setHappiness] = useState(98);
  const [treatsCount, setTreatsCount] = useState(5);
  const [copied, setCopied] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("hi maith! 👋");
  const [bongoFrameIdx, setBongoFrameIdx] = useState(0);

  // Mochi Vertical Drag Stretch State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [stretchScale, setStretchScale] = useState({ scaleX: 1, scaleY: 1 });

  // Real-time typing states
  const [kps, setKps] = useState(0);
  const [keystrokesCount, setKeystrokesCount] = useState(0);
  const [testInputText, setTestInputText] = useState('');
  const [lastKeyTyped, setLastKeyTyped] = useState('N');
  const keystrokeTimestampsRef = useRef<number[]>([]);

  // Testimonial Carousel State
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // FAQ Open State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Newsletter Form State
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Animated Counter State
  const [statCounts, setStatCounts] = useState({ deskpets: 0, cpu: 0, ram: 0, cozy: 0 });

  // Preloaded image references for Canvas
  const imagesRef = useRef<{
    pepperino: HTMLImageElement | null;
    sleep: HTMLImageElement | null;
    bongoLeft: HTMLImageElement | null;
    bongoRight: HTMLImageElement | null;
    bongoFrames: HTMLImageElement[];
  }>({
    pepperino: null,
    sleep: null,
    bongoLeft: null,
    bongoRight: null,
    bongoFrames: [],
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const catPosRef = useRef({ x: 80, y: 80, dir: 1 });

  // Track scroll position for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      setStickyCtaVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Custom Cursor Effect Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      setCursorVisible(true);
    };
    const handleMouseLeave = () => setCursorVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Animated Counter Trigger
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      setStatCounts({
        deskpets: Math.floor(progress * 50000),
        cpu: Number((progress * 0.1).toFixed(1)),
        ram: Math.floor(progress * 15),
        cozy: Number((progress * 99.9).toFixed(1))
      });
      if (step >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Preload Image Assets
  useEffect(() => {
    const pep = new Image();
    pep.src = '/assets/pepperino.png';
    pep.onload = () => { imagesRef.current.pepperino = pep; };

    const slp = new Image();
    slp.src = '/assets/sleep.png';
    slp.onload = () => { imagesRef.current.sleep = slp; };

    const bLeft = new Image();
    bLeft.src = '/assets/tyoe_left.png';
    bLeft.onload = () => { imagesRef.current.bongoLeft = bLeft; };

    const bRight = new Image();
    bRight.src = '/assets/tyoe_right.png';
    bRight.onload = () => { imagesRef.current.bongoRight = bRight; };

    BONGO_FRAMES.forEach(src => {
      const img = new Image();
      img.src = src;
      imagesRef.current.bongoFrames.push(img);
    });
  }, []);

  // Global Keyboard Typing Detector & KPS Calculator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

      const now = Date.now();
      keystrokeTimestampsRef.current.push(now);
      const keyChar = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      setLastKeyTyped(keyChar);

      keystrokeTimestampsRef.current = keystrokeTimestampsRef.current.filter(t => now - t <= 1000);
      const currentKps = keystrokeTimestampsRef.current.length;
      setKps(currentKps);
      setKeystrokesCount(prev => prev + 1);

      setActiveTab('bongo');
      setBongoFrameIdx(prev => (prev + 1) % BONGO_FRAMES.length);

      if (currentKps > 7) {
        setSpeechBubble(`🔥 HIGH SPEED TYPING! ${currentKps} KPS! 🎹⚡`);
      } else if (currentKps > 2) {
        setSpeechBubble(`⚡ Typing at ${currentKps} KPS! Key '${keyChar}' pressed! 🎵`);
      } else {
        const randomGreeting = RANDOM_GREETINGS[Math.floor(Math.random() * RANDOM_GREETINGS.length)];
        setSpeechBubble(randomGreeting);
      }
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

  // Automatic Idle Bongo frame ticker
  useEffect(() => {
    if (activeTab !== 'bongo') return;
    const speed = kps > 5 ? 40 : kps > 0 ? 70 : 110;
    const interval = setInterval(() => {
      setBongoFrameIdx(prev => (prev + 1) % BONGO_FRAMES.length);
    }, speed);
    return () => clearInterval(interval);
  }, [activeTab, kps]);

  // Main Canvas Render Loop for Pluto
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Separator floor line
      ctx.strokeStyle = darkMode ? '#EAE3EA' : '#565264';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(15, 175);
      ctx.lineTo(canvas.width - 15, 175);
      ctx.stroke();

      if (activeTab === 'walk') {
        catPosRef.current.x += 1.4 * catPosRef.current.dir;
        if (catPosRef.current.x > canvas.width - 120) catPosRef.current.dir = -1;
        if (catPosRef.current.x < 30) catPosRef.current.dir = 1;
      }

      const { x, dir } = catPosRef.current;

      ctx.save();

      // Apply Mochi Vertical Drag Stretch transformation math
      if (stretchScale.scaleY !== 1) {
        ctx.translate(canvas.width / 2, 130);
        ctx.scale(stretchScale.scaleX, stretchScale.scaleY);
        ctx.translate(-canvas.width / 2, -130);
      }

      if (activeTab === 'sleep') {
        const sleepImg = imagesRef.current.sleep;
        if (sleepImg) {
          ctx.drawImage(sleepImg, 270, 80, 95, 95);
        }

        const zOffset = Math.sin(Date.now() / 250) * 6;
        ctx.font = '20px "VT323", monospace';
        ctx.fillStyle = '#A6808C';
        ctx.fillText('Z z z...', 365, 80 + zOffset);
      } else if (activeTab === 'bongo') {
        const currentFrameImg = imagesRef.current.bongoFrames[bongoFrameIdx];
        if (currentFrameImg && currentFrameImg.complete) {
          ctx.drawImage(currentFrameImg, 265, 62, 110, 110);
        } else if (imagesRef.current.bongoLeft) {
          ctx.drawImage(imagesRef.current.bongoLeft, 265, 62, 110, 110);
        }

        if (kps > 0) {
          const noteY = Math.sin(Date.now() / 100) * 8;
          ctx.font = '16px sans-serif';
          ctx.fillText('🎵', 240, 65 + noteY);
          ctx.fillText('🎶', 380, 55 - noteY);

          if (lastKeyTyped) {
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = '#A6808C';
            ctx.fillText(`[${lastKeyTyped}]`, 310, 48 + noteY);
          }
        }
      } else if (activeTab === 'excited') {
        const bounceY = Math.abs(Math.sin(Date.now() / 140)) * 20;
        const pepImg = imagesRef.current.pepperino;
        if (pepImg) {
          ctx.drawImage(pepImg, 275, 85 - bounceY, 90, 90);
        }

        ctx.font = '16px sans-serif';
        ctx.fillText('✨', 245, 80 - bounceY);
        ctx.fillText('💖', 375, 70 - bounceY);
      } else if (activeTab === 'petting') {
        const wobbleX = Math.sin(Date.now() / 80) * 3;
        const pepImg = imagesRef.current.pepperino;
        if (pepImg) {
          ctx.drawImage(pepImg, 275 + wobbleX, 85, 90, 90);
        }
        ctx.font = '16px sans-serif';
        ctx.fillText('🥰', 360, 80);
      } else {
        const pepImg = imagesRef.current.pepperino;
        ctx.translate(x, 85);
        if (dir === -1) {
          ctx.scale(-1, 1);
          ctx.translate(-90, 0);
        }

        if (pepImg) {
          ctx.drawImage(pepImg, 0, 0, 90, 90);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, bongoFrameIdx, kps, lastKeyTyped, stretchScale, darkMode]);

  // Mochi Vertical Drag Handlers
  const handleMouseDownStage = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
  };

  const handleMouseMoveStage = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dragDistY = Math.max(0, e.clientY - dragStartY);
    // Formula: scaleY = 1 + Math.min(dragDistanceY / 100, 0.7); scaleX = 1 / scaleY
    const scaleY = 1 + Math.min(dragDistY / 100, 0.7);
    const scaleX = 1 / scaleY;
    setStretchScale({ scaleX, scaleY });
  };

  const handleMouseUpStage = () => {
    if (isDragging) {
      setIsDragging(false);
      // Instant snap-back to 1-to-1
      setStretchScale({ scaleX: 1, scaleY: 1 });
      const randomGreeting = RANDOM_GREETINGS[Math.floor(Math.random() * RANDOM_GREETINGS.length)];
      setSpeechBubble(randomGreeting);
    }
  };

  const copyInstallCommand = () => {
    navigator.clipboard.writeText(
      'git clone https://github.com/diablovocado/Pixel-Pet.git && cd Pixel-Pet && npm install && npm start'
    );
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#A6808C', '#CCB7AE', '#8A9A65']
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFeed = () => {
    if (treatsCount > 0) {
      setTreatsCount(prev => prev - 1);
      setHappiness(prev => Math.min(100, prev + 10));
      setActiveTab('excited');
      setSpeechBubble("YUMMY! Fish treat devoured! Pluto is super happy! 🐟✨");

      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#8A9A65', '#CCB7AE', '#A6808C']
      });

      setTimeout(() => setSpeechBubble("meow~ 💕"), 2500);
    } else {
      setSpeechBubble("Treat box empty! Click '+ Restock Treats'! 📦");
    }
  };

  const handlePet = () => {
    setActiveTab('petting');
    setHappiness(prev => Math.min(100, prev + 5));
    const randomGreeting = RANDOM_GREETINGS[Math.floor(Math.random() * RANDOM_GREETINGS.length)];
    setSpeechBubble(randomGreeting);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setSubscribed(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#1C1822] text-[#EAE3EA]' : 'bg-[#D6CFCB] text-[#565264]'} relative selection:bg-[#A6808C] selection:text-white`}>
      
      {/* CUSTOM PAW CURSOR EFFECT */}
      {cursorVisible && (
        <div 
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 hidden md:block"
          style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
        >
          <div className="w-6 h-6 rounded-full bg-[#A6808C]/40 border border-[#565264] flex items-center justify-center text-xs">
            🐾
          </div>
        </div>
      )}

      {/* HEADER & NAVIGATION BAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b-2 ${darkMode ? 'bg-[#1C1822]/90 border-[#A6808C]' : 'bg-[#D6CFCB]/90 border-[#565264]'} py-4 transition-colors`}>
        <div className="max-w-[1120px] mx-auto w-full px-6 flex items-center justify-between">
          
          {/* Logo Left */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#CCB7AE] border-2 border-[#565264] flex items-center justify-center shadow-[2px_2px_0px_#565264] overflow-hidden">
              <img src="/assets/pepperino.png" alt="Pluto Logo" className="w-7 h-7 rendering-pixelated object-contain" />
            </div>
            <div>
              <div className="font-boho text-2xl font-bold text-[#A6808C] leading-none flex items-center gap-2">
                Pluto <span className="font-hand text-xs px-2 py-0.5 rounded-full bg-[#CCB7AE] text-[#565264] border border-[#565264]">Your desk pet</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-6 font-hand text-lg">
            <button 
              onClick={() => setCurrentPage('home')} 
              className={`hover:text-[#A6808C] transition-colors ${currentPage === 'home' ? 'text-[#A6808C] font-bold underline' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentPage('features')} 
              className={`hover:text-[#A6808C] transition-colors ${currentPage === 'features' ? 'text-[#A6808C] font-bold underline' : ''}`}
            >
              Features
            </button>
            <button 
              onClick={() => setCurrentPage('sandbox')} 
              className={`hover:text-[#A6808C] transition-colors ${currentPage === 'sandbox' ? 'text-[#A6808C] font-bold underline' : ''}`}
            >
              Live Sandbox
            </button>
            <button 
              onClick={() => setCurrentPage('pricing')} 
              className={`hover:text-[#A6808C] transition-colors ${currentPage === 'pricing' ? 'text-[#A6808C] font-bold underline' : ''}`}
            >
              Pricing
            </button>
            <button 
              onClick={() => setCurrentPage('faq')} 
              className={`hover:text-[#A6808C] transition-colors ${currentPage === 'faq' ? 'text-[#A6808C] font-bold underline' : ''}`}
            >
              FAQ
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-[#CCB7AE] border-2 border-[#565264] text-[#565264] shadow-[2px_2px_0px_#565264] hover:bg-[#A6808C] hover:text-white transition-colors"
              title="Toggle Theme Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* CTA Button */}
            <button
              onClick={() => setCurrentPage('sandbox')}
              className="boho-btn px-4 py-2 text-sm font-hand font-bold flex items-center gap-2"
            >
              <Cat className="w-4 h-4" />
              <span>Get Pluto App</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#CCB7AE] border-2 border-[#565264] text-[#565264]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 px-6 py-4 border-t-2 border-[#565264] bg-[#CCB7AE] flex flex-col gap-3 font-hand text-xl text-[#565264]">
            <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="text-left py-1">Home</button>
            <button onClick={() => { setCurrentPage('features'); setMobileMenuOpen(false); }} className="text-left py-1">Features</button>
            <button onClick={() => { setCurrentPage('sandbox'); setMobileMenuOpen(false); }} className="text-left py-1">Live Sandbox</button>
            <button onClick={() => { setCurrentPage('pricing'); setMobileMenuOpen(false); }} className="text-left py-1">Pricing</button>
            <button onClick={() => { setCurrentPage('faq'); setMobileMenuOpen(false); }} className="text-left py-1">FAQ</button>
          </div>
        )}
      </header>

      {/* MAIN MULTI-PAGE CONTENT ROUTER */}
      <main className="max-w-[1120px] mx-auto w-full px-6 py-10">

        {/* PAGE 1: HOME (LANDING HERO + STATS + TEASER) */}
        {currentPage === 'home' && (
          <div className="space-y-20">
            
            {/* HERO SECTION WITH COZY BACKGROUND */}
            <section className="relative min-h-[520px] rounded-3xl border-2.5 border-[#565264] shadow-[6px_8px_0px_#565264] overflow-hidden flex flex-col justify-between p-8 sm:p-12 text-center bg-[url('/assets/hero_cozy_room.jpg')] bg-cover bg-center">
              <div className="absolute inset-0 bg-[#565264]/40 backdrop-blur-xs" />
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#CCB7AE] text-[#565264] font-hand text-xl font-bold border-2 border-[#565264] shadow-[3px_3px_0px_#565264]">
                  ✨ Boho Desktop Companion for macOS
                </span>
                
                <h1 className="font-boho text-5xl sm:text-7xl font-bold text-[#F5EFEB] drop-shadow-md leading-tight">
                  Pluto — Your Desk Pet
                </h1>

                <p className="font-hand text-2xl text-[#F5EFEB] leading-relaxed max-w-xl mx-auto drop-shadow-sm">
                  A living, interactive pixel-art cat that sits on your Mac Dock. She chases your cursor, sleeps when idle, slams paws to keyboard speed, and stretches like mochi!
                </p>
              </div>

              {/* Interactive Mascot Teaser on Desk */}
              <div className="relative z-10 my-6 flex flex-col items-center justify-center">
                <div className="bg-[#F5EFEB] border-2 border-[#565264] shadow-[4px_4px_0px_#565264] px-4 py-2 rounded-2xl font-hand text-2xl text-[#565264] mb-3 inline-block">
                  {speechBubble}
                </div>

                <img 
                  onClick={handlePet}
                  src="/assets/pepperino.png" 
                  alt="Pluto" 
                  className="w-28 h-28 rendering-pixelated cursor-pointer transform hover:scale-110 transition-transform drop-shadow-2xl" 
                />
              </div>

              {/* Hero Action Buttons */}
              <div className="relative z-10 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setCurrentPage('sandbox')}
                  className="boho-btn px-6 py-3.5 text-xl font-hand font-bold flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Launch Live Sandbox</span>
                </button>
                <button
                  onClick={() => setCurrentPage('features')}
                  className="px-6 py-3.5 bg-[#CCB7AE] border-2 border-[#565264] shadow-[3px_3px_0px_#565264] hover:bg-[#D6CFCB] text-[#565264] font-hand text-xl font-bold rounded-full transition-all"
                >
                  Explore Mechanics ↓
                </button>
              </div>
            </section>

            {/* ANIMATED STATISTICS COUNTER SECTION */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="boho-card p-6">
                <div className="font-boho text-5xl font-bold text-[#A6808C]">{statCounts.deskpets.toLocaleString()}+</div>
                <div className="font-hand text-xl text-[#565264] mt-1">Active Deskpets</div>
              </div>

              <div className="boho-card p-6">
                <div className="font-boho text-5xl font-bold text-[#A6808C]">{statCounts.cpu}%</div>
                <div className="font-hand text-xl text-[#565264] mt-1">CPU Footprint</div>
              </div>

              <div className="boho-card p-6">
                <div className="font-boho text-5xl font-bold text-[#A6808C]">~{statCounts.ram}MB</div>
                <div className="font-hand text-xl text-[#565264] mt-1">RAM Memory</div>
              </div>

              <div className="boho-card p-6">
                <div className="font-boho text-5xl font-bold text-[#A6808C]">{statCounts.cozy}%</div>
                <div className="font-hand text-xl text-[#565264] mt-1">Cozy Rating</div>
              </div>
            </section>

            {/* FEATURE HIGHLIGHT CARDS GRID */}
            <section className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="font-boho text-4xl sm:text-5xl font-bold text-[#A6808C]">4 Cozy Mechanics</h2>
                <p className="font-hand text-2xl text-[#706677]">Engineered for zero desktop interference and maximum delight</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="boho-card p-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#A6808C] text-white flex items-center justify-center">
                    <MousePointer className="w-6 h-6" />
                  </div>
                  <h3 className="font-boho text-3xl font-bold text-[#565264]">1. Cursor Pursuit & Stride</h3>
                  <p className="font-hand text-xl text-[#706677] leading-relaxed">
                    When your mouse moves further than 45px away, Pluto runs towards it with smooth stride math and dynamic sine-wave bounce <code className="text-xs bg-[#D6CFCB] px-2 py-0.5 rounded border">Math.sin(Date.now() * 0.018) * 3</code>.
                  </p>
                </div>

                <div className="boho-card p-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#A6808C] text-white flex items-center justify-center">
                    <Bed className="w-6 h-6" />
                  </div>
                  <h3 className="font-boho text-3xl font-bold text-[#565264]">2. Dock Sleeping & Click-to-Wake</h3>
                  <p className="font-hand text-xl text-[#706677] leading-relaxed">
                    Move your cursor down near the screen Dock (<code className="text-xs bg-[#D6CFCB] px-2 py-0.5 rounded border">mouseY ≥ window.innerHeight - 80</code>), and Pluto settles down, emits drifting blue Zzz particles, and rests peacefully.
                  </p>
                </div>

                <div className="boho-card p-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#A6808C] text-white flex items-center justify-center">
                    <Keyboard className="w-6 h-6" />
                  </div>
                  <h3 className="font-boho text-3xl font-bold text-[#565264]">3. Keyboard Typing & Bongo WebM</h3>
                  <p className="font-hand text-xl text-[#706677] leading-relaxed">
                    On keydown events, Pluto switches to her typing animation, scaled 1.38x to match resting poses 1-to-1 with hardware key identifier filtering (<code className="text-xs bg-[#D6CFCB] px-2 py-0.5 rounded border">kVK_ANSI_</code>).
                  </p>
                </div>

                <div className="boho-card p-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#A6808C] text-white flex items-center justify-center">
                    <Smile className="w-6 h-6" />
                  </div>
                  <h3 className="font-boho text-3xl font-bold text-[#565264]">4. Mochi Drag & Mood Petting</h3>
                  <p className="font-hand text-xl text-[#706677] leading-relaxed">
                    Click-and-drag vertically to stretch Pluto like soft mochi (<code className="text-xs bg-[#D6CFCB] px-2 py-0.5 rounded border">scaleY = 1 + min(dragY / 100, 0.7)</code>). Releasing mouse instantly snaps proportions back to 1-to-1!
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PAGE 2: DETAILED FEATURES PAGE */}
        {currentPage === 'features' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h1 className="font-boho text-5xl font-bold text-[#A6808C]">Architecture & Mechanics</h1>
              <p className="font-hand text-2xl text-[#706677]">Deep dive into Pluto's hardware-level key filtering and transparent window physics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="boho-card p-6 space-y-3">
                <Cpu className="w-8 h-8 text-[#A6808C]" />
                <h3 className="font-boho text-2xl font-bold text-[#565264]">0.1% CPU Optimization</h3>
                <p className="font-hand text-lg text-[#706677]">Single HTML5 Canvas loop with zero DOM redraw overhead or procedural shape layers.</p>
              </div>

              <div className="boho-card p-6 space-y-3">
                <HardDrive className="w-8 h-8 text-[#A6808C]" />
                <h3 className="font-boho text-2xl font-bold text-[#565264]">~15MB Memory Footprint</h3>
                <p className="font-hand text-lg text-[#706677]">Ultra lightweight Electron runtime built exclusively for macOS Silicon & Intel architectures.</p>
              </div>

              <div className="boho-card p-6 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#8A9A65]" />
                <h3 className="font-boho text-2xl font-bold text-[#565264]">100% Offline & Private</h3>
                <p className="font-hand text-lg text-[#706677]">Zero network requests, zero telemetry, zero analytics tracking. Complete desktop privacy.</p>
              </div>
            </div>

            <div className="boho-card p-8 space-y-6">
              <h2 className="font-boho text-4xl font-bold text-[#565264]">Sprite Asset Showcase</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#565264] flex flex-col items-center">
                  <img src="/assets/pepperino.png" alt="Resting" className="w-16 h-16 rendering-pixelated mb-2" />
                  <span className="font-hand text-lg font-bold">pepperino.png</span>
                </div>
                <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#565264] flex flex-col items-center">
                  <img src="/assets/sleep.png" alt="Sleep" className="w-16 h-16 rendering-pixelated mb-2" />
                  <span className="font-hand text-lg font-bold">sleep.png</span>
                </div>
                <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#565264] flex flex-col items-center">
                  <img src="/assets/tyoe_left.png" alt="Bongo Left" className="w-16 h-16 rendering-pixelated mb-2" />
                  <span className="font-hand text-lg font-bold">tyoe_left.png</span>
                </div>
                <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#565264] flex flex-col items-center">
                  <img src="/assets/bongo_cat_frames/tyoe_frame_2.png" alt="Frame" className="w-16 h-16 rendering-pixelated mb-2" />
                  <span className="font-hand text-lg font-bold">12-Frame Sequence</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 3: INTERACTIVE LIVE SANDBOX */}
        {currentPage === 'sandbox' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="font-boho text-5xl font-bold text-[#A6808C]">Interactive Playground</h1>
              <p className="font-hand text-2xl text-[#706677]">Test Pluto live! Type, pet, feed fish treats, or drag vertically to stretch Pluto like Mochi!</p>
            </div>

            <div className="boho-card p-6 sm:p-8 space-y-6">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#565264]">
                <div className="font-hand text-2xl font-bold text-[#565264] flex items-center gap-2">
                  <span>⚡ Typing Speed:</span>
                  <span className="px-3 py-1 rounded-full bg-[#A6808C] text-white font-mono text-sm">{kps} KPS</span>
                </div>

                <div className="font-hand text-xl text-[#706677]">
                  Last Key Pressed: <span className="font-mono font-bold text-[#A6808C]">[{lastKeyTyped}]</span>
                </div>
              </div>

              {/* Typing Input */}
              <div>
                <input
                  type="text"
                  value={testInputText}
                  onChange={(e) => setTestInputText(e.target.value)}
                  placeholder="Type anything here to make Pluto slam paws on her bongo drums..."
                  className="w-full bg-[#F5EFEB] border-2 border-[#565264] rounded-2xl px-5 py-4 font-hand text-2xl text-[#565264] placeholder-[#565264]/50 focus:outline-none shadow-inner"
                />
              </div>

              {/* Canvas Stage Box with Mochi Drag support */}
              <div 
                onMouseDown={handleMouseDownStage}
                onMouseMove={handleMouseMoveStage}
                onMouseUp={handleMouseUpStage}
                onClick={handlePet}
                className="relative bg-[#F5EFEB] border-2 border-[#565264] h-72 rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden shadow-inner select-none"
              >
                {/* Speech Bubble */}
                <div className="absolute top-6 bg-[#CCB7AE] border-2 border-[#565264] shadow-[3px_3px_0px_#565264] px-4 py-2 rounded-2xl font-hand text-2xl text-[#565264] z-20">
                  {speechBubble}
                </div>

                <canvas ref={canvasRef} width={640} height={210} className="w-full h-full rendering-pixelated" />

                <div className="absolute bottom-4 right-4 bg-[#CCB7AE] border border-[#565264] px-3 py-1 rounded-full font-hand text-sm text-[#565264]">
                  ↕️ Drag vertically to stretch Mochi!
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap gap-3 font-hand text-xl">
                <button 
                  onClick={() => { setActiveTab('walk'); setSpeechBubble("Pluto is walking... 🐾"); }}
                  className={`px-4 py-2 rounded-full border-2 border-[#565264] shadow-[2px_2px_0px_#565264] transition-all ${activeTab === 'walk' ? 'bg-[#A6808C] text-white' : 'bg-[#CCB7AE] text-[#565264]'}`}
                >
                  🐾 Walk Mode
                </button>
                <button 
                  onClick={() => { setActiveTab('sleep'); setSpeechBubble("Shhh... Pluto is sleeping! Zzz... 💤"); }}
                  className={`px-4 py-2 rounded-full border-2 border-[#565264] shadow-[2px_2px_0px_#565264] transition-all ${activeTab === 'sleep' ? 'bg-[#A6808C] text-white' : 'bg-[#CCB7AE] text-[#565264]'}`}
                >
                  💤 Dock Sleep
                </button>
                <button 
                  onClick={() => { setActiveTab('bongo'); setSpeechBubble("Bongo paw typing mode! 🥁"); }}
                  className={`px-4 py-2 rounded-full border-2 border-[#565264] shadow-[2px_2px_0px_#565264] transition-all ${activeTab === 'bongo' ? 'bg-[#A6808C] text-white' : 'bg-[#CCB7AE] text-[#565264]'}`}
                >
                  🥁 Bongo Drums
                </button>
                <button 
                  onClick={handlePet}
                  className="px-4 py-2 rounded-full bg-[#CCB7AE] border-2 border-[#565264] text-[#565264] shadow-[2px_2px_0px_#565264] flex items-center gap-1"
                >
                  ❤️ Pet Pluto
                </button>
                <button 
                  onClick={handleFeed}
                  className="px-4 py-2 rounded-full bg-[#8A9A65] text-white border-2 border-[#565264] shadow-[2px_2px_0px_#565264] flex items-center gap-1"
                >
                  🐟 Feed Fish ({treatsCount})
                </button>
              </div>

              {/* Status Metrics */}
              <div className="pt-4 border-t-2 border-[#565264] flex flex-wrap items-center justify-between font-hand text-2xl text-[#565264] gap-4">
                <div className="flex items-center gap-3">
                  <span>Happiness:</span>
                  <div className="w-36 h-4 bg-[#F5EFEB] border-2 border-[#565264] rounded-full overflow-hidden">
                    <div className="h-full bg-[#A6808C] transition-all duration-300" style={{ width: `${happiness}%` }} />
                  </div>
                  <span className="font-bold">{happiness}%</span>
                </div>
                <div>Keystrokes Typed: <span className="text-[#A6808C] font-bold">{keystrokesCount}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 4: PRICING TIERS */}
        {currentPage === 'pricing' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h1 className="font-boho text-5xl font-bold text-[#A6808C]">Simple, Fair Pricing</h1>
              <p className="font-hand text-2xl text-[#706677]">Choose your Pluto companion package. 100% open-source & royalty free.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Kitten */}
              <div className="boho-card p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-hand text-2xl font-bold text-[#706677]">Free Kitten</div>
                  <div className="font-boho text-5xl font-bold text-[#565264]">$0 <span className="font-hand text-lg text-[#706677]">forever</span></div>
                  <p className="font-hand text-lg text-[#706677]">Perfect for trying out Pluto on your Mac desktop.</p>
                  <ul className="space-y-2 font-hand text-lg text-[#565264]">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8A9A65]" /> Standard Resting & Walking</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8A9A65]" /> Cursor Chasing & Pursuit</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8A9A65]" /> Dock Sleeping State</li>
                  </ul>
                </div>
                <button onClick={() => setCurrentPage('sandbox')} className="boho-btn w-full py-3 font-hand text-xl font-bold">Download Free</button>
              </div>

              {/* Pro Pet */}
              <div className="boho-card p-8 space-y-6 flex flex-col justify-between ring-2 ring-[#A6808C] relative">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#A6808C] text-white font-hand text-sm px-4 py-1 rounded-full border border-[#565264]">Most Popular</span>
                <div className="space-y-4">
                  <div className="font-hand text-2xl font-bold text-[#A6808C]">Pro Companion</div>
                  <div className="font-boho text-5xl font-bold text-[#565264]">$9 <span className="font-hand text-lg text-[#706677]">one-time</span></div>
                  <p className="font-hand text-lg text-[#706677]">Full typing animations, sound packs, and Mochi drag physics.</p>
                  <ul className="space-y-2 font-hand text-lg text-[#565264]">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8A9A65]" /> All Free Features</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8A9A65]" /> 12-Frame Bongo Cat Typing</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8A9A65]" /> Mochi Vertical Drag Stretch</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8A9A65]" /> Retro Audio Beep Synthesizer</li>
                  </ul>
                </div>
                <button onClick={() => setCurrentPage('sandbox')} className="boho-btn w-full py-3 font-hand text-xl font-bold">Get Pro Companion</button>
              </div>

              {/* Lifetime Pack */}
              <div className="boho-card p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-hand text-2xl font-bold text-[#706677]">Supporter Pack</div>
                  <div className="font-boho text-5xl font-bold text-[#565264]">$25 <span className="font-hand text-lg text-[#706677]">lifetime</span></div>
                  <p className="font-hand text-lg text-[#706677]">For creators who want to support open-source development.</p>
                  <ul className="space-y-2 font-hand text-lg text-[#565264]">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8A9A65]" /> All Pro Features</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8A9A65]" /> Custom Sprite Pack Importer</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#8A9A65]" /> Priority Discord Support</li>
                  </ul>
                </div>
                <button onClick={() => setCurrentPage('sandbox')} className="boho-btn w-full py-3 font-hand text-xl font-bold">Support Pluto</button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 5: TESTIMONIALS & FAQ */}
        {currentPage === 'faq' && (
          <div className="space-y-16">
            
            {/* TESTIMONIAL SLIDER / CAROUSEL */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h1 className="font-boho text-5xl font-bold text-[#A6808C]">Loved by Developers</h1>
                <p className="font-hand text-2xl text-[#706677]">See what creators say about Pluto sitting on their Mac screens</p>
              </div>

              <div className="boho-card p-8 max-w-3xl mx-auto space-y-6 relative">
                <div className="flex items-center gap-4">
                  <img 
                    src={TESTIMONIALS[testimonialIdx].avatar} 
                    alt={TESTIMONIALS[testimonialIdx].name} 
                    className="w-16 h-16 rounded-full border-2 border-[#565264] object-cover" 
                  />
                  <div>
                    <h3 className="font-boho text-2xl font-bold text-[#565264]">{TESTIMONIALS[testimonialIdx].name}</h3>
                    <p className="font-hand text-lg text-[#706677]">{TESTIMONIALS[testimonialIdx].role}</p>
                  </div>
                </div>

                <p className="font-hand text-2xl text-[#565264] italic leading-relaxed">
                  "{TESTIMONIALS[testimonialIdx].quote}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t-2 border-[#565264]">
                  <div className="flex gap-1 text-[#E5B25D]">
                    {Array.from({ length: TESTIMONIALS[testimonialIdx].rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTestimonialIdx((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))}
                      className="p-2 rounded-full bg-[#CCB7AE] border border-[#565264] text-[#565264] hover:bg-[#A6808C] hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setTestimonialIdx((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))}
                      className="p-2 rounded-full bg-[#CCB7AE] border border-[#565264] text-[#565264] hover:bg-[#A6808C] hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ ACCORDION SECTION */}
            <section className="space-y-6 max-w-3xl mx-auto">
              <div className="text-center space-y-2">
                <h2 className="font-boho text-4xl font-bold text-[#A6808C]">Frequently Asked Questions</h2>
                <p className="font-hand text-2xl text-[#706677]">Everything you need to know about Pluto</p>
              </div>

              <div className="space-y-4">
                {FAQS.map((faq, i) => (
                  <div key={i} className="boho-card overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                      className="w-full p-6 text-left font-hand text-2xl font-bold text-[#565264] flex items-center justify-between gap-4"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-6 h-6 text-[#A6808C] transition-transform ${openFaqIdx === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaqIdx === i && (
                      <div className="px-6 pb-6 font-hand text-xl text-[#706677] border-t border-[#565264]/20 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* NEWSLETTER SUBSCRIPTION FORM */}
        <section className="mt-20 boho-card p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
          <h2 className="font-boho text-4xl font-bold text-[#565264]">Stay Updated with Pluto</h2>
          <p className="font-hand text-2xl text-[#706677]">Get notified when new Pluto sprite packs, custom sounds, and macOS updates drop!</p>
          
          {subscribed ? (
            <div className="p-4 rounded-2xl bg-[#8A9A65] text-white font-hand text-2xl flex items-center justify-center gap-2">
              <Check className="w-6 h-6" /> You're subscribed! Welcome to the Pluto family!
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 bg-[#F5EFEB] border-2 border-[#565264] rounded-full px-5 py-3 font-hand text-xl text-[#565264] placeholder-[#565264]/50 focus:outline-none"
                required
              />
              <button type="submit" className="boho-btn px-6 py-3 font-hand text-xl font-bold flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Subscribe
              </button>
            </form>
          )}
        </section>

      </main>

      {/* STICKY CALL-TO-ACTION BUTTON */}
      {stickyCtaVisible && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setCurrentPage('sandbox')}
            className="boho-btn px-5 py-3 text-lg font-hand font-bold shadow-[4px_4px_0px_#565264] flex items-center gap-2 animate-bounce"
          >
            <Cat className="w-5 h-5" />
            <span>Launch Pluto</span>
          </button>
        </div>
      )}

      {/* MINIMAL FOOTER WITH SOCIAL LINKS */}
      <footer className={`border-t-2 ${darkMode ? 'bg-[#1C1822] border-[#A6808C] text-[#EAE3EA]' : 'bg-[#CCB7AE] border-[#565264] text-[#565264]'} py-8 font-hand text-xl transition-colors`}>
        <div className="max-w-[1120px] mx-auto w-full px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img src="/assets/pepperino.png" alt="Pluto" className="w-6 h-6 rendering-pixelated" />
            <span>© {new Date().getFullYear()} Pluto — Your Desk Pet. MIT Open Source License.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://github.com/diablovocado/Pixel-Pet" target="_blank" rel="noopener noreferrer" className="hover:text-[#A6808C] transition-colors">GitHub Repo</a>
            <a href="https://diablovocado.github.io/Pixel-Pet/" target="_blank" rel="noopener noreferrer" className="hover:text-[#A6808C] transition-colors">Live Web Demo</a>
            <span className="text-[#A6808C]">Crafted with 💕 for cozy desktops</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
