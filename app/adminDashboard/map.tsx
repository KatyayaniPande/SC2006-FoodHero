"use client";

import React, { useEffect, useRef, useState } from "react";

interface MapProps {
  deliveryLocation: [number, number]; // Delivery location as [latitude, longitude]
  travelMode: google.maps.TravelMode; // Travel mode passed from parent (DRIVING, WALKING, BICYCLING)
}

const MapComponent: React.FC<MapProps> = ({ deliveryLocation, travelMode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const startMarkerRef = useRef<google.maps.Marker | null>(null);
  const endMarkerRef = useRef<google.maps.Marker | null>(null);
  const fixedLocation = { lat: 1.3073, lng: 103.7639 }; // Fixed starting location: Pandan Loop

  // State to hold route information
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  useEffect(() => {
    const initializeMap = () => {
      if (mapRef.current && window.google) {
        // Initialize the map only once
        if (!mapInstanceRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: fixedLocation,
            zoom: 13,
          });
          mapInstanceRef.current = map;

          // Initialize DirectionsRenderer
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
          });
          directionsRendererRef.current = directionsRenderer;

          // Add markers
          addMarkers(map);
        }

        // Fetch and display the route whenever travelMode or deliveryLocation changes
        fetchRoute(
          new google.maps.DirectionsService(),
          directionsRendererRef.current!,
          travelMode,
          mapInstanceRef.current!
        );
      }
    };

    const addMarkers = (map: google.maps.Map) => {
      // Add start marker if not already added
      if (!startMarkerRef.current) {
        startMarkerRef.current = new google.maps.Marker({
          position: fixedLocation,
          map: map,
          title: "Start: Pandan Loop",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // Green marker for start
          },
        });
      }

      // Add end marker if not already added
      if (!endMarkerRef.current) {
        endMarkerRef.current = new google.maps.Marker({
          position: { lat: deliveryLocation[0], lng: deliveryLocation[1] },
          map: map,
          title: "End: Delivery Location",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red marker for end
          },
        });
      } else {
        // Update end marker position if deliveryLocation changes
        endMarkerRef.current.setPosition({
          lat: deliveryLocation[0],
          lng: deliveryLocation[1],
        });
      }
    };

    const fetchRoute = (
      directionsService: google.maps.DirectionsService,
      directionsRenderer: google.maps.DirectionsRenderer,
      travelMode: google.maps.TravelMode,
      map: google.maps.Map
    ) => {
      const request: google.maps.DirectionsRequest = {
        origin: fixedLocation,
        destination: { lat: deliveryLocation[0], lng: deliveryLocation[1] },
        travelMode: travelMode,
      };

      directionsService.route(request, (result, status) => {
        if (status === "OK" && result) {
          directionsRenderer.setDirections(result);

          // Extract distance and duration from the result
          const route = result.routes[0];
          if (route.legs.length > 0) {
            const leg = route.legs[0];

            setRouteInfo({
              distance: leg.distance?.text || "N/A",
              duration: leg.duration?.text || "N/A",
            });

            // Adjust map bounds to fit the route
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
            map.fitBounds(bounds);
          }
        } else {
          console.error("Directions request failed due to " + status);
          setRouteInfo(null); // Clear route info on failure
        }
      });
    };

    // Initialize the map
    initializeMap();
  }, [deliveryLocation, travelMode]); // Re-run the effect when the deliveryLocation or travelMode changes

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Map Container */}
      <div
        id="map"
        ref={mapRef}
        style={{ height: "400px", width: "100%", borderRadius: "8px" }}
      ></div>

      {/* Route Information */}
      {routeInfo && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            maxWidth: "300px",
            zIndex: 1, // Ensure it appears above the map
          }}
        >
          <h3 style={{ marginBottom: "8px" }}>Route Information</h3>
          <p>
            <strong>Distance:</strong> {routeInfo.distance}
          </p>
          <p>
            <strong>Estimated Time:</strong> {routeInfo.duration}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
