/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { deleteSpot } from "../../api/spot";
import { toast } from "react-hot-toast";
import {
  TrashIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

import ConfirmModal from "../modal/ConfirmModal";

export default function SpotList({ spots, loading, onDeleted }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const openConfirm = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setSelectedId(null);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeletingLoading(true);
    try {
      await deleteSpot(selectedId);
      toast.success("Spot deleted.");
      onDeleted();
    } catch (err) {
      toast.error(err.message || "Failed to delete spot");
    } finally {
      setDeletingLoading(false);
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
        <BuildingOffice2Icon className="w-6 h-6 text-blue-500" />
        Existing Spots
      </h3>

      {loading ? (
        <div className="text-center text-gray-500 py-12">
          <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin text-blue-400" />
          <p className="mt-2">Loading spots...</p>
        </div>
      ) : spots.length === 0 ? (
        <p className="text-center text-gray-400 italic">No spots found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className="bg-white/60 backdrop-blur-lg border border-white/30 shadow-lg rounded-xl p-5 flex flex-col justify-between transition hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    Spot Code:{" "}
                    <span className="text-gray-700">{spot.code}</span>
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-1">
                  <MapPinIcon className="w-5 h-5 text-blue-500" />
                  {spot.location}
                </h4>
                <p className="text-sm text-gray-600 capitalize">
                  Type:{" "}
                  <span className="font-medium text-gray-700">{spot.type}</span>
                </p>
              </div>

              <button
                onClick={() => openConfirm(spot.id)}
                disabled={deletingLoading && selectedId === spot.id}
                className="mt-4 flex items-center justify-center gap-2 w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md transition disabled:opacity-50"
              >
                <TrashIcon className="w-5 h-5" />
                {deletingLoading && selectedId === spot.id
                  ? "Deleting…"
                  : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom confirmation modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this spot? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={closeConfirm}
        loading={deletingLoading}
      />
    </div>
  );
}
