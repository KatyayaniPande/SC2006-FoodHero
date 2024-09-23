'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header'; // Adjust the path as needed
import SomeCard from './SomeCard'; // Import SomeCard

const Dashboard: React.FC = () => {
  const [donorData, setDonorData] = useState([]);
  const [activeTab, setActiveTab] = useState<'collect' | 'deliver'>('collect'); // Track which tab is active

  const appUrl = 'http://localhost:3000';

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        const response = await fetch(`${appUrl}/api/donations/all`, { cache: 'no-store' });
        const donorData = await response.json();
        setDonorData(donorData);
      } catch (error) {
        console.error('Error fetching donor data:', error);
      }
    };

    fetchDonorData();
  }, []);

  const handleTabClick = (tab: 'collect' | 'deliver') => {
    setActiveTab(tab);
  };

  // Filter the donations based on status
  const collectDonations = donorData.filter((donation) => donation.status === 'matched');
  const deliverDonations = donorData.filter((donation) => donation.status === 'awaitingdelivery');

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <Header />
      <main className="max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white p-8 rounded-lg shadow-lg">
          <div className="absolute inset-0 bg-black/50 rounded-lg" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">Welcome Admin</h1>
            <p className="text-lg">
              Explore our features and manage donation activities.
            </p>
          </div>
        </div>

        <section className="bg-white rounded-lg shadow-lg p-12 mb-12">
          <div className="flex justify-around">
            {/* Tabs for Collect and Deliver Donations */}
            <div
              className={`p-6 bg-[#F0F4E4] rounded-lg shadow-md cursor-pointer ${
                activeTab === 'collect' ? 'bg-[#E0E8D8]' : ''
              } transition-colors`}
              onClick={() => handleTabClick('collect')}
            >
              <div className="flex flex-col items-center w-full text-center">
                <h2 className="text-2xl font-semibold mb-2 text-[#A2C765]">
                  Collect Donations
                </h2>
                <p className="text-4xl font-semibold text-gray-700">
                  {collectDonations.length}
                </p>
              </div>
            </div>

            <div
              className={`p-6 bg-[#F0F4E4] rounded-lg shadow-md cursor-pointer ${
                activeTab === 'deliver' ? 'bg-[#E0E8D8]' : ''
              } transition-colors`}
              onClick={() => handleTabClick('deliver')}
            >
              <div className="flex flex-col items-center w-full text-center">
                <h2 className="text-2xl font-semibold mb-2 text-[#A2C765]">
                  Deliver Donations
                </h2>
                <p className="text-4xl font-semibold text-gray-700">
                  {deliverDonations.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#F0F4E4] p-12 rounded-lg shadow-lg">
          {/* Tab content */}
          {activeTab === 'collect' && (
            <>
              <h1 className="text-4xl font-bold text-center mb-8 text-[#A2C765]">
                Collect Donations
              </h1>
              <div>
                {collectDonations.map((donation, index) => (
                  <SomeCard key={index} donation={donation} />
                ))}
              </div>
            </>
          )}
          {activeTab === 'deliver' && (
            <>
              <h1 className="text-4xl font-bold text-center mb-8 text-[#A2C765]">
                Deliver Donations
              </h1>
              <div>
                {deliverDonations.map((donation, index) => (
                    <SomeCard key={index} donation={donation} />
                    ))}
                  </div>
                </>
              )}
            </section>
          </main>
        </div>
      );
    };
    
export default Dashboard;
    