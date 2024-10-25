"use client";

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { AiOutlineNumber } from "react-icons/ai";
import { IoLocation } from "react-icons/io5";
import MapComponent from "../adminDashboard/map"; // Import the map component

import { FaClock, FaBowlFood, FaRegStar } from "react-icons/fa6";

// Utility function to determine the status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-300";
    case "matched":
      return "bg-yellow-500";
    case "awaitingpickup":
      return "bg-orange-500";
    case "awaitingdelivery":
      return "bg-purple-500";
    case "delivered":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

// Script loading function for Google Maps
const loadGoogleMapsScript = (onLoadCallback: () => void) => {
  if (!window.google) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = onLoadCallback;
    document.body.appendChild(script);
  } else {
    onLoadCallback(); // If the script is already loaded
  }
};

interface Donation {
  _id: string;
  foodType: string;
  foodName: string;
  foodCategory?: string;
  numberOfServings?: number;
  quantity?: number;
  consumeByTiming?: string;
  bestBeforeDate?: string;
  specialHandling?: string;
  needByTime?: string;
  deliveryLocation: string;
  status: string;
  deliveryMethod: string;
}

interface SomeCardProps {
  donation: Donation;
}

const SomeCard: React.FC<SomeCardProps> = ({ donation }) => {
  const [showMap, setShowMap] = useState(false);
  const [deliveryCoords, setDeliveryCoords] = useState<[number, number] | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false); // Track if Google Maps is loaded
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode | null>(null); // Initialize travel mode as null

  const [isCooked, setIsCooked] = useState(false);
  const [isSelfPickUp, setIsSelfPickUp] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);

  // Load Google Maps script on component mount
  useEffect(() => {
    loadGoogleMapsScript(() => {
      setGoogleMapsLoaded(true);
      if (window.google) {
        setTravelMode(google.maps.TravelMode.DRIVING); // Set default travel mode to Driving
      }
    });
  }, []);

  // Determine food type and delivery method
  useEffect(() => {
    if (donation.foodType === "Cooked Food") {
      setIsCooked(true);
    }
    if (donation.deliveryMethod === "Scheduled Pickup") {
      setIsSelfPickUp(true);
    } else {
      setIsDelivery(true);
    }
  }, [donation]);

  // Handler to take on the delivery
  const handleTakeOnDelivery = async () => {
    if (!donation._id) {
      alert("Donation ID is missing.");
      return;
    }

    try {
      const response = await fetch("/api/statusUpdate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donationId: donation._id, // Use the donation ID from the prop
          currentStatus: donation.status, // Pass the current status from the prop
        }),
      });

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
  };

  // Handler to mark as delivered
  const handleMarkAsDelivered = async () => {
    const confirmed = window.confirm("Have you delivered to the warehouse?");
    if (confirmed) {
      try {
        const response = await fetch("/api/statusUpdate", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            donationId: donation._id, // Use the _id from the request object as donationId
            currentStatus: donation.status, // Pass the current status
          }),
        });
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
    }
  };

  // Handler to display the map
  const handleDisplayMap = async () => {
    if (!googleMapsLoaded) {
      alert("Google Maps is not loaded yet.");
      return;
    }

    const geocoder = new google.maps.Geocoder(); // Google Maps Geocoder

    geocoder.geocode({ address: donation.deliveryLocation }, (results, status) => {
      if (status === "OK" && results[0]) {
        const latLng = results[0].geometry.location;
        setDeliveryCoords([latLng.lat(), latLng.lng()]);
        setShowMap(true);
      } else {
        console.error("Geocoding failed with status: " + status);
        if (status === "ZERO_RESULTS") {
          alert("No results found for the provided address.");
        } else if (status === "OVER_QUERY_LIMIT") {
          alert("You have exceeded your request quota for this API.");
        } else {
          alert("Geocoding failed due to: " + status);
        }
      }
    });
  };

  // Handler for travel mode change
  const handleTravelModeChange = (mode: google.maps.TravelMode) => {
    setTravelMode(mode);
  };

  return (
    <Card shadow={false} className="relative mb-4 border border-black rounded-lg p-4">
      {/* Status badge */}
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
          {donation.foodName} {isCooked ? "" : `[${donation.foodCategory}]`}
        </Typography>
        <Typography className="mb-2">
          <AiOutlineNumber className="inline-block mr-2" />
          {isCooked
            ? `Number of servings: ${donation.numberOfServings}`
            : `Quantity: ${donation.quantity}`}
        </Typography>
        <Typography className="mb-2">
          <FaClock className="inline-block mr-2" />
          Consume By: {donation.consumeByTiming || donation.bestBeforeDate}
        </Typography>
        <Typography className="mb-2">
          <FaRegStar className="inline-block mr-2" />
          Special Request: {donation.specialHandling}
        </Typography>
        <Typography className="mb-2">
          <FaClock className="inline-block mr-2" />
          Drop-Off Time: {donation.needByTime}
        </Typography>
        <Typography className="mb-2">
          <IoLocation className="inline-block mr-2" />
          Drop-Off Location: {donation.deliveryLocation}
        </Typography>
      </CardBody>
      <CardFooter className="pt-0">
        {donation.status === "awaitingdelivery" ? (
          <div className="flex space-x-4">
            {/* Button to mark as delivered */}
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleMarkAsDelivered}
            >
              Mark as Delivered
            </Button>

            {/* Button to display map */}
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleDisplayMap}
            >
              Display Map
            </Button>
          </div>
        ) : (
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleTakeOnDelivery}
          >
            Take on this delivery
          </Button>
        )}
      </CardFooter>

      {showMap && deliveryCoords && (
        <>
          <div className="mt-4">
            <Typography variant="h6" className="mb-2">
              Map Route with ETA
            </Typography>
            <MapComponent deliveryLocation={deliveryCoords} travelMode={travelMode!} />
          </div>

          {/* Mode Selector - shown only when the map is displayed */}
          <div className="flex space-x-2 mt-4">
            {googleMapsLoaded && travelMode && (
              <>
                <Button
                  className={`text-white px-4 py-2 rounded ${
                    travelMode === google.maps.TravelMode.DRIVING ? "bg-blue-500" : "bg-gray-500"
                  } hover:bg-blue-600`}
                  onClick={() => handleTravelModeChange(google.maps.TravelMode.DRIVING)}
                >
                  Driving
                </Button>
                <Button
                  className={`text-white px-4 py-2 rounded ${
                    travelMode === google.maps.TravelMode.WALKING ? "bg-blue-500" : "bg-gray-500"
                  } hover:bg-blue-600`}
                  onClick={() => handleTravelModeChange(google.maps.TravelMode.WALKING)}
                >
                  Walking
                </Button>
                <Button
                  className={`text-white px-4 py-2 rounded ${
                    travelMode === google.maps.TravelMode.BICYCLING ? "bg-blue-500" : "bg-gray-500"
                  } hover:bg-blue-600`}
                  onClick={() => handleTravelModeChange(google.maps.TravelMode.BICYCLING)}
                >
                  Bicycling
                </Button>
                
              </>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default SomeCard;
