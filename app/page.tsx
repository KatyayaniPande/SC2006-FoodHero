"use client";
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

const HomePage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="bg-custom-light-green min-h-screen p-8">
      <Header />
      <main>
        {/* Enhanced Work with Us Section */}
        <section className="p-8 mb-8 flex flex-col md:flex-row items-center justify-center">
          {/* Text and Buttons */}
          <div className="md:w-1/2 text-center flex flex-col items-center">
            <h1 className="text-7xl font-bold">Food</h1>
            <h1 className="text-7xl font-bold mb-4">Donation</h1>
            <p className="text-lg mb-4">
              Join our mission to eliminate food wastage and make a positive impact on the community. Whether you're a business looking to donate surplus food, or an individual looking to receive donations, there's a place for you at Food Hero.
            </p>
            <div className="text-lg flex flex-col md:flex-row justify-center">
              <button
                className="bg-custom-dark-green text-white font-bold px-6 py-3 rounded-lg  hover:bg-custom-darker-green mb-4 md:mb-0 md:mr-4 shadow-lg"
                onClick={() => router.push('/signup?type=donor')}
              >
                Get Started As A Donor
              </button>
              <button
                className="bg-custom-dark-green text-white font-bold px-6 py-3 rounded-lg hover:bg-custom-darker-green mb-4 md:mb-0 md:mr-4 shadow-lg"
                onClick={() => router.push('/signup?type=beneficiary')}
              >
                Get Started As A Beneficiary
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
            <img
              src="\images\logo2.jpg" alt="donationLogo"
              className="w-full h-auto max-w-lg object-cover rounded-3xl shadow-lg"
              
            />
          </div>
        </section>

        {/* Our Mission, Values, What We Do Sections */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-md text-center">
            <div className="mb-1">
              <img src="/images/people.png" alt="Our Mission" className="mx-auto w-16 h-16" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
            <p className="mx-7 text-lg mb-10">
              We strive to eliminate food wastage by redistributing excess food to those in need.
            </p>
            <button
              className="bg-custom-dark-green text-white text-lg font-bold px-4 py-2 rounded-full hover:bg-custom-darker-green"
              onClick={() => router.push('/mission')}
            >
              Learn More
            </button>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md text-center">
            <div className="mb-1">
              <img src="/images/people.png" alt="Our Values" className="mx-auto w-16 h-16" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Our Values</h3>
            <p className="mx-7 text-lg mb-10">
              We value sustainability, compassion, and community support.
            </p>
            <button
              className="bg-custom-dark-green text-white text-lg font-bold px-4 py-2 rounded-full hover:bg-custom-darker-green"
              onClick={() => router.push('/values')}
            >
              Explore Values
            </button>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md text-center">
            <div className="mb-1">
              <img src="/images/people.png" alt="What We Do" className="mx-auto w-16 h-16" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">What We Do</h3>
            <p className="mx-7 text-lg mb-10">
              We collect surplus food from businesses and distribute it to charities and families in need.
            </p>
            <button
              className="bg-custom-dark-green text-white text-lg font-bold px-4 py-2 rounded-full hover:bg-custom-darker-green"
              onClick={() => router.push('/what-we-do')}
            >
              Discover More
            </button>
          </div>
        </section>

        {/* Impact Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8 text-center mt-10">
          <h2 className="text-2xl font-bold mb-4">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-xl font-semibold">5,000+</h3>
              <p>Meals Distributed</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">200+</h3>
              <p>Businesses Engaged</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">100+</h3>
              <p>Charities Supported</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-200 p-8 rounded-lg mb-8 text-center shadow-md">
          <h2 className="text-2xl font-bold mb-4">Testimonials</h2>
          <p className="italic">
            "Food Hero has made a real impact in our community. The redistribution efforts have provided
            countless meals to those in need." - Partner Organization
          </p>
        </section>

        {/* Footer Section */}
        <footer className="bg-gray-900 text-white p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-semibold mb-4">About Us</h3>
              {/* <a href="/about" className="hover:underline">Our Story</a>
              <a href="/team" className="hover:underline">Team</a>
              <a href="/contact" className="hover:underline">Contact</a> */}
              <ul className="space-y-4 text-gray-300">
                <li><a href="/about" className="hover:text-white hover:underline">Our Story</a></li>
                <li><a href="/team" className="hover:text-white hover:underline">Team</a></li>
                <li><a href="/contact" className="hover:text-white hover:underline">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get Involved</h3>
              <ul className="space-y-4 text-gray-300">
                <li><a href="/signup?type=donor" className="hover:text-white hover:underline">Donate Food</a></li>
                <li><a href="/signup?type=partner" className="hover:text-white hover:underline">Partner with Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-4 text-gray-300">
                <li><a href="#" className="hover:text-white hover:underline">Facebook</a></li>
                <li><a href="#" className="hover:text-white hover:underline">Twitter</a></li>
                <li><a href="#" className="hover:text-white hover:underline">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Address</h3>
                <div className="text-gray-300">
                  <p>218 Pandan Loop, Level 6, Singapore 128408</p>
                  <p className="font-semibold mt-2">Operating Hours:</p>
                  <p>Monday to Friday 9.30am - 6pm</p>
                  <p>Saturday 10am - 5pm</p>
                </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;
