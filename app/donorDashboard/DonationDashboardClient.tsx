'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from '@material-tailwind/react';
import DonationCard from './DonationCard'; // Ensure correct import path
import RequestCard from './RequestCard'; // Ensure correct import path
import Header from '@/components/Header'; // Adjust the path as needed
import Link from 'next/link';
import { getSession } from 'next-auth/react';

export interface Donation {
  foodName: string;
  foodType: string;
  foodCategory: string;
  timeOfPreparation: string;
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
  consumeByTiming: string;
  pickUpTime: string;
  dropOffTime: string;
}

export interface Request {
  title: string;
  description: string;
  quantity: number;
  deadline: string;
}

export default function DonorDashboardClient() {
  const [activeTab, setActiveTab] = useState('donations');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const session = await getSession();
        const email = session?.user.email;

        const donationsRes = await axios.get(`/api/donations?email=${email}`);
        setDonations(donationsRes.data);

        const requestsRes = await axios.get(`/api/requests`);
        setRequests(requestsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
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
    <>
      <Header /> {/* Header remains the top-level component */}
      <div className="flex gap-8 min-h-screen p-8 bg-gray-50">
        {/* Side Image Section - Adjusting width */}
        <div className="flex-1 min-w-[25%]">
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
              <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50" />
            </CardHeader>
            <CardBody className="relative py-14 px-6 md:px-12">
              <Typography variant="h2" color="white" className="mb-6 font-medium leading-[1.5]">
                Welcome Back!
              </Typography>
              <Typography variant="h5" className="mb-4 text-gray-400">
                Manage your donations or fulfill requests.
              </Typography>
            </CardBody>
          </Card>
        </div>

        {/* Main Content Section */}
        <div className="flex-1 min-w-[75%] overflow-y-auto"> {/* Removed max-h */}
          {/* Tab Navigation */}
          <div className="flex mb-6">
            <button
              className={`px-4 py-2 ${activeTab === 'donations' ? 'bg-green-500 text-white' : 'bg-white text-black'} rounded-l-lg`}
              onClick={() => setActiveTab('donations')}
            >
              My Donations
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'requests' ? 'bg-green-500 text-white' : 'bg-white text-black'} rounded-r-lg`}
              onClick={() => setActiveTab('requests')}
            >
              Requests to Fulfill
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'donations' && (
            <div>
              {/* Adjusting the "New Donation" button */}
              <div className="flex mb-4">
                <Link href="/donate">
                  <button className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
                    New donation
                  </button>
                </Link>
              </div>

              {/* Display Donations */}
              <h1 className="text-2xl font-bold mb-4 text-black">My Donations</h1>
              <div className="grid gap-4">
                {donations.map((donation, index) => (
                  <Card key={index} className="mb-4 border p-4 rounded-lg shadow-lg">
                    <CardBody>
                      <Typography variant="h5" className="mb-2">
                        {donation.foodName} [{donation.foodCategory}]
                      </Typography>
                      <Typography className="mb-2">Quantity: {donation.quantity}</Typography>
                      <Typography className="mb-2">Special Request: {donation.specialHandling}</Typography>
                      <Typography className="mb-2">Delivery Method: {donation.deliveryMethod}</Typography>
                      <Typography className="mb-2">Drop-Off Time: {donation.dropOffTime}</Typography>
                      <Button className="bg-black text-white">Withdraw</Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h1 className="text-2xl font-bold mb-4 text-black">Requests to Fulfill</h1>
              <div className="grid gap-4">
                {requests.map((request, index) => (
                  <RequestCard key={index} request={request} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
