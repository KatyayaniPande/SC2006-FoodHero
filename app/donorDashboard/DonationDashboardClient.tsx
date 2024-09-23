"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from '@material-tailwind/react';
import DonationCard from './DonationCard';
import RequestCard from './RequestCard';
import Header from '@/components/Header';
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
  status: 'new' | 'matched' | 'awaitingpickup' | 'awaitingdelivery' | 'delivered'; // Add status field
}


export interface Request {
  title: string;
  description: string;
  quantity: number;
  deadline: string;
  status: 'new' | 'matched' | 'awaitingpickup' | 'awaitingdelivery' | 'delivered'; // Add status field

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
        const email = session?.user?.email;

        // Fetch user-specific donations
        const donationsRes = await axios.get(`/api/donations?email=${email}`);
        setDonations(donationsRes.data);

        // Fetch all beneficiary requests (no filtering by email)
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
    <div className='bg-gray-50 min-h-screen p-8'>
      <Header /> {/* Consistent header */}
      
      <div className='flex flex-row items-center justify-between'>
        <div className='mr-3 mb-3 text-3xl font-extrabold w-[90%]'>
          Donor Dashboard
        </div>
        <Link href='/donate' className='w-[10%]'>
          <button className='bg-green-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75'>
            New Donation
          </button>
        </Link>
      </div>

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

      <div className='flex gap-8'>
        {/* Left Column for Welcome Card */}
        <div className='flex-1 min-w-[30%]'>
          <Card
            shadow={false}
            className='relative h-full w-full items-end justify-center overflow-hidden text-center'
          >
            <CardHeader
              floated={false}
              shadow={false}
              color='transparent'
              className="absolute inset-0 m-0 h-full w-full rounded-none bg-[url('https://images.unsplash.com/photo-1552960562-daf630e9278b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80')] bg-cover bg-center"
            >
              <div className='to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50' />
            </CardHeader>
            <CardBody className='relative py-14 px-6 md:px-12'>
              <Typography
                variant='h2'
                color='white'
                className='mb-6 font-medium leading-[1.5]'
              >
                Welcome Back!
              </Typography>
              <Typography
                variant='h5'
                className='mb-4 text-gray-400'
              >
                Manage your donations or fulfill requests.
              </Typography>
            </CardBody>
          </Card>
        </div>

        <div className='flex-1 min-w-[70%] max-h-[calc(100vh-100px)] overflow-y-auto'>
          {activeTab === 'donations' && (
            <div>
              <h1 className='text-2xl font-bold mb-4 text-black'>My Donations</h1>
              {donations.length > 0 || requests.length > 0 ? (
        <>
          {/* Donations with status 'new' */}
          {donations
            .filter((donation) => donation.status === 'new')  // Filter for donations with status 'new'
            .map((donation, index) => (
              <DonationCard
                key={`donation-${index}`} // Use a unique key
                donation={donation}
              />
            ))
          }

          {/* Requests with status 'matched' */}
          {requests
            .filter((request) => request.status === 'matched')  // Filter for requests with status 'matched'
            .map((request, index) => (
              <RequestCard
                key={`request-${index}`} // Use a unique key
                request={request}
              />
            ))
          }
        </>
      ) : (
                <p>No donations found.</p>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h1 className='text-2xl font-bold mb-4 text-black'>Requests to Fulfill</h1>
              {requests.length > 0 ? (
      requests
        .filter((request) => request.status === 'new')  // Filter for requests with status 'new'
        .map((request, index) => (
          <RequestCard
            key={index} // Add a unique key prop here
            request={request}
          />
        ))
    ) : (
                <p>No requests to fulfill at this time.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
