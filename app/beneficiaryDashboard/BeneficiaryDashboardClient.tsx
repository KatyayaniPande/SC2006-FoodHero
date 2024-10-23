// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   Typography,
//   Button,
// } from "@material-tailwind/react";
// import BeneficiaryCard from "./BeneficiaryCard";
// import DonorCard from "./DonorCard";
// import Header from "@/components/Header";
// import Link from "next/link";
// import { getSession } from "next-auth/react";

// export interface Request {
//   foodName: string;
//   foodType: string;
//   foodCategory: string;
//   needByTime: string;
//   specialRequest: string;
//   deliveryMethod: string;
//   deliveryTime: string;
//   deliveryLocation: string;
//   quantity: number;
//   numberOfServings: number;
//   status:
//     | "new"
//     | "matched"
//     | "inwarehouse"
//     | "awaitingpickup"
//     | "awaitingdelivery"
//     | "delivered"; // Add status field
// }

// export default function BeneficiaryDashboardClient() {
//   const [activeTab, setActiveTab] = useState("myRequests");
//   const [myRequests, setMyRequests] = useState<Request[]>([]);
//   const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [email, setEmail] = useState(""); // Track the user's email

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const session = await getSession();
//         const userEmail = session?.user?.email;

//         if (!userEmail) {
//           console.error("User email not found");
//           return;
//         }

//         setEmail(userEmail);
//         // Fetching 'My Requests'
//         const myRequestsResponse = await axios.get(
//           `/api/requests?beneficiaryemail=${userEmail}`
//         );
//         setMyRequests(myRequestsResponse.data);

//         // Fetching 'Available Donations'
//         const availableDonationsResponse = await axios.get(`/api/donations`);
//         setAvailableDonations(availableDonationsResponse.data);
//       } catch (error) {
//         console.error("Error fetching requests:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchData();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen p-8">
//       <Header />
//       <div className="flex flex-row items-center justify-between">
//         <div className="mr-3 mb-3 text-3xl font-extrabold w-[90%]">
//           Beneficiary Dashboard
//         </div>
//         <Link href="/request" className="w-[10%]">
//           <button className="bg-custom-dark-green text-white font-semibold py-2 px-4 rounded-md hover:bg-custom-darker-green">
//             New Request
//           </button>
//         </Link>
//       </div>

//       {/* Tab Navigation */}
//       <div className="flex ml-1 mb-6">
//         <button
//           className={`px-4 py-2 ${
//             activeTab === "myRequests"
//               ? "bg-custom-dark-green text-white"
//               : "bg-white text-black"
//           } rounded-l-lg`}
//           onClick={() => setActiveTab("myRequests")}
//         >
//           My Requests
//         </button>
//         <button
//           className={`px-4 py-2 ${
//             activeTab === "availableDonations"
//               ? "bg-custom-dark-green text-white"
//               : "bg-white text-black"
//           } rounded-r-lg`}
//           onClick={() => setActiveTab("availableDonations")}
//         >
//           Available Donations
//         </button>
//       </div>

//       <div className="flex gap-8">
//         {/* Left Column for Welcome Card */}
//         <div className="flex-1 min-w-[30%]">
//           <Card
//             shadow={false}
//             className="relative h-full w-full items-end justify-center overflow-hidden text-center"
//           >
//             <CardHeader
//               floated={false}
//               shadow={false}
//               color="transparent"
//               className="absolute inset-0 m-0 h-full w-full rounded-none bg-[url('https://images.unsplash.com/photo-1552960562-daf630e9278b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80')] bg-cover bg-center"
//             >
//               <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50" />
//             </CardHeader>
//             <CardBody className="relative py-14 px-6 md:px-12">
//               <Typography
//                 variant="h2"
//                 color="white"
//                 className="mb-6 font-medium leading-[1.5]"
//               >
//                 Welcome Back!
//               </Typography>
//               <Typography variant="h5" className="mb-4 text-gray-400">
//                 Manage your requests or view available donations.
//               </Typography>
//             </CardBody>
//           </Card>
//         </div>

