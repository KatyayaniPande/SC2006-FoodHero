'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from '@material-tailwind/react';
import BeneficiaryCard from './BeneficiaryCard'; // Ensure correct import path
import Header from '@/components/Header'; // Adjust the path as needed
import Link from 'next/link';
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
}
import { getSession } from 'next-auth/react';

// prettier-ignore
export default function BeneficiaryDashboardClient({beneficiaries}: {beneficiaries: Request[]}) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRequests() {
            try {
              const session = await getSession()
              const email = session?.user.email
              console.log(email)
              const response = await axios.get(`/api/requests?email=${email}`);
              setRequests(response.data);
              console.log(response.data);
              console.log(requests);
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRequests();
    }, []);

    useEffect(() => {
        console.log("Updated Requests:", requests);
    }, [requests]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!requests.length) {
        return <div>No requests found.</div>;
    }

    return (
      <div className='bg-gray-50 min-h-screen p-8'>
        <Header />
        <div className='flex flex-row items-center justify-between'>
          <div className='mr-3 mb-3 text-3xl font-extrabold w-[90%]'>
            Beneficiary Dashboard
          </div>
          <Link href='/request' className='w-[10%]'>
            <button className='bg-green-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75'>
              New request
            </button>
          </Link>
        </div>
        <div className='flex gap-8'>
          {/* Left Column for Welcome Card */}
          <div className='flex-1 min-w-[30%]'>
            <Card
              shadow={false}
              className='relative h-full w-full items-end justify-center overflow-hidden text-center'
              placeholder=''
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              <CardHeader
                floated={false}
                shadow={false}
                color='transparent'
                className="absolute inset-0 m-0 h-full w-full rounded-none bg-[url('https://images.unsplash.com/photo-1552960562-daf630e9278b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80')] bg-cover bg-center"
                placeholder=''
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
              >
                <div className='to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50' />
              </CardHeader>
              <CardBody
                className='relative py-14 px-6 md:px-12'
                placeholder=''
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
              >
                <Typography
                  variant='h2'
                  color='white'
                  className='mb-6 font-medium leading-[1.5]'
                  placeholder=''
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant='h5'
                  className='mb-4 text-gray-400'
                  placeholder=''
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                >
                  Tania Andrew
                </Typography>
              </CardBody>
            </Card>
          </div>

          <div className='flex-1 min-w-[70%] max-h-[calc(100vh-100px)] overflow-y-auto'>
            <h1 className='text-2xl font-bold mb-4 text-black'>My requests</h1>
            {requests.map((request, index) => (
              <BeneficiaryCard
                key={index} // Add a unique key prop here
                request={request}
              />
            ))}
          </div>
        </div>
      </div>
    );
}
