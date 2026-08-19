import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PixelCat, type CatPose } from "@/components/PixelCat";

const VERSION = "v1.0.4";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pixel Pet — a pixel cat that lives on your desktop" },
      {
        name: "description",
        content:
          "Pixel Pet is a tiny pixel-art cat for macOS and Windows. She chases your cursor, reacts to typing, naps at the dock, and never logs a keystroke.",
      },
      {
        property: "og:title",
        content: "Pixel Pet — a pixel cat that lives on your desktop",
      },
      {
        property: "og:description",
        content:
          "A tiny pixel-art cat that reacts to your activity in real time. Click-through, private, and quietly alive on your desktop.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
    ],
  }),
  component: Landing,
});

/* ── small pieces ─────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
      {children}
    </p>
  );
}

function Rule() {
  return <div className="pixel-rule my-16 md:my-24" />;
}

const REPO_URL = "https://github.com/diablovocado/Pixel-Pet";
const RELEASES_URL = `${REPO_URL}/releases/latest`;
const MAC_ZIP_URL = `${import.meta.env.BASE_URL}Pixel-Pet-Mac.zip`;

function DownloadButtons({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <a
        href={MAC_ZIP_URL}
        download="Pixel-Pet-Mac.zip"
        className="pixel-btn bg-primary px-6 py-3 text-[11px] uppercase tracking-widest text-primary-foreground"
      >
        Download for Mac (.zip)
      </a>
      <a
        href={RELEASES_URL}
        target="_blank"
        rel="noreferrer"
        className="pixel-btn bg-background px-6 py-3 text-[11px] uppercase tracking-widest text-foreground"
      >
        Download for Windows
      </a>
      {!compact && (
        <span className="text-xs text-muted-foreground">
          {VERSION} · 4.2 MB · macOS 12+ / Windows 10+
        </span>
      )}
    </div>
  );
}

/* ── hero: looping story sequence ─────────────────────────── */

const HERO_SEQUENCE: { pose: CatPose; caption: string; ms: number }[] = [
  { pose: "idle", caption: "idling on your wallpaper", ms: 3600 },
  { pose: "type", caption: "tapping along while you type", ms: 4600 },
];

function Hero() {
  const [step, setStep] = useState(0);
  const current = HERO_SEQUENCE[step]!;

  useEffect(() => {
    const id = setTimeout(
      () => setStep((s) => (s + 1) % HERO_SEQUENCE.length),
      current.ms,
    );
    return () => clearTimeout(id);
  }, [step, current.ms]);

  return (
    <header className="mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-8 md:grid-cols-[1.05fr_1fr] md:items-center md:pt-28">
      <div>
        <Label>Desktop companion · {VERSION}</Label>
        <h1 className="mt-6 font-display text-3xl leading-[1.25] text-foreground sm:text-4xl md:text-[2.7rem]">
          Pixel Pet — a pixel cat that lives on your desktop
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
          She sits on your wallpaper, chases your cursor, taps along when you
          type, and curls up by the dock when the room goes quiet. No windows, no
          notifications, no keystrokes stored. Just a small creature keeping you
          company inside a serious machine.
        </p>
        <div className="mt-9">
          <DownloadButtons />
        </div>
      </div>

      <div className="pixel-box relative bg-card p-4">
        <div className="flex items-center justify-between border-b-2 border-border pb-3">
          <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            desktop.live
          </span>
          <span className="flex gap-1.5">
            <span className="size-2 bg-muted-foreground" />
            <span className="size-2 bg-muted-foreground" />
            <span className="size-2 bg-primary" />
          </span>
        </div>

        <div className="relative flex h-64 items-end justify-center overflow-hidden">
          <div className="anim-blink absolute top-6 left-6 font-mono text-[11px] text-muted-foreground">
            $ pixelpet --watch
          </div>
          <PixelCat pose={current.pose} size={168} className="mb-8" />
        </div>

        <div className="border-t-2 border-border pt-3 font-mono text-[11px] text-muted-foreground">
          <span className="text-primary">●</span> {current.caption}
        </div>
      </div>
    </header>
  );
}

/* ── interactive: click to pet ────────────────────────────── */

function PetDemo() {
  const [hearts, setHearts] = useState<number[]>([]);
  const [petted, setPetted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pet = () => {
    setPetted(true);
    setHearts((h) => [...h, Date.now()].slice(-6));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPetted(false), 1600);
  };

  return (
    <button
      onClick={pet}
      className="pixel-box group relative flex h-56 w-full cursor-pointer items-end justify-center overflow-hidden bg-card"
      aria-label="Pet the cat"
    >
      {hearts.map((id, i) => (
        <span
          key={id}
          className="pointer-events-none absolute bottom-24 font-display text-sm text-pixel-red"
          style={{
            left: `${38 + ((i * 9) % 26)}%`,
            animation: "pixel-hop 900ms steps(4, end) infinite",
          }}
        >
          ♥
        </span>
      ))}
      <PixelCat
        pose="idle"
        size={petted ? 132 : 120}
        className="mb-10 transition-all duration-100"
      />
      <span className="absolute bottom-3 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-primary">
        {petted ? "purring" : "click to pet"}
      </span>
    </button>
  );
}

