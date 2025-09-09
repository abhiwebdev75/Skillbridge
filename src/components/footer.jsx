import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-400 py-12 px-4 md:px-8 relative z-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-gray-700 pb-8">
          {/* Column 1: Brand and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              {/* SVG icon for the logo */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-2xl font-bold text-white">SkillBridge</span>
            </div>
            <p className="text-gray-400 text-sm max-w-sm">
              Connecting passionate learners with industry experts to create
              meaningful learning experiences. Bridge the gap between
              theoretical knowledge and practical expertise.
            </p>
            <div className="text-gray-500 text-xs mt-4">
              Made with <span className="text-red-500">&hearts;</span> by Abhinash
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Home</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Explore Tasks</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Post a Task</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Leaderboard</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">About</a></li>
            </ul>
          </div>

          {/* Column 3: Connect Links (Socials) */}
          <div className="md:col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.836 2.809 1.305 3.492.998.108-.778.418-1.305.762-1.605-2.665-.304-5.467-1.334-5.467-5.931 0-1.311.465-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.771.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.79 24 17.29 24 12.02 24 5.394 18.627 0 12 0z" /></svg>
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11.5 19h-2.5v-11h2.5v11zm12.5 0h-3.5v-5.694c0-2.315-2.251-2.24-2.55-2.24-1.215 0-1.95 0-2.95 0v7.934h-2.5v-11h2.5v1.233c.691-1.211 2.186-2.233 4.886-2.233 2.92 0 4.364 2.083 4.364 6.541v5.459z" /></svg>
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c.552 0 1 .448 1 1v7c0 .552-.448 1-1 1s-1-.448-1-1v-7c0-.552.448-1 1-1zM20 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8 6c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zM12 9c-.552 0-1-.448-1-1v-4c0-.552.448-1 1-1s1 .448 1 1v4c0 .552-.448 1-1 1z" /></svg>
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section for copyright and legal links */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 mt-8">
          <p className="mb-4 md:mb-0">&copy; {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;