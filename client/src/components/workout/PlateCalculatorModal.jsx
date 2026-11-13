import React, { useState } from "react";
import { X, Dumbbell, Plus, Minus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PLATE_COLORS = {
  25: { bg: "bg-red-600 text-white border-red-700", label: "25 kg", height: "h-24", width: "w-5" },
  20: { bg: "bg-blue-600 text-white border-blue-700", label: "20 kg", height: "h-24", width: "w-5" },
  15: { bg: "bg-yellow-500 text-zinc-950 font-bold border-yellow-600", label: "15 kg", height: "h-20", width: "w-4.5" },
  10: { bg: "bg-emerald-600 text-white border-emerald-700", label: "10 kg", height: "h-16", width: "w-4" },
  5: { bg: "bg-zinc-200 text-zinc-950 font-bold border-zinc-300", label: "5 kg", height: "h-13", width: "w-3.5" },
  2.5: { bg: "bg-zinc-700 text-white border-zinc-600", label: "2.5 kg", height: "h-11", width: "w-3" },
  1.25: { bg: "bg-zinc-400 text-zinc-950 font-bold border-zinc-300", label: "1.25 kg", height: "h-9", width: "w-2.5" },
};

const STANDARD_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export default function PlateCalculatorModal({ isOpen, onClose, initialWeight = 60 }) {
  const [totalWeight, setTotalWeight] = useState(parseFloat(initialWeight) || 60);
  const [barWeight, setBarWeight] = useState(20);

  if (!isOpen) return null;

  // Calculate plates per side
  const weightToLoad = Math.max(0, totalWeight - barWeight);
  const perSideTarget = weightToLoad / 2;

  let remaining = perSideTarget;
  const plateCounts = [];

  for (const plate of STANDARD_PLATES) {
    if (remaining >= plate) {
      const count = Math.floor(remaining / plate);
      plateCounts.push({ weight: plate, count });
      remaining = Math.round((remaining - count * plate) * 100) / 100;
    }
  }

  const remainder = remaining;

  const handleAdjust = (delta) => {
    setTotalWeight((prev) => Math.max(barWeight, Math.round((prev + delta) * 10) / 10));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-sm">Barbell Plate Calculator</h3>
              <p className="text-[11px] text-zinc-400">Standard Olympic Plate Loading Breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Controls: Target Weight & Bar Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Total Barbell Weight</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.5"
                  value={totalWeight}
                  onChange={(e) => setTotalWeight(parseFloat(e.target.value) || 0)}
                  className="font-mono font-bold text-base bg-zinc-950 border-zinc-800"
                />
                <span className="text-xs font-bold text-zinc-400">kg</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Bar Type</label>
              <select
                value={barWeight}
                onChange={(e) => setBarWeight(parseFloat(e.target.value))}
                className="w-full h-10 px-3 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value={20}>20 kg (Standard Olympic)</option>
                <option value={15}>15 kg (Women's Olympic)</option>
                <option value={10}>10 kg (Technique / EZ-Bar)</option>
                <option value={0}>0 kg (Smith / Cable load)</option>
              </select>
            </div>
          </div>

          {/* Quick Adjust Buttons */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {[-10, -5, -2.5, +2.5, +5, +10].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => handleAdjust(delta)}
                className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 hover:border-orange-500 hover:text-orange-400 transition-colors"
              >
                {delta > 0 ? `+${delta}` : delta} kg
              </button>
            ))}
          </div>

          {/* Graphical Barbell Visualizer */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center">
            <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-2">
              Visual Barbell Sleeve (Each Side: <span className="text-orange-400 font-mono">{perSideTarget.toFixed(2)} kg</span>)
            </div>

            {/* The Bar with Plates */}
            <div className="relative w-full h-32 flex items-center justify-center">
              {/* Central Barbell Shaft */}
              <div className="absolute inset-x-4 h-3 bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-700 rounded-sm shadow-inner" />
              
              {/* Bar Collar */}
              <div className="relative z-10 w-4 h-14 bg-zinc-800 border border-zinc-600 rounded-sm mr-2 shadow" />

              {/* Plates stacked on sleeve from inside out */}
              <div className="relative z-10 flex items-center gap-1 overflow-x-auto max-w-[80%] py-2">
                {plateCounts.length === 0 ? (
                  <div className="text-xs text-zinc-500 italic pl-3">Only empty bar</div>
                ) : (
                  plateCounts.map(({ weight, count }) =>
                    Array.from({ length: count }).map((_, i) => {
                      const meta = PLATE_COLORS[weight];
                      return (
                        <div
                          key={`${weight}-${i}`}
                          className={`flex items-center justify-center rounded-sm border shadow-md font-mono text-[9px] select-none ${meta.height} ${meta.width} ${meta.bg}`}
                          title={`${weight} kg plate`}
                        >
                          <span className="-rotate-90 whitespace-nowrap">{weight}</span>
                        </div>
                      );
                    })
                  )
                )}
              </div>

              {/* Outer End Collar / Sleeve tip */}
              <div className="relative z-10 w-2 h-7 bg-zinc-600 rounded-r shadow ml-1" />
            </div>

            {remainder > 0 && (
              <p className="text-[11px] text-amber-400 mt-2">
                ⚠️ Exact match requires {remainder * 2} kg fractional microplates not in standard set.
              </p>
            )}
          </div>

          {/* Plate Inventory Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Plates to load per side:
            </h4>
            {plateCounts.length === 0 ? (
              <p className="text-xs text-zinc-500">No plates needed. Just the {barWeight} kg bar.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {plateCounts.map(({ weight, count }) => (
                  <div
                    key={weight}
                    className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${PLATE_COLORS[weight]?.bg.split(" ")[0]}`} />
                      <span className="text-xs font-mono font-bold text-zinc-200">{weight} kg</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs text-orange-400 border-zinc-700">
                      × {count}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <Button onClick={onClose} size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
