import React, { useState, useRef, useEffect } from "react";
import {
  Scale,
  Calculator,
  ChevronDown,
  RotateCcw,
  Sparkles,
  X,
  Info,
} from "lucide-react";

export default function BmiDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unit, setUnit] = useState("metric"); // 'metric' | 'imperial'
  const [metricHeight, setMetricHeight] = useState("");
  const [metricWeight, setMetricWeight] = useState("");
  const [imperialFeet, setImperialFeet] = useState("");
  const [imperialInches, setImperialInches] = useState("");
  const [imperialWeight, setImperialWeight] = useState("");

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Reset inputs
  const handleReset = () => {
    setMetricHeight("");
    setMetricWeight("");
    setImperialFeet("");
    setImperialInches("");
    setImperialWeight("");
  };

  // Preset example for quick demo
  const handleFillSample = () => {
    if (unit === "metric") {
      setMetricHeight("178");
      setMetricWeight("74");
    } else {
      setImperialFeet("5");
      setImperialInches("10");
      setImperialWeight("163");
    }
  };

  // Calculate BMI
  let bmi = null;
  let healthyWeightRange = null;

  if (unit === "metric") {
    const h = parseFloat(metricHeight);
    const w = parseFloat(metricWeight);
    if (h > 50 && h < 260 && w > 20 && w < 350) {
      const heightInMeters = h / 100;
      bmi = w / (heightInMeters * heightInMeters);
      const minW = 18.5 * (heightInMeters * heightInMeters);
      const maxW = 24.9 * (heightInMeters * heightInMeters);
      healthyWeightRange = `${minW.toFixed(1)} – ${maxW.toFixed(1)} kg`;
    }
  } else {
    const ft = parseFloat(imperialFeet) || 0;
    const inch = parseFloat(imperialInches) || 0;
    const totalInches = ft * 12 + inch;
    const w = parseFloat(imperialWeight);
    if (totalInches >= 24 && totalInches <= 100 && w >= 40 && w <= 700) {
      bmi = (w * 703) / (totalInches * totalInches);
      const minLbs = (18.5 * (totalInches * totalInches)) / 703;
      const maxLbs = (24.9 * (totalInches * totalInches)) / 703;
      healthyWeightRange = `${minLbs.toFixed(1)} – ${maxLbs.toFixed(1)} lbs`;
    }
  }

  // Determine category & colors
  let category = null;
  let categoryColor = "";
  let categoryBg = "";
  let categoryBorder = "";
  let meterPercent = 0;

  if (bmi !== null) {
    if (bmi < 18.5) {
      category = "Underweight";
      categoryColor = "text-sky-400";
      categoryBg = "bg-sky-500/10";
      categoryBorder = "border-sky-500/30";
      // Scale from 14 to 18.5 -> 0% to 25%
      meterPercent = Math.max(5, Math.min(25, ((bmi - 14) / (18.5 - 14)) * 25));
    } else if (bmi <= 24.9) {
      category = "Normal Weight";
      categoryColor = "text-emerald-400";
      categoryBg = "bg-emerald-500/10";
      categoryBorder = "border-emerald-500/30";
      // Scale from 18.5 to 24.9 -> 25% to 50%
      meterPercent = 25 + ((bmi - 18.5) / (24.9 - 18.5)) * 25;
    } else if (bmi <= 29.9) {
      category = "Overweight";
      categoryColor = "text-amber-400";
      categoryBg = "bg-amber-500/10";
      categoryBorder = "border-amber-500/30";
      // Scale from 25 to 29.9 -> 50% to 75%
      meterPercent = 50 + ((bmi - 25) / (29.9 - 25)) * 25;
    } else {
      category = "Obese";
      categoryColor = "text-rose-400";
      categoryBg = "bg-rose-500/10";
      categoryBorder = "border-rose-500/30";
      // Scale from 30 to 40 -> 75% to 95%
      meterPercent = Math.min(95, 75 + ((bmi - 30) / (40 - 30)) * 20);
    }
  }

  return (
    <div className="relative inline-block text-left">
      {/* ── Cute BMI Trigger Button ────────────────────── */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Calculate BMI dropdown"
        className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer select-none ${
          isOpen
            ? "bg-gradient-to-r from-orange-500/25 to-amber-500/25 text-orange-300 border-orange-500/50 shadow-md shadow-orange-500/20 ring-1 ring-orange-500/40"
            : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700/80 hover:border-orange-500/40 hover:shadow-sm hover:shadow-orange-500/10"
        } border`}
      >
        {/* Cute micro-glow dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-orange-500 to-amber-500" />
        </span>

        {/* Cute Icon */}
        <Scale className="h-3.5 w-3.5 text-orange-400 group-hover:scale-110 transition-transform duration-200" />

        {/* Text */}
        <span className="font-medium">BMI Calc</span>

        {/* Chevron arrow indicator */}
        <ChevronDown
          className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-orange-400" : "group-hover:text-zinc-200"
          }`}
        />
      </button>

      {/* ── Dropdown Tile ──────────────────────────────── */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="region"
          aria-label="BMI Calculator Dropdown Tile"
          className="absolute right-0 sm:right-0 top-full mt-2.5 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 sm:p-5 shadow-2xl shadow-black/90 backdrop-blur-2xl ring-1 ring-orange-500/20 transition-all animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Subtle Top Accent Glow Pill */}
          <div className="h-1 w-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto mb-3 opacity-80" />

          {/* Tile Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Calculator className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  BMI Calculator
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close BMI dropdown"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Unit Switcher */}
          <div className="mt-3.5 flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => setUnit("metric")}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                unit === "metric"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Metric (cm, kg)
            </button>
            <button
              type="button"
              onClick={() => setUnit("imperial")}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                unit === "imperial"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Imperial (ft, lbs)
            </button>
          </div>

          {/* Input Form Fields */}
          <div className="mt-3.5 space-y-3">
            {unit === "metric" ? (
              <div className="grid grid-cols-2 gap-2.5">
                {/* Height (cm) */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Height <span className="text-zinc-500">(cm)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="50"
                      max="260"
                      value={metricHeight}
                      onChange={(e) => setMetricHeight(e.target.value)}
                      placeholder="e.g. 175"
                      className="w-full h-8 px-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">
                      cm
                    </span>
                  </div>
                </div>

                {/* Weight (kg) */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Weight <span className="text-zinc-500">(kg)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="20"
                      max="350"
                      value={metricWeight}
                      onChange={(e) => setMetricWeight(e.target.value)}
                      placeholder="e.g. 70"
                      className="w-full h-8 px-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">
                      kg
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Height: Feet + Inches */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Height <span className="text-zinc-500">(ft & in)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="2"
                        max="8"
                        value={imperialFeet}
                        onChange={(e) => setImperialFeet(e.target.value)}
                        placeholder="5"
                        className="w-full h-8 px-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">
                        ft
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={imperialInches}
                        onChange={(e) => setImperialInches(e.target.value)}
                        placeholder="10"
                        className="w-full h-8 px-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">
                        in
                      </span>
                    </div>
                  </div>
                </div>

                {/* Weight (lbs) */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Weight <span className="text-zinc-500">(lbs)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="40"
                      max="700"
                      value={imperialWeight}
                      onChange={(e) => setImperialWeight(e.target.value)}
                      placeholder="e.g. 160"
                      className="w-full h-8 px-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">
                      lbs
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick actions: Sample & Reset */}
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleFillSample}
              className="text-orange-400/90 hover:text-orange-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              Try sample values
            </button>
            {(metricHeight || metricWeight || imperialFeet || imperialWeight) && (
              <button
                type="button"
                onClick={handleReset}
                className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* ── Calculation Result Section ────────────────── */}
          {bmi !== null ? (
            <div className="mt-3.5 pt-3 border-t border-zinc-800/80 space-y-3">
              {/* BMI Score & Status Banner */}
              <div
                className={`p-3 rounded-xl border ${categoryBorder} ${categoryBg} flex items-center justify-between`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                    Your Result
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-extrabold tracking-tight text-white font-mono">
                      {bmi.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">BMI</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${categoryBorder} ${categoryColor}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {category}
                  </span>
                  {healthyWeightRange && (
                    <span className="block text-[10px] text-zinc-400 mt-1">
                      Ideal: {healthyWeightRange}
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Segmented Spectrum Gauge */}
              <div className="space-y-1">
                <div className="relative h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                  <div
                    className="h-full bg-sky-500"
                    style={{ width: "25%" }}
                    title="Underweight (<18.5)"
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: "25%" }}
                    title="Normal (18.5-24.9)"
                  />
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: "25%" }}
                    title="Overweight (25-29.9)"
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: "25%" }}
                    title="Obese (≥30)"
                  />
                </div>

                {/* Animated Needle Marker */}
                <div className="relative h-2 w-full">
                  <div
                    className="absolute -top-1 -translate-x-1/2 transition-all duration-300"
                    style={{ left: `${meterPercent}%` }}
                  >
                    <div className="w-2.5 h-2.5 bg-white rounded-full shadow-lg border-2 border-zinc-950 ring-1 ring-orange-500" />
                  </div>
                </div>

                {/* Scale legends */}
                <div className="flex justify-between text-[9px] text-zinc-500 pt-0.5 font-mono">
                  <span>&lt;18.5</span>
                  <span>18.5–24.9</span>
                  <span>25–29.9</span>
                  <span>30+</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3.5 pt-3 border-t border-zinc-800/80">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-center">
                <p className="text-xs text-zinc-400">
                  Enter your height and weight above to compute your BMI instantly.
                </p>
                <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> &lt;18.5
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 18.5–24.9
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> 25–29.9
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> 30+
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
