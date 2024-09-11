'use client';

import React, { useState, useEffect } from 'react';
import { getSession, signOut } from 'next-auth/react';

const Header: React.FC = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Fetch session to determine if the user is logged in
    async function fetchSession() {
      const session = await getSession();
      if (session?.user) {
        setRole(session.user.role);  // Assuming user role (donor/beneficiary) exists in the session
      }
    }
    fetchSession();
  }, []);

  return (
    <header className="flex justify-between items-center mb-12 bg-white shadow-md p-4">
      <div className="flex items-center text-3xl font-bold text-[#A2C765]">
        <img src="/images/logo.png" className="h-10 inline-block mr-2" alt="logo" />
        Food Hero
      </div>
      <nav className="flex items-center space-x-6 text-lg">
  {role ? (
    <>
      {/* Conditionally render the dashboard link based on the user's role */}
      {role === 'donor' ? (
        <a href="/donorDashboard" className="text-gray-700 hover:text-[#A2C765]">Dashboard</a>
      ) : (
        <a href="/beneficiaryDashboard" className="text-gray-700 hover:text-[#A2C765]">Dashboard</a>
      )}
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
      <a href="/feedback" className="text-gray-700 hover:text-[#A2C765]">Feedback</a>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="bg-[#3b7f5a] text-white px-4 py-2 rounded-full hover:bg-[#2e6347] shadow-lg"
      >
        Log Out
      </button>
      <a href="/notifications" className="text-gray-700 hover:text-[#A2C765]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14V11a6.002 6.002 0 00-5-5.917V5a2 2 0 10-4 0v.083A6.002 6.002 0 004 11v3a2.032 2.032 0 01-.595 1.405L2 17h5m8 0a3.001 3.001 0 01-6 0" />
        </svg>
      </a>
    </>
  ) : (
    <>
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
    </>
  )}
</nav>

    </header>
  );
};

export default Header;
