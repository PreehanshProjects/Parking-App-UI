import { useState } from "react";
import ParkingCard from "./ParkingCard";
import { ListBulletIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

function ParkingList({ spots, onBook }) {
  const [filter, setFilter] = useState("all");

  const filteredSpots = spots.filter((spot) => {
    if (filter === "available") return !spot.booked;
    if (filter === "booked") return spot.booked;
    return true;
  });

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filter Buttons */}
      <div className="flex justify-center mb-6 gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            filter === "all"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ListBulletIcon className="h-5 w-5" />
          All
        </button>
        <button
          onClick={() => setFilter("available")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            filter === "available"
              ? "bg-green-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <CheckCircleIcon className="h-5 w-5" />
          Available
        </button>
        <button
          onClick={() => setFilter("booked")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            filter === "booked"
              ? "bg-red-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <XCircleIcon className="h-5 w-5" />
          Booked
        </button>
      </div>

      {/* Parking Cards Grid */}
      {filteredSpots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map((spot) => (
            <ParkingCard key={spot.id} spot={spot} onBook={onBook} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          No spots match this filter.
        </div>
      )}
    </div>
  );
}

export default ParkingList;
