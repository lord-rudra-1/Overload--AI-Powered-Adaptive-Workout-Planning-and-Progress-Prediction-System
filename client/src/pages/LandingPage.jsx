import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Flame,
  ArrowRight,
  Brain,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BmiDropdown from "@/components/BmiDropdown";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200">
      {/* ── Background Glow Accents ────────────────────────── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-orange-600/15 via-amber-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-orange-600/5 blur-3xl pointer-events-none -z-10" />

      {/* ── Fixed / Pinned Top Navbar ──────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-zinc-950/90 border-b border-zinc-800/80 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
              <Flame className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Overload
            </span>
          </Link>

          {/* Navigation links for desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">How It Works</a>
            <a href="#science" className="hover:text-zinc-100 transition-colors">The Science</a>
          </nav>

          {/* Right CTAs & Tools */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Cute Little BMI Button & Dropdown Tile */}
            <BmiDropdown />

            {user ? (
              <Link to="/dashboard">
                <Button className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20">
                  <Activity className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20">
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Anime Lifter Illustration */}
          <div className="lg:col-span-5 flex justify-center relative group order-2 lg:order-1">
            {/* Ambient orange aura behind lifter */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-80 h-72 sm:h-80 bg-gradient-to-tr from-orange-600/30 via-amber-500/25 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700 -z-10" />

            <div className="relative max-w-sm sm:max-w-md w-full">
              <img
                src="/images/anime-lifter.png"
                alt="Anime Lifter Overhead Press"
                className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(249,115,22,0.25)] hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-2 right-4 px-3.5 py-1.5 rounded-full bg-zinc-950/90 border border-orange-500/40 text-xs font-mono text-orange-400 backdrop-blur-md shadow-xl flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                Overload Protocol &bull; Active
              </div>
            </div>
          </div>

          {/* Right Column: Hero Headline & Action Controls */}
          <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-orange-400 backdrop-blur-sm shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              AI-Powered Autoregulatory Training System
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.1]">
              Stop guessing your weights. <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Let autoregulation decide.
              </span>
            </h1>

            {/* Core Philosophy Subtitle */}
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light">
              <span className="text-zinc-200 font-normal">
                &ldquo;The plan stops being an input you follow and becomes an output the system recomputes.&rdquo;
              </span>{" "}
              Deterministic progressive overload, fatigue deload detection, and statistical 1RM forecasting powered by exercise science.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link to={user ? "/dashboard" : "/register"}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-xl shadow-orange-500/25 px-8 h-12 text-base"
                >
                  <span>{user ? "Enter Your Dashboard" : "Start Training Free"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto gap-2 border-zinc-800 hover:bg-zinc-900 text-zinc-300 h-12 px-6"
                >
                  <Brain className="h-4 w-4 text-orange-400" />
                  <span>How the Engine Works</span>
                </Button>
              </a>
            </div>

            {/* Micro trust indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Epley Validated Formula
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Autoregulatory RPE / RIR
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Injury Protection Guardrails
              </span>
            </div>
          </div>
        </div>

        {/* ── Hero Mock Interactive Preview Card ────────────── */}
        <div className="mt-16 max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-black/80 relative">
          {/* Header pill */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-zinc-500 ml-2">Overload Adaptation Simulator</span>
            </div>
            <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
              Session Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: What was performed */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Previous Session</span>
                <Badge variant="outline" className="text-xs text-zinc-400">Bench Press</Badge>
              </div>
              <div className="text-2xl font-bold text-zinc-100">
                60.0 kg <span className="text-sm font-normal text-zinc-400">× 3 sets of 10 reps</span>
              </div>
              <div className="space-y-1.5 pt-1 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Target RPE:</span>
                  <span className="text-zinc-200 font-mono">8.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual Logged RPE:</span>
                  <span className="text-emerald-400 font-mono font-semibold">7.5 (Effort with reserve)</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate:</span>
                  <span className="text-emerald-400 font-mono font-semibold">100% (30/30 reps)</span>
                </div>
              </div>
            </div>

            {/* Right: What the engine recomputed */}
            <div className="bg-gradient-to-br from-orange-950/30 via-zinc-900/90 to-zinc-950/70 border border-orange-500/30 rounded-xl p-5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Next Prescription Recomputed</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  +2.5 KG OVERLOAD
                </span>
              </div>

              <div className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <span className="text-orange-400">62.5 kg</span>
                <span className="text-sm font-normal text-zinc-400">× 3 sets of 10 reps</span>
              </div>

              <div className="text-xs text-zinc-300 bg-zinc-900/80 border border-zinc-800 rounded-lg p-2.5 font-mono leading-relaxed">
                <span className="text-orange-400 font-bold">Rule Applied:</span> RULE_1_PROGRESSIVE_OVERLOAD
                <br />
                <span className="text-zinc-400">&ldquo;Completed all 3 sets of 10 reps at RPE 7.5 &le; target 8.0. Progressing weight by +2.5 kg.&rdquo;</span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ── How It Works — Side-by-Side Anime Feature Showcase ─── */}
      <section id="how-it-works" className="py-24 border-t border-zinc-900 bg-zinc-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-orange-400 uppercase">The Autoregulated Cycle</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-zinc-100">How You Train with Overload</p>
            <p className="text-sm text-zinc-400">
              A high-precision feedback loop. Effort in, intelligent recomputation out.
            </p>
          </div>

          {/* ── Row 1: Setup & Mobility ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-mono text-xl font-black shadow-lg shadow-orange-500/30 border border-orange-400/40 shrink-0">
                  01
                </span>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-orange-500/15 border-2 border-orange-500/40 text-orange-400 font-mono text-sm sm:text-base font-black tracking-wider uppercase shadow-md shadow-orange-500/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                  STAGE 01 &bull; CALIBRATION &amp; MOBILITY
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 leading-snug">
                Set Your Foundation. <br />
                <span className="text-zinc-400 font-normal">The system calibrates every starting plate.</span>
              </h3>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Input your training frequency (2 to 6 days), bodyweight, experience level, and gym equipment. Overload applies biomechanical starting multipliers to establish your safe starting baseline—preventing ego lifting while priming your neuromuscular system.
              </p>
              <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-zinc-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Equipment filtering: Full Gym, Home Barbell, Dumbbell, or Calisthenics</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Baseline multipliers tuned for compound squats, hinges, pushes, and pulls</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Custom plate increment matching (e.g. 1.25 kg or 2.5 kg plates)</span>
                </div>
              </div>
            </div>

            {/* Right: High-Attention GIF */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/10 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-2.5 sm:p-3 shadow-2xl relative overflow-hidden">
                <img
                  src="/images/goku-stretch.gif"
                  alt="Goku Mobility and Warmup"
                  className="w-full h-auto rounded-xl object-cover shadow-inner aspect-[4/3]"
                />
                <div className="absolute top-5 right-5 px-3 py-1 rounded-full bg-zinc-950/85 border border-zinc-700/60 text-xs font-mono text-zinc-300 backdrop-blur-md flex items-center gap-2 shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Baseline Calibrated
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 2: Heavy Progressive Overload ───────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-mono text-xl font-black shadow-lg shadow-amber-500/30 border border-amber-300/40 shrink-0">
                  02
                </span>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-400 font-mono text-sm sm:text-base font-black tracking-wider uppercase shadow-md shadow-amber-500/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                  STAGE 02 &bull; WEIGHTED RESISTANCE
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 leading-snug">
                Step Up to the Bar. <br />
                <span className="text-zinc-400 font-normal">Track every rep and reserve live in the gym.</span>
              </h3>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Like stepping into 100x gravity with weighted clothing, progress demands honest tracking under load. Execute today&apos;s prescribed workout. Log reps completed and Rate of Perceived Exertion (RPE) with one tap between sets on your mobile phone.
              </p>
              <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-zinc-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Real-time RPE & RIR (Reps in Reserve) subjective fatigue tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Mobile-friendly set completion checks with automatic rest interval timing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Ghosted comparison against your previous workout metrics</span>
                </div>
              </div>
            </div>

            {/* Right: High-Attention GIF */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-2.5 sm:p-3 shadow-2xl relative overflow-hidden">
                <img
                  src="/images/goku-boots.gif"
                  alt="Goku Weighted Boots Training"
                  className="w-full h-auto rounded-xl object-cover shadow-inner aspect-[4/3]"
                />
                <div className="absolute top-5 right-5 px-3 py-1 rounded-full bg-zinc-950/85 border border-zinc-700/60 text-xs font-mono text-amber-300 backdrop-blur-md flex items-center gap-2 shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  Weighted Overload Active
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 3: Hyperbolic Adaptation ────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-mono text-xl font-black shadow-lg shadow-orange-500/40 border border-orange-400/40 shrink-0">
                  03
                </span>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-orange-500/20 border-2 border-orange-500/50 text-orange-300 font-mono text-sm sm:text-base font-black tracking-wider uppercase shadow-md shadow-orange-500/15">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                  STAGE 03 &bull; HYPERBOLIC ADAPTATION
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 leading-snug">
                The Next Session Recomputes. <br />
                <span className="text-zinc-400 font-normal">Continuous progression without hitting a wall.</span>
              </h3>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Hit &ldquo;Complete Workout&rdquo;. The deterministic adaptation engine instantly evaluates your performance. If you completed all sets within target RPE, it adds +2.5 kg. If effort was excessive, it consolidates load. If fatigue accumulated, it prescribes a deload before injury strikes.
              </p>
              <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-zinc-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Rule 1: Progressive Overload (+2.5 kg on target completion)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Rule 2: Volume autoregulation based on 4-week training adherence</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Rule 3: Automatic deload (-20% load, -40% sets) on accumulated fatigue</span>
                </div>
              </div>
            </div>

            {/* Right: High-Attention GIF */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-600/30 via-amber-500/20 to-orange-500/30 rounded-2xl blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <div className="rounded-2xl border border-orange-500/30 bg-zinc-900/90 p-2.5 sm:p-3 shadow-2xl relative overflow-hidden">
                <img
                  src="/images/goku-shadowbox.gif"
                  alt="Goku Hyperbolic Time Chamber Shadowboxing"
                  className="w-full h-auto rounded-xl object-cover shadow-inner aspect-[4/3]"
                />
                <div className="absolute top-5 right-5 px-3 py-1 rounded-full bg-zinc-950/85 border border-orange-500/40 text-xs font-mono text-orange-400 backdrop-blur-md flex items-center gap-2 shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  +2.5 kg Recomputed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scientific Foundation ──────────────────────────── */}
      <section id="science" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/60 to-zinc-950 p-8 md:p-12 space-y-6">
          <div className="flex items-center gap-3">
            <Brain className="h-7 w-7 text-orange-400" />
            <h3 className="text-2xl font-bold text-zinc-100">Validated Exercise Science</h3>
          </div>
          <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
            Overload synthesizes peer-reviewed resistance training methodologies into software logic:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm text-zinc-400">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="font-semibold text-zinc-200">Epley & Brzycki 1RM Model</div>
              <p className="font-mono text-zinc-400">1RM = Weight × (1 + Reps / 30)</p>
              <p className="text-[11px] text-zinc-500 pt-1">Predicts maximum strength without hazardous true 1RM testing.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="font-semibold text-zinc-200">RPE & RIR Autoregulation</div>
              <p className="font-mono text-zinc-400">RIR = 10 - RPE</p>
              <p className="text-[11px] text-zinc-500 pt-1">Adjusts training intensity to daily fatigue and sleep variation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Banner ──────────────────────────────── */}
      <section className="py-20 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100">
            Ready to train with intelligent autoregulation?
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Create your profile in 60 seconds and let Overload generate your baseline schedule today.
          </p>
          <div className="pt-2">
            <Link to={user ? "/dashboard" : "/register"}>
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-xl shadow-orange-500/25 px-8 h-12 text-base"
              >
                <span>{user ? "Open Athlete Dashboard" : "Get Started Now"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900/80 py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-bold text-zinc-300">Overload Adaptive Training System</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/exercises" className="hover:text-zinc-300 transition-colors">Catalog</Link>
            <Link to="/login" className="hover:text-zinc-300 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-zinc-300 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

