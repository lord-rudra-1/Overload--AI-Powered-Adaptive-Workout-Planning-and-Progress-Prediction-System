import React, { useState, useEffect } from "react";
import { X, ArrowLeftRight, Check, Dumbbell, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ExerciseSwapModal({
  isOpen,
  onClose,
  workoutExercise,
  onSwapped,
}) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState("");
  const [filterMuscle, setFilterMuscle] = useState(true);

  useEffect(() => {
    async function loadExercises() {
      if (!isOpen || !workoutExercise) return;
      try {
        setLoading(true);
        const res = await api.get("/exercises");
        if (res.data?.success && res.data?.data?.exercises) {
          setExercises(res.data.data.exercises);
        }
      } catch (err) {
        console.error("Failed to load exercises for swap:", err);
      } finally {
        setLoading(false);
      }
    }

    loadExercises();
  }, [isOpen, workoutExercise]);

  if (!isOpen || !workoutExercise) return null;

  const currentExercise = workoutExercise.exercise;

  // Filter exercises: exclude the current exercise, optionally filter by same muscle group
  const availableExercises = exercises.filter((ex) => {
    if (ex.id === currentExercise?.id) return false;
    if (filterMuscle && currentExercise?.muscleGroup) {
      return ex.muscleGroup.toLowerCase() === currentExercise.muscleGroup.toLowerCase();
    }
    return true;
  });

  const handleSelectSwap = async (newExerciseId) => {
    try {
      setSwapping(true);
      setError("");
      const res = await api.put(`/workouts/exercise/${workoutExercise.id}/swap`, {
        newExerciseId,
      });

      if (res.data?.success) {
        if (onSwapped) onSwapped();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to swap exercise.");
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-sm">Swap Scheduled Exercise</h3>
              <p className="text-[11px] text-zinc-400">
                Replace <span className="text-orange-400 font-semibold">{currentExercise?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 bg-zinc-950/70 border-b border-zinc-800/80 flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            Targeting: <strong className="text-zinc-200 capitalize">{currentExercise?.muscleGroup}</strong>
          </span>
          <button
            type="button"
            onClick={() => setFilterMuscle(!filterMuscle)}
            className="text-[11px] text-orange-400 hover:text-orange-300 underline font-medium"
          >
            {filterMuscle ? "Show all muscle groups" : "Show same muscle group only"}
          </button>
        </div>

        {/* Exercise List */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <p className="text-xs">Loading available replacement movements...</p>
            </div>
          ) : availableExercises.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No alternative exercises found for this category.
            </div>
          ) : (
            availableExercises.map((ex) => (
              <div
                key={ex.id}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900/60 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 group-hover:text-orange-400 transition-colors">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] capitalize border-zinc-700">
                      {ex.muscleGroup}
                    </Badge>
                    <span className="text-[11px] text-zinc-400 capitalize">{ex.equipment}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleSelectSwap(ex.id)}
                  disabled={swapping}
                  className="h-8 text-xs gap-1.5 bg-zinc-800 hover:bg-orange-500 text-zinc-200 hover:text-white transition-colors"
                >
                  {swapping ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <ArrowLeftRight className="h-3 w-3" />
                      Swap In
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
