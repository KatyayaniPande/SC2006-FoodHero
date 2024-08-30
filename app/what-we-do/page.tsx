'use client';

import React from 'react';
import Header from '@/components/Header'; // Adjust the import path as necessary

const WhatWeDoPage: React.FC = () => {
  return (
    <div className='bg-gray-50 min-h-screen p-8'>
      <Header /> {/* Imported and used the Header component */}
      <main className='max-w-7xl mx-auto'>
        <section className='bg-white rounded-lg shadow-lg p-12 mb-12'>
          <h1 className='text-4xl font-bold text-center mb-8 text-[#A2C765]'>
            What We Do
          </h1>

          <p className='text-xl text-gray-700 leading-relaxed text-center mb-12'>
            At Singapore Food Bank, we bridge the gap between food surplus and
            food scarcity. Our efforts are dedicated to collecting, sorting, and
            redistributing surplus food to those who need it most. Through our
            programs, we work tirelessly to ensure that no one in our community
            goes hungry.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='p-6 bg-[#F0F4E4] rounded-lg'>
              <h2 className='text-2xl font-semibold mb-4 text-[#A2C765]'>
                Food Collection
              </h2>

              <p className='text-gray-700'>
                We partner with local businesses, supermarkets, and farms to
                collect surplus food. Our volunteers ensure that food is handled
                with care and delivered promptly to our distribution centers.
              </p>
            </div>

            <div className='p-6 bg-[#F0F4E4] rounded-lg'>
              <h2 className='text-2xl font-semibold mb-4 text-[#A2C765]'>
                Distribution
              </h2>

              <p className='text-gray-700'>
                Our distribution network spans across the island, reaching out
                to charities, shelters, and community centers. We focus on
                getting food to those who need it most, with a focus on
                nutritious and balanced meals.
              </p>
            </div>

            <div className='p-6 bg-[#F0F4E4] rounded-lg'>
              <h2 className='text-2xl font-semibold mb-4 text-[#A2C765]'>
                Community Engagement
              </h2>

              <p className='text-gray-700'>
                Beyond food distribution, we educate and engage the community on
                the importance of food security, sustainability, and reducing
                food waste. Through workshops and outreach programs, we empower
                others to take part in our mission.
              </p>
            </div>

            <div className='p-6 bg-[#F0F4E4] rounded-lg'>
              <h2 className='text-2xl font-semibold mb-4 text-[#A2C765]'>
                Impact Measurement
              </h2>

              <p className='text-gray-700'>
                We are committed to transparency and accountability. We
                regularly measure the impact of our programs and share our
                successes and challenges with the community.
              </p>
            </div>
          </div>
        </section>

        <section className='bg-[#E7EDCF] p-12 rounded-lg shadow-lg'>
          <h2 className='text-3xl font-bold text-center text-[#A2C765] mb-8'>
            Our Impact
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            <div className='p-6 bg-white rounded-lg shadow'>
              <h3 className='text-4xl font-bold text-[#A2C765]'>500,000+</h3>
              <p className='text-lg text-gray-700 mt-2'>Meals Distributed</p>
            </div>
            <div className='p-6 bg-white rounded-lg shadow'>
              <h3 className='text-4xl font-bold text-[#A2C765]'>1,200+</h3>
              <p className='text-lg text-gray-700 mt-2'>Volunteers Engaged</p>
            </div>
            <div className='p-6 bg-white rounded-lg shadow'>
              <h3 className='text-4xl font-bold text-[#A2C765]'>300+</h3>

              <p className='text-lg text-gray-700 mt-2'>Partners & Donors</p>
            </div>
          </div>
          <div className='text-center mt-12'>
            <a
              href='/get-involved'
              className='inline-block bg-[#A2C765] text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-[#8FA556]'
            >
              Join Us
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WhatWeDoPage;
