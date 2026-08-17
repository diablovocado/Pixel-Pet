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
  Layers
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
  }
];

export default function App() {
  // Navigation & Page View State
  const [currentPage, setCurrentPage] = useState<'home' | 'features' | 'cli' | 'pricing' | 'faq' | 'contact'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Interactive CLI Terminal Input & Output Log State
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState<string[]>([
    "System initialized: Pluto OS v1.0.0",
    "Type 'help' or click quick commands below..."
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
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
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

      // Cyberpunk Cyan Separator floor line
      ctx.strokeStyle = '#00d9ff';
      ctx.lineWidth = 2;
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
        ctx.fillStyle = '#00d9ff';
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
            ctx.fillStyle = '#ff00aa';
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
        colors: ['#00d9ff', '#ff00aa', '#00ff9d']
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#0b0b1a] text-[#f1f1f1] font-mono relative overflow-x-hidden selection:bg-[#00d9ff] selection:text-[#0b0b1a]">
      
      {/* 1. FIXED TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#0b0b1a]/90 backdrop-blur-md border-b border-[#00d9ff]/30 py-3.5">
        <div className="max-w-[1120px] mx-auto w-full px-6 flex items-center justify-between">
          
          {/* Logo Left */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1a1a2e] border border-[#00d9ff] flex items-center justify-center shadow-[0_0_10px_rgba(0,217,255,0.3)]">
              <img src="/assets/pepperino.png" alt="Pluto Logo" className="w-6 h-6 rendering-pixelated object-contain" />
            </div>
            <div>
              <div className="font-bold text-lg text-[#00d9ff] cyber-glow-text flex items-center gap-2">
                PLUTO <span className="text-xs px-2 py-0.5 rounded bg-[#ff00aa]/20 text-[#ff00aa] border border-[#ff00aa]/40">v1.0.0</span>
              </div>
              <div className="text-[11px] text-[#00ff9d]">Your desk pet</div>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#f1f1f1]/80">
            <button 
              onClick={() => setCurrentPage('home')} 
              className={`hover:text-[#00d9ff] transition-colors flex items-center gap-1.5 ${currentPage === 'home' ? 'text-[#00d9ff] font-bold border-b border-[#00d9ff]' : ''}`}
            >
              <Terminal className="w-4 h-4" /> Home
            </button>
            <button 
              onClick={() => setCurrentPage('features')} 
              className={`hover:text-[#00d9ff] transition-colors flex items-center gap-1.5 ${currentPage === 'features' ? 'text-[#00d9ff] font-bold border-b border-[#00d9ff]' : ''}`}
            >
              <Cpu className="w-4 h-4" /> Architecture
            </button>
            <button 
              onClick={() => setCurrentPage('cli')} 
              className={`hover:text-[#00d9ff] transition-colors flex items-center gap-1.5 ${currentPage === 'cli' ? 'text-[#00d9ff] font-bold border-b border-[#00d9ff]' : ''}`}
            >
              <Code2 className="w-4 h-4" /> Interactive CLI
            </button>
            <button 
              onClick={() => setCurrentPage('pricing')} 
              className={`hover:text-[#00d9ff] transition-colors flex items-center gap-1.5 ${currentPage === 'pricing' ? 'text-[#00d9ff] font-bold border-b border-[#00d9ff]' : ''}`}
            >
              <Layers className="w-4 h-4" /> Enterprise
            </button>
            <button 
              onClick={() => setCurrentPage('faq')} 
              className={`hover:text-[#00d9ff] transition-colors flex items-center gap-1.5 ${currentPage === 'faq' ? 'text-[#00d9ff] font-bold border-b border-[#00d9ff]' : ''}`}
            >
              <Activity className="w-4 h-4" /> Docs & FAQ
            </button>
            <button 
              onClick={() => setCurrentPage('contact')} 
              className={`hover:text-[#00d9ff] transition-colors flex items-center gap-1.5 ${currentPage === 'contact' ? 'text-[#00d9ff] font-bold border-b border-[#00d9ff]' : ''}`}
            >
              <Send className="w-4 h-4" /> Contact
            </button>
          </nav>

          {/* Right Download CTA */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/diablovocado/Pixel-Pet"
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-btn-cyan px-4 py-2 text-xs flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get App (macOS)</span>
            </a>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#1a1a2e] border border-[#00d9ff] text-[#00d9ff]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 px-6 py-4 border-t border-[#00d9ff]/30 bg-[#1a1a2e] flex flex-col gap-3 text-sm text-[#f1f1f1]">
            <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="text-left py-1 flex items-center gap-2"><Terminal className="w-4 h-4 text-[#00d9ff]" /> Home</button>
            <button onClick={() => { setCurrentPage('features'); setMobileMenuOpen(false); }} className="text-left py-1 flex items-center gap-2"><Cpu className="w-4 h-4 text-[#00d9ff]" /> Architecture</button>
            <button onClick={() => { setCurrentPage('cli'); setMobileMenuOpen(false); }} className="text-left py-1 flex items-center gap-2"><Code2 className="w-4 h-4 text-[#00d9ff]" /> Interactive CLI</button>
            <button onClick={() => { setCurrentPage('pricing'); setMobileMenuOpen(false); }} className="text-left py-1 flex items-center gap-2"><Layers className="w-4 h-4 text-[#00d9ff]" /> Enterprise</button>
            <button onClick={() => { setCurrentPage('faq'); setMobileMenuOpen(false); }} className="text-left py-1 flex items-center gap-2"><Activity className="w-4 h-4 text-[#00d9ff]" /> Docs & FAQ</button>
            <button onClick={() => { setCurrentPage('contact'); setMobileMenuOpen(false); }} className="text-left py-1 flex items-center gap-2"><Send className="w-4 h-4 text-[#00d9ff]" /> Contact</button>
          </div>
        )}
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-[1120px] mx-auto w-full px-6 py-12">

        {/* PAGE 1: HOME PAGE (SPLIT HERO SECTION) */}
        {currentPage === 'home' && (
          <div className="space-y-20">
            
            {/* SPLIT HERO SECTION (TEXT LEFT, MASCOT TERMINAL RIGHT) */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column: Text & CTAs */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d9ff]/10 border border-[#00d9ff]/40 text-[#00d9ff] text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff00aa]" />
                  <span>Terminal Desktop Companion v1.0</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-bold leading-tight tracking-tight">
                  Pluto — <br />
                  <span className="text-[#00d9ff] cyber-glow-text">Your desk pet</span>
                </h1>

                <p className="text-[#f1f1f1]/70 text-lg leading-relaxed">
                  A high-performance, pixel-art cat that lives on your Mac Dock. Featuring cursor pursuit, Dock sleeping physics, hardware-level key event detection, and Mochi drag stretch math.
                </p>

                {/* Live CLI Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setCurrentPage('cli')}
                    className="cyber-btn-cyan px-6 py-3 text-sm flex items-center gap-2"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Launch Terminal Sandbox</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage('features')}
                    className="px-6 py-3 rounded-lg bg-[#1a1a2e] border border-[#00d9ff]/40 text-[#00d9ff] hover:bg-[#00d9ff]/10 text-sm font-bold transition-all"
                  >
                    View Architecture Specs →
                  </button>
                </div>

                {/* Status Bar Pills */}
                <div className="pt-4 border-t border-[#00d9ff]/20 flex flex-wrap gap-4 text-xs font-mono text-[#00ff9d]">
                  <div>✓ CPU: 0.1% Footprint</div>
                  <div>✓ RAM: ~15MB</div>
                  <div>✓ 100% Offline</div>
                </div>
              </div>

              {/* Right Column: Terminal Window Showcase with Live Mascot Canvas */}
              <div className="cyber-card p-6 relative overflow-hidden">
                {/* Window Controls */}
                <div className="flex items-center justify-between pb-4 border-b border-[#00d9ff]/30 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block" />
                    <span className="ml-2 text-xs text-[#00d9ff]">pluto-core-process --dock</span>
                  </div>
                  <div className="text-xs text-[#ff00aa]">STATUS: ACTIVE</div>
                </div>

                {/* Speech Bubble */}
                <div className="bg-[#0b0b1a] border border-[#00d9ff] text-[#00d9ff] px-3 py-1.5 rounded text-xs mb-3 inline-block">
                  {speechBubble}
                </div>

                {/* Interactive Mascot Canvas */}
                <div 
                  onMouseDown={handleMouseDownStage}
                  onMouseMove={handleMouseMoveStage}
                  onMouseUp={handleMouseUpStage}
                  onClick={handlePet}
                  className="bg-[#0b0b1a] border border-[#00d9ff]/30 h-60 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden"
                >
                  <canvas ref={canvasRef} width={640} height={210} className="w-full h-full rendering-pixelated" />
                  <div className="absolute bottom-3 right-3 text-[10px] bg-[#1a1a2e] border border-[#00d9ff]/40 px-2 py-0.5 rounded text-[#00d9ff]">
                    ↕️ Drag vertically to stretch Mochi!
                  </div>
                </div>

                {/* Fast Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4 text-xs">
                  <button onClick={() => handleCliSubmit(undefined, 'pet')} className="px-3 py-1.5 rounded bg-[#1a1a2e] border border-[#00d9ff] text-[#00d9ff] hover:bg-[#00d9ff] hover:text-[#0b0b1a]">❤️ Pet</button>
                  <button onClick={() => handleCliSubmit(undefined, 'feed')} className="px-3 py-1.5 rounded bg-[#1a1a2e] border border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d] hover:text-[#0b0b1a]">🐟 Feed ({treatsCount})</button>
                  <button onClick={() => handleCliSubmit(undefined, 'bongo')} className="px-3 py-1.5 rounded bg-[#1a1a2e] border border-[#ff00aa] text-[#ff00aa] hover:bg-[#ff00aa] hover:text-[#ffffff]">🥁 Bongo Drums</button>
                  <button onClick={() => handleCliSubmit(undefined, 'sleep')} className="px-3 py-1.5 rounded bg-[#1a1a2e] border border-[#f1f1f1]/40 text-[#f1f1f1]/80 hover:bg-[#f1f1f1] hover:text-[#0b0b1a]">💤 Sleep</button>
                </div>
              </div>

            </section>

            {/* CARD-BASED GRID LAYOUT FOR CORE MECHANICS */}
            <section className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-3xl font-bold text-[#00d9ff] cyber-glow-text">Core Technical Mechanics</h2>
                <p className="text-[#f1f1f1]/70">Low-level execution specifications engineered for zero desktop interference</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="cyber-card p-6 space-y-3">
                  <MousePointer className="w-8 h-8 text-[#00d9ff]" />
                  <h3 className="text-xl font-bold text-[#f1f1f1]">1. Cursor Pursuit & Running Stride</h3>
                  <p className="text-sm text-[#f1f1f1]/70 leading-relaxed">
                    When cursor distance exceeds 45px, Pluto runs towards target coordinates with directional face flipping (<code className="text-[#00ff9d]">scaleX * faceDir</code>) and sine wave stride bounce (<code className="text-[#00ff9d]">Math.sin(Date.now() * 0.018) * 3</code>).
                  </p>
                </div>

                <div className="cyber-card p-6 space-y-3">
                  <Bed className="w-8 h-8 text-[#00d9ff]" />
                  <h3 className="text-xl font-bold text-[#f1f1f1]">2. Dock Sleeping & Click-to-Wake</h3>
                  <p className="text-sm text-[#f1f1f1]/70 leading-relaxed">
                    Moving cursor down near the Dock (<code className="text-[#00ff9d]">mouseY ≥ window.innerHeight - 80</code>) triggers Dock Sleeping state with drifting blue Zzz particles. Hovering over Pluto and clicking restores normal IDLE state.
                  </p>
                </div>

                <div className="cyber-card p-6 space-y-3">
                  <Keyboard className="w-8 h-8 text-[#00d9ff]" />
                  <h3 className="text-xl font-bold text-[#f1f1f1]">3. Keyboard Typing & WebM Animation</h3>
                  <p className="text-sm text-[#f1f1f1]/70 leading-relaxed">
                    Keydown events switch Pluto to her 12-frame typing animation, seamlessly scaled 1.38x using hardware key identifier filtering (<code className="text-[#00ff9d]">kVK_ANSI_</code>) to prevent trackpad click confusion.
                  </p>
                </div>

                <div className="cyber-card p-6 space-y-3">
                  <Smile className="w-8 h-8 text-[#ff00aa]" />
                  <h3 className="text-xl font-bold text-[#f1f1f1]">4. Mochi Drag & Mood Petting</h3>
                  <p className="text-sm text-[#f1f1f1]/70 leading-relaxed">
                    Click-and-drag vertically stretches Pluto like soft mochi (<code className="text-[#ff00aa]">scaleY = 1 + min(dragY / 100, 0.7)</code>). Mouseup instantly snaps proportions back 1-to-1 with heart particle bursts!
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PAGE 2: ARCHITECTURE & SPECS */}
        {currentPage === 'features' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="text-4xl font-bold text-[#00d9ff] cyber-glow-text">System Architecture</h1>
              <p className="text-[#f1f1f1]/70">Under the hood of Pluto's Electron overlay process</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="cyber-card p-6 space-y-3">
                <Cpu className="w-8 h-8 text-[#00ff9d]" />
                <h3 className="text-lg font-bold">0.1% CPU Redraw</h3>
                <p className="text-xs text-[#f1f1f1]/70">Single HTML5 Canvas loop with zero DOM redrawing or procedural overlay math.</p>
              </div>
              <div className="cyber-card p-6 space-y-3">
                <HardDrive className="w-8 h-8 text-[#00d9ff]" />
                <h3 className="text-lg font-bold">15MB Memory Footprint</h3>
                <p className="text-xs text-[#f1f1f1]/70">Ultra lightweight memory allocation optimized for Apple Silicon M1/M2/M3 and Intel chips.</p>
              </div>
              <div className="cyber-card p-6 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#ff00aa]" />
                <h3 className="text-lg font-bold">100% Offline & Secure</h3>
                <p className="text-xs text-[#f1f1f1]/70">Zero analytics, zero telemetry data, zero background web sockets.</p>
              </div>
            </div>

            <div className="cyber-card p-8 space-y-4">
              <h2 className="text-2xl font-bold text-[#00d9ff]">Transparent Overlay Window Contract</h2>
              <pre className="bg-[#0b0b1a] p-4 rounded-lg border border-[#00d9ff]/30 text-xs text-[#00ff9d] overflow-x-auto">
{`const windowConfig = {
  width: 140,
  height: 140,
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  hasShadow: false,
  webPreferences: { nodeIntegration: true, contextIsolation: false }
};`}
              </pre>
            </div>
          </div>
        )}

        {/* PAGE 3: INTERACTIVE CLI TERMINAL */}
        {currentPage === 'cli' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="text-4xl font-bold text-[#00d9ff] cyber-glow-text">Interactive Terminal CLI</h1>
              <p className="text-[#f1f1f1]/70">Execute live commands to interact directly with Pluto's state machine</p>
            </div>

            <div className="cyber-card p-6 space-y-4">
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#00d9ff]/30 text-xs">
                <div className="text-[#00d9ff]">bash — pluto@desktop:~$</div>
                <button onClick={() => handleCliSubmit(undefined, 'clear')} className="text-xs text-[#ff00aa] hover:underline">Clear Logs</button>
              </div>

              {/* Terminal Logs Output */}
              <div className="bg-[#0b0b1a] p-4 rounded-lg border border-[#00d9ff]/30 font-mono text-xs text-[#00ff9d] min-h-[180px] max-h-[300px] overflow-y-auto space-y-1">
                {cliLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>

              {/* Terminal Command Input */}
              <form onSubmit={(e) => handleCliSubmit(e)} className="flex items-center gap-2">
                <span className="text-[#ff00aa] font-bold">$</span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="Type 'help', 'status', 'pet', 'feed', 'bongo', or 'sleep'..."
                  className="flex-1 bg-[#0b0b1a] border border-[#00d9ff]/40 rounded px-4 py-2 text-sm text-[#00d9ff] placeholder-[#00d9ff]/40 focus:outline-none focus:border-[#00d9ff]"
                />
                <button type="submit" className="cyber-btn-cyan px-4 py-2 text-xs">Run</button>
              </form>
            </div>
          </div>
        )}

        {/* PAGE 4: ENTERPRISE & PRICING */}
        {currentPage === 'pricing' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="text-4xl font-bold text-[#00d9ff] cyber-glow-text">Open Source Packages</h1>
              <p className="text-[#f1f1f1]/70">Choose your Pluto desktop package. 100% free under MIT license.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="cyber-card p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-lg font-bold text-[#00d9ff]">Community Edition</div>
                  <div className="text-4xl font-bold">$0 <span className="text-xs text-[#f1f1f1]/60">forever</span></div>
                  <ul className="space-y-2 text-xs text-[#f1f1f1]/80">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> Standard Resting & Walking</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> Cursor Chasing & Stride Math</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> Dock Sleeping Physics</li>
                  </ul>
                </div>
                <button onClick={() => setCurrentPage('cli')} className="cyber-btn-cyan w-full py-3 text-xs">Download Free</button>
              </div>

              <div className="cyber-card p-8 space-y-6 flex flex-col justify-between border-[#ff00aa]">
                <div className="space-y-4">
                  <div className="text-lg font-bold text-[#ff00aa]">Developer Pro</div>
                  <div className="text-4xl font-bold">$9 <span className="text-xs text-[#f1f1f1]/60">one-time</span></div>
                  <ul className="space-y-2 text-xs text-[#f1f1f1]/80">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> 12-Frame Bongo Cat WebM</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> Mochi Vertical Drag Stretch</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> Hardware Key Guarding (kVK_)</li>
                  </ul>
                </div>
                <button onClick={() => setCurrentPage('cli')} className="cyber-btn-magenta w-full py-3 text-xs">Get Pro Version</button>
              </div>

              <div className="cyber-card p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-lg font-bold text-[#00ff9d]">Enterprise Team</div>
                  <div className="text-4xl font-bold">$25 <span className="text-xs text-[#f1f1f1]/60">lifetime</span></div>
                  <ul className="space-y-2 text-xs text-[#f1f1f1]/80">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> All Pro Features</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> Custom Sprite Importer</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00ff9d]" /> Priority GitHub Support</li>
                  </ul>
                </div>
                <button onClick={() => setCurrentPage('contact')} className="cyber-btn-cyan w-full py-3 text-xs">Contact Sales</button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 5: DOCS & FAQ */}
        {currentPage === 'faq' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-[#00d9ff] cyber-glow-text">Technical Documentation & FAQ</h1>
              <p className="text-[#f1f1f1]/70">Frequently asked questions regarding Pluto's core execution contract</p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="cyber-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                    className="w-full p-6 text-left text-sm font-bold text-[#00d9ff] flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-[#ff00aa] transition-transform ${openFaqIdx === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqIdx === i && (
                    <div className="px-6 pb-6 text-xs text-[#f1f1f1]/80 border-t border-[#00d9ff]/20 pt-4 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 6: CONTACT FORM */}
        {currentPage === 'contact' && (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-[#00d9ff] cyber-glow-text">Contact Development Team</h1>
              <p className="text-[#f1f1f1]/70">Have questions or want to report a bug? Send us a terminal message.</p>
            </div>

            <div className="cyber-card p-8">
              {formSubmitted ? (
                <div className="p-6 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d] text-[#00ff9d] text-center text-sm space-y-2">
                  <Check className="w-8 h-8 mx-auto" />
                  <div className="font-bold text-base">Message Sent Successfully!</div>
                  <p className="text-xs text-[#f1f1f1]/80">We will respond to your work email within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#00d9ff] mb-1">Your Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Maithili Pawar"
                      className="w-full bg-[#0b0b1a] border border-[#00d9ff]/40 rounded p-3 text-sm text-[#f1f1f1] focus:outline-none focus:border-[#00d9ff]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#00d9ff] mb-1">Work Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="e.g. developer@company.com"
                      className="w-full bg-[#0b0b1a] border border-[#00d9ff]/40 rounded p-3 text-sm text-[#f1f1f1] focus:outline-none focus:border-[#00d9ff]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#00d9ff] mb-1">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="e.g. Sprite Customization Request"
                      className="w-full bg-[#0b0b1a] border border-[#00d9ff]/40 rounded p-3 text-sm text-[#f1f1f1] focus:outline-none focus:border-[#00d9ff]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#00d9ff] mb-1">Message</label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Type your message here..."
                      className="w-full bg-[#0b0b1a] border border-[#00d9ff]/40 rounded p-3 text-sm text-[#f1f1f1] focus:outline-none focus:border-[#00d9ff]"
                      required
                    />
                  </div>

                  <button type="submit" className="cyber-btn-cyan w-full py-3 text-sm font-bold flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Transmit Message
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </main>

      {/* BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#1a1a2e] border border-[#00d9ff] text-[#00d9ff] shadow-[0_0_15px_rgba(0,217,255,0.4)] hover:bg-[#00d9ff] hover:text-[#0b0b1a] transition-all"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* MINIMAL FOOTER WITH COPYRIGHT AND SOCIAL LINKS IN ONE LINE */}
      <footer className="border-t border-[#00d9ff]/30 py-6 text-xs text-[#f1f1f1]/70 bg-[#0b0b1a]">
        <div className="max-w-[1120px] mx-auto w-full px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/assets/pepperino.png" alt="Pluto" className="w-5 h-5 rendering-pixelated" />
            <span>© {new Date().getFullYear()} Pluto — Your desk pet. MIT License.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://github.com/diablovocado/Pixel-Pet" target="_blank" rel="noopener noreferrer" className="hover:text-[#00d9ff] transition-colors flex items-center gap-1">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#00d9ff] transition-colors flex items-center gap-1">
              <Twitter className="w-4 h-4" /> Twitter
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#00d9ff] transition-colors flex items-center gap-1">
              <Discord className="w-4 h-4" /> Discord
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
