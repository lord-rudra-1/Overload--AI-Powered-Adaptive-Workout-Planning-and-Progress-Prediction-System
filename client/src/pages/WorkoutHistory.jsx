import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import {
  History,
  Calendar,
  Clock,
  Dumbbell,
  TrendingUp,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
  const [workoutLogsMap, setWorkoutLogsMap] = useState({});

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await api.get("/workouts?status=COMPLETED");
        if (res.data?.success && res.data?.data?.workouts) {
          setWorkouts(res.data.data.workouts);
        }
      } catch (err) {
        console.error("Failed to load workout history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const toggleExpand = async (workoutId) => {
    if (expandedWorkoutId === workoutId) {
      setExpandedWorkoutId(null);
      return;
    }

    setExpandedWorkoutId(workoutId);

    if (!workoutLogsMap[workoutId]) {
      try {
        const res = await api.get(`/performance/workout/${workoutId}`);
        if (res.data?.success && res.data?.data) {
          setWorkoutLogsMap((prev) => ({
            ...prev,
            [workoutId]: res.data.data,
          }));
        }
      } catch (err) {
        console.error("Failed to load sets for workout:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-3">
          <History className="h-8 w-8 text-orange-500" />
          Completed Workout History
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Historical logbook of all executed training sessions, set volumes, and perceived exertion.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm">Loading historical sessions...</p>
        </div>
      ) : workouts.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8">
          <History className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-200">No Completed Workouts Yet</h3>
          <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
            Once you perform and complete workouts, your detailed volume and performance logs will appear here.
          </p>
          <Link to="/plan" className="inline-block mt-4">
            <Button size="sm" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              Go to Workout Plan
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((w) => {
            const isExpanded = expandedWorkoutId === w.id;
            const logDetails = workoutLogsMap[w.id];

            return (
              <Card key={w.id} className="border-zinc-800 bg-zinc-900/80">
                <CardHeader className="p-4 cursor-pointer hover:bg-zinc-800/30 transition-colors" onClick={() => toggleExpand(w.id)}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-100">
                          {w.notes || `Day ${w.dayNum}`}
                        </h3>
                        <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(w.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {w.duration && (
                            <span className="flex items-center gap-1 text-zinc-500">
                              <Clock className="h-3 w-3" />
                              {w.duration} mins
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <span className="text-xs text-zinc-400 block">
                          {w.exercises?.length || 0} Exercises Prescribed
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="text-zinc-400 h-8 w-8">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="p-4 pt-0 border-t border-zinc-800/60 mt-2 space-y-4">
                    {!logDetails ? (
                      <div className="py-4 text-center text-xs text-zinc-500">
                        Loading set breakdown...
                      </div>
                    ) : logDetails.logs?.length === 0 ? (
                      <div className="py-4 text-center text-xs text-zinc-500">
                        No sets were logged for this session.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Metrics Bar */}
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-zinc-950 font-mono text-xs">
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase">
                              Volume Load
                            </span>
                            <span className="font-bold text-orange-400 text-sm">
                              {logDetails.metrics?.totalVolume || 0} kg
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase">
                              Total Sets / Reps
                            </span>
                            <span className="font-bold text-zinc-200 text-sm">
                              {logDetails.metrics?.totalSets || 0}s / {logDetails.metrics?.totalReps || 0}r
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase">
                              Average RPE
                            </span>
                            <span className="font-bold text-zinc-200 text-sm">
                              {logDetails.metrics?.avgRpe || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Sets List */}
                        <div className="border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800/60 text-xs">
                          {logDetails.logs.map((log) => (
                            <div
                              key={log.id}
                              className="p-2.5 flex items-center justify-between font-mono bg-zinc-900/40"
                            >
                              <div>
                                <span className="font-semibold text-zinc-200 block">
                                  {log.exercise?.name}
                                </span>
                                <span className="text-[11px] text-zinc-500">
                                  Set #{log.setNumber}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-orange-400 font-bold">
                                  {log.weight} kg × {log.repetitions} reps
                                </span>
                                <span className="text-zinc-400 text-[11px] block">
                                  RPE {log.rpe || 8}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
