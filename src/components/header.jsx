import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from '@/components/ui/button';

const Header = ({ userRole }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo and brand name as a link to the home page */}
        <Link to="/" className="flex items-center space-x-2">
          {/* Custom SVG icon for branding */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-xl font-bold text-gray-800">SkillBridge</span>
        </Link>

        {/* Desktop navigation links */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-300">Home</Link>
          <Link to="/explore" className="text-gray-600 hover:text-blue-500 transition-colors duration-300">Explore Tasks</Link>
          {userRole === 'recruiter' && (
            <Link to="/post-task" className="text-gray-600 hover:text-blue-500 transition-colors duration-300">Post a Task</Link>
          )}
          <Link to="/messages" className="text-gray-600 hover:text-blue-500 transition-colors duration-300">Messages</Link>
          <Link to="/profile" className="text-gray-600 hover:text-blue-500 transition-colors duration-300">Profile</Link>
        </nav>

        {/* Mobile menu toggle button */}
        <button
          className="md:hidden p-2 text-gray-600 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMenuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu panel that shows/hides based on state */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white bg-opacity-90 backdrop-blur-md shadow-inner py-4">
          <div className="flex flex-col items-center space-y-4">
            <Link to="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/explore" className="text-gray-600 hover:text-blue-500 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Explore Tasks</Link>
            {userRole === 'recruiter' && (
              <Link to="/post-task" className="text-gray-600 hover:text-blue-500 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Post a Task</Link>
            )}
            <Link to="/messages" className="text-gray-600 hover:text-blue-500 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Messages</Link>
            <Link to="/profile" className="text-gray-600 hover:text-blue-500 transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Profile</Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
