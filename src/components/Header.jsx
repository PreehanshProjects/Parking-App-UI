// src/components/Header.jsx
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

function Header({ isLoggedIn, onLoginToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenuAndLogin = () => {
    onLoginToggle(); // This now triggers login/logout in App
    setMenuOpen(false);
  };

  return (
    <header className="bg-blue-700 text-white py-4 px-6 shadow-md mb-6 flex justify-between items-center">
      <h1 className="text-xl sm:text-2xl font-semibold">
        🚗 Company Parking Booking
      </h1>

      {/* User Icon with Dropdown */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center space-x-1 hover:opacity-90"
        >
          <UserCircleIcon className="h-7 w-7 text-white" />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg py-2 z-50">
            <button
              onClick={toggleMenuAndLogin}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
            >
              {isLoggedIn ? (
                <>
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                  Logout
                </>
              ) : (
                <>
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  Login
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
