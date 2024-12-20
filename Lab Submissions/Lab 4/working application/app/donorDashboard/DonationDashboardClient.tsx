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
import DonationCard from "./DonationCard";
import RequestCard from "./RequestCard";
import Header from "@/components/Header";
import Link from "next/link";
import { getSession } from "next-auth/react";

export interface Donation {
  _id: string;
  foodName: string;
  foodType: string;
  foodCategory: string;
  timePrepared: string;
  timeOfConsumption: string;
  ingredient: string;
  quantity: number;
  perishable: string;
  expiryDate: string;
  donationStatus: string;
  pickUpLocation: string;
  specialHandling: string;
  deliveryMethod: string;
  numberOfServings: number;
  bestBeforeDate: string;
  consumeByTiming: string;
  needByTime: string;
  pickUpTime: string;
  dropOffTime: string;
  beneficiaryemail: string;
  status: "new" | "matched" | "inwarehouse" | "awaitingdelivery" | "delivered";
}

export interface Request {
  foodName: string;
  title: string;
  description: string;
  quantity: number;
  deadline: string;
  donoremail: string;
  status:
    | "new"
    | "matched"
    | "inwarehouse"
    | "awaitingpickup"
    | "awaitingdelivery"
    | "delivered";
}

export default function DonorDashboardClient() {
  const [activeTab, setActiveTab] = useState("donations");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState(""); // Track the user's email
  const [statusFilter, setStatusFilter] = useState("all"); // State for filtering donations by status
  const [searchTerm, setSearchTerm] = useState(""); // Track the search term

  useEffect(() => {
    async function fetchData() {
      try {
        const session = await getSession();
        const userEmail = session?.user?.email;

        if (!userEmail) {
          console.error("User email not found");
          return;
        }

        setEmail(userEmail);

        // Fetch user-specific donations
        const donationsRes = await axios.get(
          `/api/donations?donoremail=${userEmail}`
        );

        // Fetch all requests
        const requestsRes = await axios.get(`/api/requests`);

        // Set the donations with combined data
        setDonations(donationsRes.data);

        // Set all requests to the state if needed elsewhere
        setRequests(requestsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Stop the loading spinner
      }
    }

    fetchData();
  }, []);

  const handleWithdraw = (id) => {
    // Remove the withdrawn donation from the state
    setDonations(donations.filter((donation) => donation._id !== id));
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value); // Update the filter based on selection
  };

  // Filter by status first
  const filteredDonations = donations.filter((donation) => {
    if (statusFilter === "all") return true; // Show all if 'all' is selected
    return donation.status === statusFilter;
  });

  const filteredRequests = requests
    .filter((request) => request.donoremail === email) // First filter by email
    .filter((request) => {
      if (statusFilter === "all") return true; // Show all if 'all' is selected
      return request.status === statusFilter; // Filter by status
    });

  // Apply search term filtering after status filtering
  const searchedDonations = filteredDonations.filter((donation) =>
    donation.foodName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const searchedRequests = filteredRequests.filter((request) =>
    request.foodName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <Header /> {/* Consistent header */}
      <div className="flex flex-row items-center justify-between px-4">
        <div className="text-3xl font-extrabold w-[90%]">Donor Dashboard</div>
        <Link href="/donate" className="w-[10%]">
          <button className="bg-custom-dark-green text-white font-semibold py-2 px-4 rounded-md hover:bg-custom-darker-green">
            New Donation
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-[400px_1fr_auto] gap-x-2 p-5">
        {/* Tab Navigation */}
        <div className="flex ml-1">
          <button
            className={`px-8 py-2 border border-gray-300 shadow-sm ${
              activeTab === "donations"
                ? "bg-custom-dark-green text-white"
                : "bg-white text-black"
            } rounded-l-lg`}
            onClick={() => setActiveTab("donations")}
          >
            My Donations
          </button>
          <button
            className={`px-8 py-2 border border-gray-300 shadow-sm ${
              activeTab === "requests"
                ? "bg-custom-dark-green text-white"
                : "bg-white text-black"
            } rounded-r-lg`}
            onClick={() => setActiveTab("requests")}
          >
            Requests to Fulfill
          </button>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by food name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="w-5 h-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z"
              />
            </svg>
          </div>
        </div>

        {/* Filter Dropdown for Donations */}
        {activeTab === "donations" && (
          <div className="flex items-center justify-between">
            <label htmlFor="statusFilter" className="mr-2">
              Filter by status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="matched">Matched</option>
              <option value="inwarehouse">In Warehouse</option>
              <option value="awaitingdelivery">Awaiting Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        )}
      </div>
      <div className="flex flex-row justify-between gap-4">
        {/* Left Column for Welcome Card */}
        <div className="flex w-[30%]">
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
                Welcome Back Donor!
              </Typography>
              <Typography variant="h5" className="mb-4 text-gray-400">
                Manage your donations or fulfill requests.
              </Typography>
            </CardBody>
          </Card>
        </div>

        <div className="min-w-[70%] h-[calc(100vh-100px)] overflow-y-auto">
          {activeTab === "donations" && (
            <div>
              <div>
                <h1 className="text-2xl font-bold mb-4">My Donations</h1>
              </div>
              {filteredDonations.length > 0 ? (
                searchedDonations.map((donation, index) => (
                  <DonationCard
                    key={`donation-${index}`} // Use a unique key
                    donation={donation}
                    onWithdraw={handleWithdraw}
                  />
                ))
              ) : (
                <></>
              )}
              {searchedRequests.length > 0 ? (
                searchedRequests.map((request, index) => (
                  <RequestCard
                    key={index} // Add a unique key prop here
                    request={request}
                  />
                ))
              ) : (
                <></>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">Requests to Fulfill</h1>
              {requests
                .filter((request) => request.status === "new") // Keep the "new" status filter for Requests to Fulfill
                .filter((request) =>
                  request.foodName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                ) // Apply search filter on raw requests data
                .map((request, index) => (
                  <RequestCard
                    key={index} // Add a unique key prop here
                    request={request}
                  />
                ))}
              {requests.filter((request) => request.status === "new").length ===
                0 && <></>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