//         <div className="flex-1 min-w-[70%] max-h-[calc(100vh-100px)] overflow-y-auto">
//           {activeTab === "myRequests" && (
//             <div>
//               <h1 className="text-2xl font-bold mb-4 text-black">
//                 My Requests
//               </h1>
//               {myRequests.length > 0 || availableDonations.length > 0 ? (
//                 <>
//                   {/* My Requests with status 'new' */}
//                   {myRequests

//                     .filter(
//                       (request) =>
//                         request.status === "new" ||
//                         request.status === "matched" ||
//                         request.status === "inwarehouse" ||
//                         request.status === "awaitingdelivery"
//                     ) // Filter for requests with status 'new'
//                     .map((request, index) => (
//                       <BeneficiaryCard
//                         key={`request-${index}`} // Use a unique key
//                         request={request}
//                       />
//                     ))}

//                   {/* Available Donations with status 'matched' */}
//                   {availableDonations
//                     .filter((donation) => donation.beneficiaryemail === email) // First filter by email

//                     .filter(
//                       (donation) =>
//                         donation.status === "matched" ||
//                         donation.status === "inwarehouse" ||
//                         donation.status === "awaitingdelivery"
//                     ) // Filter for donations with status 'matched'
//                     .map((donation, index) => (
//                       <DonorCard
//                         key={`donation-${index}`} // Use a unique key
//                         donation={donation}
//                       />
//                     ))}
//                 </>
//               ) : (
//                 <p>No requests found.</p>
//               )}
//             </div>
//           )}

//           {activeTab === "availableDonations" && (
//             <div>
//               <h1 className="text-2xl font-bold mb-4 text-black">
//                 Available Donations
//               </h1>
//               {availableDonations.length > 0 ? (
//                 availableDonations
//                   .filter((donation) => donation.status === "new") // Filter for donations with status 'new'
//                   .map((donation, index) => (
//                     <DonorCard
//                       key={`donation-${index}`} // Use a unique key
//                       donation={donation}
//                     />
//                   ))
//               ) : (
//                 <p>No available donations at this time.</p>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

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
  _id: string;
  foodName: string;
  foodType: string;
  foodCategory: string;
  needByTime: string;
  specialRequest: string;
  deliveryMethod: string;
  deliveryTime: string;
  donoremail: string;
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
  const [email, setEmail] = useState(""); // Track the user's email
  const [statusFilter, setStatusFilter] = useState("all"); // State for filtering donations by status

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
        // Fetching 'My Requests'
        const myRequestsResponse = await axios.get(
          `/api/requests?beneficiaryemail=${userEmail}`
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

  const handleWithdraw = (id) => {
    // Remove the withdrawn donation from the state
    setMyRequests(myRequests.filter((request) => request._id !== id));
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value); // Update the filter based on selection
  };
  const filteredRequests = myRequests.filter((donation) => {
    if (statusFilter === "all") return true; // Show all if 'all' is selected
    return donation.status === statusFilter;
  });

  const filteredDonations = availableDonations
    .filter((donation) => donation.donoremail === email) // First filter by email
    .filter((donation) => {
      if (statusFilter === "all") return true; // Show all if 'all' is selected
      return donation.status === statusFilter; // Filter by status
    });

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
          <button className="bg-custom-dark-green text-white font-semibold py-2 px-4 rounded-md hover:bg-custom-darker-green">
            New Request
          </button>
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex ml-1 mb-6">
        <button
          className={`px-4 py-2 ${
            activeTab === "myRequests"
              ? "bg-custom-dark-green text-white"
              : "bg-white text-black"
          } rounded-l-lg`}
          onClick={() => setActiveTab("myRequests")}
        >
          My Requests
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "availableDonations"
              ? "bg-custom-dark-green text-white"
              : "bg-white text-black"
          } rounded-r-lg`}
          onClick={() => setActiveTab("availableDonations")}
        >
          Available Donations
        </button>
      </div>

      {activeTab === "myRequests" && (
        <div className="mb-4">
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

              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation, index) => (
                  <DonorCard
                    key={`donation-${index}`} // Use a unique key
                    donation={donation}
                    onWithdraw={handleWithdraw}
                  />
                ))
              ) : (
                <></>
              )}
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request, index) => (
                  <BeneficiaryCard
                    key={index} // Add a unique key prop here
                    request={request}
                  />
                ))
              ) : (
                <></>
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
