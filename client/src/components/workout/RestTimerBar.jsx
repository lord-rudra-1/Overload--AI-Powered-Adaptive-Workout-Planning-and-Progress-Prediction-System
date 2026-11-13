import React, { useState, useEffect } from "react";
import { Timer, Play, Pause, RotateCcw, Plus, Bell, Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function playChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  } catch (err) {
    // Ignore audio permission errors
  }
}

export default function RestTimerBar({
  initialRestSeconds = 90,
  onFinish,
  active,
  timeLeft,
  setTimeLeft,
  totalRestTime,
  setTotalRestTime,
  isRunning,
  setIsRunning,
}) {
  const [minimized, setMinimized] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setJustCompleted(true);
            playChime();
            if (onFinish) onFinish();
            setTimeout(() => setJustCompleted(false), 5000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onFinish, setTimeLeft, setIsRunning]);

  const handleStartPreset = (secs) => {
    setTotalRestTime(secs);
    setTimeLeft(secs);
    setIsRunning(true);
    setJustCompleted(false);
    setMinimized(false);
  };

  const handleAdd30 = () => {
    setTimeLeft((prev) => prev + 30);
    setTotalRestTime((prev) => Math.max(prev, timeLeft + 30));
    setIsRunning(true);
  };

  const handleTogglePlay = () => {
    if (timeLeft === 0) {
      handleStartPreset(totalRestTime || 90);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setJustCompleted(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPct = totalRestTime > 0 ? Math.min(100, ((totalRestTime - timeLeft) / totalRestTime) * 100) : 0;

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 max-w-sm w-full transition-all duration-300 ${
        justCompleted
          ? "ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/30 animate-bounce"
          : "shadow-2xl shadow-black/80"
      }`}
    >
      <div className="rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 p-3.5 space-y-3">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                justCompleted
                  ? "bg-emerald-500 text-white animate-pulse"
                  : isRunning
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              <Timer className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200">
                {justCompleted ? "Rest Complete! Ready for Next Set" : "Rest Interval Timer"}
              </span>
              <span className="text-[10px] text-zinc-500 block">
                {isRunning ? "Countdown active" : timeLeft > 0 ? "Paused" : "Select interval"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(!minimized)}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded"
              title={minimized ? "Expand" : "Minimize"}
            >
              {minimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              justCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-orange-500 to-amber-400"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {!minimized && (
          <div className="space-y-3">
            {/* Big Countdown Display */}
            <div className="flex items-center justify-between px-1">
              <span
                className={`text-3xl font-black font-mono tracking-tight ${
                  justCompleted
                    ? "text-emerald-400"
                    : isRunning
                    ? "text-orange-400"
                    : "text-zinc-300"
                }`}
              >
                {formatTime(timeLeft)}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAdd30}
                  className="h-8 px-2 text-xs font-mono border-zinc-800 hover:border-zinc-700 text-zinc-300"
                >
                  <Plus className="h-3 w-3 mr-0.5" /> 30s
                </Button>

                <Button
                  size="sm"
                  onClick={handleTogglePlay}
                  className={`h-8 px-3 text-xs font-semibold ${
                    isRunning
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-3.5 w-3.5 mr-1" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 mr-1" /> Start
                    </>
                  )}
                </Button>

                {timeLeft > 0 && (
                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Interval Quick Presets */}
            <div className="flex gap-1.5 pt-1 border-t border-zinc-800/80">
              {[60, 90, 120, 180].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleStartPreset(sec)}
                  className={`flex-1 py-1 rounded text-[11px] font-mono transition-colors border ${
                    totalRestTime === sec && (isRunning || timeLeft > 0)
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/50 font-bold"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  {sec < 60 ? `${sec}s` : sec % 60 === 0 ? `${sec / 60}m` : `${sec}s`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
