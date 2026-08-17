import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Terminal,
  Cpu,
  HardDrive,
  ShieldCheck,
  MousePointer,
  Keyboard,
  Bed,
  Smile,
  Zap,
  Download,
  Github,
  Twitter,
  Disc as Discord,
  Check,
  ChevronDown,
  ArrowUp,
  Menu,
  X,
  Send,
  Code2,
  Sparkles,
  Play,
  RotateCcw,
  Activity,
  Layers,
  Heart,
  Cat
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

// FAQ Accordion Data
const FAQS = [
  {
    q: "01. How does Pluto track cursor pursuit and running stride?",
    a: "When your mouse moves further than 45px away, Pluto enters pursuit state with smooth stride math and directional face flipping (scaleX * faceDir). Dynamic sine-wave stride bounce is computed via Math.sin(Date.now() * 0.018) * 3."
  },
  {
    q: "02. How does Dock Sleeping and Click-to-Wake work?",
    a: "Moving your cursor down near the bottom screen Dock (mouseY >= window.innerHeight - 80) triggers Dock Sleeping mode. Pluto emits drifting blue Zzz particles. Hovering over her sleeping body and clicking restores normal IDLE state."
  },
  {
    q: "03. How is hardware-level keystroke guarding implemented?",
    a: "Pluto utilizes native macOS kVK_ANSI_ hardware key identifier filtering in Electron to strictly distinguish keyboard typing from trackpad/mouse clicks, instantly triggering 1.38x scaled Bongo Cat WebM typing animations."
  },
  {
    q: "04. What is the Mochi Vertical Drag transformation formula?",
    a: "Click-and-drag vertically stretches Pluto like soft mochi using scaleY = 1 + Math.min(dragDistanceY / 100, 0.7) and scaleX = 1 / scaleY. Releasing the mouse instantly snaps proportions back 1-to-1."
  },
  {
    q: "05. Can I run Pluto on multi-display setups?",
    a: "Yes! Electron transparent overlays support multi-display coordinate mapping, ensuring Pluto follows your cursor seamlessly across external displays."
  }
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Interactive CLI Terminal State
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState<string[]>([
    "System initialized: Pluto Core v1.0.0",
    "Type 'help' or click quick command buttons below..."
  ]);

  // Sandbox & Mascot States
  const [activeTab, setActiveTab] = useState<'walk' | 'sleep' | 'bongo' | 'excited' | 'petting'>('bongo');
  const [happiness, setHappiness] = useState(98);
  const [treatsCount, setTreatsCount] = useState(5);
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

  // FAQ Open State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

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

  // Track scroll position for Back To Top button
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      ctx.strokeStyle = '#748DAE';
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
        ctx.font = '20px "Share Tech Mono", monospace';
        ctx.fillStyle = '#748DAE';
        ctx.fillText('Z z z...', 365, 80 + zOffset);
      } else if (activeTab === 'bongo') {
        const currentFrameImg = imagesRef.current.bongoFrames[bongoFrameIdx];
        const pepImg = imagesRef.current.pepperino;
        if (currentFrameImg && currentFrameImg.complete && currentFrameImg.naturalWidth !== 0) {
          ctx.drawImage(currentFrameImg, 265, 62, 110, 110);
        } else if (imagesRef.current.bongoLeft && imagesRef.current.bongoLeft.complete && imagesRef.current.bongoLeft.naturalWidth !== 0) {
          ctx.drawImage(imagesRef.current.bongoLeft, 265, 62, 110, 110);
        } else if (pepImg && pepImg.complete && pepImg.naturalWidth !== 0) {
          ctx.drawImage(pepImg, 275, 85, 90, 90);
        }

        if (kps > 0) {
          const noteY = Math.sin(Date.now() / 100) * 8;
          ctx.font = '16px sans-serif';
          ctx.fillText('🎵', 240, 65 + noteY);
          ctx.fillText('🎶', 380, 55 - noteY);

          if (lastKeyTyped) {
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = '#748DAE';
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
  }, [activeTab, bongoFrameIdx, kps, lastKeyTyped, stretchScale]);

  // Mochi Vertical Drag Handlers
  const handleMouseDownStage = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
  };

  const handleMouseMoveStage = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dragDistY = Math.max(0, e.clientY - dragStartY);
    const scaleY = 1 + Math.min(dragDistY / 100, 0.7);
    const scaleX = 1 / scaleY;
    setStretchScale({ scaleX, scaleY });
  };

  const handleMouseUpStage = () => {
    if (isDragging) {
      setIsDragging(false);
      setStretchScale({ scaleX: 1, scaleY: 1 });
      const randomGreeting = RANDOM_GREETINGS[Math.floor(Math.random() * RANDOM_GREETINGS.length)];
      setSpeechBubble(randomGreeting);
    }
  };

  const handlePet = () => {
    setActiveTab('petting');
    setHappiness(prev => Math.min(100, prev + 5));
    const randomGreeting = RANDOM_GREETINGS[Math.floor(Math.random() * RANDOM_GREETINGS.length)];
    setSpeechBubble(randomGreeting);
  };

  const handleFeed = () => {
    if (treatsCount > 0) {
      setTreatsCount(prev => prev - 1);
      setHappiness(prev => Math.min(100, prev + 10));
      setActiveTab('excited');
      setSpeechBubble("YUMMY! Fish treat devoured! 🐟✨");

      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#9ECAD6', '#F5CBCB', '#748DAE']
      });

      setTimeout(() => setSpeechBubble("meow~ 💕"), 2500);
    } else {
      setSpeechBubble("Treat box empty! Restock treats! 📦");
    }
  };

  // CLI Command Execution Handler
  const handleCliSubmit = (e?: React.FormEvent, cmdOverride?: string) => {
    if (e) e.preventDefault();
    const command = (cmdOverride || cliInput).trim().toLowerCase();
    if (!command) return;

    let output = '';
    if (command === 'help') {
      output = "Available commands: 'status', 'pet', 'feed', 'bongo', 'sleep', 'clear'";
    } else if (command === 'status') {
      output = `STATUS: ONLINE | CPU: 0.1% | RAM: ~15MB | Happiness: ${happiness}% | KPS: ${kps}`;
    } else if (command === 'pet') {
      handlePet();
      output = "Executed: Petting Pluto! ❤️ Happiness +5%";
    } else if (command === 'feed') {
      handleFeed();
      output = "Executed: Feeding fish treat to Pluto! 🐟 Happiness +10%";
    } else if (command === 'bongo') {
      setActiveTab('bongo');
      output = "Executed: Switched Pluto to Bongo Drums typing state! 🥁";
    } else if (command === 'sleep') {
      setActiveTab('sleep');
      output = "Executed: Pluto is resting near Dock... 💤";
    } else if (command === 'clear') {
      setCliLogs([]);
      setCliInput('');
      return;
    } else {
      output = `Command not recognized: '${command}'. Type 'help' for options.`;
    }

    setCliLogs(prev => [...prev, `$ ${command}`, output]);
    setCliInput('');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
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
    <div className="min-h-screen bg-[#FFEAEA] text-[#2B3A4A] font-mono relative overflow-x-hidden selection:bg-[#9ECAD6] selection:text-[#2B3A4A]">
      
      {/* 1. FIXED TOP NAVIGATION BAR WITH SMOOTH SCROLL ANCHORS */}
      <header className="sticky top-0 z-50 bg-[#FFEAEA]/90 backdrop-blur-md border-b-2 border-[#748DAE] py-3.5">
        <div className="max-w-[1120px] mx-auto w-full px-6 flex items-center justify-between">
          
          {/* Logo Left */}
          <a href="#hero" onClick={scrollToSection('hero')} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-[#9ECAD6] border-2 border-[#2B3A4A] flex items-center justify-center shadow-[2px_2px_0px_#2B3A4A] overflow-hidden">
              <img src="/assets/pepperino.png" alt="Pluto Logo" className="w-7 h-7 rendering-pixelated object-contain" />
            </div>
            <div>
              <div className="font-bold text-xl text-[#748DAE] flex items-center gap-2">
                PLUTO <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5CBCB] text-[#2B3A4A] border border-[#2B3A4A]">v1.0.0</span>
              </div>
              <div className="text-[11px] text-[#2B3A4A]">Your desk pet</div>
            </div>
          </a>

          {/* Smooth Scroll Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-[#2B3A4A]">
            <a href="#hero" onClick={scrollToSection('hero')} className="hover:text-[#748DAE] transition-colors">Home</a>
            <a href="#features" onClick={scrollToSection('features')} className="hover:text-[#748DAE] transition-colors">Mechanics</a>
            <a href="#architecture" onClick={scrollToSection('architecture')} className="hover:text-[#748DAE] transition-colors">Architecture</a>
            <a href="#sandbox" onClick={scrollToSection('sandbox')} className="hover:text-[#748DAE] transition-colors">Live Sandbox</a>
            <a href="#showcase" onClick={scrollToSection('showcase')} className="hover:text-[#748DAE] transition-colors">Sprites</a>
            <a href="#pricing" onClick={scrollToSection('pricing')} className="hover:text-[#748DAE] transition-colors">Packages</a>
            <a href="#faq" onClick={scrollToSection('faq')} className="hover:text-[#748DAE] transition-colors">FAQ</a>
            <a href="#contact" onClick={scrollToSection('contact')} className="hover:text-[#748DAE] transition-colors">Contact</a>
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/diablovocado/Pixel-Pet"
              target="_blank"
              rel="noopener noreferrer"
              className="pastel-btn-blue px-4 py-2 text-xs flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get App (macOS)</span>
            </a>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-[#9ECAD6] border-2 border-[#2B3A4A] text-[#2B3A4A]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 px-6 py-4 border-t-2 border-[#2B3A4A] bg-[#9ECAD6] flex flex-col gap-3 text-sm font-bold text-[#2B3A4A]">
            <a href="#hero" onClick={(e) => { scrollToSection('hero')(e); setMobileMenuOpen(false); }}>Home</a>
            <a href="#features" onClick={(e) => { scrollToSection('features')(e); setMobileMenuOpen(false); }}>Mechanics</a>
            <a href="#architecture" onClick={(e) => { scrollToSection('architecture')(e); setMobileMenuOpen(false); }}>Architecture</a>
            <a href="#sandbox" onClick={(e) => { scrollToSection('sandbox')(e); setMobileMenuOpen(false); }}>Live Sandbox</a>
            <a href="#showcase" onClick={(e) => { scrollToSection('showcase')(e); setMobileMenuOpen(false); }}>Sprites</a>
            <a href="#pricing" onClick={(e) => { scrollToSection('pricing')(e); setMobileMenuOpen(false); }}>Packages</a>
            <a href="#faq" onClick={(e) => { scrollToSection('faq')(e); setMobileMenuOpen(false); }}>FAQ</a>
            <a href="#contact" onClick={(e) => { scrollToSection('contact')(e); setMobileMenuOpen(false); }}>Contact</a>
          </div>
        )}
      </header>

      {/* 2. CONTINUOUS SCROLLING PAGE SECTIONS */}
      <main className="max-w-[1120px] mx-auto w-full px-6 space-y-28 py-12">

        {/* SECTION 1: FULL-SCREEN HERO WITH CENTERED TEXT */}
        <section id="hero" className="min-h-[80vh] flex flex-col justify-center items-center text-center space-y-6 pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#9ECAD6] text-[#2B3A4A] text-sm font-bold border-2 border-[#2B3A4A] shadow-[2px_2px_0px_#2B3A4A]">
            <Sparkles className="w-4 h-4 text-[#748DAE]" />
            <span>✨ Pastel Terminal Desktop Companion for macOS</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold leading-tight text-[#2B3A4A] max-w-3xl tracking-tight">
            Pluto — <span className="text-[#748DAE]">Your desk pet</span>
          </h1>

          <p className="text-[#2B3A4A]/80 text-xl sm:text-2xl leading-relaxed max-w-2xl mx-auto font-sans font-semibold">
            A living, interactive pixel-art cat that sits on your Mac Dock. She chases your cursor, sleeps when idle, slams paws to keyboard speed, and stretches like mochi!
          </p>

          {/* Interactive Bongo Cat Typing Animation Showcase Stage */}
          <div className="w-full max-w-xl my-6 bg-[#FFFFFF] border-2 border-[#2B3A4A] shadow-[6px_6px_0px_#2B3A4A] rounded-2xl p-6 relative flex flex-col items-center space-y-4">
            
            {/* Floating Speech Bubble */}
            <div className="bg-[#F5CBCB] border-2 border-[#2B3A4A] shadow-[2px_2px_0px_#2B3A4A] px-4 py-2 rounded-xl text-base font-bold text-[#2B3A4A] transition-all">
              {speechBubble}
            </div>

            {/* Central Mascot Cat Sprite Image (Guaranteed 100% Instant Load) */}
            <div className="relative group cursor-pointer" onClick={handlePet}>
              <div className="w-24 h-4 bg-[#2B3A4A]/20 rounded-full blur-xs absolute -bottom-1 left-1/2 transform -translate-x-1/2" />
              <img 
                src={activeTab === 'sleep' ? '/assets/sleep.png' : activeTab === 'bongo' ? BONGO_FRAMES[bongoFrameIdx] : '/assets/pepperino.png'} 
                alt="Pluto Cat Mascot" 
                className="w-28 h-28 rendering-pixelated object-contain relative z-10 transform group-hover:scale-110 transition-transform duration-200" 
              />
            </div>

            {/* Interactive Bongo Typing Canvas */}
            <div 
              onMouseDown={handleMouseDownStage}
              onMouseMove={handleMouseMoveStage}
              onMouseUp={handleMouseUpStage}
              onClick={handlePet}
              className="w-full h-44 bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative shadow-inner"
            >
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full rendering-pixelated" />

              <div className="absolute top-3 right-3 bg-[#9ECAD6] border border-[#2B3A4A] px-3 py-1 rounded-full text-xs font-bold text-[#2B3A4A]">
                ⚡ {kps > 0 ? `${kps} KPS Typing!` : 'Press keys to type!'}
              </div>
            </div>

            {/* Real-time typing hint */}
            <div className="w-full flex items-center justify-between text-xs font-bold text-[#748DAE] pt-2 border-t border-[#748DAE]/20">
              <span>🥁 Real-time Hardware Key Event Guard</span>
              <span className="text-[#2B3A4A]">Key: [{lastKeyTyped}]</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <a
              href="#sandbox"
              onClick={scrollToSection('sandbox')}
              className="pastel-btn-blue px-7 py-3.5 text-lg font-bold flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Launch Live Sandbox</span>
            </a>
            <a
              href="#features"
              onClick={scrollToSection('features')}
              className="pastel-btn-pink px-7 py-3.5 text-lg font-bold flex items-center gap-2"
            >
              <span>Explore 4 Mechanics ↓</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-8 border-t-2 border-[#748DAE]/30 flex flex-wrap justify-center gap-8 text-sm font-bold text-[#748DAE]">
            <div>⚡ 0.1% CPU Redraw</div>
            <div>💾 ~15MB Memory Footprint</div>
            <div>🔒 100% Offline & Private</div>
          </div>
        </section>

        {/* SECTION 2: 4 CORE TECHNICAL MECHANICS */}
        <section id="features" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#748DAE]">4 Core Technical Mechanics</h2>
            <p className="text-[#2B3A4A]/70 text-lg font-sans">Low-level execution specifications engineered for zero desktop interference</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="pastel-card p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#9ECAD6] border-2 border-[#2B3A4A] flex items-center justify-center text-[#2B3A4A]">
                <MousePointer className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[#2B3A4A]">1. Cursor Pursuit & Running Stride</h3>
              <p className="text-base text-[#2B3A4A]/80 font-sans leading-relaxed">
                When cursor distance exceeds 45px, Pluto runs towards target coordinates with directional face flipping (<code className="text-[#748DAE] font-mono">scaleX * faceDir</code>) and sine wave stride bounce (<code className="text-[#748DAE] font-mono">Math.sin(Date.now() * 0.018) * 3</code>).
              </p>
            </div>

            <div className="pastel-card p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F5CBCB] border-2 border-[#2B3A4A] flex items-center justify-center text-[#2B3A4A]">
                <Bed className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[#2B3A4A]">2. Dock Sleeping & Click-to-Wake</h3>
              <p className="text-base text-[#2B3A4A]/80 font-sans leading-relaxed">
                Moving cursor down near the Dock (<code className="text-[#748DAE] font-mono">mouseY ≥ window.innerHeight - 80</code>) triggers Dock Sleeping state with drifting blue Zzz particles. Hovering over Pluto and clicking restores normal IDLE state.
              </p>
            </div>

            <div className="pastel-card p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#9ECAD6] border-2 border-[#2B3A4A] flex items-center justify-center text-[#2B3A4A]">
                <Keyboard className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[#2B3A4A]">3. Keyboard Typing & Bongo WebM</h3>
              <p className="text-base text-[#2B3A4A]/80 font-sans leading-relaxed">
                Keydown events switch Pluto to her 12-frame typing animation, seamlessly scaled 1.38x using hardware key identifier filtering (<code className="text-[#748DAE] font-mono">kVK_ANSI_</code>) to prevent trackpad click confusion.
              </p>
            </div>

            <div className="pastel-card p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F5CBCB] border-2 border-[#2B3A4A] flex items-center justify-center text-[#2B3A4A]">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[#2B3A4A]">4. Mochi Drag & Mood Petting</h3>
              <p className="text-base text-[#2B3A4A]/80 font-sans leading-relaxed">
                Click-and-drag vertically stretches Pluto like soft mochi (<code className="text-[#748DAE] font-mono">scaleY = 1 + min(dragY / 100, 0.7)</code>). Mouseup instantly snaps proportions back 1-to-1 with heart particle bursts!
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: SYSTEM ARCHITECTURE */}
        <section id="architecture" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#748DAE]">System Architecture</h2>
            <p className="text-[#2B3A4A]/70 text-lg font-sans">Under the hood of Pluto's Electron overlay process</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="pastel-card p-6 space-y-3">
              <Cpu className="w-8 h-8 text-[#748DAE]" />
              <h3 className="text-xl font-bold">0.1% CPU Redraw</h3>
              <p className="text-sm text-[#2B3A4A]/80 font-sans">Single HTML5 Canvas loop with zero DOM redrawing or procedural overlay math.</p>
            </div>
            <div className="pastel-card p-6 space-y-3">
              <HardDrive className="w-8 h-8 text-[#748DAE]" />
              <h3 className="text-xl font-bold">15MB Memory Footprint</h3>
              <p className="text-sm text-[#2B3A4A]/80 font-sans">Ultra lightweight memory allocation optimized for Apple Silicon M1/M2/M3 and Intel chips.</p>
            </div>
            <div className="pastel-card p-6 space-y-3">
              <ShieldCheck className="w-8 h-8 text-[#748DAE]" />
              <h3 className="text-xl font-bold">100% Offline & Secure</h3>
              <p className="text-sm text-[#2B3A4A]/80 font-sans">Zero analytics, zero telemetry data, zero background web sockets.</p>
            </div>
          </div>
        </section>

        {/* SECTION 4: INTERACTIVE LIVE SANDBOX & MOCHI DRAG */}
        <section id="sandbox" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#748DAE]">Interactive Sandbox & Playground</h2>
            <p className="text-[#2B3A4A]/70 text-lg font-sans">Test Pluto live! Type, pet, feed fish treats, or drag vertically to stretch Pluto like Mochi!</p>
          </div>

          <div className="pastel-card p-6 sm:p-8 space-y-6">
            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#748DAE]">
              <div className="text-xl font-bold text-[#2B3A4A] flex items-center gap-2">
                <span>⚡ Typing Speed:</span>
                <span className="px-3 py-1 rounded-full bg-[#9ECAD6] text-[#2B3A4A] font-mono text-sm border border-[#2B3A4A]">{kps} KPS</span>
              </div>

              <div className="text-sm font-bold text-[#748DAE]">
                Last Key Pressed: <span className="font-mono font-bold text-[#2B3A4A]">[{lastKeyTyped}]</span>
              </div>
            </div>

            {/* Typing Input */}
            <div>
              <input
                type="text"
                value={testInputText}
                onChange={(e) => setTestInputText(e.target.value)}
                placeholder="Type anything here to make Pluto slam paws on her bongo drums..."
                className="w-full bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-2xl px-5 py-4 text-xl text-[#2B3A4A] placeholder-[#2B3A4A]/50 focus:outline-none shadow-inner"
              />
            </div>

            {/* Canvas Stage Box with Mochi Drag support */}
            <div 
              onMouseDown={handleMouseDownStage}
              onMouseMove={handleMouseMoveStage}
              onMouseUp={handleMouseUpStage}
              onClick={handlePet}
              className="relative bg-[#FFEAEA] border-2 border-[#2B3A4A] h-72 rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden shadow-inner select-none"
            >
              {/* Speech Bubble */}
              <div className="absolute top-6 bg-[#F5CBCB] border-2 border-[#2B3A4A] shadow-[3px_3px_0px_#2B3A4A] px-4 py-2 rounded-2xl text-xl font-bold text-[#2B3A4A] z-20">
                {speechBubble}
              </div>

              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full rendering-pixelated" />

              <div className="absolute bottom-4 right-4 bg-[#9ECAD6] border border-[#2B3A4A] px-3 py-1 rounded-full text-xs font-bold text-[#2B3A4A]">
                ↕️ Drag vertically to stretch Mochi!
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap gap-3 font-bold text-sm">
              <button 
                onClick={() => { setActiveTab('walk'); setSpeechBubble("Pluto is walking... 🐾"); }}
                className={`px-4 py-2 rounded-full border-2 border-[#2B3A4A] shadow-[2px_2px_0px_#2B3A4A] transition-all ${activeTab === 'walk' ? 'bg-[#9ECAD6] text-[#2B3A4A]' : 'bg-[#FFEAEA] text-[#2B3A4A]'}`}
              >
                🐾 Walk Mode
              </button>
              <button 
                onClick={() => { setActiveTab('sleep'); setSpeechBubble("Shhh... Pluto is sleeping! Zzz... 💤"); }}
                className={`px-4 py-2 rounded-full border-2 border-[#2B3A4A] shadow-[2px_2px_0px_#2B3A4A] transition-all ${activeTab === 'sleep' ? 'bg-[#9ECAD6] text-[#2B3A4A]' : 'bg-[#FFEAEA] text-[#2B3A4A]'}`}
              >
                💤 Dock Sleep
              </button>
              <button 
                onClick={() => { setActiveTab('bongo'); setSpeechBubble("Bongo paw typing mode! 🥁"); }}
                className={`px-4 py-2 rounded-full border-2 border-[#2B3A4A] shadow-[2px_2px_0px_#2B3A4A] transition-all ${activeTab === 'bongo' ? 'bg-[#9ECAD6] text-[#2B3A4A]' : 'bg-[#FFEAEA] text-[#2B3A4A]'}`}
              >
                🥁 Bongo Drums
              </button>
              <button 
                onClick={handlePet}
                className="px-4 py-2 rounded-full bg-[#F5CBCB] border-2 border-[#2B3A4A] text-[#2B3A4A] shadow-[2px_2px_0px_#2B3A4A] flex items-center gap-1"
              >
                ❤️ Pet Pluto
              </button>
              <button 
                onClick={handleFeed}
                className="px-4 py-2 rounded-full bg-[#9ECAD6] text-[#2B3A4A] border-2 border-[#2B3A4A] shadow-[2px_2px_0px_#2B3A4A] flex items-center gap-1"
              >
                🐟 Feed Fish ({treatsCount})
              </button>
            </div>

            {/* Status Metrics */}
            <div className="pt-4 border-t-2 border-[#748DAE] flex flex-wrap items-center justify-between text-xl font-bold text-[#2B3A4A] gap-4">
              <div className="flex items-center gap-3">
                <span>Happiness:</span>
                <div className="w-36 h-4 bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#748DAE] transition-all duration-300" style={{ width: `${happiness}%` }} />
                </div>
                <span>{happiness}%</span>
              </div>
              <div>Keystrokes Typed: <span className="text-[#748DAE]">{keystrokesCount}</span></div>
            </div>
          </div>
        </section>

        {/* SECTION 5: TRANSPARENT SPRITE ASSETS */}
        <section id="showcase" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#748DAE]">Sprite Asset Library</h2>
            <p className="text-[#2B3A4A]/70 text-lg font-sans">Transparent PNG pixel art assets driving Pluto's animations</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="pastel-card p-6 text-center space-y-3">
              <div className="w-20 h-20 mx-auto bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-xl flex items-center justify-center">
                <img src="/assets/pepperino.png" alt="Resting" className="w-14 h-14 rendering-pixelated object-contain" />
              </div>
              <div className="text-sm font-bold text-[#2B3A4A]">pepperino.png</div>
              <div className="text-xs text-[#2B3A4A]/70 font-sans">Standard resting & walking sprite.</div>
            </div>

            <div className="pastel-card p-6 text-center space-y-3">
              <div className="w-20 h-20 mx-auto bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-xl flex items-center justify-center">
                <img src="/assets/sleep.png" alt="Sleep" className="w-14 h-14 rendering-pixelated object-contain" />
              </div>
              <div className="text-sm font-bold text-[#2B3A4A]">sleep.png</div>
              <div className="text-xs text-[#2B3A4A]/70 font-sans">Dock sleeping pose sprite.</div>
            </div>

            <div className="pastel-card p-6 text-center space-y-3">
              <div className="w-20 h-20 mx-auto bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-xl flex items-center justify-center gap-1">
                <img src="/assets/tyoe_left.png" alt="Left" className="w-8 h-8 rendering-pixelated object-contain" />
                <img src="/assets/tyoe_right.png" alt="Right" className="w-8 h-8 rendering-pixelated object-contain" />
              </div>
              <div className="text-sm font-bold text-[#2B3A4A]">tyoe_left/right.png</div>
              <div className="text-xs text-[#2B3A4A]/70 font-sans">Bongo cat typing paws.</div>
            </div>

            <div className="pastel-card p-6 text-center space-y-3">
              <div className="w-20 h-20 mx-auto bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-xl flex items-center justify-center">
                <img src="/assets/bongo_cat_frames/tyoe_frame_2.png" alt="Sequence" className="w-12 h-12 rendering-pixelated object-contain" />
              </div>
              <div className="text-sm font-bold text-[#2B3A4A]">12-Frame Sequence</div>
              <div className="text-xs text-[#2B3A4A]/70 font-sans">Full WebM keyboard animation.</div>
            </div>
          </div>
        </section>

        {/* SECTION 6: PRICING PACKAGES */}
        <section id="pricing" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#748DAE]">Open Source Packages</h2>
            <p className="text-[#2B3A4A]/70 text-lg font-sans">Choose your Pluto desktop package. 100% free under MIT license.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="pastel-card p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xl font-bold text-[#748DAE]">Free Kitten</div>
                <div className="text-4xl font-bold">$0 <span className="text-xs text-[#2B3A4A]/60">forever</span></div>
                <ul className="space-y-2 text-sm text-[#2B3A4A] font-sans">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#748DAE]" /> Standard Resting & Walking</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#748DAE]" /> Cursor Chasing & Stride Math</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#748DAE]" /> Dock Sleeping Physics</li>
                </ul>
              </div>
              <a href="#sandbox" onClick={scrollToSection('sandbox')} className="pastel-btn-blue w-full py-3 text-center text-sm font-bold block">Download Free</a>
            </div>

            <div className="pastel-card p-8 space-y-6 flex flex-col justify-between border-[#748DAE]">
              <div className="space-y-4">
                <div className="text-xl font-bold text-[#748DAE]">Developer Pro</div>
                <div className="text-4xl font-bold">$9 <span className="text-xs text-[#2B3A4A]/60">one-time</span></div>
                <ul className="space-y-2 text-sm text-[#2B3A4A] font-sans">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#748DAE]" /> 12-Frame Bongo Cat WebM</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#748DAE]" /> Mochi Vertical Drag Stretch</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#748DAE]" /> Hardware Key Guarding (kVK_)</li>
                </ul>
              </div>
              <a href="#sandbox" onClick={scrollToSection('sandbox')} className="pastel-btn-pink w-full py-3 text-center text-sm font-bold block">Get Pro Version</a>
            </div>

            <div className="pastel-card p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xl font-bold text-[#748DAE]">Supporter Pack</div>
                <div className="text-4xl font-bold">$25 <span className="text-xs text-[#2B3A4A]/60">lifetime</span></div>
                <ul className="space-y-2 text-sm text-[#2B3A4A] font-sans">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#748DAE]" /> All Pro Features</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#748DAE]" /> Custom Sprite Importer</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#748DAE]" /> Priority GitHub Support</li>
                </ul>
              </div>
              <a href="#contact" onClick={scrollToSection('contact')} className="pastel-btn-blue w-full py-3 text-center text-sm font-bold block">Support Pluto</a>
            </div>
          </div>
        </section>

        {/* SECTION 7: DOCS & FAQ ACCORDION */}
        <section id="faq" className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#748DAE]">Technical Documentation & FAQ</h2>
            <p className="text-[#2B3A4A]/70 text-lg font-sans">Frequently asked questions regarding Pluto's core execution contract</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="pastel-card overflow-hidden">
                <button
                  onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                  className="w-full p-6 text-left text-sm sm:text-base font-bold text-[#2B3A4A] flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#748DAE] transition-transform ${openFaqIdx === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaqIdx === i && (
                  <div className="px-6 pb-6 text-sm text-[#2B3A4A]/80 font-sans border-t-2 border-[#748DAE]/20 pt-4 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 8: CONTACT FORM */}
        <section id="contact" className="space-y-8 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#748DAE]">Contact Development Team</h2>
            <p className="text-[#2B3A4A]/70 text-lg font-sans">Have questions or want to report a bug? Send us a terminal message.</p>
          </div>

          <div className="pastel-card p-8">
            {formSubmitted ? (
              <div className="p-6 rounded-2xl bg-[#9ECAD6] border-2 border-[#2B3A4A] text-[#2B3A4A] text-center text-base font-bold space-y-2">
                <Check className="w-8 h-8 mx-auto" />
                <div>Message Sent Successfully!</div>
                <p className="text-xs text-[#2B3A4A]/80 font-sans">We will respond to your work email within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B3A4A] mb-1">Your Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Maithili Pawar"
                    className="w-full bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-xl p-3 text-sm text-[#2B3A4A] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B3A4A] mb-1">Work Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="e.g. developer@company.com"
                    className="w-full bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-xl p-3 text-sm text-[#2B3A4A] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B3A4A] mb-1">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="e.g. Sprite Customization Request"
                    className="w-full bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-xl p-3 text-sm text-[#2B3A4A] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B3A4A] mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Type your message here..."
                    className="w-full bg-[#FFEAEA] border-2 border-[#2B3A4A] rounded-xl p-3 text-sm text-[#2B3A4A] focus:outline-none"
                    required
                  />
                </div>

                <button type="submit" className="pastel-btn-blue w-full py-3 text-sm font-bold flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Transmit Message
                </button>
              </form>
            )}
          </div>
        </section>

      </main>

      {/* BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#9ECAD6] border-2 border-[#2B3A4A] text-[#2B3A4A] shadow-[3px_3px_0px_#2B3A4A] hover:bg-[#F5CBCB] transition-all"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* MINIMAL FOOTER WITH COPYRIGHT AND SOCIAL LINKS IN ONE LINE */}
      <footer className="border-t-2 border-[#748DAE] py-6 text-xs text-[#2B3A4A] bg-[#9ECAD6]/30">
        <div className="max-w-[1120px] mx-auto w-full px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/assets/pepperino.png" alt="Pluto" className="w-5 h-5 rendering-pixelated" />
            <span>© {new Date().getFullYear()} Pluto — Your desk pet. MIT License.</span>
          </div>

          <div className="flex items-center gap-6 font-bold">
            <a href="https://github.com/diablovocado/Pixel-Pet" target="_blank" rel="noopener noreferrer" className="hover:text-[#748DAE] transition-colors flex items-center gap-1">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#748DAE] transition-colors flex items-center gap-1">
              <Twitter className="w-4 h-4" /> Twitter
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#748DAE] transition-colors flex items-center gap-1">
              <Discord className="w-4 h-4" /> Discord
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
