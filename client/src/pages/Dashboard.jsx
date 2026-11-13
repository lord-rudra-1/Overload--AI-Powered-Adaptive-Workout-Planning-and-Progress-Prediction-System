import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  Flame,
  Target,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Dumbbell,
  TrendingUp,
  Calendar,
  Sparkles,
  Layers,
  Play,
  Activity,
  History,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GoalModal from "@/components/goals/GoalModal";
import { useToast } from "@/context/ToastContext";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [goals, setGoals] = useState([]);
  const [nextWorkout, setNextWorkout] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const isProfileComplete = Boolean(user?.experience && user?.trainingDays && user?.bodyWeight);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const [goalsRes, workoutsRes, summaryRes] = await Promise.allSettled([
          api.get("/profile/goals"),
          api.get("/workouts?status=PLANNED&limit=1"),
          api.get("/performance/summary"),
        ]);

        if (goalsRes.status === "fulfilled" && goalsRes.value.data?.success) {
          setGoals(goalsRes.value.data.data.goals || []);
        }

        if (workoutsRes.status === "fulfilled" && workoutsRes.value.data?.success) {
          const list = workoutsRes.value.data.data.workouts || [];
          setNextWorkout(list[0] || null);
        }

        if (summaryRes.status === "fulfilled" && summaryRes.value.data?.success) {
          setSummary(summaryRes.value.data.data);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Remove this strength goal?")) return;
    try {
      await api.delete(`/profile/goal/${goalId}`);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      toast.info("Strength goal removed.");
    } catch (err) {
      console.error("Failed to delete goal:", err);
      toast.error("Failed to remove strength goal.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600/20 via-zinc-900 to-zinc-900 border border-orange-500/20 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-orange-400">
              <Flame className="h-3.5 w-3.5" />
              Overload Adaptive Engine Active
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-100">
              Welcome, {user?.name || "Athlete"}
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              "The plan stops being an input the user follows and becomes an output the system recomputes."
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/plan">
              <Button size="sm" className="gap-2 shadow-lg shadow-orange-500/20">
                <Dumbbell className="h-4 w-4" />
                View Workout Plan
              </Button>
            </Link>
            <Link to="/exercises">
              <Button variant="outline" size="sm" className="gap-2">
                Catalog
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-900/80 border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Adherence Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-orange-400 font-mono">
              {summary?.adherenceRate ? `${Math.round(summary.adherenceRate * 100)}%` : "100%"}
            </span>
            <span className="text-xs text-zinc-500">rolling 4wk</span>
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900/80 border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Total Volume Load
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-zinc-100 font-mono">
              {summary?.totalVolume?.toLocaleString() || "0"}
            </span>
            <span className="text-xs text-zinc-500">kg moved</span>
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900/80 border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Completed Sessions
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {summary?.totalWorkoutsCompleted || 0}
            </span>
            <span className="text-xs text-zinc-500">workouts</span>
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900/80 border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Training Trend
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold capitalize text-zinc-200">
              {summary?.trainingTrend?.classification || "Active"}
            </span>
            {summary?.trainingTrend?.trendRatio && (
              <span className="text-xs text-orange-400 font-mono">
                {summary.trainingTrend.trendRatio}x
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Main Grid: Next Session & Strength Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Scheduled Workout Card */}
        <Card className="border-orange-500/30 bg-zinc-900/90 shadow-xl lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="default" className="text-[10px] mb-1">
                  Next Prescription
                </Badge>
                <CardTitle className="text-xl font-bold text-zinc-100">
                  {nextWorkout?.notes || "Upcoming Session"}
                </CardTitle>
              </div>
              {nextWorkout && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/workout/${nextWorkout.id}`)}
                  className="gap-2 shadow-md shadow-orange-500/20"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Start Workout
                </Button>
              )}
            </div>
            {nextWorkout && (
              <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                Scheduled for {new Date(nextWorkout.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {!nextWorkout ? (
              <div className="py-8 text-center border border-dashed border-zinc-800 rounded-lg">
                <Dumbbell className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">No scheduled workouts found.</p>
                <Link to="/plan" className="inline-block mt-3">
                  <Button size="sm" className="gap-2 text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate Schedule
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-800">
                  Prescribed Movements:
                </div>
                <div className="divide-y divide-zinc-800/50">
                  {nextWorkout.exercises?.map((item) => (
                    <div
                      key={item.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-zinc-200">
                          {item.exercise?.name}
                        </span>
                        <p className="text-[11px] text-zinc-500 capitalize">
                          {item.exercise?.muscleGroup} · {item.exercise?.equipment}
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-orange-400">
                          {item.targetWeight} kg
                        </span>
                        <span className="text-zinc-400 ml-2">
                          {item.targetSets}s × {item.targetReps}r @ RPE {item.targetRPE || 8}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          {nextWorkout && (
            <CardFooter className="pt-2 border-t border-zinc-800/60 flex justify-between">
              <span className="text-[11px] text-zinc-500 italic">
                Targets dynamically update when previous workouts complete.
              </span>
              <Link to="/plan">
                <Button variant="ghost" size="sm" className="text-xs text-orange-400">
                  Full Schedule →
                </Button>
              </Link>
            </CardFooter>
          )}
        </Card>

        {/* Profile & Goals Summary */}
        <div className="space-y-6">
          {/* Active Goals Card */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  Strength Targets
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {goals.length}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsGoalModalOpen(true)}
                    className="h-7 px-2 text-xs gap-1 border-zinc-800 text-zinc-300 hover:text-orange-400 hover:border-orange-500/50"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-zinc-800 rounded-lg">
                  <p className="text-xs text-zinc-400">No active goal set.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsGoalModalOpen(true)}
                    className="mt-2 text-xs gap-1.5"
                  >
                    <Plus className="h-3 w-3" /> Set Strength Target
                  </Button>
                </div>
              ) : (
                goals.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">
                        {g.exercise?.name || "Exercise"}
                      </h4>
                      <p className="text-[10px] text-zinc-500 capitalize">
                        {g.exercise?.muscleGroup} {g.targetDate ? `· by ${new Date(g.targetDate).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-base font-bold text-orange-400 font-mono">
                          {g.targetWeight} kg
                        </span>
                        <p className="text-[9px] text-zinc-500 uppercase">Target 1RM</p>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove goal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Profile Status Card */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-orange-400" />
                  Athlete Config
                </CardTitle>
                <Link to="/profile-setup">
                  <Button variant="ghost" size="sm" className="text-[11px] h-7 text-zinc-400">
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500">Experience:</span>
                <span className="font-medium capitalize text-zinc-300">
                  {user?.experience || "Beginner"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500">Days / Week:</span>
                <span className="font-medium text-zinc-300">
                  {user?.trainingDays || 3} days
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Plate Jump:</span>
                <span className="font-medium text-zinc-300 font-mono">
                  +{user?.increment || 2.5} kg
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Goal Creator Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onGoalCreated={(newGoal) => {
          setGoals((prev) => [newGoal, ...prev]);
          toast.success(
            `Target 1RM set to ${newGoal.targetWeight} kg`,
            `${newGoal.exercise?.name || "Strength"} Goal Created`
          );
        }}
      />
    </div>
  );
}
