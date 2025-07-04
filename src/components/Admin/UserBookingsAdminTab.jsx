import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmModal from "../modal/ConfirmModal";
import {
  TrashIcon,
  UserIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { getAllUsers, getBookingsByUser, cancelBooking } from "../../api/admin";

export default function UserBookingsAdminTab() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // search state
  const [selectedUser, setSelectedUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Filter users on search term
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (e) {
      toast.error(e.message || "Error loading users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const onSelectUser = async (user) => {
    setSelectedUser(user);
    setLoadingBookings(true);
    try {
      const data = await getBookingsByUser(user.id);
      setBookings(data);
    } catch (e) {
      toast.error(e.message || "Error loading bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  const openConfirm = (spotId, date) => {
    setToDelete({ spotId, date });
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setToDelete(null);
  };

  const handleDeleteBooking = async () => {
    if (!toDelete || !selectedUser) return;
    setDeleting(true);
    try {
      await cancelBooking(toDelete.spotId, toDelete.date);
      toast.success("Booking canceled");
      const data = await getBookingsByUser(selectedUser.id);
      setBookings(data);
    } catch (e) {
      toast.error(e.message || "Error canceling booking");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <UserIcon className="w-6 h-6 text-blue-600" />
        Users
      </h3>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {loadingUsers ? (
        <div className="text-center text-gray-500 py-12">
          <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin text-blue-400" />
          <p className="mt-2">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-400 italic">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`cursor-pointer bg-white/60 backdrop-blur-lg border border-white/30 shadow-lg rounded-xl p-5 transition hover:shadow-xl ${
                selectedUser?.id === user.id ? "ring-2 ring-blue-600" : ""
              }`}
            >
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Created: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {selectedUser && (
        <>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
            Bookings for {selectedUser.email}
          </h4>

          {loadingBookings ? (
            <div className="text-center text-gray-500 py-6">
              <ArrowPathIcon className="w-6 h-6 mx-auto animate-spin text-blue-400" />
              <p>Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-gray-500 italic">No bookings for this user.</p>
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                    <span>
                      {b.date} – Spot #{b.spotCode} ({b.type})
                    </span>
                  </div>
                  <button
                    onClick={() => openConfirm(b.spotId, b.date)}
                    disabled={deleting}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Cancel booking?"
        message="Are you sure you want to cancel this booking?"
        onConfirm={handleDeleteBooking}
        onCancel={closeConfirm}
        loading={deleting}
      />
    </div>
  );
}
