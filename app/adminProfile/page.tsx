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
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Track edit mode
  const [saving, setSaving] = useState(false); // Track saving state

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
    setSaving(true); // Start the saving process
    try {
      const response = await fetch(`/api/adminDetails`, { // Updated API path
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

      <div className="container mx-auto p-4 max-w-4xl grid grid-cols-2 gap-6 mt-4">
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

      {/* Button to toggle between edit and save modes */}
      <div className="mt-8 flex justify-center">
        {isEditing ? (
          <button
            className="bg-custom-dark-green text-white px-4 py-2 rounded-md hover:bg-custom-darker-green"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        ) : (
          <button
            className="bg-custom-dark-green text-white px-4 py-2 rounded-md hover:bg-custom-darker-green"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
}
