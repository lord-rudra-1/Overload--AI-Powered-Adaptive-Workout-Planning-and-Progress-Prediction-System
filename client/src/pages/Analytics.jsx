import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Target,
  ShieldCheck,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";

export default function Analytics() {
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [predictionData, setPredictionData] = useState(null);
  const [volumeTrends, setVolumeTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load goals and volume data on mount
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);

        const [goalsRes, volumeRes] = await Promise.allSettled([
          api.get("/profile/goals"),
          api.get("/analytics/volume-trends"),
        ]);

        if (goalsRes.status === "fulfilled" && goalsRes.value.data?.success) {
          const list = goalsRes.value.data.data.goals || [];
          setGoals(list);
          if (list.length > 0) {
            setSelectedGoalId(list[0].id.toString());
          }
        }

        if (volumeRes.status === "fulfilled" && volumeRes.value.data?.success) {
          setVolumeTrends(volumeRes.value.data.data.volumeData || []);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  // Fetch prediction whenever selected goal changes
  useEffect(() => {
    if (!selectedGoalId) return;

    async function fetchPrediction() {
      try {
        const res = await api.get(`/analytics/prediction/${selectedGoalId}`);
        if (res.data?.success && res.data?.data) {
          setPredictionData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load goal prediction:", err);
      }
    }

    fetchPrediction();
  }, [selectedGoalId]);

  const prediction = predictionData?.prediction;
  const goal = predictionData?.goal;

  // Prepare combined time-series chart data (History + Forecast extrapolation)
  const combinedChartData = [];

  if (prediction?.history) {
    prediction.history.forEach((h) => {
      combinedChartData.push({
        name: h.date,
        actual1RM: h.e1rm,
        target: goal?.targetWeight,
      });
    });
  }

  if (prediction?.forecast) {
    prediction.forecast.forEach((f) => {
      combinedChartData.push({
        name: `Wk +${f.weekOffset}`,
        forecast1RM: f.predicted1RM,
        lowerBound: f.lowerBound,
        upperBound: f.upperBound,
        target: goal?.targetWeight,
      });
    });
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            Performance Intelligence & Forecasts
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Stage 5: Linear regression 1RM modeling, forecast uncertainty bands, and training load trends.
          </p>
        </div>

        {/* Goal Selector */}
        {goals.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Forecast Goal:</span>
            <Select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-56"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.exercise?.name} ({g.targetWeight} kg)
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm">Calculating regression models and prediction intervals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8">
          <Target className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-200">No Target Goals Defined</h3>
          <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
            Define a strength target to enable AI progress forecasting, regression trajectory models, and estimated date of achievement.
          </p>
          <div className="mt-4">
            <Link to="/dashboard">
              <Button size="sm" className="gap-2 shadow-lg shadow-orange-500/20">
                <Plus className="h-4 w-4" />
                Add Strength Target
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Prediction Metric Highlights */}
          {prediction && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-zinc-900/90 border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Current Estimated 1RM
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-zinc-100 font-mono">
                    {prediction.current1RM || 0} kg
                  </span>
                  <span className="text-xs text-zinc-500">Epley formula</span>
                </div>
              </Card>

              <Card className="p-4 bg-zinc-900/90 border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Weekly Progression Rate
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-orange-400 font-mono">
                    {prediction.weeklyGainKg !== null
                      ? `${prediction.weeklyGainKg > 0 ? "+" : ""}${prediction.weeklyGainKg} kg`
                      : "Calibrating"}
                  </span>
                  <span className="text-xs text-zinc-500">per week</span>
                </div>
              </Card>

              <Card className="p-4 bg-zinc-900/90 border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Timeline to Goal
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                    {prediction.weeksToGoal !== null
                      ? `${prediction.weeksToGoal} wks`
                      : prediction.goalStatus === "ACHIEVED"
                      ? "Achieved! 🏆"
                      : "Pending data"}
                  </span>
                  {prediction.estimatedCompletionDate && (
                    <span className="text-[11px] text-zinc-500 block">
                      ~{prediction.estimatedCompletionDate}
                    </span>
                  )}
                </div>
              </Card>

              <Card className="p-4 bg-zinc-900/90 border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Prediction Uncertainty
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-zinc-300 font-mono">
                    {prediction.standardError ? `±${prediction.standardError} kg` : "N/A"}
                  </span>
                  <span className="text-xs text-zinc-500">80% CI</span>
                </div>
              </Card>
            </div>
          )}

          {/* Main Chart: 1RM Progression & Forecast with Uncertainty Band */}
          <Card className="border-zinc-800 bg-zinc-900/80 p-4">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    1RM Trajectory & Extrapolated Forecast
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Historical 1RM calculations (solid) extrapolated into the future with statistical uncertainty interval (dashed).
                  </CardDescription>
                </div>
                {prediction?.rSquared && (
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    R² = {prediction.rSquared}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0 pt-2">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedChartData}>
                    <defs>
                      <linearGradient id="uncertaintyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                      dataKey="name"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={11}
                      domain={["dataMin - 10", "dataMax + 10"]}
                      tickLine={false}
                      unit="kg"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#3f3f46",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

                    {/* Goal Reference Line */}
                    {goal?.targetWeight && (
                      <ReferenceLine
                        y={goal.targetWeight}
                        label={{
                          value: `Goal: ${goal.targetWeight}kg`,
                          fill: "#22c55e",
                          fontSize: 11,
                          position: "top",
                        }}
                        stroke="#22c55e"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Uncertainty Bounds */}
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      name="Upper Bound (80% CI)"
                      stroke="#f97316"
                      strokeDasharray="3 3"
                      fillOpacity={0.1}
                      fill="url(#uncertaintyGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="lowerBound"
                      name="Lower Bound (80% CI)"
                      stroke="#f97316"
                      strokeDasharray="3 3"
                      fillOpacity={0}
                    />

                    {/* Actual 1RM Line */}
                    <Line
                      type="monotone"
                      dataKey="actual1RM"
                      name="Actual e1RM (Epley)"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ fill: "#38bdf8", r: 4 }}
                    />

                    {/* Projected 1RM Line */}
                    <Line
                      type="monotone"
                      dataKey="forecast1RM"
                      name="Predicted Forecast"
                      stroke="#f97316"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "#f97316", r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Volume Load Chart */}
          <Card className="border-zinc-800 bg-zinc-900/80 p-4">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-400" />
                Weekly Training Volume Load (Tonnage)
              </CardTitle>
              <CardDescription className="text-xs">
                Total kilograms moved per weekly cycle (sum of sets × reps × weight).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              {volumeTrends.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  No volume data recorded yet. Complete workouts to visualize weekly tonnage.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="week" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} unit="kg" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          borderColor: "#3f3f46",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="volume"
                        name="Volume Load (kg)"
                        fill="#f97316"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Safety Layer Governance Card */}
          <Card className="border-zinc-800 bg-zinc-900/60 p-4">
            <CardHeader className="p-0 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
                <CardTitle className="text-base font-bold">
                  Safety Layer Guardrails Active
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                "Adaptation decides. Prediction only informs. Safety can always override both."
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                <span className="font-semibold text-zinc-200 block mb-1">
                  1. Max Load Jump (≤10%)
                </span>
                <p className="text-zinc-500">
                  Blocks excessive single-session weight jumps from data errors or overzealous progression.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                <span className="font-semibold text-zinc-200 block mb-1">
                  2. Restorative Deload Lock
                </span>
                <p className="text-zinc-500">
                  Forces a -20% load / -40% volume recovery cycle after 5 consecutive progressive weeks.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                <span className="font-semibold text-zinc-200 block mb-1">
                  3. Motor Control Guardrail
                </span>
                <p className="text-zinc-500">
                  Restricts beginner RPE targets to ≤8.0 and compound loads to ≤1.5× body weight.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
