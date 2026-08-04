import React, { useState, useEffect, useRef } from 'react';

// Crisp SVG Icons
const Icons = {
  Terminal: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Github: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5 text-pink-500 fill-pink-500" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  Fish: () => (
    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Apple: () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.03c.67-.81 1.13-1.94.99-3.03-.97.04-2.16.65-2.85 1.46-.61.71-1.14 1.86-.99 2.97 1.09.08 2.2-.59 2.85-1.4" />
    </svg>
  ),
  Keyboard: () => (
    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  )
};

// Bongo Cat frame sequence paths
const BONGO_FRAMES = Array.from({ length: 12 }, (_, i) => `/assets/bongo_cat_frames/tyoe_frame_${i}.png`);

export default function App() {
  const [activeTab, setActiveTab] = useState<'walk' | 'sleep' | 'bongo' | 'excited' | 'petting'>('bongo');
  const [happiness, setHappiness] = useState(98);
  const [treatsCount, setTreatsCount] = useState(5);
  const [copied, setCopied] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("Type on your keyboard anywhere or use the input box to see Bongo Cat react! 🎹⚡");
  const [bongoFrameIdx, setBongoFrameIdx] = useState(0);

  // Real-time typing states
  const [kps, setKps] = useState(0);
  const [keystrokesCount, setKeystrokesCount] = useState(0);
  const [testInputText, setTestInputText] = useState("");
  const keystrokeTimestampsRef = useRef<number[]>([]);
  const lastKeyTypedRef = useRef<string>("");

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

  // Load all PNG assets
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

    // Preload Bongo Cat frame sequence
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
      lastKeyTypedRef.current = e.key.length === 1 ? e.key.toUpperCase() : e.key;

      // Filter timestamps older than 1000ms
      keystrokeTimestampsRef.current = keystrokeTimestampsRef.current.filter(t => now - t <= 1000);
      const currentKps = keystrokeTimestampsRef.current.length;
      setKps(currentKps);
      setKeystrokesCount(prev => prev + 1);

      // Automatically switch to Bongo Cat mode when user types
      setActiveTab('bongo');

      // Advance Bongo Cat frame sequence immediately on keystroke
      setBongoFrameIdx(prev => (prev + 1) % BONGO_FRAMES.length);

      // Dynamic speech bubble updates
      if (currentKps > 7) {
        setSpeechBubble(`🔥 HIGH SPEED TYPING! ${currentKps} KPS! BONGO CAT IS SLAMMING PAWS FAST! 🎹⚡`);
      } else if (currentKps > 2) {
        setSpeechBubble(`⚡ Typing at ${currentKps} KPS! Key '${lastKeyTypedRef.current}' pressed! 🎵`);
      } else {
        setSpeechBubble(`Keystroke detected! Key '${lastKeyTypedRef.current}' • Bongo Cat reacting! 🐾`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // KPS Decay Ticker (resets KPS to 0 when user stops typing)
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

  // Main Canvas Render Loop with true 1:1 aspect ratio & Typing Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Desktop Dock line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 175);
      ctx.lineTo(canvas.width - 15, 175);
      ctx.stroke();

      // Move cat if walking
      if (activeTab === 'walk') {
        catPosRef.current.x += 1.4 * catPosRef.current.dir;
        if (catPosRef.current.x > canvas.width - 120) catPosRef.current.dir = -1;
        if (catPosRef.current.x < 30) catPosRef.current.dir = 1;
      }

      const { x, dir } = catPosRef.current;

      ctx.save();

      if (activeTab === 'sleep') {
        // Draw Sleeping Cat asset (95x95)
        const sleepImg = imagesRef.current.sleep;
        if (sleepImg) {
          ctx.drawImage(sleepImg, 270, 80, 95, 95);
        }

        // Animated Zzz particles
        const zOffset = Math.sin(Date.now() / 250) * 6;
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = '#c084fc';
        ctx.fillText('Z z z...', 365, 80 + zOffset);
      } else if (activeTab === 'bongo') {
        // Draw Bongo Cat Frame with true square aspect ratio (110x110)
        const currentFrameImg = imagesRef.current.bongoFrames[bongoFrameIdx];
        if (currentFrameImg && currentFrameImg.complete) {
          ctx.drawImage(currentFrameImg, 265, 62, 110, 110);
        } else if (imagesRef.current.bongoLeft) {
          ctx.drawImage(imagesRef.current.bongoLeft, 265, 62, 110, 110);
        }

        // Live Musical Notes & Key Burst Particles when typing
        if (kps > 0) {
          const noteY = Math.sin(Date.now() / 100) * 8;
          ctx.font = '16px sans-serif';
          ctx.fillText('🎵', 240, 65 + noteY);
          ctx.fillText('🎶', 380, 55 - noteY);

          if (lastKeyTypedRef.current) {
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = '#ec4899';
            ctx.fillText(`[${lastKeyTypedRef.current}]`, 310, 48 + noteY);
          }
        }
      } else if (activeTab === 'excited') {
        // Bounce Pepperino Cat asset (90x90)
        const bounceY = Math.abs(Math.sin(Date.now() / 140)) * 20;
        const pepImg = imagesRef.current.pepperino;
        if (pepImg) {
          ctx.drawImage(pepImg, 275, 85 - bounceY, 90, 90);
        }

        // Sparkle effects
        ctx.font = '16px sans-serif';
        ctx.fillText('✨', 245, 80 - bounceY);
        ctx.fillText('💖', 375, 70 - bounceY);
      } else if (activeTab === 'petting') {
        // Petting cat purr wobble
        const wobbleX = Math.sin(Date.now() / 80) * 3;
        const pepImg = imagesRef.current.pepperino;
        if (pepImg) {
          ctx.drawImage(pepImg, 275 + wobbleX, 85, 90, 90);
        }
        ctx.font = '14px sans-serif';
        ctx.fillText('🥰', 360, 80);
      } else {
        // Walk mode with real Pepperino asset (90x90)
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
  }, [activeTab, bongoFrameIdx, kps]);

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
      setSpeechBubble("YUMMY! Fish treat devoured! 🐟✨");
      setTimeout(() => setSpeechBubble("Purrrrr! Pixel Cat is super happy! 🥰"), 2500);
    } else {
      setSpeechBubble("Treat box empty! Click '+ Restock Treats' to get more! 📦");
    }
  };

  const handlePet = () => {
    setActiveTab('petting');
    setHappiness(prev => Math.min(100, prev + 5));
    setSpeechBubble("Purrrrrrr! You petted Pixel Cat! ❤️");
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-sans bg-grid-pattern relative selection:bg-purple-600 selection:text-white">
      {/* Glow Backdrops */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090a0f]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden">
              <img src="/assets/pepperino.png" alt="Pixel Pet Logo" className="w-8 h-8 rendering-pixelated object-contain" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight font-mono text-white flex items-center gap-2">
                Pixel-Pet <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-sans font-medium border border-purple-500/30">v1.0</span>
              </div>
              <p className="text-xs text-slate-400 font-sans">Retro Desktop Companion</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#playground" className="hover:text-purple-400 transition-colors">Live Canvas Demo</a>
            <a href="#gallery" className="hover:text-purple-400 transition-colors">Cat Assets Showcase</a>
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#download" className="hover:text-purple-400 transition-colors">Download</a>
            <a href="https://github.com/diablovocado/Pixel-Pet" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
              <Icons.Github /> GitHub
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a 
              href="#download"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Icons.Download />
              <span>Get Pixel-Pet</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-mono shadow-inner">
            <img src="/assets/pepperino.png" alt="Icon" className="w-4 h-4 rendering-pixelated" />
            <span>100% Free & Open Source Desktop Companion</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Your Intelligent Retro <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Desktop Pixel Pet
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 font-sans leading-relaxed">
            A tiny pixel cat that walks along your dock, sleeps when you step away, reacts to typing speed, and plays Bongo drums right on your screen.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#download"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-xl shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 text-base flex items-center justify-center gap-3"
            >
              <Icons.Apple />
              <span>Download for macOS</span>
            </a>
            
            <a
              href="https://github.com/diablovocado/Pixel-Pet"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold transition-all text-base flex items-center justify-center gap-3"
            >
              <Icons.Github />
              <span>Star on GitHub</span>
            </a>
          </div>

          {/* Quick Specs */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-slate-400">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">⚡ &lt; 0.1% CPU Usage</div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">💾 ~15MB RAM Footprint</div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">🔒 100% Offline & Private</div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">🖥️ Cross-Platform</div>
          </div>
        </div>

        {/* Live Interactive Pet Canvas Playground */}
        <div id="playground" className="mt-14 max-w-4xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Controls Bar Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold">Live Interactive Typing Canvas</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="text-slate-400">Typing Speed:</span>
              <span className={`px-2.5 py-0.5 rounded font-bold border ${kps > 0 ? 'bg-purple-950 text-purple-300 border-purple-500/40 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                ⚡ {kps} KPS
              </span>
            </div>
          </div>

          {/* Interactive Typing Input Box */}
          <div className="mt-4 mb-3">
            <input
              type="text"
              value={testInputText}
              onChange={(e) => setTestInputText(e.target.value)}
              placeholder="Type anything on your keyboard here to see Bongo Cat react in real time... 🎹"
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/80 rounded-xl px-4 py-3 text-sm text-purple-200 placeholder-slate-500 font-mono focus:outline-none transition-colors shadow-inner"
            />
          </div>

          {/* Speech Bubble Banner */}
          <div className="mb-3 bg-purple-950/70 border border-purple-500/30 p-3 rounded-xl text-purple-200 text-xs font-mono text-center shadow-inner flex items-center justify-center gap-2">
            <span>💬</span>
            <span>{speechBubble}</span>
          </div>

          {/* Canvas Box */}
          <div 
            onClick={handlePet}
            className="relative bg-slate-950 rounded-2xl border border-slate-800 h-60 flex items-center justify-center cursor-pointer overflow-hidden group shadow-inner"
          >
            <canvas ref={canvasRef} width={640} height={210} className="w-full h-full rendering-pixelated" />
            <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 pointer-events-none flex items-center gap-1.5">
              <img src="/assets/pepperino.png" alt="Cat" className="w-3.5 h-3.5 rendering-pixelated" />
              <span>Click Canvas to Pet!</span>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => { setActiveTab('walk'); setSpeechBubble("Walking along the dock... 🐾"); }}
              className={`px-3 py-3 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'walk' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'}`}
            >
              <img src="/assets/pepperino.png" alt="Walk" className="w-4 h-4 rendering-pixelated" />
              <span>Walk Patrol</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('sleep'); setSpeechBubble("Shhh... Cat is sleeping! Zzz... 💤"); }}
              className={`px-3 py-3 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'sleep' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'}`}
            >
              <img src="/assets/sleep.png" alt="Sleep" className="w-4 h-4 rendering-pixelated" />
              <span>Sleep (AFK)</span>
            </button>

            <button
              onClick={() => { setActiveTab('bongo'); setSpeechBubble("Bongo Cat mode! Slamming paws on keyboard! 🎹⚡"); }}
              className={`px-3 py-3 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'bongo' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'}`}
            >
              <img src="/assets/tyoe_left.png" alt="Bongo" className="w-4 h-4 rendering-pixelated" />
              <span>Bongo Typing</span>
            </button>

            <button
              onClick={handlePet}
              className="px-3 py-3 rounded-xl text-xs font-mono font-medium transition-all bg-pink-950/50 text-pink-300 border border-pink-500/30 hover:bg-pink-900/60 flex items-center justify-center gap-1.5"
            >
              <Icons.Heart /> Pet Cat
            </button>

            <button
              onClick={handleFeed}
              className="px-3 py-3 rounded-xl text-xs font-mono font-medium transition-all bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60 flex items-center justify-center gap-1.5"
            >
              <Icons.Fish /> Feed ({treatsCount})
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span>Happiness:</span>
                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300" style={{ width: `${happiness}%` }} />
                </div>
                <span className="text-white font-bold">{happiness}%</span>
              </div>
              <div>Keys Typed: <span className="text-purple-400 font-bold">{keystrokesCount}</span></div>
              <div>Treats: <span className="text-cyan-400 font-bold">{treatsCount}</span></div>
            </div>

            {treatsCount === 0 && (
              <button 
                onClick={() => { setTreatsCount(5); setSpeechBubble("Treat box refilled! 🐟🐟"); }}
                className="text-xs text-purple-400 hover:text-purple-300 underline font-mono"
              >
                + Restock Treats
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Cat Assets Showcase Section */}
      <section id="gallery" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-mono text-purple-400 uppercase tracking-widest font-semibold">Authentic Sprite Library</h2>
          <p className="text-3xl font-extrabold text-white">Built With Transparent Pixel Cat Assets</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 bg-slate-950 rounded-xl p-2 border border-slate-800/80 flex items-center justify-center overflow-hidden">
              <img src="/assets/pepperino.png" alt="Pepperino" className="w-16 h-16 rendering-pixelated object-contain" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">Pepperino Cat Sprite</h4>
            <p className="text-slate-400 text-xs font-mono">assets/pepperino.png</p>
            <p className="text-slate-500 text-xs mt-2">Main pixel cat mascot that walks along screen dock.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 bg-slate-950 rounded-xl p-2 border border-slate-800/80 flex items-center justify-center overflow-hidden">
              <img src="/assets/sleep.png" alt="Sleep" className="w-20 h-20 rendering-pixelated object-contain" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">Sleeping Cat Asset</h4>
            <p className="text-slate-400 text-xs font-mono">assets/sleep.png</p>
            <p className="text-slate-500 text-xs mt-2">Triggered automatically when system is idle.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 bg-slate-950 rounded-xl p-2 border border-slate-800/80 flex items-center justify-center overflow-hidden">
              <img src="/assets/tyoe_left.png" alt="Bongo Left" className="w-16 h-16 rendering-pixelated object-contain" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">Bongo Cat Paws</h4>
            <p className="text-slate-400 text-xs font-mono">assets/tyoe_left.png</p>
            <p className="text-slate-500 text-xs mt-2">Paws slam in sync with typing speed.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 bg-slate-950 rounded-xl p-2 border border-slate-800/80 flex items-center justify-center overflow-hidden">
              <img src="/assets/bongo_cat_frames/tyoe_frame_2.png" alt="Frame" className="w-16 h-16 rendering-pixelated object-contain" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">12-Frame Animation</h4>
            <p className="text-slate-400 text-xs font-mono">assets/bongo_cat_frames/*</p>
            <p className="text-slate-500 text-xs mt-2">Clean transparent PNG frame sequence for typing.</p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-mono text-purple-400 uppercase tracking-widest font-semibold">Desktop Integration</h2>
          <p className="text-3xl font-extrabold text-white">Engineered For Zero Interruptions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 overflow-hidden">
              <img src="/assets/sleep.png" alt="Sleep" className="w-8 h-8 rendering-pixelated" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Power & Idle Watcher</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              When system idle or display sleep triggers, Pixel-Pet curls up and falls asleep on your dock. Wakes up instantly when cursor moves.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-6 overflow-hidden">
              <img src="/assets/tyoe_right.png" alt="Bongo" className="w-8 h-8 rendering-pixelated" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Keystroke Reactive</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitors typing speed via global keystroke listener. Enters high-speed Bongo Cat typing mode when you type fast.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 overflow-hidden">
              <img src="/assets/pepperino.png" alt="Cat" className="w-8 h-8 rendering-pixelated" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Seamless Passthrough</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Uses transparent overlay with click forwarding. Never steals focus or blocks IDE, browser, or terminal clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Social Card Preview Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
          <h3 className="text-sm font-mono text-purple-400 mb-4 flex items-center gap-2">
            <Icons.Sparkles /> Official Preview Card
          </h3>
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <img src="/assets/social_card.png" alt="Pixel Pet Preview" className="w-full h-auto object-cover" />
          </div>
        </div>
      </section>

      {/* Quick Setup & Install Section */}
      <section id="download" className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-800/60">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-6">
            <h2 className="text-3xl font-extrabold text-white">Get Started in 30 Seconds</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Clone the repository and launch Pixel-Pet instantly on macOS, Linux, or Windows.
            </p>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-purple-300 flex items-center justify-between gap-4 overflow-x-auto shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">$</span>
                <span>git clone https://github.com/diablovocado/Pixel-Pet.git && cd Pixel-Pet && npm install && npm start</span>
              </div>
              <button 
                onClick={copyInstallCommand}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors shrink-0"
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
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 flex items-center gap-2"
              >
                <Icons.Download />
                <span>Download DMG / App Package</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/60 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/assets/pepperino.png" alt="Cat" className="w-4 h-4 rendering-pixelated" />
            <span>© {new Date().getFullYear()} Pixel-Pet. Open source under MIT License.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/diablovocado/Pixel-Pet" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">GitHub Repository</a>
            <a href="#playground" className="hover:text-slate-300 transition-colors">Live Canvas Demo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
