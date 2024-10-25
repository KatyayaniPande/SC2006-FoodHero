"use client";

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
  input,
} from "@material-tailwind/react";
import {
  FaClock,
  FaCalendarAlt,
  FaUtensils,
  FaQuestionCircle,
} from "react-icons/fa";
import { FaBowlFood } from "react-icons/fa6";
import { Donation } from "./DonorDashboardClient"; // Adjust this import based on your structure
import { useState, useEffect, useRef } from "react";
import { AiOutlineNumber } from "react-icons/ai";
import { FaRegStar } from "react-icons/fa6";
import { FaTruck } from "react-icons/fa";
import { FaPersonChalkboard } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { getSession } from "next-auth/react";
import { Dialog } from "@headlessui/react"; // Import Dialog for the modal
import { Input } from "@/components/ui/input";
import {
  GoogleMap,
  useJsApiLoader,
  StandaloneSearchBox,
  Autocomplete,
} from "@react-google-maps/api";

interface DonorCardProps {
  donation: Donation;
}
// Utility function to determine the status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-300"; // New = Blue
    case "matched":
      return "bg-yellow-500"; // Matched = Yellow
    case "inwarehouse":
      return "bg-green-500"; // In Warehouse = Green
    case "awaitingpickup":
      return "bg-orange-500"; // Awaiting Pickup = Orange
    case "awaitingdelivery":
      return "bg-purple-500"; // Awaiting Delivery = Purple
    case "delivered":
      return "bg-green-500"; // Delivered = Green
    default:
      return "bg-gray-500"; // Default = Gray
  }
};
const DonorCard: React.FC<DonorCardProps> = ({ donation }) => {
  const [isCooked, setIsCooked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal state
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(""); // Track the selected delivery date
  const [errors, setErrors] = useState({ location: "", date: "" }); // Track errors
  const [isValidLocation, setIsValidLocation] = useState(false);

  const inputRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyB7CV-gPgdBWcYd65zzNlBzGcVxCA-I3xA",
    libraries: ["places"],
  });
  useEffect(() => {
    if (donation.foodType === "Cooked Food") {
      setIsCooked(true);
    }
  }, [donation]);

  const handleAcceptClick = () => {
    setIsModalOpen(true); // Open modal when Accept button is clicked
  };

  const handleLocationChange = () => {
    const place = inputRef.current.getPlace();

    if (place && place.formatted_address) {
      setDeliveryLocation(place.formatted_address);
      setErrors({ ...errors, location: "" });
      setIsValidLocation(true); // Valid location selected
    } else {
      setErrors({
        ...errors,
        location: "Please select a valid location from the dropdown.",
      });
      setIsValidLocation(false); // Invalid location
    }
  };

  const handleConfirmSubmit = async () => {
    let validationErrors = { location: "", date: "" };

    // Validate Delivery Location using isValidLocation
    if (!isValidLocation) {
      validationErrors.location = "Please select a valid delivery location.";
    }

    // Validate Delivery Date
    if (!deliveryDate) {
      validationErrors.date = "Delivery date is required.";
    }

    // If there are validation errors, update the state and stop the submission
    if (validationErrors.location || validationErrors.date) {
      setErrors(validationErrors);
      return;
    }
    if (!donation._id) {
      alert("Donation ID is missing.");
      return;
    }

    try {
      const session = await getSession();
      const beneficiaryEmail = session?.user?.email;

      const response = await fetch("/api/statusUpdate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donationId: donation._id, // Use the _id from the request object as donationId
          currentStatus: donation.status, // Pass the current status
          deliveryLocation: deliveryLocation, // Include an 'accept' action if necessary for logic differentiation
          floorNumber: floorNumber,
          needByTime: deliveryDate,
          method: "accept",
        }),
      });

      const beneificaryUpdateResponse = await fetch("/api/updateBeneficiary", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donationId: donation._id, // Use the same request._id
          beneficiaryEmail, // Update the donorEmail field in the DB
        }),
      });

      if (!beneificaryUpdateResponse.ok) {
        const errorData = await beneificaryUpdateResponse.json();
        alert(`Error updating beneficiary: ${errorData.error}`);
        return;
      }

      const beneificaryUpdateData = await beneificaryUpdateResponse.json();
      alert(`Beneficary Update Success: ${beneificaryUpdateData.message}`);

      if (response.ok) {
        const data = await response.json();
        alert(`Success: ${data.message}`);
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the donation status.");
    }
    setIsModalOpen(false); // Close modal after submission
  };

  return (
    <>
      <Card
        shadow={false}
        className="relative mb-4 border border-black rounded-lg p-4"
      >
        {/* Status Box */}
        <div
          className={`absolute top-2 right-2 text-black text-sm font-semibold px-2 py-1 rounded-md ${getStatusColor(
            donation.status
          )}`}
        >
          {donation.status}
        </div>
        <CardBody>
          <Typography variant="h5" color="blue-gray" className="mb-2">
            <FaBowlFood className="inline-block mr-2" />
            {donation.foodName} {isCooked || `[${donation.foodCategory}]`}
          </Typography>

          <Typography className="mb-2">
            <AiOutlineNumber className="inline-block mr-2" />
            {isCooked
              ? `Number of servings: ${donation.numberOfServings}`
              : `Quantity: ${donation.quantity}`}
          </Typography>

          {donation.needByTime && (
            <Typography className="mb-2">
              <FaClock className="inline-block mr-2" />
              Need By: {donation.needByTime}
            </Typography>
          )}

          {donation.consumeByTiming && (
            <Typography className="mb-2">
              <FaClock className="inline-block mr-2" />
              ConsumeBy: {donation.consumeByTiming}
            </Typography>
          )}

          {donation.specialHandling && (
            <Typography className="mb-2">
              <FaRegStar className="inline-block mr-2" />
              Special Request: {donation.specialHandling}
            </Typography>
          )}

          {donation.deliveryLocation && (
            <Typography className="mb-2">
              <IoLocation className="inline-block mr-2" />
              Delivery Location: {donation.deliveryLocation}
            </Typography>
          )}

          {donation.floorNumber && (
            <Typography className="mb-2">
              <IoLocation className="inline-block mr-2" />
              Unit Number: {donation.floorNumber}
            </Typography>
          )}
        </CardBody>

        <CardFooter className="pt-0">
          {donation.status === "new" && (
            <Button className="text-white bg-black" onClick={handleAcceptClick}>
              Accept
            </Button>
          )}
        </CardFooter>
      </Card>

      {isModalOpen && (
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Enter Delivery Details
              </Dialog.Title>
              <div className="mt-2">
                {/* Delivery Location */}
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Location
                </label>
                {isLoaded && (
                  <Autocomplete
                    onLoad={(ref) => (inputRef.current = ref)}
                    onPlaceChanged={handleLocationChange}
                    options={{
                      componentRestrictions: { country: "SG" },
                      fields: ["address_components", "formatted_address"],
                    }}
                  >
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                      value={deliveryLocation}
                      onChange={(e) => {
                        setDeliveryLocation(e.target.value);
                        setErrors({ ...errors, location: "" });
                        setIsValidLocation(false); // User is typing, so set to false
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Prevent autocomplete on Enter
                        }
                      }}
                      autoComplete="off" // Disable browser autocomplete
                    />
                  </Autocomplete>
                )}
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location}</p>
                )}
                <label className="block text-sm font-medium text-gray-700 mt-4">
                  Floor Number
                </label>
                <Input
                  className="shadow-sm"
                  placeholder="If applicable"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(e.target.value)}
                />

                {/* Delivery Date */}
                <label className="block text-sm font-medium text-gray-700 mt-4">
                  Delivery Date
                </label>
                <Input
                  className="shadow-sm"
                  type="datetime-local"
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    if (errors.date) {
                      setErrors({ ...errors, date: "" });
                    } // Clear location error
                  }}
                  min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Adds 2 days
                    .toISOString()
                    .slice(0, 16)} // Convert to 'YYYY-MM-DDTHH:MM' format
                />
                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date}</p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <p className="text-red-500 text-sm mt-2">{errors.general}</p>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  className="text-white bg-black"
                  onClick={handleConfirmSubmit}
                >
                  Confirm
                </Button>
                <Button
                  className="ml-2 text-white bg-black"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default DonorCard;
