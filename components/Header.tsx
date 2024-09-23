'use client';

import React, { useState, useEffect } from 'react';
import { getSession, signOut } from 'next-auth/react';
import { FaRegHandPaper, FaHandHoldingHeart } from 'react-icons/fa';

const Header: React.FC = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch session to determine if the user is logged in
    async function fetchSessionAndData() {
      const session = await getSession();
      if (session?.user) {
        setRole(session.user.role); // Assuming user role exists in the session

        try {
          // Fetch requests
          const requestsResponse = await fetch(
            `/api/requests?email=${session.user.email}`
          );
          const requestsData = requestsResponse.ok
            ? await requestsResponse.json()
            : [];

          // Fetch donations
          const donationsResponse = await fetch(
            `/api/donations?email=${session.user.email}`
          );
          const donationsData = donationsResponse.ok
            ? await donationsResponse.json()
            : [];

          // Combine and map data with default status
          const combinedNotifications = [
            ...requestsData.map((request) => ({
              id: request._id,
              type: 'Request',
              foodName: request.foodName,
              quantity: request.quantity || request.numberOfServings,
              status: request.status || 'unknown',
              date: request.createdAt,
            })),
            ...donationsData.map((donation) => ({
              id: donation._id,
              type: 'Donation',
              foodName: donation.foodName,
              quantity: donation.quantity || donation.numberOfServings,
              status: donation.status || 'unknown',
              date: donation.createdAt,
            })),
          ];

          // Sort notifications by date (optional)
          combinedNotifications.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );

          setNotifications(combinedNotifications);
        } catch (error) {
          console.error('Error fetching requests and donations:', error);
        }
      }
    }
    fetchSessionAndData();
  }, []);

  const getStatusColor = (status) => {
    if (!status || typeof status !== 'string') {
      return 'bg-gray-100 text-gray-800'; // Default color for undefined status
    }
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'matched':
        return 'bg-yellow-100 text-yellow-800';
      case 'awaitingpickup':
        return 'bg-orange-100 text-orange-800';
      case 'awaitingdelivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'Request') {
      return <FaRegHandPaper className="text-blue-500 mr-2" />;
    } else if (type === 'Donation') {
      return <FaHandHoldingHeart className="text-green-500 mr-2" />;
    }
    return null;
  };

  return (
    <header className="flex justify-between items-center mb-12 bg-white shadow-md p-4">
      <div className="flex items-center text-3xl font-bold text-[#A2C765]">
        <img
          src="/images/logo.png"
          className="h-10 inline-block mr-2"
          alt="logo"
        />
        Food Hero
      </div>
      <nav className="flex items-center space-x-6 text-lg">
        {role ? (
          <>
            {/* Conditionally render the dashboard link based on the user's role */}
            {role === 'donor' ? (
              <a
                href="/donorDashboard"
                className="text-gray-700 hover:text-[#A2C765]"
              >
                Dashboard
              </a>
            ) : (
              <a
                href="/beneficiaryDashboard"
                className="text-gray-700 hover:text-[#A2C765]"
              >
                Dashboard
              </a>
            )}
            <a href="/chatbot" className="text-gray-700 hover:text-[#A2C765]">
              Chatbot
            </a>
            <div
              className="relative inline-block text-gray-700"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <a href="#" className="hover:text-[#A2C765]">
                About
              </a>
              {isDropdownOpen && (
                <div className="absolute bg-white shadow-md mt-1 rounded-md">
                  <a
                    href="/mission"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#A2C765]"
                  >
                    Our Mission
                  </a>
                  <a
                    href="/values"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#A2C765]"
                  >
                    Our Values
                  </a>
                  <a
                    href="/what-we-do"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#A2C765]"
                  >
                    What We Do
                  </a>
                </div>
              )}
            </div>
            <a
              href="/feedback"
              className="text-gray-700 hover:text-[#A2C765]"
            >
              Feedback
            </a>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-[#3b7f5a] text-white px-4 py-2 rounded-full hover:bg-[#2e6347] shadow-lg"
            >
              Log Out
            </button>
            {/* Notifications Icon with Dropdown */}
            <div
              className="relative inline-block text-gray-700"
              onMouseEnter={() => setIsNotifOpen(true)}
              onMouseLeave={() => setIsNotifOpen(false)}
            >
              <a href="#" className="hover:text-[#A2C765]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 inline-block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {/* SVG paths */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14V11a6.002 6.002 0 00-5-5.917V5a2 2 0 10-4 0v.083A6.002 6.002 0 004 11v3a2.032 2.032 0 01-.595 1.405L2 17h5m8 0a3.001 3.001 0 01-6 0"
                  />
                </svg>
              </a>
              {isNotifOpen && (
                <div className="absolute right-0 bg-white shadow-lg mt-2 rounded-md w-80 max-h-96 overflow-auto z-50">
                  <div className="p-4">
                    <h3 className="font-bold mb-4 text-lg">Notifications</h3>
                    {notifications.length > 0 ? (
                      <ul>
                        {notifications.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-start mb-4 pb-4 border-b last:border-none last:mb-0 last:pb-0 cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              window.location.href =
                                item.type === 'Request'
                                  ? `/requests/${item.id}`
                                  : `/donations/${item.id}`;
                            }}
                          >
                            {/* Icon */}
                            <div className="mt-1">{getTypeIcon(item.type)}</div>
                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-800">
                                  {item.foodName}
                                </p>
                                {/* Status Badge */}
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {item.type} • Quantity: {item.quantity}
                              </p>
                              {/* Optional: Display date if available */}
                              {item.date && (
                                <p className="text-xs text-gray-400">
                                  {new Date(item.date).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <a href="/" className="text-gray-700 hover:text-[#A2C765]">
              Home
            </a>
            <a href="/chatbot" className="text-gray-700 hover:text-[#A2C765]">
              Chatbot
            </a>
            <div
              className="relative inline-block text-gray-700"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <a href="#" className="hover:text-[#A2C765]">
                About
              </a>
              {isDropdownOpen && (
                <div className="absolute bg-white shadow-md mt-1 rounded-md">
                  <a
                    href="/mission"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#A2C765]"
                  >
                    Our Mission
                  </a>
                  <a
                    href="/values"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#A2C765]"
                  >
                    Our Values
                  </a>
                  <a
                    href="/what-we-do"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-[#A2C765]"
                  >
                    What We Do
                  </a>
                </div>
              )}
            </div>
            <a href="/signup" className="text-gray-700 hover:text-[#A2C765]">
              Sign Up
            </a>
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
