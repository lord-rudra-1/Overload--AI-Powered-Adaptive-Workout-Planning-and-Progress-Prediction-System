import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Exercises from "./pages/Exercises";
import WorkoutPlan from "./pages/WorkoutPlan";
import ActiveWorkout from "./pages/ActiveWorkout";
import WorkoutHistory from "./pages/WorkoutHistory";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm font-medium">Initializing Overload System...</p>
      </div>
    );
  }

  // If logged in, go straight to athlete dashboard; otherwise show landing page
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      {/* Smart Root & Public Landing */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/welcome" element={<LandingPage />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Standalone Protected Route for Profile Setup */}
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-zinc-950 p-6">
              <ProfileSetup />
            </div>
          </ProtectedRoute>
        }
      />

      {/* Standalone Protected Route for Live Workout Session (Full Screen Focus) */}
      <Route
        path="/workout/:id"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
              <ActiveWorkout />
            </div>
          </ProtectedRoute>
        }
      />

      {/* Main Dashboard Layout Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plan" element={<WorkoutPlan />} />
        <Route path="/history" element={<WorkoutHistory />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/exercises" element={<Exercises />} />
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
