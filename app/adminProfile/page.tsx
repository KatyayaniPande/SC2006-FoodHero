'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import Header from '@/components/Header'; // Adjust the path to your Header component

export default function AdminProfile() {
  const [admin, setAdmin] = useState({
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState(''); // Store the initial fetched email separately
  const [isEditing, setIsEditing] = useState(false); // Track edit mode
  const [saving, setSaving] = useState(false); // Track saving state
  const [message, setMessage] = useState(''); // Message to show no changes
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Show delete confirmation pop-up

  // Fetch admin details from API based on the session
  useEffect(() => {
    async function fetchAdmin() {
      try {
        const session = await getSession();
        const userEmail = session?.user?.email;

        if (!userEmail) {
          setError('User email not found');
          return;
        }

        setEmail(userEmail);

        const response = await fetch(`/api/adminDetails?email=${userEmail}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setAdmin(data); // Set the fetched email
      } catch (error) {
        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchAdmin();
  }, []);

  // Handle input changes when editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    if (admin.email === email) {
      // No changes made, show a message and skip the API request
      setMessage('No changes were made');
      setIsEditing(false); // Exit edit mode
      return;
    }

    setSaving(true); // Start the saving process
    setMessage(''); // Reset message

    try {
      const response = await fetch(`/api/adminDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(admin), // Send the updated admin data (email)
      });

      const result = await response.json(); // Parse the JSON response

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save admin data');
      }

      // Successfully saved profile
      setIsEditing(false); // Exit edit mode
      setError('');
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.message);
      console.error("Error in saveProfile:", err); // Log the error
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
        <h1 className="text-2xl font-semibold">{admin.email}</h1>
        <p className="text-gray-500">Admin</p>
      </div>

      <div className="container mx-auto p-4 max-w-md mt-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-500 mb-1">Email</label>
          <input
            type="text"
            name="email"
            value={admin.email}
            readOnly={!isEditing}
            onChange={handleInputChange}
            className={`border border-gray-300 rounded-md px-3 py-2 ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
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
              onClick={() => setIsEditing(true)}
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
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)} // Close the modal
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {message && <p className="text-green-500 mt-4 text-center">{message}</p>}
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
}
