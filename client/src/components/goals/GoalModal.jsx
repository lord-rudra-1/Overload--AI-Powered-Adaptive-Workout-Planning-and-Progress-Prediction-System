import React, { useState, useEffect } from "react";
import { X, Target, Plus, Calendar, Dumbbell, Sparkles, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function GoalModal({ isOpen, onClose, onGoalCreated }) {
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCatalog() {
      if (!isOpen) return;
      try {
        setLoadingExercises(true);
        const res = await api.get("/exercises");
        if (res.data?.success && res.data?.data?.exercises) {
          const list = res.data.data.exercises;
          setExercises(list);
          if (list.length > 0 && !selectedExerciseId) {
            // Default to compound barbell exercise if present
            const bench = list.find((e) => e.name.toLowerCase().includes("bench press"));
            setSelectedExerciseId(bench ? bench.id.toString() : list[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load exercises for goal creator:", err);
      } finally {
        setLoadingExercises(false);
      }
    }

    fetchCatalog();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedExerciseId || !targetWeight) {
      setError("Please select an exercise and enter your target 1RM.");
      return;
    }

    const weightNum = parseFloat(targetWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError("Target weight must be a positive number.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/profile/goal", {
        exerciseId: parseInt(selectedExerciseId, 10),
        targetWeight: weightNum,
        targetDate: targetDate || undefined,
      });

      if (res.data?.success && res.data?.data?.goal) {
        if (onGoalCreated) onGoalCreated(res.data.data.goal);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to create target goal.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedExercise = exercises.find((e) => e.id.toString() === selectedExerciseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-sm">Add Strength Goal</h3>
              <p className="text-[11px] text-zinc-400">Track 1RM target with predictive autoregulation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="goal-exercise" className="text-xs text-zinc-300">
                Movement / Exercise
              </Label>
              <Select
                id="goal-exercise"
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                disabled={loadingExercises}
                className="bg-zinc-950 border-zinc-800"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.muscleGroup} · {ex.equipment})
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="target-weight" className="text-xs text-zinc-300">
                  Target 1RM (kg)
                </Label>
                <div className="relative">
                  <Input
                    id="target-weight"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 100"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="font-mono bg-zinc-950 border-zinc-800 text-orange-400 font-bold"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-zinc-500">kg</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="target-date" className="text-xs text-zinc-300">
                  Target Date (Optional)
                </Label>
                <Input
                  id="target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-xs"
                />
              </div>
            </div>

            {/* Scientific explanation callout */}
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs space-y-1 text-zinc-400">
              <div className="flex items-center gap-1.5 text-orange-400 font-semibold text-[11px]">
                <Sparkles className="h-3.5 w-3.5" />
                Adaptive Regression Model
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Overload estimates your current 1RM via the Epley formula after each session and uses time-series regression to project your expected date of achievement.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Save Strength Goal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
