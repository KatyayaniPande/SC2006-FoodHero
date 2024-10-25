"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header"; // Adjust the path as needed
import SomeCard from "./SomeCard"; // Import SomeCard

const Dashboard: React.FC = () => {
  const [combinedData, setCombinedData] = useState([]); // Store combined donorData and requestData
  const [acceptedDeliveries, setAcceptedDeliveries] = useState([]); // Store accepted deliveries for the logged-in admin
  const [activeTab, setActiveTab] = useState<
    "donationsInventory" | "pendingDelivery"
  >("donationsInventory"); // Track which tab is active

  const appUrl = "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch donor data
        const donorResponse = await fetch(`${appUrl}/api/donations/all`, {
          cache: "no-store",
        });
        const donorData = await donorResponse.json();

        // Fetch request data
        const requestResponse = await fetch(`${appUrl}/api/requests/all`, {
          cache: "no-store",
        });
        const requestData = await requestResponse.json();

        // Combine donorData and requestData into one array
        const combinedData = [
          ...donorData.map((donation) => ({ ...donation, type: "donation" })), // Mark as donation
          ...requestData.map((request) => ({ ...request, type: "request" })), // Mark as request
        ];

        setCombinedData(combinedData);

        // Fetch the logged-in user's accepted deliveries
        const acceptedDeliveriesResponse = await fetch(
          `${appUrl}/api/getAcceptedDeliveries`
        );
        const acceptedDeliveriesData = await acceptedDeliveriesResponse.json();

        setAcceptedDeliveries(acceptedDeliveriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleTabClick = (tab: "donationsInventory" | "pendingDelivery") => {
    setActiveTab(tab);
  };

  const collectDonations = combinedData.filter(
    (item) => item.status === "inwarehouse"
  );
  const deliverDonations =
    acceptedDeliveries.length > 0
      ? acceptedDeliveries.filter((item) => item.status === "awaitingdelivery")
      : [];

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
            <div
              className={`p-6 bg-[#F0F4E4] rounded-lg shadow-md cursor-pointer ${
                activeTab === "donationsInventory" ? "bg-[#E0E8D8]" : ""
              }`}
              onClick={() => handleTabClick("donationsInventory")}
            >
              <div className="flex flex-col items-center w-full text-center">
                <h2 className="text-2xl font-semibold mb-2 text-[#A2C765]">
                  Donations Inventory
                </h2>
                <p className="text-4xl font-semibold text-gray-700">
                  {collectDonations.length}
                </p>
              </div>
            </div>

            <div
              className={`p-6 bg-[#F0F4E4] rounded-lg shadow-md cursor-pointer ${
                activeTab === "pendingDelivery" ? "bg-[#E0E8D8]" : ""
              }`}
              onClick={() => handleTabClick("pendingDelivery")}
            >
              <div className="flex flex-col items-center w-full text-center">
                <h2 className="text-2xl font-semibold mb-2 text-[#A2C765]">
                  Pending Delivery
                </h2>
                <p className="text-4xl font-semibold text-gray-700">
                  {deliverDonations.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#F0F4E4] p-12 rounded-lg shadow-lg">
          {activeTab === "donationsInventory" && (
            <>
              <h1 className="text-4xl font-bold text-center mb-8 text-[#A2C765]">
                Donations Inventory
              </h1>
              <div>
                {collectDonations.map((item, index) => (
                  <SomeCard key={index} donation={item} />
                ))}
              </div>
            </>
          )}
          {activeTab === "pendingDelivery" && (
            <>
              <h1 className="text-4xl font-bold text-center mb-8 text-[#A2C765]">
                Pending Delivery
              </h1>
              <div>
                {deliverDonations.map((item, index) => (
                  <SomeCard key={index} donation={item} />
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
