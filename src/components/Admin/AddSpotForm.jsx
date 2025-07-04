import React, { useState } from "react";
import { addSpot } from "../../api/spot";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  HashtagIcon,
} from "@heroicons/react/24/solid";

export default function AddSpotForm({ onSpotAdded }) {
  const [location, setLocation] = useState("");
  const [type, setType] = useState("outside");
  const [code, setCode] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!location.trim() || !type.trim() || !code.trim()) {
      return toast.error("All fields are required.");
    }

    setAdding(true);
    try {
      await addSpot(location.trim(), type, code.trim());
      toast.success("Spot added.");
      setLocation("");
      setType("outside");
      setCode("");
      onSpotAdded();
    } catch (err) {
      toast.error(err.message || "Failed to add spot");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-12 border border-gray-100">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
        <PlusIcon className="w-6 h-6 text-blue-600" />
        Add New Spot
      </h3>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Location Input */}
        <div className="relative flex-1">
          <MapPinIcon className="w-5 h-5 text-gray-400 absolute top-3 left-3" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            disabled={adding}
          />
        </div>

        {/* Type Select */}
        <div className="relative">
          <BuildingOffice2Icon className="w-5 h-5 text-gray-400 absolute top-3 left-3" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            disabled={adding}
          >
            <option value="outside">Outside</option>
            <option value="underground">Underground</option>
            <option value="special">Special</option>
            <option value="guest">Guest</option>
          </select>
        </div>
      </div>

      {/* Spot Code Input */}
      <div className="relative mb-4">
        <HashtagIcon className="w-5 h-5 text-gray-400 absolute top-3 left-3" />
        <input
          type="text"
          placeholder="Spot Code (e.g., A1, B12)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          disabled={adding}
        />
      </div>

      <button
        onClick={handleAdd}
        disabled={adding}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow-md transition disabled:opacity-50"
      >
        {adding ? "Adding..." : "Add Spot"}
      </button>
    </div>
  );
}
