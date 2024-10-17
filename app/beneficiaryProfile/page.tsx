'use client'; // Ensure the component is a client-side component

import React, { useState } from 'react';
import Header from '@/components/Header'; // Adjust the path as needed

const BeneficiaryProfile = () => {
    // State for beneficiary details and edit mode
    const [beneficiary, setBeneficiary] = useState({
        agency: "Goodwill Beneficiary Org",
        address: "123 Charity Lane, Cityville",
        poc_name: "John Doe",
        poc_phone: "98765432",
    });

    const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBeneficiary((prevBeneficiary) => ({
            ...prevBeneficiary,
            [name]: value,
        }));
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <Header />
            <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <img src="/images/people.png" className="w-16 h-16" alt="profilelogo" />
                </div>
                <h1 className="text-2xl font-semibold">{beneficiary.agency}</h1>
                <p className="text-gray-500">Beneficiary</p>
            </div>

            <div className="container mx-auto p-4 max-w-4xl grid grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={beneficiary.address}
                        readOnly={!isEditing} // Editable only when in edit mode
                        onChange={handleInputChange}
                        className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">Point of Contact Name</label>
                    <input
                        type="text"
                        name="poc_name"
                        value={beneficiary.poc_name}
                        readOnly={!isEditing} // Editable only when in edit mode
                        onChange={handleInputChange}
                        className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">Point of Contact Phone</label>
                    <input
                        type="text"
                        name="poc_phone"
                        value={beneficiary.poc_phone}
                        readOnly={!isEditing} // Editable only when in edit mode
                        onChange={handleInputChange}
                        className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    className="bg-custom-dark-green text-white px-4 py-2 rounded-md hover:bg-custom-darker-green"
                    onClick={() => setIsEditing(!isEditing)} // Toggle edit mode
                >
                    {isEditing ? "Save Profile" : "Edit Profile"} {/* Toggle button text */}
                </button>
            </div>
        </div>
    );
};

export default BeneficiaryProfile;
