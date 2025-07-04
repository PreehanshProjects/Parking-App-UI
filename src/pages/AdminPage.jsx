/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import AddSpotForm from "../components/Admin/AddSpotForm";
import SpotList from "../components/Admin/SpotList";
import UserBookingsAdminTab from "../components/Admin/UserBookingsAdminTab";

// Heroicons
import {
  Squares2X2Icon,
  BuildingOffice2Icon,
  CubeTransparentIcon,
  StarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export default function AdminPage({ spots, fetchSpots, loading }) {
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("spots"); // "spots" | "users"

  useEffect(() => {
    if (activeTab === "spots") {
      fetchSpots();
    }
  }, [fetchSpots, activeTab]);

  const filteredSpots = (spots || []).filter((spot) => {
    if (filter === "outside") return spot.type === "outside";
    if (filter === "underground") return spot.type === "underground";
    if (filter === "special") return spot.type === "special";
    if (filter === "guest") return spot.type === "guest";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Admin Panel</h2>

      {/* Modern Tab Buttons */}
      <div className="flex gap-4 mb-8">
        <TabButton
          label="Manage Spots"
          icon={Cog6ToothIcon}
          isActive={activeTab === "spots"}
          onClick={() => setActiveTab("spots")}
        />
        <TabButton
          label="User Bookings"
          icon={UsersIcon}
          isActive={activeTab === "users"}
          onClick={() => setActiveTab("users")}
        />
      </div>

      {/* Tab Content */}
      {activeTab === "spots" ? (
        <>
          <AddSpotForm onSpotAdded={fetchSpots} />

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
        </>
      ) : (
        <UserBookingsAdminTab />
      )}
    </div>
  );
}

// 💎 Modern Tab Button
function TabButton({ label, icon: Icon, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition duration-300
        ${
          isActive
            ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-300"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{label}</span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-white/80 shadow-md mt-1"></span>
      )}
    </button>
  );
}

// Filter Button (unchanged but visually consistent)
function FilterButton({ label, icon: Icon, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
        isActive
          ? "bg-blue-600 text-white shadow"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
