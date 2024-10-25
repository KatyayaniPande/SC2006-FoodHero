'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import Header from '@/components/Header'; // Adjust the path to your Header component

export default function Profile() {
  const [beneficiary, setBeneficiary] = useState({
    agency: '',
    email: '',
    poc_name: '',
    poc_phone: '',
    halal_certification: false,
    hygiene_certification: '',
    role: '',
    createdAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Track edit mode
  const [saving, setSaving] = useState(false); // Track saving state
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Show delete confirmation pop-up
  const [message, setMessage] = useState(''); // To display success or info messages

  // Fetch beneficiary details from API based on the session
  useEffect(() => {
    async function fetchBeneficiary() {
      try {
        const session = await getSession();
        const userEmail = session?.user?.email;

        if (!userEmail) {
          setError('User email not found');
          return;
        }

        setEmail(userEmail);

        const response = await fetch(`/api/beneficiaryDetails?email=${userEmail}`); // Update API call

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setBeneficiary(data);
      } catch (error) {
        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchBeneficiary();
  }, []);

  // Handle input changes when editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBeneficiary((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Simulate saving changes to a backend
  const saveProfile = async () => {
    
    setSaving(true); // Start the saving process
    try {
      const response = await fetch(`/api/beneficiaryDetails`, { // Update API call
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(beneficiary),
      });

      if (!response.ok) {
        throw new Error('Failed to save beneficiary data');
      }

      // Successfully saved profile
      setIsEditing(false); // Exit edit mode
      setMessage('Profile updated successfully!'); // Set success message
      setError('');
    } catch (err) {
      setError(err.message);
       setMessage(''); // Clear any previous success message on error
 
    } finally {
      setSaving(false); // Stop the saving process
    }
  };

  // Handle loading state
  if (loading) {
    return <div>Loading profile...</div>;
  }

  // Handle error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render profile UI
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
        {/* Render form inputs */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 mb-1">Email</label>
          <input
            type="text"
            name="email"
            value={beneficiary.email}
            readOnly
            className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 mb-1">Point of Contact Name</label>
          <input
            type="text"
            name="poc_name"
            value={beneficiary.poc_name}
            readOnly={!isEditing}
            onChange={handleInputChange}
            className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 mb-1">Phone</label>
          <input
            type="text"
            name="poc_phone"
            value={beneficiary.poc_phone}
            readOnly={!isEditing}
            onChange={handleInputChange}
            className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 mb-1">Agency</label>
          <input
            type="text"
            name="agency"
            value={beneficiary.agency}
            readOnly={!isEditing}
            onChange={handleInputChange}
            className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 mb-1">Halal Certification</label>
          <input
            type="text"
            name="halal_certification"
            value={beneficiary.halal_certification ? 'Yes' : 'No'}
            readOnly={!isEditing}
            onChange={handleInputChange}
            className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 mb-1">Hygiene Certification</label>
          <input
            type="text"
            name="hygiene_certification"
            value={beneficiary.hygiene_certification}
            readOnly={!isEditing}
            onChange={handleInputChange}
            className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 mb-1">Role</label>
          <input
            type="text"
            name="role"
            value={beneficiary.role}
            readOnly
            className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 mb-1">Account Created At</label>
          <input
            type="text"
            name="createdAt"
            value={new Date(beneficiary.createdAt).toLocaleString()}
            readOnly
            className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
          />
        </div>
      </div>

      <div className="ml-4 mt-8 flex justify-center space-x-2">
        {/* Button to toggle between edit and save modes */}
        {isEditing ? (
          <button
            className="bg-custom-dark-green text-white px-4 py-2 rounded-md hover:bg-custom-darker-green"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        ) : (
          <>
            <button
              className="bg-custom-dark-green text-white px-4 py-2 rounded-md hover:bg-custom-darker-green"
              onClick={() => {
                setIsEditing(true);
                setMessage(''); // Clear message on edit
              }}
            >
              Edit Profile
            </button>
            
            {/* Delete Profile Button */}
            <button
              className="bg-custom-dark-green text-white px-4 py-2 rounded-md hover:bg-custom-darker-green"
              onClick={() => setShowDeleteModal(true)}  // Trigger modal visibility   
            >
              Delete Profile
            </button>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this profile?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              // onClick={deleteProfile} // Call the delete function
              >
                Confirm
              </button>
              <button
                className="px-4 py-2 rounded-md text-black bg-white hover:bg-gray-100 border border-black"
                onClick={() => setShowDeleteModal(false)} // Close the modal
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {message && <p className="text-green-500 mt-4 text-center">{message}</p>}
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>} {/* Display error if any */}
    </div>
  );
}
