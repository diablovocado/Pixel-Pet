import React, { useState, useEffect, useRef } from 'react';

// Hand-drawn & SVG Scrapbook Decorative Icons
const Icons = {
  Apple: () => (
    <svg className="w-5 h-5 fill-[#2D231E]" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.03c.67-.81 1.13-1.94.99-3.03-.97.04-2.16.65-2.85 1.46-.61.71-1.14 1.86-.99 2.97 1.09.08 2.2-.59 2.85-1.4" />
    </svg>
  ),
  Github: () => (
    <svg className="w-5 h-5 fill-[#2D231E]" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  DownArrow: () => (
    <svg className="w-4 h-4 text-[#2D231E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5 text-[#C87A5B] fill-[#C87A5B]" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  Fish: () => (
    <svg className="w-5 h-5 text-[#8A9A65]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 text-[#8A9A65]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4 text-[#2D231E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5 text-[#2D231E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5 text-[#E5B25D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Terminal: () => (
    <svg className="w-5 h-5 text-[#2D231E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
};

// Hand-drawn Decorative Art Illustrations
const ScrapbookArt = {
  // Detailed Hand-Drawn Vintage Typewriter Illustration
  Typewriter: () => (
    <div className="relative w-68 h-60 p-4 bg-[#EAE0D5] border-2 border-[#2D231E] rounded-3xl shadow-[5px_6px_0px_#2D231E] flex flex-col items-center justify-between">
      {/* Paper Sheet sticking out */}
      <div className="w-48 h-20 bg-[#F5EFEB] border-2 border-[#2D231E] rounded-t-lg p-2 flex flex-col items-center justify-center text-center shadow-inner">
        <span className="font-hand text-base font-bold text-[#2D231E]">Keyboard Instructions</span>
        <span className="font-mono text-[10px] text-[#8C5A3C] font-semibold mt-0.5">Press any key to test Pluto!</span>
      </div>

      {/* Roller Bar */}
      <div className="w-56 h-5 bg-[#2D231E] rounded-full my-1 flex items-center justify-between px-3">
        <div className="w-3 h-3 bg-[#E5B25D] rounded-full border border-white" />
        <div className="w-3 h-3 bg-[#E5B25D] rounded-full border border-white" />
      </div>

      {/* Main Metal Body */}
      <div className="w-60 h-28 bg-[#C87A5B]/30 border-2 border-[#2D231E] rounded-2xl p-2.5 flex flex-col justify-between shadow-sm">
        <div className="text-center font-hand font-bold text-xs text-[#2D231E] tracking-wider uppercase">
          ★ PLUTO TYPEWRITER ★
        </div>
        <div className="grid grid-cols-7 gap-1 px-1">
          {['Q','W','E','R','T','Y','U','I','O','P','A','S','D','F'].map((char, i) => (
            <div 
              key={i} 
              className="w-5 h-5 rounded-full bg-[#F5EFEB] border border-[#2D231E] flex items-center justify-center font-mono text-[8px] font-bold text-[#2D231E] shadow-[1px_1px_0px_#2D231E]"
            >
              {char}
            </div>
          ))}
        </div>
        <div className="w-36 h-3 mx-auto bg-[#F5EFEB] border border-[#2D231E] rounded-md shadow-[1px_1px_0px_#2D231E]" />
      </div>
    </div>
  ),

  // Floating 3D Keycap Graphic
  Keycap: ({ label }: { label: string }) => (
    <div className="relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#F5EFEB] border-2 border-[#2D231E] shadow-[2px_2px_0px_#2D231E] font-mono font-bold text-sm text-[#2D231E] transform hover:-translate-y-0.5 transition-transform">
      {label || 'N'}
    </div>
  )
};

// Bongo Cat frame sequence paths
const BONGO_FRAMES = Array.from({ length: 12 }, (_, i) => `/assets/bongo_cat_frames/tyoe_frame_${i}.png`);

export default function App() {
  const [activeTab, setActiveTab] = useState<'walk' | 'sleep' | 'bongo' | 'excited' | 'petting'>('bongo');
  const [happiness, setHappiness] = useState(98);
  const [treatsCount, setTreatsCount] = useState(5);
  const [copied, setCopied] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("Meow! I'm Pluto! Type on your keyboard or use the input box to see me react! 🐾");
  const [bongoFrameIdx, setBongoFrameIdx] = useState(0);

  // Real-time typing states
  const [kps, setKps] = useState(0);
  const [keystrokesCount, setKeystrokesCount] = useState(0);
  const [testInputText, setTestInputText] = useState("");
  const [lastKeyTyped, setLastKeyTyped] = useState("N");
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

  // Load all Pluto PNG assets
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
        setSpeechBubble(`🔥 HIGH SPEED TYPING! ${currentKps} KPS! PLUTO IS SLAMMING PAWS FAST! 🎹⚡`);
      } else if (currentKps > 2) {
        setSpeechBubble(`⚡ Typing at ${currentKps} KPS! Key '${keyChar}' pressed! 🎵`);
      } else {
        setSpeechBubble(`Keystroke detected! Key '${keyChar}' • Pluto is reacting! 🐾`);
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

  // Automatic Idle Bongo frame ticker when not typing fast
  useEffect(() => {
    if (activeTab !== 'bongo') return;
    const speed = kps > 5 ? 50 : kps > 0 ? 80 : 120;
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
        ctx.font = '14px "Caveat", cursive';
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
        ctx.font = '14px sans-serif';
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
    navigator.clipboard.writeText('git clone https://github.com/diablovocado/Pixel-Pet.git && cd Pixel-Pet && npm install && npm start');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFeed = () => {
    if (treatsCount > 0) {
      setTreatsCount(prev => prev - 1);
      setHappiness(prev => Math.min(100, prev + 10));
      setActiveTab('excited');
      setSpeechBubble("YUMMY! Fish treat devoured! Pluto is super happy! 🐟✨");
      setTimeout(() => setSpeechBubble("Purrrrr! Pluto loves you! 🥰"), 2500);
    } else {
      setSpeechBubble("Treat box empty! Click '+ Restock Treats' to get more for Pluto! 📦");
    }
  };

  const handlePet = () => {
    setActiveTab('petting');
    setHappiness(prev => Math.min(100, prev + 5));
    setSpeechBubble("Purrrrrrr! You petted Pluto! ❤️");
  };

  return (
    <div className="min-h-screen bg-paper-grain text-[#2D231E] font-sans relative selection:bg-[#E5B25D] selection:text-[#2D231E]">
      
      {/* 1. TOP NAVBAR (Clean Translucent Paper Style) */}
      <header className="sticky top-0 z-50 bg-[#F5EFEB]/95 backdrop-blur-md border-b-2 border-[#2D231E]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Left */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#EAE0D5] border-2 border-[#2D231E] flex items-center justify-center shadow-[2px_3px_0px_#2D231E] overflow-hidden">
              <img src="/assets/pepperino.png" alt="Pluto Logo" className="w-8 h-8 rendering-pixelated object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-2xl text-[#2D231E]">Pluto</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E5B25D]/50 text-[#2D231E] font-mono font-bold border border-[#2D231E] shadow-[1px_1px_0px_#2D231E]">
                v1.0
              </span>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-base font-heading font-bold text-[#2D231E]">
            <a href="#overview" className="hover:text-[#C87A5B] transition-colors">Features</a>
            <a href="#playground" className="hover:text-[#C87A5B] transition-colors">Setup</a>
            <a href="#gallery" className="hover:text-[#C87A5B] transition-colors">Assets</a>
            <a href="https://github.com/diablovocado/Pixel-Pet" target="_blank" rel="noreferrer" className="hover:text-[#C87A5B] transition-colors flex items-center gap-1.5">
              <Icons.Github /> GitHub
            </a>
          </nav>

          {/* Right Action CTA Button */}
          <div className="flex items-center gap-3">
            <a 
              href="#download"
              className="px-6 py-3 bg-[#EAE0D5] border-2 border-[#2D231E] shadow-[3px_3px_0px_#2D231E] hover:bg-[#E5B25D]/40 text-[#2D231E] font-heading text-sm font-extrabold rounded-full transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Icons.Apple />
              <span>Get Pluto App</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. PAGE 1: UNBOXED HERO SECTION DIRECTLY OVER COZY PIXEL ROOM (100vh Full Screen) */}
      <section className="h-[calc(100vh-80px)] min-h-[660px] relative flex flex-col justify-between items-center px-6 py-6 text-center overflow-hidden">
        
        {/* Full-Screen Cozy Pixel Room Background Image */}
        <div className="absolute inset-0 bg-[url('/assets/hero_cozy_room.jpg')] bg-cover bg-center bg-no-repeat" />
        
        {/* Soft Darkening Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D231E]/30 via-black/25 to-[#F5EFEB]" />

        {/* Top Floating Badge */}
        <div className="relative z-10 pt-2">
          <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-[#F5EFEB]/90 backdrop-blur-md border-2 border-[#2D231E] shadow-[3px_3px_0px_#2D231E] text-[#2D231E] text-base font-hand font-extrabold">
            <img src="/assets/pepperino.png" alt="Pluto" className="w-5 h-5 rendering-pixelated" />
            <span>✨ Meet Pluto — 100% Free & Open Source Desktop Companion</span>
          </div>
        </div>

        {/* Central Display: UNBOXED BOLD DOODLY TYPOGRAPHY Directly Over Pixel Room */}
        <div className="relative z-10 my-auto max-w-4xl w-full px-4 flex flex-col items-center justify-center space-y-5">
          
          {/* Pluto Cat Mascot sitting on the background desk */}
          <div className="relative cursor-pointer group" onClick={handlePet}>
            <div className="w-40 h-8 bg-[#C87A5B]/40 rounded-full blur-md absolute -bottom-2 left-1/2 transform -translate-x-1/2" />
            <img 
              src="/assets/pepperino.png" 
              alt="Pluto Cat Mascot" 
              className="w-40 h-40 sm:w-48 sm:h-48 rendering-pixelated relative z-10 transform hover:scale-110 transition-transform duration-300 drop-shadow-2xl" 
            />
          </div>

          {/* Large Bold Doodly Title */}
          <div className="space-y-1">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-hand font-extrabold tracking-tight text-[#F5EFEB] doodly-title-stroke leading-none">
              <span className="watercolor-brush-highlight">PLUTO</span>
            </h1>
            <p className="text-3xl sm:text-4xl font-hand font-extrabold text-[#E5B25D] doodly-text-stroke tracking-wide pt-2">
              Pixel-Pet v1.0 • Your Desktop Companion
            </p>
          </div>

          {/* Large Bold Doodly Description */}
          <p className="text-2xl sm:text-3xl font-hand font-extrabold text-[#F5EFEB] doodly-text-stroke max-w-3xl mx-auto leading-relaxed px-2">
            Transparent overlay, click-through everywhere except her body, zero rendering glitches or input conflicts. Pure native desk serotonin.
          </p>

          {/* Dual Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 w-full sm:w-auto">
            <a
              href="#download"
              className="w-full sm:w-auto px-9 py-4 bg-[#C87A5B] hover:bg-[#B5684A] text-[#F5EFEB] border-2.5 border-[#2D231E] shadow-[5px_6px_0px_#2D231E] font-heading font-extrabold text-xl rounded-full transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
            >
              <Icons.Apple />
              <span>Download Pluto for macOS</span>
            </a>

            <a
              href="https://github.com/diablovocado/Pixel-Pet"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-9 py-4 bg-[#F5EFEB] hover:bg-[#E5B25D]/40 text-[#2D231E] border-2.5 border-[#2D231E] shadow-[5px_6px_0px_#2D231E] font-heading font-extrabold text-xl rounded-full transition-all text-base flex items-center justify-center gap-3"
            >
              <Icons.Github />
              <span>⭐ Star on GitHub</span>
            </a>
          </div>

        </div>

        {/* Bottom Scroll Indicator Pill */}
        <div className="relative z-10 pb-3">
          <a 
            href="#overview" 
            className="px-6 py-2.5 rounded-full bg-[#F5EFEB]/95 backdrop-blur-md border-2 border-[#2D231E] shadow-[4px_4px_0px_#2D231E] text-base font-heading font-extrabold text-[#2D231E] hover:bg-[#E5B25D]/40 transition-all inline-flex items-center gap-2 group"
          >
            <span className="group-hover:translate-y-0.5 transition-transform">Scroll to Explore ↓</span>
            <Icons.DownArrow />
          </a>
        </div>
      </section>

      {/* PAGE 2: SCROLL DOWN CONTENT & FEATURES */}
      
      {/* SECTION 2: INTRO & FEATURE CHIPS */}
      <section id="overview" className="py-24 px-6 max-w-6xl mx-auto border-t-2 border-[#2D231E]">
        <div className="bg-[#EAE0D5] border-2.5 border-[#2D231E] shadow-[6px_8px_0px_#2D231E] rounded-3xl p-8 sm:p-12 text-center space-y-8 relative">
          
          <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-[#2D231E] leading-tight">
            A Living Pixel Cat for Your Mac Desktop
          </h2>

          <p className="text-xl sm:text-2xl font-hand font-bold text-[#2D231E]/85 max-w-3xl mx-auto leading-relaxed">
            Pluto sits on your dock, sleeps when you step away, reacts to typing speed, and plays Bongo drums right on your screen.
          </p>

          {/* 4 Feature Chips */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left font-hand font-bold">
            <div className="p-5 bg-[#F5EFEB] border-2 border-[#2D231E] shadow-[4px_4px_0px_#2D231E] rounded-2xl flex items-center gap-3">
              <span className="text-3xl">💾</span>
              <div>
                <div className="font-heading font-extrabold text-lg text-[#2D231E]">0.1% CPU Usage</div>
                <div className="text-xs text-[#8C5A3C] font-mono">Ultra Lightweight</div>
              </div>
            </div>

            <div className="p-5 bg-[#F5EFEB] border-2 border-[#2D231E] shadow-[4px_4px_0px_#2D231E] rounded-2xl flex items-center gap-3">
              <span className="text-3xl">💼</span>
              <div>
                <div className="font-heading font-extrabold text-lg text-[#2D231E]">~15MB RAM Footprint</div>
                <div className="text-xs text-[#8C5A3C] font-mono">Minimal Memory</div>
              </div>
            </div>

            <div className="p-5 bg-[#F5EFEB] border-2 border-[#2D231E] shadow-[4px_4px_0px_#2D231E] rounded-2xl flex items-center gap-3">
              <span className="text-3xl">🌐</span>
              <div>
                <div className="font-heading font-extrabold text-lg text-[#2D231E]">100% Offline & Private</div>
                <div className="text-xs text-[#8C5A3C] font-mono">Zero Analytics</div>
              </div>
            </div>

            <div className="p-5 bg-[#F5EFEB] border-2 border-[#2D231E] shadow-[4px_4px_0px_#2D231E] rounded-2xl flex items-center gap-3">
              <span className="text-3xl">🖥</span>
              <div>
                <div className="font-heading font-extrabold text-lg text-[#2D231E]">macOS Silicon & Intel</div>
                <div className="text-xs text-[#8C5A3C] font-mono">Universal Build</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE TYPING CANVAS DEMO */}
      <section id="playground" className="py-20 px-6 max-w-6xl mx-auto border-t-2 border-[#2D231E]">
        
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-base font-hand text-[#C87A5B] uppercase tracking-widest font-bold">Interactive Sandbox</h2>
          <p className="text-4xl sm:text-5xl font-heading font-extrabold text-[#2D231E]">Test Pluto's Reactions Live</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Vintage Typewriter */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <ScrapbookArt.Typewriter />
          </div>

          {/* Right Side: Mechanical Framing Box Canvas */}
          <div className="lg:col-span-8 bg-[#EAE0D5] border-2.5 border-[#2D231E] shadow-[6px_7px_0px_#2D231E] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#2D231E]">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-[#C87A5B] border border-[#2D231E] inline-block" />
                <span className="font-heading font-extrabold text-lg text-[#2D231E] tracking-wide">
                  LIVE PLUTO TYPING CANVAS
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-sm font-bold text-[#2D231E]">
                <span>Typing Speed:</span>
                <span className="px-3 py-1 rounded-full bg-[#E5B25D]/50 border-2 border-[#2D231E]">
                  + {kps} KPS
                </span>
              </div>
            </div>

            <div className="mt-5 mb-4">
              <input
                type="text"
                value={testInputText}
                onChange={(e) => setTestInputText(e.target.value)}
                placeholder="Type anything here to see Pluto react in real time..."
                className="w-full bg-[#F5EFEB] border-2 border-[#2D231E] rounded-2xl px-5 py-4 text-base sm:text-lg text-[#2D231E] placeholder-[#2D231E]/50 font-hand font-bold focus:outline-none focus:bg-white transition-colors shadow-inner"
              />
            </div>

            <div className="mb-4 bg-[#8A9A65]/25 border-2 border-[#2D231E] p-4 rounded-2xl text-[#2D231E] text-base font-hand font-bold flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span>💬 Keystroke detected! Key '{lastKeyTyped}' • Pluto is reacting!</span>
              </div>
              <ScrapbookArt.Keycap label={lastKeyTyped} />
            </div>

            <div 
              onClick={handlePet}
              className="relative bg-[#F5EFEB] rounded-2xl border-2 border-[#2D231E] h-64 flex items-center justify-center cursor-pointer overflow-hidden group shadow-inner"
            >
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full rendering-pixelated" />
              
              <div className="absolute top-4 right-4 text-sm font-heading font-extrabold text-[#2D231E] bg-[#EAE0D5] px-4 py-2 rounded-full border-2 border-[#2D231E] shadow-[2px_2px_0px_#2D231E] pointer-events-none flex items-center gap-2">
                <img src="/assets/pepperino.png" alt="Pluto" className="w-4 h-4 rendering-pixelated" />
                <span>🐾 Click Canvas to Pet Pluto!</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-heading font-extrabold text-sm">
              <button
                onClick={() => { setActiveTab('walk'); setSpeechBubble("Pluto is walking along the dock... 🐾"); }}
                className={`px-3 py-3.5 rounded-xl border-2 border-[#2D231E] transition-all flex items-center justify-center gap-2 ${activeTab === 'walk' ? 'bg-[#C87A5B] text-[#F5EFEB] shadow-[3px_3px_0px_#2D231E]' : 'bg-[#F5EFEB] text-[#2D231E] hover:bg-[#E5B25D]/30 shadow-[2px_2px_0px_#2D231E]'}`}
              >
                <img src="/assets/pepperino.png" alt="Walk" className="w-4 h-4 rendering-pixelated" />
                <span>Walk Patrol</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('sleep'); setSpeechBubble("Shhh... Pluto is sleeping! Zzz... 💤"); }}
                className={`px-3 py-3.5 rounded-xl border-2 border-[#2D231E] transition-all flex items-center justify-center gap-2 ${activeTab === 'sleep' ? 'bg-[#C87A5B] text-[#F5EFEB] shadow-[3px_3px_0px_#2D231E]' : 'bg-[#F5EFEB] text-[#2D231E] hover:bg-[#E5B25D]/30 shadow-[2px_2px_0px_#2D231E]'}`}
              >
                <img src="/assets/sleep.png" alt="Sleep" className="w-4 h-4 rendering-pixelated" />
                <span>Sleep (AFK)</span>
              </button>

              <button
                onClick={() => { setActiveTab('bongo'); setSpeechBubble("Pluto Bongo mode! Slamming paws on keyboard! 🎹⚡"); }}
                className={`px-3 py-3.5 rounded-xl border-2 border-[#2D231E] transition-all flex items-center justify-center gap-2 ${activeTab === 'bongo' ? 'bg-[#C87A5B] text-[#F5EFEB] shadow-[3px_3px_0px_#2D231E]' : 'bg-[#F5EFEB] text-[#2D231E] hover:bg-[#E5B25D]/30 shadow-[2px_2px_0px_#2D231E]'}`}
              >
                <img src="/assets/tyoe_left.png" alt="Bongo" className="w-4 h-4 rendering-pixelated" />
                <span>Bongo Typing</span>
              </button>

              <button
                onClick={handlePet}
                className="px-3 py-3.5 rounded-xl border-2 border-[#2D231E] bg-[#F5EFEB] hover:bg-[#C87A5B]/20 text-[#2D231E] shadow-[2px_2px_0px_#2D231E] flex items-center justify-center gap-1.5"
              >
                <Icons.Heart /> Pet Pluto
              </button>

              <button
                onClick={handleFeed}
                className="px-3 py-3.5 rounded-xl border-2 border-[#2D231E] bg-[#F5EFEB] hover:bg-[#8A9A65]/30 text-[#2D231E] shadow-[2px_2px_0px_#2D231E] flex items-center justify-center gap-1.5"
              >
                <Icons.Fish /> Feed ({treatsCount})
              </button>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-[#2D231E] flex flex-col sm:flex-row items-center justify-between text-sm text-[#2D231E] font-hand font-bold gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span>Pluto's Happiness:</span>
                  <div className="w-28 h-3.5 bg-[#F5EFEB] border-2 border-[#2D231E] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C87A5B] transition-all duration-300" style={{ width: `${happiness}%` }} />
                  </div>
                  <span className="font-bold">{happiness}%</span>
                </div>
                <div>Keys Typed: <span className="text-[#C87A5B] font-bold">{keystrokesCount}</span></div>
                <div>Treats Left: <span className="text-[#8A9A65] font-bold">{treatsCount}</span></div>
              </div>

              {treatsCount === 0 && (
                <button 
                  onClick={() => { setTreatsCount(5); setSpeechBubble("Treat box refilled for Pluto! 🐟🐟"); }}
                  className="text-sm text-[#C87A5B] hover:underline font-bold"
                >
                  + Restock Treats
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SPRITE GALLERY */}
      <section id="gallery" className="py-20 px-6 max-w-7xl mx-auto border-t-2 border-[#2D231E]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-base font-hand text-[#C87A5B] uppercase tracking-widest font-bold">Pluto Sprite Library</h2>
          <p className="text-4xl sm:text-5xl font-heading font-extrabold text-[#2D231E]">Built With Transparent Pixel Assets</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-[#EAE0D5] border-2 border-[#2D231E] shadow-[4px_4px_0px_#2D231E] rounded-2xl flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 bg-[#F5EFEB] border-2 border-[#2D231E] rounded-xl p-2 flex items-center justify-center">
              <img src="/assets/pepperino.png" alt="Pluto Sprite" className="w-16 h-16 rendering-pixelated object-contain" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#2D231E] mb-1">Pluto Cat Sprite</h4>
            <p className="text-[#8C5A3C] text-xs font-mono">assets/pepperino.png</p>
            <p className="text-[#2D231E]/80 text-sm font-hand font-semibold mt-2">Main Pluto pixel cat mascot that walks along screen dock.</p>
          </div>

          <div className="p-6 bg-[#EAE0D5] border-2 border-[#2D231E] shadow-[4px_4px_0px_#2D231E] rounded-2xl flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 bg-[#F5EFEB] border-2 border-[#2D231E] rounded-xl p-2 flex items-center justify-center">
              <img src="/assets/sleep.png" alt="Pluto Sleeping" className="w-20 h-20 rendering-pixelated object-contain" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#2D231E] mb-1">Sleeping Pluto Asset</h4>
            <p className="text-[#8C5A3C] text-xs font-mono">assets/sleep.png</p>
            <p className="text-[#2D231E]/80 text-sm font-hand font-semibold mt-2">Triggered automatically when system is idle.</p>
          </div>

          <div className="p-6 bg-[#EAE0D5] border-2 border-[#2D231E] shadow-[4px_4px_0px_#2D231E] rounded-2xl flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 bg-[#F5EFEB] border-2 border-[#2D231E] rounded-xl p-2 flex items-center justify-center">
              <img src="/assets/tyoe_left.png" alt="Pluto Bongo Left" className="w-16 h-16 rendering-pixelated object-contain" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#2D231E] mb-1">Pluto Bongo Paws</h4>
            <p className="text-[#8C5A3C] text-xs font-mono">assets/tyoe_left.png</p>
            <p className="text-[#2D231E]/80 text-sm font-hand font-semibold mt-2">Pluto slams paws in sync with typing speed.</p>
          </div>

          <div className="p-6 bg-[#EAE0D5] border-2 border-[#2D231E] shadow-[4px_4px_0px_#2D231E] rounded-2xl flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 bg-[#F5EFEB] border-2 border-[#2D231E] rounded-xl p-2 flex items-center justify-center">
              <img src="/assets/bongo_cat_frames/tyoe_frame_2.png" alt="Frame" className="w-16 h-16 rendering-pixelated object-contain" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#2D231E] mb-1">12-Frame Animation</h4>
            <p className="text-[#8C5A3C] text-xs font-mono">assets/bongo_cat_frames/*</p>
            <p className="text-[#2D231E]/80 text-sm font-hand font-semibold mt-2">Clean transparent PNG frame sequence for Pluto's typing.</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: QUICK SETUP & DOWNLOAD */}
      <section id="download" className="py-20 px-6 max-w-5xl mx-auto border-t-2 border-[#2D231E]">
        <div className="bg-[#EAE0D5] border-2.5 border-[#2D231E] shadow-[6px_8px_0px_#2D231E] rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-6">
            <h2 className="text-4xl font-heading font-extrabold text-[#2D231E]">Get Started With Pluto in 30 Seconds</h2>
            <p className="text-[#2D231E]/80 text-xl font-hand font-semibold leading-relaxed">
              Clone the repository and launch Pluto instantly on macOS, Linux, or Windows.
            </p>

            <div className="bg-[#F5EFEB] rounded-2xl p-4 border-2 border-[#2D231E] font-mono text-xs text-[#2D231E] flex items-center justify-between gap-4 overflow-x-auto shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-[#C87A5B] font-bold">$</span>
                <span>git clone https://github.com/diablovocado/Pixel-Pet.git && cd Pixel-Pet && npm install && npm start</span>
              </div>
              <button 
                onClick={copyInstallCommand}
                className="px-3.5 py-2 rounded-xl bg-[#EAE0D5] border border-[#2D231E] hover:bg-[#E5B25D]/40 text-[#2D231E] flex items-center gap-1.5 transition-colors shrink-0 font-heading font-extrabold"
              >
                {copied ? <Icons.Check /> : <Icons.Copy />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="https://github.com/diablovocado/Pixel-Pet/releases"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-[#C87A5B] hover:bg-[#B5684A] text-[#F5EFEB] border-2.5 border-[#2D231E] shadow-[4px_5px_0px_#2D231E] font-heading font-extrabold text-base rounded-full flex items-center gap-2.5"
              >
                <Icons.Download />
                <span>Download Pluto App Package</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t-2 border-[#2D231E] text-center text-base font-hand font-bold text-[#2D231E]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/assets/pepperino.png" alt="Pluto" className="w-5 h-5 rendering-pixelated" />
            <span>© {new Date().getFullYear()} Pluto (Pixel-Pet). Open source under MIT License.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/diablovocado/Pixel-Pet" target="_blank" rel="noreferrer" className="hover:text-[#C87A5B] transition-colors">GitHub Repository</a>
            <a href="#playground" className="hover:text-[#C87A5B] transition-colors">Live Pluto Demo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
