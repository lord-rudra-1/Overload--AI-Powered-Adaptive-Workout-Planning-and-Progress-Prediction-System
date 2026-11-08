import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  History,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Flame,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Layout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Workout Plan", href: "/plan", icon: Dumbbell },
    { name: "History", href: "/history", icon: History },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Exercises", href: "/exercises", icon: BookOpen },
    { name: "Profile Setup", href: "/profile-setup", icon: User },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500">
            <Flame className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Overload
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-zinc-400 hover:text-zinc-50"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar Desktop + Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900/95 border-r border-zinc-800/80 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-zinc-800/60">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-zinc-100 leading-none">
              Overload
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1">
              Adaptive System
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isExternalPlaceholder = item.href.includes("#");

            if (isExternalPlaceholder) {
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-500 cursor-not-allowed hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-zinc-800/60 bg-zinc-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || "Athlete"} className="h-9 w-9" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10 gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
        />
      )}
    </div>
  );
}
