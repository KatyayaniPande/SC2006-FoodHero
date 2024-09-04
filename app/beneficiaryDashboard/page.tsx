import BeneficiaryDashboardClient from "./BeneficiaryDashboardClient"; // Client component

export default async function BeneficiaryDashboardPage() {
  const appUrl = process.env.APP_URL;

  // Fetch data on the server side
  const res = await fetch(`${appUrl}/api/requests`, {
    cache: "no-store",
  });
  const beneficiaries = await res.json();

  return (
    <BeneficiaryDashboardClient beneficiaries={beneficiaries} />
  );
}
