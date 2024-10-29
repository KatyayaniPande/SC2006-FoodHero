"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header"; // Adjust the path as needed
import SomeCard from "./SomeCard"; // Import SomeCard
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [combinedData, setCombinedData] = useState([]); // Store combined donorData and requestData
  const [acceptedDeliveries, setAcceptedDeliveries] = useState([]); // Store accepted deliveries for the logged-in admin
  const [activeTab, setActiveTab] = useState<
    "donationsInventory" | "pendingDelivery"
  >("donationsInventory"); // Track which tab is active
  const appUrl = "http://localhost:3000";

  useEffect(() => {
    async function fetchUserExist() {
      try {
        const session = await getSession();
        const userEmail = session?.user?.email;

        if (!userEmail) {
          // No user email found, handle redirect or action
          // router.push("/login");
          return;
        }

        const response = await fetch(`${appUrl}/api/adminList`);
        const data = await response.json();

        // Assuming data.email is an array
        if (Array.isArray(data)) {
          const userExists = data.some((item) => item.email === userEmail);
          console.log(userExists);

          if (!userExists) {
            // If userEmail is not found in any object, redirect to login
            signOut({ callbackUrl: "/" });
          } else {
            // Handle cases where data is not an array or is undefined
            console.error(
              "Data is not in the expected array of objects format."
            );
            // router.push("/login"); // Optional redirect based on failure
          }
        }
      } catch (error) {
        console.error("Error fetching user existence:", error);
        // Handle error or fallback logic, maybe redirect to login
        // router.push("/login");
      }
    }

    fetchUserExist();
  }, []);
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
      <div className="flex flex-row items-center justify-between px-4 mb-6">
        <div className="text-3xl font-extrabold">Admin Dashboard</div>

        {/* Tab Navigation */}
        <div className="flex ml-1">
          <button
            className={`px-8 py-2 border border-gray-300 shadow-sm  ${
              activeTab === "donationsInventory"
                ? "bg-custom-dark-green text-white"
                : "bg-white text-black"
            } rounded-l-lg`}
            onClick={() => handleTabClick("donationsInventory")}
          >
            Donations Inventory
            <p className="text-lg font-semibold text-black">
              {collectDonations.length}
            </p>
          </button>
          <button
            className={`px-8 py-2 border border-gray-300 shadow-sm  ${
              activeTab === "pendingDelivery"
                ? "bg-custom-dark-green text-white"
                : "bg-white text-black"
            } rounded-r-lg`}
            onClick={() => handleTabClick("pendingDelivery")}
          >
            Pending Delivery
            <p className="text-lg font-semibold text-black">
              {deliverDonations.length}
            </p>
          </button>
        </div>
      </div>

      <div className="flex flex-row justify-between gap-4">
        <div className="flex w-[30%]">
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden text-center">
            {/* Background Image with Gradient Overlay */}
            <div
              className="absolute inset-0 h-full w-full bg-cover bg-center rounded-xl"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1552960562-daf630e9278b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80')",
              }}
            >
              <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 py-14 px-6 md:px-12 text-white">
              <h2 className="text-4xl font-medium mb-6 leading-[1.5]">
                Welcome Back Admin!
              </h2>
              <p className="text-lg text-gray-400 mb-4">
                Manage donation inventory or pending delivery.
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[70%] h-[calc(100vh-100px)] overflow-y-auto">
          {activeTab === "donationsInventory" && (
            <>
              <h1 className="text-2xl font-bold mb-4 text-black">
                Donations Inventory
              </h1>
              <div>
                {collectDonations.length > 0 ? (
                  collectDonations.map((item, index) => (
                    <SomeCard key={index} donation={item} />
                  ))
                ) : (
                  <p>No donations available.</p>
                )}
              </div>
            </>
          )}
          {activeTab === "pendingDelivery" && (
            <>
              <h1 className="text-2xl font-bold mb-4 text-black">
                Pending Delivery
              </h1>
              <div>
                {deliverDonations.length > 0 ? (
                  deliverDonations.map((item, index) => (
                    <SomeCard key={index} donation={item} />
                  ))
                ) : (
                  <p>No deliveries to be made at this time.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="bg-gray-50 min-h-screen p-8">
  //     <Header />
  //     <main className="max-w-7xl mx-auto">
  //       <div className="relative bg-custom-dark-green text-white p-8 rounded-lg shadow-lg">
  //         <div className="absolute inset-0  rounded-lg" />
  //         <div className="relative z-10">
  //           <h1 className="text-4xl font-bold mb-4">Welcome Back, Admin!</h1>
  //           <p className="text-lg">
  //             Explore our features and manage donation activities.
  //           </p>
  //         </div>
  //       </div>

  //       <section className="bg-white rounded-lg shadow-lg p-12 mb-12">
  //         <div className="flex justify-around">
  //           <div
  //             className={`p-6 bg-[#F0F4E4] rounded-lg shadow-md cursor-pointer ${
  //               activeTab === "donationsInventory" ? "bg-[#E0E8D8]" : "bg-white"
  //             }`}
  //             onClick={() => handleTabClick("donationsInventory")}
  //           >
  //             <div className="flex flex-col items-center w-full text-center">
  //               <h2 className="text-2xl font-semibold mb-2 text-[#A2C765]">
  //                 Donations Inventory
  //               </h2>
  //               <p className="text-4xl font-semibold text-gray-700">
  //                 {collectDonations.length}
  //               </p>
  //             </div>
  //           </div>

  //           <div
  //             className={`p-6 bg-[#F0F4E4] rounded-lg shadow-md cursor-pointer ${
  //               activeTab === "pendingDelivery" ? "bg-[#E0E8D8]" : ""
  //             }`}
  //             onClick={() => handleTabClick("pendingDelivery")}
  //           >
  //             <div className="flex flex-col items-center w-full text-center">
  //               <h2 className="text-2xl font-semibold mb-2 text-[#A2C765]">
  //                 Pending Delivery
  //               </h2>
  //               <p className="text-4xl font-semibold text-gray-700">
  //                 {deliverDonations.length}
  //               </p>
  //             </div>
  //           </div>
  //         </div>
  //       </section>
  // <section className="bg-[#F0F4E4] p-12 rounded-lg shadow-lg">
  //   {activeTab === "donationsInventory" && (
  //     <>
  //       <h1 className="text-4xl font-bold text-center mb-8 text-[#A2C765]">
  //         Donations Inventory
  //       </h1>
  //       <div>
  //         {collectDonations.map((item, index) => (
  //           <SomeCard key={index} donation={item} />
  //         ))}
  //       </div>
  //     </>
  //   )}
  //   {activeTab === "pendingDelivery" && (
  //     <>
  //       <h1 className="text-4xl font-bold text-center mb-8 text-[#A2C765]">
  //         Pending Delivery
  //       </h1>
  //       <div>
  //         {deliverDonations.map((item, index) => (
  //           <SomeCard key={index} donation={item} />
  //         ))}
  //       </div>
  //     </>
  //   )}
  // </section>
  //     </main>
  //   </div>
  // );
};

export default Dashboard;
