import BeneficiaryDashboardClient from "./BeneficiaryDashboardClient"; // Client component

export default async function DonorDashboardPage() {
    const appUrl = process.env.APP_URL;

    // Fetch data on the server side
    const res = await fetch(`${appUrl}/api/requests`, {
        cache: "no-store",
    });
    const beneficiaries = await res.json();

    return (
        // Render the client component and pass the data as props
        <BeneficiaryDashboardClient beneficiaries={beneficiaries} />
    );
}
