import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600">{message}</p>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition font-medium"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50`}
              disabled={loading}
            >
              {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
