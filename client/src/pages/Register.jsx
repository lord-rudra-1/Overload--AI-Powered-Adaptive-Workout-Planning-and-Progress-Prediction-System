import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Flame, Lock, Mail, User, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name, email, password);
      // New user goes directly to profile onboarding setup
      navigate("/profile-setup");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-zinc-950 flex flex-col justify-center items-center md:items-end p-4 sm:p-6 md:pr-16 lg:pr-24 xl:pr-32 relative overflow-hidden bg-cover bg-no-repeat bg-[position:25%_center] md:bg-[position:15%_center]"
      style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
    >
      {/* Cinematic dark overlay: subtle on left so Baki is sharp & visible, deep on right for form legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-950/70 to-zinc-950/95 md:bg-gradient-to-r md:from-black/25 md:via-zinc-950/75 md:to-zinc-950/95 pointer-events-none" />

      {/* Subtle ambient orange energy glow behind the auth card */}
      <div className="absolute top-1/3 right-10 md:right-32 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-orange-400 transition-colors z-20 bg-zinc-950/70 hover:bg-zinc-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-800/90 shadow-xl"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="w-full max-w-md relative z-10 my-auto py-8">
        {/* Brand header */}
        <div className="text-center md:text-left mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="inline-flex h-11 w-11 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-100 uppercase">
                Overload
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-orange-400 font-bold">
                Adaptive Training System
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 hidden sm:block">
            Join the autoregulated training network. Build your foundation.
          </p>
        </div>

        <Card className="border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-2xl shadow-black/90">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-zinc-100">Create Account</CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Start tracking training load, 1RM estimates, and progressive overload.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3.5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-zinc-300 font-medium">Full Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Alex Mercer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-orange-500"
                    required
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-zinc-300 font-medium">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-orange-500"
                    required
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-zinc-300 font-medium">Password (min 6 characters)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-orange-500"
                    required
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs text-zinc-300 font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-orange-500"
                    required
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-3">
              <Button
                type="submit"
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 border-0 transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Athlete Account...
                  </>
                ) : (
                  <>
                    Continue to Profile Setup
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-xs text-zinc-400">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="text-orange-400 hover:text-orange-300 font-medium underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center md:text-left text-[11px] text-zinc-600 mt-4">
          IIIT Vadodara · CS447 Software Project Management
        </p>
      </div>
    </div>
  );
}
