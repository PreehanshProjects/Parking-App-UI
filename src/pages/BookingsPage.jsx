// src/pages/BookingsPage.jsx
import {
  CalendarDaysIcon,
  TrashIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

function BookingsPage({ bookings, onCancel }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        <CalendarDaysIcon className="h-7 w-7 text-blue-600 animate-pulse" />
        My Bookings
      </h2>

      {bookings.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center text-gray-600">
          You haven't made any bookings yet. 💤
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
          {bookings.map((booking, idx) => (
            <li
              key={idx}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <MapPinIcon className="h-6 w-6 text-blue-500" />
                <p className="text-lg font-semibold text-gray-800">
                  Spot #{booking.spotId}
                </p>
              </div>

              <p className="text-sm text-gray-500 capitalize mb-1">
                Type: {booking.type}
              </p>

              <p className="text-sm text-gray-500 mb-4">
                Date:{" "}
                <span className="font-medium text-gray-700">
                  {new Date(booking.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </p>

              <button
                onClick={() => onCancel(booking)}
                className="mt-auto inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-md transition-colors duration-200"
              >
                <TrashIcon className="h-5 w-5" />
                Cancel Booking
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookingsPage;
