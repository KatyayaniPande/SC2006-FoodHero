'use client';

import React from 'react';
import Header from '@/components/Header'; // Adjust the path as needed

const MissionPage: React.FC = () => {
  return (
    <div className='bg-gray-50 min-h-screen p-8'>
      <Header />
      <main className='max-w-7xl mx-auto'>
        <section className='bg-white rounded-lg shadow-lg p-12 mb-12'>
          <h1 className='text-4xl font-bold text-center mb-8 text-[#A2C765]'>
            Our Mission
          </h1>

          <p className='text-xl text-gray-700 leading-relaxed text-center mb-12'>
            Our mission is to eradicate hunger and minimize food waste by
            ensuring that excess food reaches those who need it most. We believe
            in a sustainable future where no one in Singapore goes hungry.
            Through innovation, collaboration, and dedication, we are committed
            to building a community where food is shared with dignity, care, and
            compassion.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='p-6 bg-[#F0F4E4] rounded-lg'>
              <h2 className='text-2xl font-semibold mb-4 text-[#A2C765]'>
                Empowering Communities
              </h2>

              <p className='text-gray-700'>
                We work closely with local communities, volunteers, and
                businesses to create a network that supports those in need. Our
                programs are designed to provide nutritious food to
                underprivileged families while fostering a sense of community
                and mutual support.
              </p>
            </div>

            <div className='p-6 bg-[#F0F4E4] rounded-lg'>
              <h2 className='text-2xl font-semibold mb-4 text-[#A2C765]'>
                Innovative Solutions
              </h2>

              <p className='text-gray-700'>
                By leveraging technology and innovative strategies, we aim to
                optimize food distribution, reduce waste, and create sustainable
                practices. Our goal is to make food security a reality for all
                through continuous improvement and creative problem-solving.
              </p>
            </div>
          </div>
        </section>

        <section className='bg-[#E7EDCF] p-12 rounded-lg shadow-lg'>
          <h2 className='text-3xl font-bold text-center text-[#A2C765] mb-8'>
            Join Our Mission
          </h2>

          <p className='text-lg text-gray-700 leading-relaxed text-center mb-8'>
            We invite you to join us in our mission to make Singapore
            hunger-free. Whether you are an individual, business, or
            organization, your support can make a difference. Together, we can
            ensure that everyone has access to the food they need to thrive.
          </p>
          <div className='text-center'>
            <a
              href='/get-involved'
              className='inline-block bg-[#A2C765] text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-[#8FA556]'
            >
              Get Involved
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MissionPage;
