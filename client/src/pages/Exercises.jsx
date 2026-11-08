import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Search,
  Dumbbell,
  Filter,
  Loader2,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [category, setCategory] = useState("");

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (muscleGroup) params.muscleGroup = muscleGroup;
      if (equipment) params.equipment = equipment;
      if (category) params.category = category;

      const res = await api.get("/exercises", { params });
      if (res.data?.success && res.data?.data?.exercises) {
        setExercises(res.data.data.exercises);
      }
    } catch (err) {
      console.error("Failed to load exercises:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly or fetch on change
    const timer = setTimeout(() => {
      fetchExercises();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, muscleGroup, equipment, category]);

  const clearFilters = () => {
    setSearch("");
    setMuscleGroup("");
    setEquipment("");
    setCategory("");
  };

  const hasActiveFilters = Boolean(search || muscleGroup || equipment || category);

  return (
    <div className="space-y-6">
      {/* Page Title & Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-3">
            <Dumbbell className="h-8 w-8 text-orange-500" />
            Exercise Database
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Curated catalog of movement patterns, target muscle groups, and mechanical categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {exercises.length} Exercises Available
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-zinc-900/60 border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search text */}
          <div className="relative md:col-span-1">
            <Input
              type="text"
              placeholder="Search exercise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          </div>

          {/* Muscle Group filter */}
          <div>
            <Select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
            >
              <option value="">All Muscle Groups</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="shoulders">Shoulders</option>
              <option value="legs">Legs</option>
              <option value="arms">Arms</option>
              <option value="core">Core</option>
            </Select>
          </div>

          {/* Equipment filter */}
          <div>
            <Select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
            >
              <option value="">All Equipment</option>
              <option value="barbell">Barbell</option>
              <option value="dumbbell">Dumbbell</option>
              <option value="machine">Machine</option>
              <option value="cable">Cable</option>
              <option value="bodyweight">Bodyweight</option>
            </Select>
          </div>

          {/* Category filter */}
          <div className="flex gap-2">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1"
            >
              <option value="">All Categories</option>
              <option value="compound">Compound</option>
              <option value="isolation">Isolation</option>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearFilters}
                title="Reset filters"
                className="shrink-0 text-zinc-400 hover:text-zinc-200"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Grid of Exercises */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm">Querying exercise library...</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8">
          <Layers className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-300">No exercises found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="mt-4 text-xs"
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <Card
              key={ex.id}
              className="hover:border-zinc-700 transition-all duration-200 group bg-zinc-900/80"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold group-hover:text-orange-400 transition-colors">
                    {ex.name}
                  </CardTitle>
                  <Badge
                    variant={ex.category === "compound" ? "default" : "secondary"}
                    className="shrink-0 capitalize text-[10px]"
                  >
                    {ex.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[11px] capitalize">
                    {ex.muscleGroup}
                  </Badge>
                  {ex.equipment && (
                    <Badge variant="secondary" className="text-[11px] capitalize text-zinc-400">
                      {ex.equipment}
                    </Badge>
                  )}
                  {ex.movementType && (
                    <Badge variant="outline" className="text-[11px] capitalize text-zinc-500">
                      {ex.movementType}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
