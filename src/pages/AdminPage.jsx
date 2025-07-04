/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import AddSpotForm from "../components/Admin/AddSpotForm";
import SpotList from "../components/Admin/SpotList";

// Import icons from Heroicons
import {
  Squares2X2Icon, // All
  BuildingOffice2Icon, // Outside
  CubeTransparentIcon, // Underground
  StarIcon, // Special
  UserGroupIcon, // Guest
} from "@heroicons/react/24/outline";

export default function AdminPage({ spots, fetchSpots, loading }) {
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSpots(); // Fetch spots on mount from the parent
  }, [fetchSpots]);

  const filteredSpots = (spots || []).filter((spot) => {
    if (filter === "outside") return spot.type === "outside";
    if (filter === "underground") return spot.type === "underground";
    if (filter === "special") return spot.type === "special";
    if (filter === "guest") return spot.type === "guest";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Admin Panel – Manage Spots
      </h2>

      <AddSpotForm onSpotAdded={fetchSpots} />

      {/* Filter Buttons */}
      <div className="flex justify-center mb-6 gap-4 flex-wrap">
        <FilterButton
          label="All"
          icon={Squares2X2Icon}
          isActive={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterButton
          label="Outside"
          icon={BuildingOffice2Icon}
          isActive={filter === "outside"}
          onClick={() => setFilter("outside")}
        />
        <FilterButton
          label="Underground"
          icon={CubeTransparentIcon}
          isActive={filter === "underground"}
          onClick={() => setFilter("underground")}
        />
        <FilterButton
          label="Special"
          icon={StarIcon}
          isActive={filter === "special"}
          onClick={() => setFilter("special")}
        />
        <FilterButton
          label="Guest"
          icon={UserGroupIcon}
          isActive={filter === "guest"}
          onClick={() => setFilter("guest")}
        />
      </div>

      <SpotList
        spots={filteredSpots}
        loading={loading}
        onDeleted={fetchSpots}
      />
    </div>
  );
}

// 💡 Reusable FilterButton Component
function FilterButton({ label, icon: Icon, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
        isActive
          ? "bg-blue-600 text-white shadow"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
      }`}
      aria-label={`Show ${label.toLowerCase()} spots`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
