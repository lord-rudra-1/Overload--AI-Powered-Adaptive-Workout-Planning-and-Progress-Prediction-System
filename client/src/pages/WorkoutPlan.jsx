import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
  Dumbbell,
  Play,
  RotateCw,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Loader2,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WorkoutPlan() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/workouts");
      if (res.data?.success && res.data?.data?.workouts) {
        setWorkouts(res.data.data.workouts);
      }
    } catch (err) {
      console.error("Failed to load workouts:", err);
      setError("Failed to fetch workout schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleGeneratePlan = async () => {
    try {
      setGenerating(true);
      setError("");
      const res = await api.post("/workouts/generate");
      if (res.data?.success) {
        await fetchWorkouts();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate workout plan.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSkipWorkout = async (id) => {
    if (!window.confirm("Are you sure you want to mark this workout as skipped?")) return;
    try {
      await api.put(`/workouts/${id}/skip`);
      fetchWorkouts();
    } catch (err) {
      console.error("Failed to skip workout:", err);
    }
  };

  const plannedWorkouts = workouts.filter((w) => w.status === "PLANNED" || w.status === "IN_PROGRESS");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-3">
            <Dumbbell className="h-8 w-8 text-orange-500" />
            Adaptive Workout Schedule
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Dynamic split prescribed to your available days, equipment, and experience level.
          </p>
        </div>

        <Button
          onClick={handleGeneratePlan}
          disabled={generating}
          className="gap-2 shadow-lg shadow-orange-500/20"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Computing Schedule...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate / Reset Weekly Plan
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm">Retrieving your workout schedule...</p>
        </div>
      ) : plannedWorkouts.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8">
          <Layers className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-zinc-200">No Active Workout Plan</h3>
          <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
            You don't have any upcoming planned workouts. Click below to generate your personalized split.
          </p>
          <Button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="mt-6 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate My Personalized Split
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-200">
              Upcoming Training Sessions ({plannedWorkouts.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plannedWorkouts.map((workout) => (
              <Card
                key={workout.id}
                className={`border-zinc-800 bg-zinc-900/80 transition-all ${
                  workout.status === "IN_PROGRESS"
                    ? "border-orange-500/50 shadow-lg shadow-orange-500/10"
                    : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-bold text-zinc-100">
                          {workout.notes || `Day ${workout.dayNum}`}
                        </CardTitle>
                        {workout.status === "IN_PROGRESS" && (
                          <Badge variant="default" className="text-[10px] animate-pulse">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Scheduled: {new Date(workout.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Skip workout"
                        onClick={() => handleSkipWorkout(workout.id)}
                        className="text-zinc-500 hover:text-zinc-300 h-8 w-8"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/workout/${workout.id}`)}
                        className="gap-2"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        {workout.status === "IN_PROGRESS" ? "Resume" : "Start"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Prescribed Targets:
                  </div>
                  <div className="divide-y divide-zinc-800/50">
                    {workout.exercises.map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-medium text-zinc-200">
                            {item.exercise?.name}
                          </p>
                          <span className="text-[11px] text-zinc-500 capitalize">
                            {item.exercise?.muscleGroup} · {item.exercise?.equipment}
                          </span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-orange-400 text-sm">
                            {item.targetWeight} kg
                          </span>
                          <p className="text-[11px] text-zinc-400">
                            {item.targetSets} sets × {item.targetReps} reps @ RPE {item.targetRPE || 8}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
