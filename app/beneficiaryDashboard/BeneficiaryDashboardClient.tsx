"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import BeneficiaryCard from "./BeneficiaryCard";
import DonorCard from "./DonorCard";
import Header from "@/components/Header";
import Link from "next/link";
import { getSession } from "next-auth/react";

export interface Request {
  foodName: string;
  foodType: string;
  foodCategory: string;
  needByTime: string;
  specialRequest: string;
  deliveryMethod: string;
  deliveryTime: string;
  deliveryLocation: string;
  quantity: number;
  numberOfServings: number;
  status:
    | "new"
    | "matched"
    | "inwarehouse"
    | "awaitingpickup"
    | "awaitingdelivery"
    | "delivered"; // Add status field
}

export default function BeneficiaryDashboardClient() {
  const [activeTab, setActiveTab] = useState("myRequests");
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const session = await getSession();
        const email = session?.user?.email;

        // Fetching 'My Requests'
        const myRequestsResponse = await axios.get(
          `/api/requests?email=${email}`
        );
        setMyRequests(myRequestsResponse.data);

        // Fetching 'Available Donations'
        const availableDonationsResponse = await axios.get(`/api/donations`);
        setAvailableDonations(availableDonationsResponse.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <Header />
      <div className="flex flex-row items-center justify-between">
        <div className="mr-3 mb-3 text-3xl font-extrabold w-[90%]">
          Beneficiary Dashboard
        </div>
        <Link href="/request" className="w-[10%]">
          <button className="bg-green-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
            New request
          </button>
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6">
        <button
          className={`px-4 py-2 ${
            activeTab === "myRequests"
              ? "bg-green-500 text-white"
              : "bg-white text-black"
          } rounded-l-lg`}
          onClick={() => setActiveTab("myRequests")}
        >
          My Requests
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "availableDonations"
              ? "bg-green-500 text-white"
              : "bg-white text-black"
          } rounded-r-lg`}
          onClick={() => setActiveTab("availableDonations")}
        >
          Available Donations
        </button>
      </div>

      <div className="flex gap-8">
        {/* Left Column for Welcome Card */}
        <div className="flex-1 min-w-[30%]">
          <Card
            shadow={false}
            className="relative h-full w-full items-end justify-center overflow-hidden text-center"
          >
            <CardHeader
              floated={false}
              shadow={false}
              color="transparent"
              className="absolute inset-0 m-0 h-full w-full rounded-none bg-[url('https://images.unsplash.com/photo-1552960562-daf630e9278b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80')] bg-cover bg-center"
            >
              <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50" />
            </CardHeader>
            <CardBody className="relative py-14 px-6 md:px-12">
              <Typography
                variant="h2"
                color="white"
                className="mb-6 font-medium leading-[1.5]"
              >
                Welcome Back!
              </Typography>
              <Typography variant="h5" className="mb-4 text-gray-400">
                Manage your requests or view available donations.
              </Typography>
            </CardBody>
          </Card>
        </div>

        <div className="flex-1 min-w-[70%] max-h-[calc(100vh-100px)] overflow-y-auto">
          {activeTab === "myRequests" && (
            <div>
              <h1 className="text-2xl font-bold mb-4 text-black">
                My Requests
              </h1>
              {myRequests.length > 0 || availableDonations.length > 0 ? (
                <>
                  {/* My Requests with status 'new' */}
                  {myRequests
                    .filter(
                      (request) =>
                        request.status === "new" ||
                        request.status === "matched" ||
                        request.status === "inwarehouse"
                    ) // Filter for requests with status 'new'
                    .map((request, index) => (
                      <BeneficiaryCard
                        key={`request-${index}`} // Use a unique key
                        request={request}
                      />
                    ))}

                  {/* Available Donations with status 'matched' */}
                  {availableDonations
                    .filter(
                      (donation) =>
                        donation.status === "matched" ||
                        donation.status === "inwarehouse"
                    ) // Filter for donations with status 'matched'
                    .map((donation, index) => (
                      <DonorCard
                        key={`donation-${index}`} // Use a unique key
                        donation={donation}
                      />
                    ))}
                </>
              ) : (
                <p>No requests found.</p>
              )}
            </div>
          )}

          {activeTab === "availableDonations" && (
            <div>
              <h1 className="text-2xl font-bold mb-4 text-black">
                Available Donations
              </h1>
              {availableDonations.length > 0 ? (
                availableDonations
                  .filter((donation) => donation.status === "new") // Filter for donations with status 'new'
                  .map((donation, index) => (
                    <DonorCard
                      key={`donation-${index}`} // Use a unique key
                      donation={donation}
                    />
                  ))
              ) : (
                <p>No available donations at this time.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
