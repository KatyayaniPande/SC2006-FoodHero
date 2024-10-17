'use client'; // Ensure the component is a client-side component

import React, { useState } from 'react';
import Header from '@/components/Header'; // Adjust the path as needed

const DonorProfile = () => {
    // State for donor details and edit mode
    const [donor, setDonor] = useState({
        agency: "Goodwill Donors Org",
        address: "123 Charity Lane, Cityville",
        uen: "201812345M",
        poc_name: "John Doe",
        poc_phone: "98765432",
        halal_certification: true,
        hygiene_certification: "A (Excellent)",
    });

    const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDonor((prevDonor) => ({
            ...prevDonor,
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
                <h1 className="text-2xl font-semibold">{donor.agency}</h1>
                <p className="text-gray-500">Donor</p>
            </div>

            <div className="container mx-auto p-4 max-w-4xl grid grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={donor.address}
                        readOnly={!isEditing} // Editable only when in edit mode
                        onChange={handleInputChange}
                        className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">UEN Number</label>
                    <input
                        type="text"
                        name="uen"
                        value={donor.uen}
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
                        value={donor.poc_name}
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
                        value={donor.poc_phone}
                        readOnly={!isEditing} // Editable only when in edit mode
                        onChange={handleInputChange}
                        className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">Halal Certified</label>
                    <input
                        type="text"
                        name="halal_certification"
                        value={donor.halal_certification ? 'Yes' : 'No'}
                        readOnly={!isEditing} // Editable only when in edit mode
                        onChange={handleInputChange}
                        className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">Hygiene Certification</label>
                    <input
                        type="text"
                        name="hygiene_certification"
                        value={donor.hygiene_certification}
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

export default DonorProfile;
