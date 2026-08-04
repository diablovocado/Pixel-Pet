import React, { useState, useEffect, useRef } from 'react';

// Inline SVGs for crisp, zero-dependency rendering
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
  )
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'walk' | 'sit' | 'sleep' | 'bongo' | 'pet' | 'excited'>('walk');
  const [happiness, setHappiness] = useState(88);
  const [treatsCount, setTreatsCount] = useState(3);
  const [copied, setCopied] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("Meow! Click me or drop a treat! 🐾");
  const [petVariant, setPetVariant] = useState<'pepperino' | 'calico' | 'tuxedo'>('pepperino');
  
  // Canvas simulation state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const catPosRef = useRef({ x: 100, y: 140, dir: 1, frame: 0 });

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Dock floor line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 180);
      ctx.lineTo(canvas.width - 20, 180);
      ctx.stroke();

      // Update cat pos if walking
      if (activeTab === 'walk') {
        catPosRef.current.x += 1.2 * catPosRef.current.dir;
        if (catPosRef.current.x > canvas.width - 80) catPosRef.current.dir = -1;
        if (catPosRef.current.x < 30) catPosRef.current.dir = 1;
      }
      catPosRef.current.frame = (catPosRef.current.frame + 0.15) % 4;

      const { x, y, dir } = catPosRef.current;

      ctx.save();
      ctx.translate(x, y);

      // Flip horizontal if moving left
      if (dir === -1) {
        ctx.scale(-1, 1);
        ctx.translate(-48, 0);
      }

      // Draw Pixel Cat Mascot based on state
      const bodyColor = petVariant === 'pepperino' ? '#8b5cf6' : petVariant === 'calico' ? '#f97316' : '#334155';
      const accentColor = petVariant === 'pepperino' ? '#c084fc' : petVariant === 'calico' ? '#fbbf24' : '#94a3b8';
      const earColor = '#f472b6';

      if (activeTab === 'sleep') {
        // Sleeping cat
        ctx.fillStyle = bodyColor;
        ctx.fillRect(8, 20, 32, 20); // Body
        ctx.fillStyle = accentColor;
        ctx.fillRect(4, 16, 16, 16); // Head curled down

        // Ears
        ctx.fillStyle = earColor;
        ctx.fillRect(6, 12, 4, 4);

        // Zzz floating text
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#a855f7';
        const zOffset = (Math.sin(Date.now() / 300) * 4);
        ctx.fillText('Z z z...', 32, 8 + zOffset);
      } else if (activeTab === 'bongo') {
        // Bongo Cat typing on desk
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 32, 48, 8); // Desk keyboard

        ctx.fillStyle = bodyColor;
        ctx.fillRect(10, 10, 28, 22); // Body

        // Paws slamming down
        const pawLeftY = Math.floor(Math.sin(Date.now() / 80) * 4);
        const pawRightY = Math.floor(Math.cos(Date.now() / 80) * 4);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 24 + pawLeftY, 8, 8);
        ctx.fillRect(34, 24 + pawRightY, 8, 8);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(16, 14, 4, 4);
        ctx.fillRect(28, 14, 4, 4);

        // Music notes
        ctx.fillStyle = '#ec4899';
        ctx.font = '12px sans-serif';
        ctx.fillText('🎵', 36, 4);
      } else if (activeTab === 'excited') {
        // Jump/Excited animation
        const jumpY = Math.abs(Math.sin(Date.now() / 150)) * 14;
        ctx.translate(0, -jumpY);

        ctx.fillStyle = bodyColor;
        ctx.fillRect(8, 8, 32, 28);
        // Ears
        ctx.fillStyle = earColor;
        ctx.fillRect(10, 2, 6, 6);
        ctx.fillRect(32, 2, 6, 6);
        // Happy Eyes (><)
        ctx.fillStyle = '#facc15';
        ctx.fillRect(14, 12, 6, 4);
        ctx.fillRect(28, 12, 6, 4);

        // Sparkles
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('✨', -4, 4);
        ctx.fillText('💖', 40, 4);
      } else {
        // Walking or Sitting
        const legWalk = activeTab === 'walk' ? Math.floor(Math.sin(Date.now() / 100) * 4) : 0;

        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(8, 12, 32, 22);

        // Head
        ctx.fillRect(28, 6, 16, 16);

        // Ears
        ctx.fillStyle = earColor;
        ctx.fillRect(30, 0, 4, 6);
        ctx.fillRect(38, 0, 4, 6);

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(36, 10, 4, 4);
        ctx.fillStyle = '#000000';
        ctx.fillRect(38, 10, 2, 2);

        // Tail wiggle
        const tailAngle = Math.sin(Date.now() / 200) * 6;
        ctx.fillStyle = accentColor;
        ctx.fillRect(4, 8 + tailAngle, 6, 14);

        // Legs
        ctx.fillStyle = '#475569';
        ctx.fillRect(12 + legWalk, 34, 4, 8);
        ctx.fillRect(22 - legWalk, 34, 4, 8);
        ctx.fillRect(32 + legWalk, 34, 4, 8);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [activeTab, petVariant]);

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('git clone https://github.com/diablovocado/Pixel-Pet.git && cd Pixel-Pet && npm install && npm start');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFeed = () => {
    if (treatsCount > 0) {
      setTreatsCount(prev => prev - 1);
      setHappiness(prev => Math.min(100, prev + 12));
      setActiveTab('excited');
      setSpeechBubble("YUM! Tasty pixel fish! 🐟✨");
      setTimeout(() => setSpeechBubble("Purrrrr... That was delicious! ❤️"), 2500);
    } else {
      setSpeechBubble("Out of treats! Click 'Refill Treats' to restock! 📦");
    }
  };

  const handlePet = () => {
    setActiveTab('pet');
    setHappiness(prev => Math.min(100, prev + 5));
    setSpeechBubble("Purrrrrrr! You petted Pixel Cat! 🥰");
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 font-sans bg-grid-pattern relative selection:bg-purple-600 selection:text-white">
      {/* Background ambient glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0c10]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-pixel text-xs text-white shadow-lg shadow-purple-500/20 rendering-pixelated">
              🐱
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight font-mono text-white flex items-center gap-2">
                Pixel-Pet <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-sans font-medium border border-purple-500/30">v1.0</span>
              </div>
              <p className="text-xs text-slate-400 font-sans">Retro Desktop Mascot</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#playground" className="hover:text-purple-400 transition-colors">Live Demo</a>
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#states" className="hover:text-purple-400 transition-colors">Pet States</a>
            <a href="#download" className="hover:text-purple-400 transition-colors">Download</a>
            <a href="https://github.com/diablovocado/Pixel-Pet" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
              <Icons.Github /> GitHub
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a 
              href="#download"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Icons.Download />
              <span>Get Pixel-Pet</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono backdrop-blur-md shadow-inner">
            <Icons.Sparkles />
            <span>100% Free & Open Source Desktop Companion</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Your Intelligent Retro <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Desktop Pixel Pet
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 font-sans leading-relaxed">
            A tiny pixel cat that lives right on your dock. It walks, sleeps when you step away, reacts to your typing speed, and brings wholesome energy to your workflow.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
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

          {/* Quick Specs Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-slate-400">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">⚡ &lt; 0.1% CPU Usage</div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">💾 ~15MB RAM Footprint</div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">🔒 100% Offline & Private</div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">🖥️ macOS & Cross-Platform</div>
          </div>
        </div>

        {/* Live Interactive Playground Card */}
        <div id="playground" className="mt-16 max-w-4xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl pixel-glow relative overflow-hidden">
          {/* Header Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold">Live Interactive Pet Canvas</span>
            </div>

            {/* Pet Variant Switcher */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-500 px-2 font-mono">Skin:</span>
              <button 
                onClick={() => setPetVariant('pepperino')}
                className={`px-3 py-1 rounded-md font-mono transition-colors ${petVariant === 'pepperino' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Purple (Pepperino)
              </button>
              <button 
                onClick={() => setPetVariant('calico')}
                className={`px-3 py-1 rounded-md font-mono transition-colors ${petVariant === 'calico' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Orange Calico
              </button>
              <button 
                onClick={() => setPetVariant('tuxedo')}
                className={`px-3 py-1 rounded-md font-mono transition-colors ${petVariant === 'tuxedo' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Tuxedo
              </button>
            </div>
          </div>

          {/* Speech Bubble */}
          <div className="mt-4 mb-2 bg-purple-950/80 border border-purple-500/30 p-3 rounded-xl text-purple-200 text-xs font-mono text-center shadow-inner flex items-center justify-center gap-2">
            <span>💬</span>
            <span>{speechBubble}</span>
          </div>

          {/* Interactive Canvas Area */}
          <div 
            onClick={handlePet}
            className="relative bg-slate-950 rounded-xl border border-slate-800/80 h-56 flex items-center justify-center cursor-pointer overflow-hidden group"
          >
            <canvas ref={canvasRef} width={640} height={200} className="w-full h-full rendering-pixelated" />
            <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none">
              Click Canvas to Pet! 🐾
            </div>
          </div>

          {/* Interactive Action Buttons Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-6 gap-2">
            <button
              onClick={() => { setActiveTab('walk'); setSpeechBubble("Walking along the screen dock... 🐾"); }}
              className={`px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${activeTab === 'walk' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'}`}
            >
              🐾 Walk
            </button>
            <button
              onClick={() => { setActiveTab('sleep'); setSpeechBubble("Shhh... Cat is sleeping! Zzz... 💤"); }}
              className={`px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${activeTab === 'sleep' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'}`}
            >
              💤 Sleep (AFK)
            </button>
            <button
              onClick={() => { setActiveTab('bongo'); setSpeechBubble("Bongo Cat mode! Slamming keys fast! 🎹⚡"); }}
              className={`px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${activeTab === 'bongo' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'}`}
            >
              🎹 Bongo Mode
            </button>
            <button
              onClick={() => { setActiveTab('excited'); setSpeechBubble("Yay! Pixel Cat is super excited! ✨🎉"); }}
              className={`px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${activeTab === 'excited' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'}`}
            >
              ✨ Excited
            </button>
            <button
              onClick={handlePet}
              className={`px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all bg-pink-900/40 text-pink-300 border border-pink-500/30 hover:bg-pink-900/60 flex items-center justify-center gap-1`}
            >
              <Icons.Heart /> Pet Cat
            </button>
            <button
              onClick={handleFeed}
              className={`px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60 flex items-center justify-center gap-1`}
            >
              <Icons.Fish /> Feed Fish ({treatsCount})
            </button>
          </div>

          {/* Pet Stats HUD */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span>Happiness:</span>
                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300" style={{ width: `${happiness}%` }} />
                </div>
                <span className="text-white font-bold">{happiness}%</span>
              </div>
              <div>Treats Left: <span className="text-cyan-400 font-bold">{treatsCount}</span></div>
            </div>

            {treatsCount === 0 && (
              <button 
                onClick={() => { setTreatsCount(5); setSpeechBubble("Treats refilled! 🐟🐟🐟"); }}
                className="text-xs text-purple-400 hover:text-purple-300 underline font-mono"
              >
                + Refill Treats Box
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-mono text-purple-400 uppercase tracking-widest font-semibold">Engineered For Efficiency</h2>
          <p className="text-3xl font-extrabold text-white">Why Developers & Pixel Lovers Enjoy Pixel-Pet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-6">
              💤
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Power Monitor & AFK Watcher</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              When system idle or display sleep triggers, Pixel-Pet gracefully curls up and falls asleep on your dock. Wakes up instant when you return.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center text-xl mb-6">
              🎹
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Keystroke & KPS Reactive</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitors global typing speed. When typing fast during coding sessions, Pixel-Pet enters high-speed Bongo Cat typing mode alongside you.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-6">
              🪟
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Seamless Window Passthrough</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Uses transparent hardware overlay with click forwarding. Never steals focus or interferes with your IDE, browser, or terminal clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Pet States Gallery */}
      <section id="states" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-mono text-purple-400 uppercase tracking-widest font-semibold">Rich Behavioral Engine</h2>
          <p className="text-3xl font-extrabold text-white">9 Distinct Pixel Cat States</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { title: "Idle Patrol", icon: "🐾", desc: "Walks calmly along screen dock" },
            { title: "Sleep Mode", icon: "💤", desc: "Curled up Zzz when system is idle" },
            { title: "Bongo Typing", icon: "🎹", desc: "Slams paws in sync with typing" },
            { title: "Petting Reaction", icon: "🥰", desc: "Purrs and emits heart particles" },
            { title: "Excited Jump", icon: "✨", desc: "Leaps with joy on high KPS" },
            { title: "Wakeup Stretch", icon: "🌅", desc: "Stretches when cursor moves" },
            { title: "Drag & Drop", icon: "🖐️", desc: "Pick up & place anywhere" },
            { title: "Agent Speech", icon: "💬", desc: "Displays pixel speech bubbles" }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:bg-slate-900/80 transition-colors">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
              <p className="text-slate-400 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Setup & Install Terminal Section */}
      <section id="download" className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-800/60">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-6">
            <h2 className="text-3xl font-extrabold text-white">Get Started in 30 Seconds</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Clone the GitHub repo and launch Pixel-Pet instantly on macOS, Linux, or Windows.
            </p>

            {/* Terminal snippet box */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/90 font-mono text-xs text-purple-300 flex items-center justify-between gap-4 overflow-x-auto shadow-inner">
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

            <div className="pt-4 flex flex-wrap items-center gap-4">
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
          <div>
            © {new Date().getFullYear()} Pixel-Pet. Open source under MIT License.
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
