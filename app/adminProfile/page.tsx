"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header"; // Adjust the path to your Header component

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]); // Store list of admins
  const [newAdminEmail, setNewAdminEmail] = useState(""); // New admin input field
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // Display success/failure messages
  const [showAddModal, setShowAddModal] = useState(false); // Show add new admin modal
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Show delete confirmation modal
  const [selectedAdmin, setSelectedAdmin] = useState(""); // Store selected admin for deletion
  const [messageType, setMessageType] = useState(""); // 'success', 'info', 'error'

  const appUrl = "http://localhost:3000"; // Adjust the base API URL

  // Fetch admin details from API
  useEffect(() => {
    async function fetchAdmins() {
      try {
        const response = await fetch(`${appUrl}/api/adminList`);
        if (!response.ok) {
          throw new Error("Error fetching admin list");
        }
        const data = await response.json();
        setAdmins(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchAdmins();
  }, []);

  // Handle input change for new admin email
  const handleNewAdminChange = (e) => {
    setNewAdminEmail(e.target.value);
  };

  // Add new admin to the list
  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;

    try {
      const response = await fetch(`/api/adminList`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newAdminEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessageType("info");
        setMessage(result.error || "Failed to add admin email");
        setShowAddModal(false); // Close the modal
        return;
      }

      setMessageType("success");
      // Add new admin to the UI without refreshing
      setAdmins([...admins, { email: newAdminEmail }]);
      setNewAdminEmail(""); // Clear the input
      setShowAddModal(false); // Close the modal
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete click
  const handleDeleteClick = (email) => {
    setShowDeleteModal(true);
    setSelectedAdmin(email); // Set the selected admin for deletion
  };

  // Remove admin from the list
  const handleDeleteAdmin = async () => {
    try {
      setError(""); // Clear previous error
      setMessage(""); // Clear previous messages

      const response = await fetch(`/api/adminList?email=${selectedAdmin}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        // If there's an error, set the error message based on the result from the API
        setMessageType("info");
        setMessage(result.error || "Failed to delete admin data");
        setShowDeleteModal(false); // Close the modal
        return;
      }
      setMessageType("success");
      // If successful, filter out the admin from the list and display success message
      setAdmins(admins.filter((admin) => admin.email !== selectedAdmin));
      setShowDeleteModal(false);
      setMessage(result.message);
    } catch (err) {
      // Set the error message and close the modal
      setMessageType("error");
      setError(err.message || "An unexpected error occurred");
      setShowDeleteModal(false);
    }
  };

  // Handle loading state
  if (loading) {
    return <div>Loading admin list...</div>;
  }

  // Handle error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <Header />

      <div className="container mx-auto p-4 max-w-4xl mt-4">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Approved Admin Users
        </h1>
        <hr className="border-gray-300 mb-4" />

        {/* Table for displaying approved admins */}
        <table className="min-w-full bg-white border rounded-lg shadow-md">
          <thead>
            <tr className="border-b bg-custom-dark-green">
              <th className="py-3 px-6 text-white font-medium text-center w-1/6">No.</th>
              <th className="py-3 px-6 text-white font-medium text-center w-4/6">Email</th>
              <th className="py-3 px-6 text-white font-medium text-center w-1/6">Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.length > 0 ? (
              admins.map((admin, index) => (
                <tr key={index}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                   <td className="py-3 px-6 text-gray-700 text-center">{index + 1}</td>
                  <td className="py-3 px-6 text-gray-700 text-center">{admin.email}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      onClick={() => handleDeleteClick(admin.email)} // Correct way to pass the admin email to the handler
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 px-6 border-b text-center" colSpan={2}>
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add New Admin Button */}
        <div className="mt-4 flex justify-center">
          <button
            className="bg-custom-dark-green text-white px-4 py-2 rounded-md hover:bg-custom-darker-green"
            onClick={() => setShowAddModal(true)}
          >
            Add New Admin
          </button>
        </div>
      </div>

      {/* Add New Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Add New Admin</h2>
            <input
              type="email"
              className="border border-gray-300 rounded-md px-3 py-2 mb-4 w-full"
              placeholder="Enter admin email"
              value={newAdminEmail}
              onChange={handleNewAdminChange}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="bg-custom-dark-green text-white px-4 py-2 rounded-md hover:bg-custom-darker-green"
                onClick={handleAddAdmin}
              >
                Add Admin
              </button>
              <button
                className="px-4 py-2 rounded-md text-black bg-white hover:bg-gray-100 border border-black"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to remove {selectedAdmin}?</p>{" "}
            {/* Display selectedAdmin */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleDeleteAdmin} // Confirm deletion
              >
                Confirm
              </button>
              <button
                className="px-4 py-2 rounded-md text-black bg-white hover:bg-gray-100 border border-black"
                onClick={() => setShowDeleteModal(false)} // Cancel deletion
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <p
          className={`mt-4 text-center ${messageType === "success"
            ? "text-green-500"
            : messageType === "error" || messageType === "info"
              ? "text-red-500"
              : "text-blue-500" // For 'info' messages
            }`}
        >
          {message}
        </p>
      )}
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
}