/* ── features ─────────────────────────────────────────────── */

const FEATURES: {
  name: string;
  pose: CatPose;
  copy: string;
  meta: string;
}[] = [
  {
    name: "Cursor Chase",
    pose: "idle",
    copy: "She notices the pointer and bolts after it, skidding to a stop a few pixels short. Move slowly and she stalks instead.",
    meta: "reads pointer position only",
  },
  {
    name: "Typing Reaction",
    pose: "type",
    copy: "When your keyboard gets busy she hops onto an imaginary keyboard and taps along. Rhythm only — never content.",
    meta: "keystroke timing, never text",
  },
  {
    name: "Sleeps at the Dock",
    pose: "sleep",
    copy: "Idle for a while and she wanders down to the dock or taskbar, curls up, and breathes slowly until you come back.",
    meta: "wakes on first input",
  },
  {
    name: "Fully Click-Through",
    pose: "idle",
    copy: "Every pixel around her passes clicks straight to whatever is underneath. She is present, never in the way.",
    meta: "0 intercepted clicks",
  },
];

function FeatureCard({ f }: { f: (typeof FEATURES)[number] }) {
  const [hover, setHover] = useState(false);
  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`p-5 transition-transform duration-75 ${
        hover ? "pixel-box-hot -translate-x-0.5 -translate-y-0.5" : "pixel-box"
      } bg-card`}
    >
      <div className="flex h-28 items-end justify-center overflow-hidden">
        <PixelCat
          pose={f.pose}
          size={96}
          className={hover ? "anim-hop" : ""}
        />
      </div>
      <h3 className="mt-5 font-display text-sm text-foreground">{f.name}</h3>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {f.copy}
      </p>
      <p className="mt-4 border-t-2 border-border pt-3 font-display text-[9px] uppercase tracking-[0.25em] text-primary">
        {f.meta}
      </p>
    </article>
  );
}

/* ── faq ──────────────────────────────────────────────────── */

const FAQ = [
  {
    q: "Does Pixel Pet read what I type?",
    a: "No. She listens for the fact that a key was pressed, not which key. Typing content is never logged, read, or stored, and nothing about your input ever leaves your machine.",
  },
  {
    q: "Why does macOS ask for Accessibility?",
    a: "macOS requires Accessibility permission for any app that observes cursor position and keypress events system-wide. It is the only permission she asks for, and you can revoke it at any time.",
  },
  {
    q: "Why does Windows ask for Administrator?",
    a: "One-time Administrator approval during install lets her draw a transparent, click-through layer above the desktop. She runs as a normal user afterwards.",
  },
  {
    q: "Will she slow down my computer?",
    a: "She idles around 0.3% CPU and roughly 40 MB of memory, and pauses her animation entirely while a fullscreen app or game is in focus.",
  },
  {
    q: "Can I have more than one cat?",
    a: "Yes. Up to four cats can share a desktop, and they will occasionally chase each other instead of your cursor.",
  },
];

