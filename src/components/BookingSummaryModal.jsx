import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

function BookingSummaryModal({ results, onClose }) {
  const navigate = useNavigate();

  if (!results) return null;

  const { success = [], failed = [] } = results;

  return (
    <Transition.Root show={!!results} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white max-w-lg w-full rounded-xl shadow-lg p-6 transform transition-all">
              <Dialog.Title className="text-lg font-semibold text-gray-800 mb-4">
                Booking Summary
              </Dialog.Title>

              <div className="space-y-6 max-h-64 overflow-y-auto">
                {success.length > 0 && (
                  <div>
                    <div className="flex items-center text-green-600 mb-2">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        Success ({success.length})
                      </span>
                    </div>
                    <ul className="text-sm text-gray-700 divide-y">
                      {success.map((item, index) => (
                        <li
                          key={index}
                          className="py-2 flex items-center gap-2"
                        >
                          <CalendarDaysIcon className="h-4 w-4 text-blue-500" />
                          <span>
                            {item.date} – Spot #{item.spotCode}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {failed.length > 0 && (
                  <div>
                    <div className="flex items-center text-red-600 mb-2">
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        Failed ({failed.length})
                      </span>
                    </div>
                    <ul className="text-sm text-gray-700 divide-y">
                      {failed.map((item, index) => (
                        <li
                          key={index}
                          className="py-2 flex items-center gap-2"
                        >
                          <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {item.date} – {item.reason || "Unknown error"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    onClose();
                    navigate("/bookings");
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Go to My Bookings
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default BookingSummaryModal;
