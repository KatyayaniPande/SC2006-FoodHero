import DonationDashboardClient from "./DonationDashboardClient"; // Client component
import { Donation } from "./DonationDashboardClient";

export interface DonationCardProps {
  donation: Donation;
}

export default async function DonorDashboardPage() {
  const appUrl = process.env.APP_URL;

  // Fetch donations and requests data on the server side
  const [donationsRes, requestsRes] = await Promise.all([
    fetch(`${appUrl}/api/donations`, { cache: "no-store" }),
    fetch(`${appUrl}/api/requests`, { cache: "no-store" }), // Fetch all requests
  ]);

  const donations = await donationsRes.json();
  const requests = await requestsRes.json();

  return (
    <div className="min-h-screen overflow-auto bg-gray-100">
      {" "}
      {/* Ensure scrollability */}
      {/* Render the client component and pass the data as props */}
      <DonationDashboardClient donations={donations} requests={requests} />
    </div>
  );
}