function FaqItem({ item }: { item: (typeof FAQ)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b-2 border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="font-display text-xs text-foreground">{item.q}</span>
        <span
          className={`font-display text-xs ${open ? "text-primary" : "text-muted-foreground"}`}
        >
          {open ? "[-]" : "[+]"}
        </span>
      </button>
      {open && (
        <p className="pb-5 pr-10 text-xs leading-relaxed text-muted-foreground">
          {item.a}
        </p>
      )}
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────── */

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />

      <div className="mx-auto max-w-6xl px-6">
        <Rule />

        {/* interaction */}
        <section className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
          <PetDemo />
          <div>
            <Label>Click to Pet</Label>
            <h2 className="mt-4 font-display text-xl leading-relaxed text-foreground">
              Reach over and scratch her ears
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A single click on the cat — and only on the cat — makes her look
              up, blink, and throw a little pixel heart. Try it here; it works
              exactly the same on your desktop.
            </p>
          </div>
        </section>

        <Rule />

        {/* features */}
        <section id="features">
          <Label>Core behaviours</Label>
          <h2 className="mt-4 max-w-xl font-display text-xl leading-relaxed">
            She reacts to what you are already doing
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <FeatureCard key={f.name} f={f} />
            ))}
          </div>
        </section>

        <Rule />

        {/* trust */}
        <section id="privacy" className="grid gap-10 md:grid-cols-2">
          <div>
            <Label>Platforms & permissions</Label>
            <h2 className="mt-4 font-display text-xl leading-relaxed">
              Nothing hidden, nothing sent
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Pixel Pet runs entirely on your machine. There is no account, no
              telemetry, and no network connection except the update check you
              can switch off.
            </p>
            <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
              <li>
                <span className="text-primary">▪</span> Typing content is never
                logged, read, or stored.
              </li>
              <li>
                <span className="text-primary">▪</span> macOS 12 Monterey and
                later — requires Accessibility permission.
              </li>
              <li>
                <span className="text-primary">▪</span> Windows 10 and 11 —
                requires Administrator once, at install.
              </li>
              <li>
                <span className="text-primary">▪</span> Apple notarised and
                Windows code-signed builds.
              </li>
            </ul>
          </div>

          <div className="pixel-box bg-card p-6">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              what she can see
            </p>
            <dl className="mt-5 space-y-4 text-xs">
              <div className="flex justify-between gap-4 border-b-2 border-border pb-3">
                <dt className="text-muted-foreground">Cursor position</dt>
                <dd className="text-foreground">yes · local only</dd>
              </div>
              <div className="flex justify-between gap-4 border-b-2 border-border pb-3">
                <dt className="text-muted-foreground">Keypress timing</dt>
                <dd className="text-foreground">yes · local only</dd>
              </div>
              <div className="flex justify-between gap-4 border-b-2 border-border pb-3">
                <dt className="text-muted-foreground">Keystroke content</dt>
                <dd className="text-primary">never</dd>
              </div>
              <div className="flex justify-between gap-4 border-b-2 border-border pb-3">
                <dt className="text-muted-foreground">Screen contents</dt>
                <dd className="text-primary">never</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Analytics</dt>
                <dd className="text-primary">none</dd>
              </div>
            </dl>
          </div>
        </section>

        <Rule />

        {/* pricing + install */}
        <section id="install" className="grid gap-10 md:grid-cols-2">
          <div className="pixel-box-hot bg-card p-6">
            <Label>One-time</Label>
            <p className="mt-4 font-display text-3xl text-foreground">
              $9<span className="text-sm text-muted-foreground"> once</span>
            </p>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              One cat, both platforms, every future behaviour included. No
              subscription, no account. Refunded on request within 14 days.
            </p>
            <div className="mt-6">
              <DownloadButtons compact />
            </div>
            <p className="mt-5 text-[11px] text-muted-foreground">
              Free 7-day trial · {VERSION} · 4.2 MB
            </p>
          </div>

          <div>
            <Label>Installing</Label>
            <ol className="mt-5 space-y-4 text-xs leading-relaxed text-muted-foreground">
              <li>
                <span className="font-display text-foreground">01 </span>
                Download the build for your platform and open it.
              </li>
              <li>
                <span className="font-display text-foreground">02 </span>
                macOS: drag Pixel Pet to Applications, then allow her under
                System Settings › Privacy & Security › Accessibility.
              </li>
              <li>
                <span className="font-display text-foreground">03 </span>
                Windows: run the signed installer and approve the one-time
                Administrator prompt.
              </li>
              <li>
                <span className="font-display text-foreground">04 </span>
                Launch her. She appears in the lower-left of your desktop,
                stretches once, and starts watching your cursor.
              </li>
            </ol>
            <div className="mt-8 flex items-end gap-4">
              <PixelCat pose="idle" size={88} />
              <p className="font-mono text-[11px] text-muted-foreground">
                she naps here while you read
              </p>
            </div>
          </div>
        </section>

        <Rule />

        {/* faq */}
        <section id="faq" className="max-w-3xl">
          <Label>Questions</Label>
          <h2 className="mt-4 font-display text-xl leading-relaxed">
            The things people ask first
          </h2>
          <div className="mt-8 border-t-2 border-border">
            {FAQ.map((item) => (
              <FaqItem key={item.q} item={item} />
            ))}
          </div>
        </section>

        <Rule />

        {/* final cta */}
        <section className="pixel-box bg-card px-6 py-14 text-center">
          <div className="flex justify-center">
            <PixelCat pose="idle" size={160} className="anim-hop" />
          </div>
          <h2 className="mt-8 font-display text-xl leading-relaxed">
            She is ready when you are
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            One small download and there is a cat on your desktop, chasing your
            cursor by the time you finish reading this.
          </p>
          <div className="mt-8 flex justify-center">
            <DownloadButtons compact />
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 py-12 font-mono text-[11px] text-muted-foreground">
          <span className="font-display text-[10px] uppercase tracking-[0.3em]">
            Pixel Pet {VERSION}
          </span>
          <nav className="flex flex-wrap gap-6">
            <a className="hover:text-primary" href="#privacy">
              Privacy policy
            </a>
            <a className="hover:text-primary" href="mailto:hello@pixelpet.cat">
              hello@pixelpet.cat
            </a>
            <a className="hover:text-primary" href="#faq">
              Support
            </a>
          </nav>
          <span>Made late at night, one pixel at a time.</span>
        </footer>
      </div>
    </main>
  );
}
