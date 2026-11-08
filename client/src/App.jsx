import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <Routes>
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
        <Route path="/" element={<Dashboard />} />
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
