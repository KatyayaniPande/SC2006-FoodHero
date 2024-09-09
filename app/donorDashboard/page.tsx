import DonationDashboardClient from "./DonationDashboardClient"; // Client component
import { Donation } from "./DonationDashboardClient";

export interface DonationCardProps {
  donation: Donation;
}

export default async function DonorDashboardPage() {
  const appUrl = process.env.APP_URL;

  // Fetch data on the server side
  const res = await fetch(`${appUrl}/api/donations`, {
    cache: "no-store",
  });
  const donations = await res.json();

  return (
    <div className="min-h-screen overflow-auto bg-gray-100 p-8"> {/* Ensure scrollability */}
      {/* Render the client component and pass the data as props */}
      <DonationDashboardClient donation={donations} />
    </div>
  );
}
