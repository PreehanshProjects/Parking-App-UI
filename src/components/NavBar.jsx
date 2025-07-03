import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

// Heroicons v2 import path
import {
  HomeIcon,
  CalendarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function Navbar({ isLoggedIn, userEmail, onLoginToggle }) {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Home", icon: <HomeIcon className="w-5 h-5" /> },
    {
      href: "/bookings",
      label: "My Bookings",
      icon: <CalendarIcon className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="bg-white bg-opacity-70 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/images/logo-novity.png"
            alt="Novity Logo"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center space-x-1 text-gray-700 hover:text-blue-700 transition-colors duration-200 font-medium ${
                pathname === href
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : ""
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}

          {isLoggedIn && userEmail && (
            <div className="flex items-center space-x-2 text-gray-600 italic text-sm max-w-xs truncate">
              <UserCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <span>{userEmail}</span>
            </div>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-blue-700 text-white px-4 py-1 rounded-md hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          ) : (
            <button
              onClick={onLoginToggle}
              className="flex items-center gap-1 bg-blue-700 text-white px-4 py-1 rounded-md hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white bg-opacity-90 backdrop-blur-md shadow-inner px-6 py-4 space-y-4">
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2 text-gray-700 hover:text-blue-700 transition-colors duration-200 font-medium ${
                pathname === href
                  ? "text-blue-700 border-l-4 border-blue-700 pl-2"
                  : ""
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}

          {isLoggedIn && userEmail && (
            <div className="flex items-center space-x-2 text-gray-600 italic text-sm max-w-xs truncate">
              <UserCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <span>{userEmail}</span>
            </div>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-md w-full justify-center hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          ) : (
            <button
              onClick={onLoginToggle}
              className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-md w-full justify-center hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
