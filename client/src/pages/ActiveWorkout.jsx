import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
  Play,
  CheckCircle2,
  Clock,
  Dumbbell,
  Plus,
  Trash2,
  Flame,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  TrendingUp,
  History,
  Calculator,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PlateCalculatorModal from "@/components/workout/PlateCalculatorModal";
import RestTimerBar from "@/components/workout/RestTimerBar";
import { useToast } from "@/context/ToastContext";

export default function ActiveWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [workout, setWorkout] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Input state for logging set
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [inputWeight, setInputWeight] = useState("");
  const [inputReps, setInputReps] = useState("");
  const [inputRpe, setInputRpe] = useState("8.0");
  const [isLoggingSet, setIsLoggingSet] = useState(false);

  // Session elapsed timer state
  const [seconds, setSeconds] = useState(0);

  // Rest Timer state
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [totalRestTime, setTotalRestTime] = useState(90);
  const [isRestRunning, setIsRestRunning] = useState(false);

  // Plate Calculator state
  const [plateModalOpen, setPlateModalOpen] = useState(false);
  const [plateModalWeight, setPlateModalWeight] = useState(60);

  // Previous performance history (ghosting)
  const [previousLogs, setPreviousLogs] = useState([]);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  // Completion / Adaptation state
  const [isCompleting, setIsCompleting] = useState(false);
  const [adaptationResult, setAdaptationResult] = useState(null);

  const fetchWorkoutData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/workouts/${id}`);
      if (res.data?.success && res.data?.data) {
        setWorkout(res.data.data.workout);
        setLogs(res.data.data.performanceLogs || []);

        // Start workout if PLANNED
        if (res.data.data.workout.status === "PLANNED") {
          await api.put(`/workouts/${id}/start`);
        }
      }
    } catch (err) {
      console.error("Failed to load workout:", err);
      setError("Failed to load workout details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutData();
  }, [id]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentExercise = workout?.exercises?.[activeExerciseIndex];

  // Fetch previous exercise performance history for ghosting
  useEffect(() => {
    async function fetchPreviousPerformance() {
      if (!currentExercise?.exerciseId) return;
      try {
        setLoadingPrevious(true);
        const res = await api.get(`/performance/exercise/${currentExercise.exerciseId}`);
        if (res.data?.success && res.data?.data?.logs) {
          const pastLogs = res.data.data.logs.filter(
            (l) => l.workoutId !== parseInt(id, 10)
          );
          setPreviousLogs(pastLogs);
        }
      } catch (err) {
        console.error("Failed to load previous exercise performance:", err);
      } finally {
        setLoadingPrevious(false);
      }
    }

    fetchPreviousPerformance();
  }, [currentExercise?.exerciseId, id]);

  // Extract the most recent previous session's logs for this exercise
  const lastSessionLogs = useMemo(() => {
    if (!previousLogs.length) return [];
    const sorted = [...previousLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastWorkoutId = sorted[0]?.workoutId;
    if (lastWorkoutId) {
      return sorted
        .filter((l) => l.workoutId === lastWorkoutId)
        .sort((a, b) => a.setNumber - b.setNumber);
    }
    return [sorted[0]];
  }, [previousLogs]);

  // Set default weight & reps when changing active exercise
  useEffect(() => {
    if (currentExercise) {
      setInputWeight(currentExercise.targetWeight.toString());
      setInputReps(currentExercise.targetReps.toString());
      setInputRpe((currentExercise.targetRPE || 8.0).toFixed(1));
    }
  }, [activeExerciseIndex, workout]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLogSet = async (e) => {
    e.preventDefault();
    if (!currentExercise || !inputWeight || !inputReps) return;

    try {
      setIsLoggingSet(true);
      const exerciseLogs = logs.filter((l) => l.exerciseId === currentExercise.exerciseId);
      const nextSetNumber = exerciseLogs.length + 1;

      const res = await api.post("/performance/log", {
        exerciseId: currentExercise.exerciseId,
        workoutId: parseInt(id, 10),
        setNumber: nextSetNumber,
        weight: parseFloat(inputWeight),
        repetitions: parseInt(inputReps, 10),
        rpe: parseFloat(inputRpe),
      });

      if (res.data?.success && res.data?.data?.log) {
        setLogs((prev) => [...prev, res.data.data.log]);
        toast.success(
          `Logged ${inputWeight} kg × ${inputReps} reps @ RPE ${inputRpe}`,
          `Set #${nextSetNumber} Recorded`
        );
        // Auto-start rest timer
        setRestTimeLeft(totalRestTime);
        setIsRestRunning(true);
      }
    } catch (err) {
      console.error("Failed to log set:", err);
      toast.error(err.response?.data?.error || "Failed to record set.");
    } finally {
      setIsLoggingSet(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    try {
      await api.delete(`/performance/${logId}`);
      setLogs((prev) => prev.filter((l) => l.id !== logId));
      toast.info("Set removed from workout session.");
    } catch (err) {
      console.error("Failed to delete set:", err);
      toast.error("Failed to remove set.");
    }
  };

  const handleCompleteWorkout = async () => {
    if (logs.length === 0) {
      if (!window.confirm("You haven't logged any sets. Complete anyway?")) return;
    }

    try {
      setIsCompleting(true);
      const durationMinutes = Math.max(1, Math.round(seconds / 60));
      const res = await api.put(`/workouts/${id}/complete`, {
        duration: durationMinutes,
      });

      if (res.data?.success && res.data?.data) {
        setAdaptationResult(res.data.data);
      }
    } catch (err) {
      console.error("Failed to complete workout:", err);
      alert("Error completing workout: " + (err.response?.data?.error || err.message));
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm">Initializing active session...</p>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="p-8 text-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
        {error || "Workout not found."}
      </div>
    );
  }

  // If workout was completed, show Adaptation Modal / Result View
  if (adaptationResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center border border-emerald-500/30 mb-2">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-100">
            Workout Completed!
          </h1>
          <p className="text-sm text-zinc-400">
            Duration: {Math.round(seconds / 60)} mins · Total sets logged: {logs.length}
          </p>
        </div>

        <Card className="border-orange-500/30 bg-zinc-900 shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-orange-400">
              <Sparkles className="h-5 w-5" />
              <CardTitle className="text-lg">Adaptive Engine Prescriptions</CardTitle>
            </div>
            <CardDescription>
              "The loop closes and keeps closing." Here is how your next workout was computed:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adaptationResult.adaptationSummaries?.length === 0 ? (
              <p className="text-xs text-zinc-400">
                Prescriptions maintained for future sessions.
              </p>
            ) : (
              <div className="space-y-3">
                {adaptationResult.adaptationSummaries?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-100 text-sm">
                        {item.exerciseName}
                      </span>
                      <Badge variant="default" className="text-[10px] font-mono">
                        {item.rule}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-zinc-500">
                        Prev: {item.previous.weight}kg × {item.previous.reps}r ({item.previous.sets}s)
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-orange-400" />
                      <span className="font-bold text-orange-400">
                        Next: {item.next.weight}kg × {item.next.reps}r ({item.next.sets}s)
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 italic bg-zinc-900/50 p-2 rounded">
                      "{item.reasoning}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full gap-2 shadow-lg shadow-orange-500/20"
              onClick={() => navigate("/")}
            >
              Return to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentExerciseLogs = logs.filter(
    (l) => l.exerciseId === currentExercise?.exerciseId
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Session Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-bold text-zinc-100">
              {workout.notes || `Day ${workout.dayNum}`}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Logging actual weight, repetitions, and perceived effort.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPlateModalWeight(currentExercise?.targetWeight || 60);
              setPlateModalOpen(true);
            }}
            className="gap-1.5 border-zinc-800 text-zinc-300 hover:text-orange-400 hover:border-orange-500/50 bg-zinc-950"
          >
            <Calculator className="h-4 w-4 text-orange-400" />
            <span className="hidden sm:inline">Plate Calc</span>
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-sm text-zinc-300">
            <Clock className="h-4 w-4 text-orange-400" />
            <span>{formatTimer(seconds)}</span>
          </div>

          <Button
            onClick={handleCompleteWorkout}
            disabled={isCompleting}
            className="gap-2 shadow-md shadow-orange-500/20"
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Computing Adaptation...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Finish Workout
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Exercise Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {workout.exercises.map((item, idx) => {
          const count = logs.filter((l) => l.exerciseId === item.exerciseId).length;
          const isComplete = count >= item.targetSets;
          const isActive = idx === activeExerciseIndex;

          return (
            <button
              key={item.id}
              onClick={() => setActiveExerciseIndex(idx)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-2 ${
                isActive
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                  : isComplete
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
            >
              <span>{item.exercise?.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] ${
                  isActive ? "bg-black/30 text-white" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {count}/{item.targetSets}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Exercise Detail Card */}
      {currentExercise && (
        <Card className="border-zinc-800 bg-zinc-900/90">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-orange-400" />
                  {currentExercise.exercise?.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                  <Badge variant="outline" className="capitalize text-[11px]">
                    {currentExercise.exercise?.muscleGroup}
                  </Badge>
                  <span className="capitalize">{currentExercise.exercise?.equipment}</span>
                </div>
              </div>

              {/* Target Prescription Pill & Performance Ghosting */}
              <div className="flex flex-col items-end gap-1.5">
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-right w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Prescribed Target
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPlateModalWeight(currentExercise.targetWeight);
                        setPlateModalOpen(true);
                      }}
                      className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium hover:underline"
                    >
                      <Calculator className="h-3 w-3" />
                      Calc Plates
                    </button>
                  </div>
                  <div className="flex items-baseline justify-end gap-2 mt-0.5">
                    <span className="font-mono font-black text-orange-400 text-lg">
                      {currentExercise.targetWeight} kg
                    </span>
                    <span className="text-xs text-zinc-300 font-mono">
                      {currentExercise.targetSets}s × {currentExercise.targetReps}r @ RPE {currentExercise.targetRPE || 8}
                    </span>
                  </div>
                </div>

                {/* Performance Ghosting: previous session for this exercise */}
                {lastSessionLogs.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-zinc-950/80 px-2.5 py-1 rounded-md border border-zinc-800">
                    <History className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span className="text-zinc-500 font-sans">Last Session:</span>
                    <span className="text-cyan-400 font-bold">{lastSessionLogs[0].weight} kg</span>
                    <span>×</span>
                    <span className="text-zinc-300">
                      {lastSessionLogs.map((l) => l.repetitions).join("-")} reps
                    </span>
                    <span className="text-zinc-500 text-[10px]">(@ RPE {lastSessionLogs[0].rpe || 8})</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Logged Sets Table */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Completed Sets ({currentExerciseLogs.length} / {currentExercise.targetSets})
              </h4>

              {currentExerciseLogs.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3 italic">
                  No sets logged yet for this exercise. Log your first set below.
                </p>
              ) : (
                <div className="border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800/60">
                  <div className="grid grid-cols-5 text-[11px] font-bold text-zinc-500 uppercase p-2 bg-zinc-950">
                    <span>Set</span>
                    <span>Weight</span>
                    <span>Reps</span>
                    <span>Effort (RPE / RIR)</span>
                    <span className="text-right">Action</span>
                  </div>

                  {currentExerciseLogs.map((log) => {
                    const hitTarget = log.repetitions >= currentExercise.targetReps;
                    const prevSetForComparison = lastSessionLogs[log.setNumber - 1];

                    return (
                      <div
                        key={log.id}
                        className="grid grid-cols-5 items-center p-2 text-xs font-mono text-zinc-300 bg-zinc-900/40"
                      >
                        <span className="font-bold text-zinc-400">#{log.setNumber}</span>
                        <div>
                          <span className="text-orange-400 font-bold">{log.weight} kg</span>
                          {prevSetForComparison && (
                            <span className="block text-[10px] text-zinc-500">
                              Prev: {prevSetForComparison.weight}kg
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{log.repetitions}</span>
                          {hitTarget ? (
                            <Badge variant="success" className="text-[9px] px-1 py-0">
                              Hit
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[9px] px-1 py-0">
                              Under
                            </Badge>
                          )}
                          {prevSetForComparison && (
                            <span className="text-[10px] text-zinc-500">
                              ({prevSetForComparison.repetitions}r)
                            </span>
                          )}
                        </div>
                        <span className="text-zinc-400 text-[11px]">
                          RPE {log.rpe || 8} · RIR {log.rir !== null ? log.rir : 2}
                        </span>
                        <div className="text-right">
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-zinc-500 hover:text-red-400 p-1"
                            title="Delete set"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Set Input Form */}
            <form onSubmit={handleLogSet} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">
                  Record Set #{currentExerciseLogs.length + 1}
                </span>
                <span className="text-[11px] text-zinc-500">
                  Computed RIR: {Math.max(0, 10 - parseFloat(inputRpe || 8))} reps in reserve
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weight" className="text-xs">
                      Weight (kg)
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        setPlateModalWeight(parseFloat(inputWeight) || currentExercise.targetWeight);
                        setPlateModalOpen(true);
                      }}
                      className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
                    >
                      <Calculator className="h-2.5 w-2.5" /> Plates
                    </button>
                  </div>
                  <Input
                    id="weight"
                    type="number"
                    step="0.5"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reps" className="text-xs">
                    Repetitions Completed
                  </Label>
                  <Input
                    id="reps"
                    type="number"
                    min="1"
                    max="100"
                    value={inputReps}
                    onChange={(e) => setInputReps(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="rpe" className="text-xs">
                    Perceived Effort (RPE)
                  </Label>
                  <Select
                    id="rpe"
                    value={inputRpe}
                    onChange={(e) => setInputRpe(e.target.value)}
                  >
                    <option value="6.0">6.0 — Light, ~4 reps in reserve</option>
                    <option value="6.5">6.5 — Moderate warm effort</option>
                    <option value="7.0">7.0 — 3 reps in reserve</option>
                    <option value="7.5">7.5 — ~2-3 reps in reserve</option>
                    <option value="8.0">8.0 — Standard (2 reps in reserve)</option>
                    <option value="8.5">8.5 — 1-2 reps in reserve</option>
                    <option value="9.0">9.0 — 1 rep in reserve</option>
                    <option value="9.5">9.5 — Max effort, maybe 0-1 rep</option>
                    <option value="10.0">10.0 — Complete failure / 0 RIR</option>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoggingSet}
                className="w-full gap-2 shadow-md shadow-orange-500/20"
              >
                {isLoggingSet ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Log Set #{currentExerciseLogs.length + 1}
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-zinc-800/80 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={activeExerciseIndex === 0}
              onClick={() => setActiveExerciseIndex((prev) => prev - 1)}
            >
              ← Previous Exercise
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={activeExerciseIndex === workout.exercises.length - 1}
              onClick={() => setActiveExerciseIndex((prev) => prev + 1)}
            >
              Next Exercise →
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Floating Rest Interval Timer */}
      <RestTimerBar
        timeLeft={restTimeLeft}
        setTimeLeft={setRestTimeLeft}
        totalRestTime={totalRestTime}
        setTotalRestTime={setTotalRestTime}
        isRunning={isRestRunning}
        setIsRunning={setIsRestRunning}
      />

      {/* Barbell Plate Loading Calculator Modal */}
      <PlateCalculatorModal
        isOpen={plateModalOpen}
        onClose={() => setPlateModalOpen(false)}
        initialWeight={plateModalWeight}
      />
    </div>
  );
}
