'use client';
import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png',
  iconSize: [32, 32],
});

const fixedLocation = [1.3073, 103.7639]; // Fixed starting point: Pandan Loop, Singapore

interface MapProps {
  deliveryLocation: [number, number]; // Delivery location as [latitude, longitude]
}

const MapComponent: React.FC<MapProps> = ({ deliveryLocation }) => {
  const mapRef = useRef<L.Map | null>(null); // Ref for the map instance
  const routeLayerRef = useRef<L.GeoJSON | null>(null); // Ref for the route layer

  const API_KEY = '5b3ce3597851110001cf62488301258b241149b6a0149e42fc074d3e'; // Add your OpenRouteService API key here

  useEffect(() => {
    console.log('Map initialization...');

    if (!mapRef.current) {
      // Initialize the map if it hasn't been initialized yet
      mapRef.current = L.map('map').setView(fixedLocation, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      console.log('Map initialized with starting location:', fixedLocation);
    }

    // Add fixed location marker
    const startMarker = L.marker(fixedLocation, { icon: customIcon }).bindPopup('Starting Point: Pandan Loop');
    startMarker.addTo(mapRef.current);

    // Add delivery location marker
    const deliveryMarker = L.marker(deliveryLocation, { icon: customIcon }).bindPopup('Delivery Location');
    deliveryMarker.addTo(mapRef.current);

    console.log('Markers added at:', fixedLocation, 'and', deliveryLocation);

    // Fetch route from OpenRouteService API
    const fetchRoute = async () => {
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${fixedLocation[1]},${fixedLocation[0]}&end=${deliveryLocation[1]},${deliveryLocation[0]}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        console.log('Route data from OpenRouteService:', data);

        const routeGeoJSON = data.features[0]; // Extract GeoJSON route
        if (routeLayerRef.current) {
          mapRef.current?.removeLayer(routeLayerRef.current); // Remove existing route layer
        }

        // Add new route layer
        routeLayerRef.current = L.geoJSON(routeGeoJSON, {
          style: {
            color: 'blue',
            weight: 4,
          },
        }).addTo(mapRef.current);

        console.log('Route added to the map.');
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();

    return () => {
      // Cleanup the markers and route layer if the component re-renders
      mapRef.current?.removeLayer(startMarker);
      mapRef.current?.removeLayer(deliveryMarker);
      if (routeLayerRef.current) {
        mapRef.current?.removeLayer(routeLayerRef.current);
      }
    };
  }, [deliveryLocation]); // Re-run the effect when the deliveryLocation changes

  return <div id="map" style={{ height: '400px', width: '100%' }}></div>;
};

export default MapComponent;
