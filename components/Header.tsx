"use client";

import React, { useState } from 'react';

const Header: React.FC = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="flex justify-between items-center mb-12 bg-white shadow-md p-4">
      <div className="flex items-center text-3xl font-bold text-[#A2C765]">
        <img src="/images/logo.png" className="h-10 inline-block mr-2"/>
        Food Hero
      </div>
      <nav className="flex items-center space-x-6 text-lg">
        <a href="/" className="text-gray-700 hover:text-[#A2C765]">Home</a>
        <a href="/chatbot" className="text-gray-700 hover:text-[#A2C765]">Chatbot</a>
        <div
          className="relative inline-block text-gray-700"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <a href="#" className="hover:text-[#A2C765]">About</a>
          {isDropdownOpen && (
            <div className="absolute bg-white shadow-md mt-1 rounded-md">
              <a href="/mission" className="block px-4 py-2 hover:bg-gray-100 hover:text-[#A2C765]">Our Mission</a>
              <a href="/values" className="block px-4 py-2 hover:bg-gray-100 hover:text-[#A2C765]">Our Values</a>
              <a href="/what-we-do" className="block px-4 py-2 hover:bg-gray-100 hover:text-[#A2C765]">What We Do</a>
            </div>
          )}
        </div>
        <a href="/signup" className="text-gray-700 hover:text-[#A2C765]">Sign Up</a>
        <a
          href="/login"
          className="bg-[#3b7f5a] text-white px-4 py-2 rounded-full hover:bg-[#2e6347] shadow-lg"
        >
          Login
        </a>
      </nav>
    </header>
  );
};

export default Header;
