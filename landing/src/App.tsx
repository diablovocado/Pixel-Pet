import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Download,
  Github,
  Zap,
  RotateCcw
} from 'lucide-react';

const BONGO_FRAMES = Array.from(
  { length: 12 },
  (_, i) => `/assets/bongo_cat_frames/tyoe_frame_${i}.png`
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'walk' | 'sleep' | 'bongo' | 'excited' | 'petting'>('bongo');
  const [happiness, setHappiness] = useState(98);
  const [treatsCount, setTreatsCount] = useState(5);
  const [copied, setCopied] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("Meow! I'm sitting on your desk! 🐾");
  const [bongoFrameIdx, setBongoFrameIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Real-time typing states
  const [kps, setKps] = useState(0);
  const [keystrokesCount, setKeystrokesCount] = useState(0);
  const [testInputText, setTestInputText] = useState('');
  const [lastKeyTyped, setLastKeyTyped] = useState('N');
  const keystrokeTimestampsRef = useRef<number[]>([]);

  // Preloaded image references for HTML5 Canvas rendering
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

  // Preload image assets
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

  // Web Audio Synthesizer for Retro Beep Sound Effects
  const playRetroSound = (type: 'meow' | 'type' | 'treat' | 'pet') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'type') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440 + Math.random() * 200, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'treat') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'pet') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'meow') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.2);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // AudioContext fallback
    }
  };

  // Global Keyboard Typing Detector & KPS Calculator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

      const now = Date.now();
      keystrokeTimestampsRef.current.push(now);
      const keyChar = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      setLastKeyTyped(keyChar);
      playRetroSound('type');

      keystrokeTimestampsRef.current = keystrokeTimestampsRef.current.filter(t => now - t <= 1000);
      const currentKps = keystrokeTimestampsRef.current.length;
      setKps(currentKps);
      setKeystrokesCount(prev => prev + 1);

      setActiveTab('bongo');
      setBongoFrameIdx(prev => (prev + 1) % BONGO_FRAMES.length);

      if (currentKps > 7) {
        setSpeechBubble(`🔥 HIGH SPEED TYPING! ${currentKps} KPS! PLUTO IS SLAMMING PAWS FAST! 🎹⚡`);
      } else if (currentKps > 2) {
        setSpeechBubble(`⚡ Typing at ${currentKps} KPS! Key '${keyChar}' pressed! 🎵`);
      } else {
        setSpeechBubble(`Keystroke detected! Key '${keyChar}' • Pluto is reacting! 🐾`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [soundEnabled]);

  // KPS Decay Ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = Date.now();
      keystrokeTimestampsRef.current = keystrokeTimestampsRef.current.filter(t => now - t <= 1000);
      const currentKps = keystrokeTimestampsRef.current.length;
      setKps(currentKps);
      if (currentKps === 0 && activeTab === 'bongo') {
        setSpeechBubble("Keystroke detected! Pluto is reacting! 🐾");
      }
    }, 200);
    return () => clearInterval(ticker);
  }, [activeTab]);

  // Automatic Idle Bongo frame ticker when typing or active
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

      // Retro floor line
      ctx.strokeStyle = '#2D231E';
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

      if (activeTab === 'sleep') {
        const sleepImg = imagesRef.current.sleep;
        if (sleepImg) {
          ctx.drawImage(sleepImg, 270, 80, 95, 95);
        }

        const zOffset = Math.sin(Date.now() / 250) * 6;
        ctx.font = '20px "VT323", monospace';
        ctx.fillStyle = '#C87A5B';
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
            ctx.fillStyle = '#C87A5B';
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
  }, [activeTab, bongoFrameIdx, kps, lastKeyTyped]);

  const copyInstallCommand = () => {
    navigator.clipboard.writeText(
      'git clone https://github.com/diablovocado/Pixel-Pet.git && cd Pixel-Pet && npm install && npm start'
    );
    setCopied(true);
    playRetroSound('treat');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#C87A5B', '#E5B25D', '#8A9A65']
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFeed = () => {
    if (treatsCount > 0) {
      setTreatsCount(prev => prev - 1);
      setHappiness(prev => Math.min(100, prev + 10));
      setActiveTab('excited');
      playRetroSound('treat');
      setSpeechBubble("YUMMY! Fish treat devoured! Pluto is super happy! 🐟✨");

      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#8A9A65', '#E5B25D', '#C87A5B']
      });

      setTimeout(() => setSpeechBubble("Purrrrr! Pluto loves you! 🥰"), 2500);
    } else {
      setSpeechBubble("Treat box empty! Click '+ Restock Treats' to get more for Pluto! 📦");
    }
  };

  const handlePet = () => {
    setActiveTab('petting');
    setHappiness(prev => Math.min(100, prev + 5));
    playRetroSound('pet');
    setSpeechBubble("Purrrrrrr! You petted Pluto on the desk! ❤️");
  };

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#2D231E] font-['Press_Start_2P'] relative selection:bg-[#E5B25D] selection:text-[#2D231E] overflow-x-hidden">
      
      {/* 🧭 2. NAVIGATION BAR (Fixed Top) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5EFEB]/90 backdrop-blur-md border-b-[2.5px] border-[#2D231E] py-4">
        <div className="max-w-[1120px] mx-auto w-full px-6 flex items-center justify-between">
          
          {/* Left Logo */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <img 
              src="/assets/pepperino.png" 
              alt="Pluto Logo" 
              className="w-[32px] h-[32px] image-rendering-pixelated object-contain" 
            />
            <span className="font-['Press_Start_2P'] text-[14px] text-[#2D231E] font-bold">
              PLUTO
            </span>
            <span className="bg-[#E5B25D] text-[#2D231E] border border-[#2D231E] px-2 py-0.5 text-xs font-['Fredoka'] font-bold rounded-sm shadow-[1px_1px_0px_#2D231E]">
              v1.0
            </span>
          </motion.div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-['Press_Start_2P'] text-[#2D231E]">
            <a href="#overview" onClick={scrollToSection('overview')} className="hover:text-[#C87A5B] transition-colors">Features</a>
            <a href="#playground" onClick={scrollToSection('playground')} className="hover:text-[#C87A5B] transition-colors">Setup</a>
            <a href="#gallery" onClick={scrollToSection('gallery')} className="hover:text-[#C87A5B] transition-colors">Assets</a>
            <a 
              href="https://github.com/diablovocado/Pixel-Pet" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#C87A5B] transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </nav>

          {/* Right Controls CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-sm bg-[#EAE0D5] border-[2px] border-[#2D231E] shadow-[2px_2px_0px_#2D231E] hover:bg-[#E5B25D]/30 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#2D231E] transition-all text-[#2D231E]"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#C87A5B]" />}
            </button>

            <motion.a 
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              href="#download"
              onClick={scrollToSection('download')}
              className="bg-[#C87A5B] text-white border-[2px] border-[#2D231E] shadow-[3px_3px_0px_#2D231E] hover:bg-[#b56b4e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#2D231E] px-4 py-2 text-xs font-['Press_Start_2P'] transition-all inline-flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Pluto App</span>
            </motion.a>
          </div>
        </div>
      </header>

      {/* 🛋️ 3. SECTION 1 — HERO (100vh Cozy Study Room) */}
      <section className="min-h-screen relative flex flex-col justify-between items-center pt-24 pb-10 bg-[#F5EFEB] overflow-hidden">
        
        {/* Visual Background Illustration Layer with warm dot-grid */}
        <div className="absolute inset-0 bg-[url('/assets/hero_cozy_room.jpg')] bg-cover bg-center bg-no-repeat opacity-95" />
        <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5EFEB]/30 via-transparent to-[#F5EFEB]" />

        {/* Center Stage Content */}
        <div className="max-w-[1120px] mx-auto w-full px-6 relative z-10 flex flex-col items-center justify-center text-center my-auto">
          
          {/* Floating Speech Bubble above mascot */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={speechBubble}
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#F5EFEB] border-[2.5px] border-[#2D231E] shadow-[4px_4px_0px_#2D231E] px-4 py-2 font-['VT323'] text-2xl text-[#2D231E] mb-3 inline-block rounded-md"
            >
              <span>{speechBubble}</span>
            </motion.div>
          </AnimatePresence>

          {/* Central Mascot Sprite on Desk */}
          <div className="relative cursor-pointer group" onClick={handlePet}>
            <div className="w-32 h-6 bg-[#2D231E]/35 rounded-full blur-xs absolute -bottom-1 left-1/2 transform -translate-x-1/2" />
            <motion.img 
              whileHover={{ scale: 1.1 }}
              src="/assets/pepperino.png" 
              alt="Pluto Cat" 
              className="w-[140px] h-[140px] image-rendering-pixelated object-contain relative z-10 drop-shadow-xl" 
            />
          </div>

          {/* Headline */}
          <h1 className="font-['Press_Start_2P'] text-4xl md:text-6xl text-[#2D231E] mt-4 tracking-wider">
            PLUTO
          </h1>

          {/* Subtitle */}
          <p className="font-['VT323'] text-2xl md:text-3xl text-[#2D231E]/80 mt-2">
            Pixel-Pet v1.0 • Your Desktop Companion
          </p>

        </div>

        {/* Bottom CTA Floating Pill */}
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="relative z-10"
        >
          <a 
            href="#overview" 
            onClick={scrollToSection('overview')}
            className="font-['Press_Start_2P'] text-xs bg-[#EAE0D5] border-[2.5px] border-[#2D231E] shadow-[4px_4px_0px_#2D231E] px-6 py-3 rounded-full hover:bg-[#E5B25D]/40 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Scroll to Explore ↓</span>
          </a>
        </motion.div>

      </section>

      {/* ⚡ 4. SECTION 2 — FEATURES & SPECS */}
      <section id="overview" className="py-24 bg-[#F5EFEB]">
        <div className="max-w-[1120px] mx-auto w-full px-6">
          
          <div className="text-center">
            <h2 className="font-['Press_Start_2P'] text-2xl md:text-3xl text-[#2D231E] leading-relaxed">
              A Living Pixel Cat for Your Mac Desktop
            </h2>
            <p className="font-['VT323'] text-2xl text-[#2D231E]/70 max-w-2xl mx-auto text-center mt-3 leading-relaxed">
              Pluto sits on your dock, sleeps when you step away, reacts to typing speed, and plays Bongo drums right on your screen.
            </p>
          </div>

          {/* 4 Feature Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-[#EAE0D5] border-[2.5px] border-[#2D231E] shadow-[4px_4px_0px_#2D231E] p-6 rounded-md hover:-translate-y-1 transition-transform"
            >
              <div className="text-4xl mb-3">💾</div>
              <div className="font-['Press_Start_2P'] text-xs text-[#2D231E] mb-2">0.1% CPU Usage</div>
              <div className="font-['VT323'] text-xl text-[#2D231E]/80">Ultra Lightweight Performance</div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-[#EAE0D5] border-[2.5px] border-[#2D231E] shadow-[4px_4px_0px_#2D231E] p-6 rounded-md hover:-translate-y-1 transition-transform"
            >
              <div className="text-4xl mb-3">💼</div>
              <div className="font-['Press_Start_2P'] text-xs text-[#2D231E] mb-2">~15MB RAM</div>
              <div className="font-['VT323'] text-xl text-[#2D231E]/80">Minimal Memory Footprint</div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-[#EAE0D5] border-[2.5px] border-[#2D231E] shadow-[4px_4px_0px_#2D231E] p-6 rounded-md hover:-translate-y-1 transition-transform"
            >
              <div className="text-4xl mb-3">🌐</div>
              <div className="font-['Press_Start_2P'] text-xs text-[#2D231E] mb-2">100% Offline</div>
              <div className="font-['VT323'] text-xl text-[#2D231E]/80">Zero Analytics & 100% Private</div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-[#EAE0D5] border-[2.5px] border-[#2D231E] shadow-[4px_4px_0px_#2D231E] p-6 rounded-md hover:-translate-y-1 transition-transform"
            >
              <div className="text-4xl mb-3">🖥</div>
              <div className="font-['Press_Start_2P'] text-xs text-[#2D231E] mb-2">macOS Universal</div>
              <div className="font-['VT323'] text-xl text-[#2D231E]/80">Apple Silicon M-Series & Intel</div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 🎮 5. SECTION 3 — INTERACTIVE LIVE SANDBOX */}
      <section id="playground" className="py-12 bg-[#F5EFEB]">
        <div className="max-w-[1120px] mx-auto w-full px-6">
          
          <div className="bg-[#EAE0D5] border-[2.5px] border-[#2D231E] shadow-[6px_6px_0px_#2D231E] rounded-lg p-6 md:p-8 my-8">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-[2px] border-[#2D231E]">
              <div className="font-['Press_Start_2P'] text-sm md:text-base text-[#2D231E]">
                Interactive Sandbox → Test Pluto Live
              </div>
              <div className="bg-[#E5B25D] text-[#2D231E] border-[2px] border-[#2D231E] px-3 py-1 font-['Press_Start_2P'] text-xs shadow-[2px_2px_0px_#2D231E] flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Typing Speed: {kps} KPS</span>
              </div>
            </div>

            {/* Real-Time Input Slot */}
            <div className="mt-6 mb-4">
              <input 
                type="text" 
                value={testInputText}
                onChange={(e) => setTestInputText(e.target.value)}
                placeholder="Type anything here to see Pluto react in real time..." 
                className="w-full bg-[#F5EFEB] border-[2.5px] border-[#2D231E] p-4 font-['VT323'] text-2xl text-[#2D231E] focus:outline-none shadow-[3px_3px_0px_#2D231E] placeholder-[#2D231E]/40"
              />
            </div>

            {/* Canvas Stage Area */}
            <div 
              onClick={handlePet}
              className="relative bg-[#F5EFEB] border-[2.5px] border-[#2D231E] h-64 rounded-md flex items-center justify-center cursor-pointer overflow-hidden shadow-inner group"
            >
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full image-rendering-pixelated" />
              
              <div className="absolute top-4 right-4 bg-[#EAE0D5] border-[2px] border-[#2D231E] shadow-[2px_2px_0px_#2D231E] px-3 py-1 font-['Press_Start_2P'] text-[10px] text-[#2D231E] pointer-events-none flex items-center gap-2">
                <img src="/assets/pepperino.png" alt="Pluto" className="w-4 h-4 image-rendering-pixelated" />
                <span>🐾 Click Stage to Pet Pluto</span>
              </div>
            </div>

            {/* Action Controls Bar */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => { setActiveTab('walk'); setSpeechBubble("Pluto is walking along the dock... 🐾"); }}
                className={`bg-[#F5EFEB] hover:bg-[#C87A5B] hover:text-white border-[2px] border-[#2D231E] shadow-[3px_3px_0px_#2D231E] px-4 py-2 font-['Press_Start_2P'] text-xs cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#2D231E] ${activeTab === 'walk' ? 'bg-[#C87A5B] text-white' : ''}`}
              >
                🐾 Walk
              </button>

              <button
                onClick={() => { setActiveTab('sleep'); setSpeechBubble("Shhh... Pluto is sleeping! Zzz... 💤"); }}
                className={`bg-[#F5EFEB] hover:bg-[#C87A5B] hover:text-white border-[2px] border-[#2D231E] shadow-[3px_3px_0px_#2D231E] px-4 py-2 font-['Press_Start_2P'] text-xs cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#2D231E] ${activeTab === 'sleep' ? 'bg-[#C87A5B] text-white' : ''}`}
              >
                💤 Sleep
              </button>

              <button
                onClick={() => { setActiveTab('bongo'); setSpeechBubble("Pluto Bongo mode! Slamming paws on keyboard! 🎹⚡"); }}
                className={`bg-[#F5EFEB] hover:bg-[#C87A5B] hover:text-white border-[2px] border-[#2D231E] shadow-[3px_3px_0px_#2D231E] px-4 py-2 font-['Press_Start_2P'] text-xs cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#2D231E] ${activeTab === 'bongo' ? 'bg-[#C87A5B] text-white' : ''}`}
              >
                🥁 Bongo
              </button>

              <button
                onClick={handlePet}
                className="bg-[#F5EFEB] hover:bg-[#C87A5B] hover:text-white border-[2px] border-[#2D231E] shadow-[3px_3px_0px_#2D231E] px-4 py-2 font-['Press_Start_2P'] text-xs cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#2D231E]"
              >
                ❤️ Pet
              </button>

              <button
                onClick={handleFeed}
                className="bg-[#F5EFEB] hover:bg-[#8A9A65] hover:text-white border-[2px] border-[#2D231E] shadow-[3px_3px_0px_#2D231E] px-4 py-2 font-['Press_Start_2P'] text-xs cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#2D231E]"
              >
                🐟 Feed Treat ({treatsCount})
              </button>
            </div>

            <div className="mt-6 pt-4 border-t-[2px] border-[#2D231E] flex flex-col sm:flex-row items-center justify-between font-['VT323'] text-2xl text-[#2D231E] gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span>Happiness:</span>
                  <div className="w-28 h-3.5 bg-[#F5EFEB] border-[2px] border-[#2D231E] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C87A5B] transition-all duration-300" style={{ width: `${happiness}%` }} />
                  </div>
                  <span className="font-bold">{happiness}%</span>
                </div>
                <div>Keystrokes: <span className="text-[#C87A5B] font-bold">{keystrokesCount}</span></div>
              </div>

              {treatsCount === 0 && (
                <button 
                  onClick={() => { setTreatsCount(5); setSpeechBubble("Treat box refilled for Pluto! 🐟🐟"); }}
                  className="text-xl text-[#C87A5B] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Restock Treats
                </button>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 🎨 6. SECTION 4 — SPRITE ASSET LIBRARY */}
      <section id="gallery" className="py-16 bg-[#F5EFEB]">
        <div className="max-w-[1120px] mx-auto w-full px-6">
          
          <h2 className="font-['Press_Start_2P'] text-xl text-[#2D231E] mb-8">
            Sprite Library → Transparent Pixel Assets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-[#F5EFEB] border-[2px] border-[#2D231E] shadow-[3px_3px_0px_#2D231E] p-4 text-center flex flex-col items-center justify-center rounded-md"
            >
              <div className="w-24 h-24 bg-[#EAE0D5] border-[2px] border-[#2D231E] rounded-md mb-3 flex items-center justify-center">
                <img src="/assets/pepperino.png" alt="Pepperino" className="w-[90px] h-[90px] image-rendering-pixelated object-contain" />
              </div>
              <div className="font-['Press_Start_2P'] text-xs text-[#2D231E] mb-1">Cat Sprite</div>
              <div className="font-['VT323'] text-lg text-[#2D231E]/70">assets/pepperino.png (90x90px)</div>
              <div className="font-['VT323'] text-lg text-[#2D231E] mt-2">Standard resting & walking sprite.</div>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-[#F5EFEB] border-[2px] border-[#2D231E] shadow-[3px_3px_0px_#2D231E] p-4 text-center flex flex-col items-center justify-center rounded-md"
            >
              <div className="w-24 h-24 bg-[#EAE0D5] border-[2px] border-[#2D231E] rounded-md mb-3 flex items-center justify-center">
                <img src="/assets/sleep.png" alt="Sleep" className="w-[95px] h-[95px] image-rendering-pixelated object-contain" />
              </div>
              <div className="font-['Press_Start_2P'] text-xs text-[#2D231E] mb-1">Sleeping Pose</div>
              <div className="font-['VT323'] text-lg text-[#2D231E]/70">assets/sleep.png (95x95px)</div>
              <div className="font-['VT323'] text-lg text-[#2D231E] mt-2">Dock sleeping pose sprite.</div>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-[#F5EFEB] border-[2px] border-[#2D231E] shadow-[3px_3px_0px_#2D231E] p-4 text-center flex flex-col items-center justify-center rounded-md"
            >
              <div className="w-24 h-24 bg-[#EAE0D5] border-[2px] border-[#2D231E] rounded-md mb-3 flex items-center justify-center gap-1">
                <img src="/assets/tyoe_left.png" alt="Left Paw" className="w-10 h-10 image-rendering-pixelated object-contain" />
                <img src="/assets/tyoe_right.png" alt="Right Paw" className="w-10 h-10 image-rendering-pixelated object-contain" />
              </div>
              <div className="font-['Press_Start_2P'] text-xs text-[#2D231E] mb-1">Bongo Paws</div>
              <div className="font-['VT323'] text-lg text-[#2D231E]/70">tyoe_left & tyoe_right.png</div>
              <div className="font-['VT323'] text-lg text-[#2D231E] mt-2">Bongo paws typing frames.</div>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-[#F5EFEB] border-[2px] border-[#2D231E] shadow-[3px_3px_0px_#2D231E] p-4 text-center flex flex-col items-center justify-center rounded-md"
            >
              <div className="w-24 h-24 bg-[#EAE0D5] border-[2px] border-[#2D231E] rounded-md mb-3 flex items-center justify-center">
                <img src="/assets/bongo_cat_frames/tyoe_frame_2.png" alt="Frame" className="w-16 h-16 image-rendering-pixelated object-contain" />
              </div>
              <div className="font-['Press_Start_2P'] text-xs text-[#2D231E] mb-1">12-Frame Anim</div>
              <div className="font-['VT323'] text-lg text-[#2D231E]/70">assets/bongo_cat_frames/*</div>
              <div className="font-['VT323'] text-lg text-[#2D231E] mt-2">12-Frame full typing sequence.</div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 🚀 7. SECTION 5 — QUICK SETUP & TERMINAL */}
      <section id="download" className="py-20 bg-[#F5EFEB]">
        <div className="max-w-[1120px] mx-auto w-full px-6">
          
          <div className="mb-8">
            <h2 className="font-['Press_Start_2P'] text-2xl md:text-3xl text-[#2D231E] mb-3">
              Get Started In 30s
            </h2>
            <p className="font-['VT323'] text-2xl text-[#2D231E]/70">
              Clone the repository and launch Pluto instantly on macOS, Linux, or Windows.
            </p>
          </div>

          {/* Terminal Container */}
          <div className="bg-[#2D231E] text-[#F5EFEB] border-[2.5px] border-[#2D231E] shadow-[6px_6px_0px_#C87A5B] p-6 rounded-md font-['VT323'] text-2xl relative">
            
            {/* Window Header */}
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#F5EFEB]/20">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] inline-block border border-black/20" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] inline-block border border-black/20" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] inline-block border border-black/20" />
              <span className="ml-3 font-mono text-xs text-[#F5EFEB]/60">bash — pixel-pet-setup</span>
            </div>

            {/* Command Line */}
            <div className="overflow-x-auto whitespace-nowrap py-2 flex items-center justify-between gap-4">
              <div>
                <span className="text-[#C87A5B] font-bold mr-2">$</span>
                <span>git clone https://github.com/diablovocado/Pixel-Pet.git && cd Pixel-Pet && npm install && npm start</span>
              </div>

              <button 
                onClick={copyInstallCommand}
                className="bg-[#F5EFEB] text-[#2D231E] hover:bg-[#E5B25D] border-[2px] border-[#2D231E] px-4 py-2 font-['Press_Start_2P'] text-xs cursor-pointer transition-all shrink-0 active:translate-x-[1px] active:translate-y-[1px]"
              >
                {copied ? '📋 Copied!' : '📋 Copy Command'}
              </button>
            </div>

          </div>

          {/* Primary Download CTA Button */}
          <div className="mt-8">
            <a 
              href="https://github.com/diablovocado/Pixel-Pet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#C87A5B] text-white border-[2.5px] border-[#2D231E] shadow-[4px_4px_0px_#2D231E] px-8 py-4 font-['Press_Start_2P'] text-sm hover:bg-[#b56b4e] inline-block cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#2D231E] transition-all"
            >
              Download Pluto App Package
            </a>
          </div>

        </div>
      </section>

      {/* 📄 8. FOOTER */}
      <footer className="bg-[#EAE0D5] border-t-[2.5px] border-[#2D231E] py-12">
        <div className="max-w-[1120px] mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-['VT323'] text-xl text-[#2D231E]">
          
          <div className="flex items-center gap-2">
            <img src="/assets/pepperino.png" alt="Pluto" className="w-5 h-5 image-rendering-pixelated" />
            <span className="font-['Press_Start_2P'] text-xs text-[#2D231E] mr-2">PLUTO</span>
            <span>Open Source Desktop Companion Under MIT License</span>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/diablovocado/Pixel-Pet" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#C87A5B] transition-colors"
            >
              GitHub Repository
            </a>
            <a 
              href="https://diablovocado.github.io/Pixel-Pet/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#C87A5B] transition-colors"
            >
              Live Demo
            </a>
          </div>

          <div>
            Crafted for cozy desktops • 2026
          </div>

        </div>
      </footer>

    </div>
  );
}
