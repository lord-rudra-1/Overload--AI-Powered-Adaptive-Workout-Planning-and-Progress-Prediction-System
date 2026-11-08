import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  User,
  Activity,
  Target,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  Scale,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function ProfileSetup() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Profile fields
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [bodyWeight, setBodyWeight] = useState(user?.bodyWeight || "");
  const [experience, setExperience] = useState(user?.experience || "beginner");
  const [trainingDays, setTrainingDays] = useState(user?.trainingDays || 3);
  const [equipment, setEquipment] = useState(user?.equipment || "full_gym");
  const [increment, setIncrement] = useState(user?.increment || 2.5);

  // Goal fields
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchExercises() {
      try {
        const res = await api.get("/exercises");
        if (res.data?.success && res.data?.data?.exercises) {
          setExercises(res.data.data.exercises);
          // Default to Barbell Bench Press if available
          const bench = res.data.data.exercises.find((e) =>
            e.name.toLowerCase().includes("bench press")
          );
          if (bench) {
            setSelectedExerciseId(bench.id);
          } else if (res.data.data.exercises.length > 0) {
            setSelectedExerciseId(res.data.data.exercises[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load exercises for goal selector:", err);
      } finally {
        setIsLoadingExercises(false);
      }
    }

    fetchExercises();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!age || !bodyWeight) {
      setError("Please provide your age and body weight.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Update Profile
      await updateProfile({
        age: parseInt(age, 10),
        gender,
        bodyWeight: parseFloat(bodyWeight),
        experience,
        trainingDays: parseInt(trainingDays, 10),
        equipment,
        increment: parseFloat(increment),
      });

      // 2. If Goal is configured, save it
      if (selectedExerciseId && targetWeight) {
        await api.post("/profile/goal", {
          exerciseId: parseInt(selectedExerciseId, 10),
          targetWeight: parseFloat(targetWeight),
          targetDate: targetDate || undefined,
        });
      }

      setSuccess("Profile and training goals configured successfully!");
      setTimeout(() => {
        navigate("/");
      }, 900);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-3">
          <Activity className="h-8 w-8 text-orange-500" />
          Athlete Profile & Goal Setup
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Stage 1 of the Overload System: Set your baseline parameters, equipment access, and strength goal.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Attributes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-orange-400">
              <User className="h-5 w-5" />
              <CardTitle className="text-lg">1. Personal Characteristics</CardTitle>
            </div>
            <CardDescription>
              Used for initial workload scaling and baseline 1RM projections.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="14"
                max="90"
                placeholder="21"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Non-binary</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyWeight">Body Weight (kg)</Label>
              <div className="relative">
                <Input
                  id="bodyWeight"
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  placeholder="75.0"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                  required
                />
                <Scale className="absolute right-3 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Training Experience & Constraints */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-orange-400">
              <Dumbbell className="h-5 w-5" />
              <CardTitle className="text-lg">2. Training Experience & Availability</CardTitle>
            </div>
            <CardDescription>
              Defines the workout split (Full Body, Upper/Lower, PPL) and safety guardrails.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="beginner">Beginner (&lt; 1 year of structured training)</option>
                <option value="intermediate">Intermediate (1–3 years consistent)</option>
                <option value="advanced">Advanced (3+ years competitive/heavy)</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainingDays">Available Training Days / Week</Label>
              <Select
                id="trainingDays"
                value={trainingDays}
                onChange={(e) => setTrainingDays(e.target.value)}
              >
                <option value="2">2 Days (Full Body Split)</option>
                <option value="3">3 Days (Full Body Split — Recommended)</option>
                <option value="4">4 Days (Upper / Lower Split)</option>
                <option value="5">5 Days (Push / Pull / Legs Split)</option>
                <option value="6">6 Days (PPL Repeat)</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment Access</Label>
              <Select
                id="equipment"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
              >
                <option value="full_gym">Full Gym (Barbells, Dumbbells, Cables, Machines)</option>
                <option value="home">Home Gym (Barbell, Dumbbells, Bench)</option>
                <option value="bodyweight">Bodyweight Only (Calisthenics)</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="increment">Smallest Weight Increment (kg)</Label>
              <Input
                id="increment"
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                placeholder="2.5"
                value={increment}
                onChange={(e) => setIncrement(e.target.value)}
              />
              <p className="text-[11px] text-zinc-500">
                Smallest micro-plate jump the adaptation engine can prescribe.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Primary Fitness Goal */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-orange-400">
              <Target className="h-5 w-5" />
              <CardTitle className="text-lg">3. Target Strength Goal</CardTitle>
            </div>
            <CardDescription>
              Overload tracks your estimated 1RM toward this milestone and estimates your arrival timeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="goalExercise">Benchmark Exercise</Label>
              {isLoadingExercises ? (
                <div className="flex items-center gap-2 text-xs text-zinc-500 h-10">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  Loading exercise catalog...
                </div>
              ) : (
                <Select
                  id="goalExercise"
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                >
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.muscleGroup})
                    </option>
                  ))}
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetWeight">Target 1RM (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                step="2.5"
                min="10"
                max="500"
                placeholder="e.g. 100"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date (Optional)</Label>
              <div className="relative">
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 gap-2 shadow-xl shadow-orange-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Configuration...
              </>
            ) : (
              <>
                Save & Initialize Overload Loop
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
