/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { getSpots } from "../api/spot";
import { toast } from "react-hot-toast";
import AddSpotForm from "../components/Admin/AddSpotForm";
import SpotList from "../components/Admin/SpotList";

// Import icons from Heroicons
import {
  Squares2X2Icon, // for All
  BuildingOffice2Icon, // for Outside (office building)
  CubeTransparentIcon, // for Underground (box/underground)
} from "@heroicons/react/24/outline";

export default function AdminPage() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const data = await getSpots();
      setSpots(data);
    } catch (err) {
      toast.error("Failed to load spots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const filteredSpots = spots.filter((spot) => {
    if (filter === "outside") return spot.type === "outside";
    if (filter === "underground") return spot.type === "underground";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Admin Panel – Manage Spots
      </h2>

      <AddSpotForm onSpotAdded={fetchSpots} />

      {/* Filter Buttons — placed just above SpotList */}
      <div className="flex justify-center mb-6 gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            filter === "all"
              ? "bg-blue-600 text-white shadow"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
          aria-label="Show all spots"
        >
          <Squares2X2Icon className="h-5 w-5" />
          All
        </button>

        <button
          onClick={() => setFilter("outside")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            filter === "outside"
              ? "bg-blue-600 text-white shadow"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
          aria-label="Show outside spots"
        >
          <BuildingOffice2Icon className="h-5 w-5" />
          Outside
        </button>

        <button
          onClick={() => setFilter("underground")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            filter === "underground"
              ? "bg-blue-600 text-white shadow"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
          aria-label="Show underground spots"
        >
          <CubeTransparentIcon className="h-5 w-5" />
          Underground
        </button>
      </div>

      <SpotList
        spots={filteredSpots}
        loading={loading}
        onDeleted={fetchSpots}
      />
    </div>
  );
}
