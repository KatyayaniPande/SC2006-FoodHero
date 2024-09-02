'use client';
import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import polyline from "@mapbox/polyline";
const polyline = require('@mapbox/polyline') as any;
// Import customIcon if you have it, otherwise remove the icon prop in Marker
// import customIcon from './path-to-your-icon';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png',
  iconSize: [32, 32],
});

interface RouteLayerProps {
  routeData: any; // Replace 'any' with the correct type if you know it
  decodedPolyline: any; // Replace 'any' with the correct type if you know it
  color: string;
  isVisible: boolean;
}

const RouteLayer: React.FC<RouteLayerProps> = ({
  routeData,
  decodedPolyline,
  color,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <>
      {routeData.map(
        (
          route: {
            location: any[];
            arrivalTime:
              | string
              | number
              | bigint
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | Iterable<React.ReactNode>
              | React.ReactPortal
              | Promise<React.AwaitedReactNode>
              | null
              | undefined;
            jobId:
              | string
              | number
              | bigint
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | Iterable<React.ReactNode>
              | React.ReactPortal
              | Promise<React.AwaitedReactNode>
              | null
              | undefined;
          },
          index: React.Key | null | undefined
        ) => (
          <Marker
            key={index}
            position={[route.location[1], route.location[0]]}
            icon={customIcon}
          >
            <Popup>
              Arrival Time: {route.arrivalTime} <br /> Job ID: {route.jobId}
            </Popup>
          </Marker>
        )
      )}
      <Polyline positions={decodedPolyline} pathOptions={{ color: color }} />
    </>
  );
};

const MapComponent: React.FC = () => {
  const [routesData1, setRoutesData1] = useState<any[]>([]);
  const [routesData2, setRoutesData2] = useState<any[]>([]);
  const [routesData3, setRoutesData3] = useState<any[]>([]);
  const [decodedPolyline1, setDecodedPolyline1] = useState<any[][]>([]);
  const [decodedPolyline2, setDecodedPolyline2] = useState<any[][]>([]);
  const [decodedPolyline3, setDecodedPolyline3] = useState<any[][]>([]);
  const [isRouteVisible, setIsRouteVisible] = useState<boolean[]>([
    true,
    true,
    true,
  ]);

  useEffect(() => {
    const fetchRoutesData = async () => {
      try {
        const response = await fetch('/api/optimizeRoutes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        setRoutesData1(data[0].coordinates || []);
        setDecodedPolyline1(
          polyline.decode(data[0].geometry).map(([lat, lng]: [number, number]) => [lat, lng])
        );

        setRoutesData2(data[1].coordinates || []);
        setDecodedPolyline2(
          polyline.decode(data[1].geometry).map(([lat, lng]: [number, number]) => [lat, lng])
        );

        setRoutesData3(data[2].coordinates || []);
        setDecodedPolyline3(
          polyline.decode(data[2].geometry).map(([lat, lng]: [number, number]) => [lat, lng])
        );
      } catch (error) {
        console.error('Error fetching routes data:', error);
      }
    };

    fetchRoutesData();
  }, []);

  const toggleRouteVisibility = (index: number) => {
    setIsRouteVisible((prev) =>
      prev.map((isVisible, i) => (i === index ? !isVisible : isVisible))
    );
  };

  return (
    <>
      <section>
        <h1 className='text-4xl font-bold text-center mb-8 text-[#A2C765]'>
          Routes Generated
        </h1>

        <p className='text-lg text-gray-700 mb-8 text-center'>
          Approved match transfers will undergo an algorithmic evaluation to
          determine the most efficient delivery method. Factors such as
          location, food availability, timing, and other logistical
          considerations will be taken into account.{' '}
        </p>

        {routesData1.length > 0 && (
          <MapContainer
            center={[1.3521, 103.8198]}
            zoom={12}
            style={{ height: '48vh' }}
          >
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <RouteLayer
              routeData={routesData1}
              decodedPolyline={decodedPolyline1}
              color='blue'
              isVisible={isRouteVisible[0]}
            />
            <RouteLayer
              routeData={routesData2}
              decodedPolyline={decodedPolyline2}
              color='green'
              isVisible={isRouteVisible[1]}
            />
            <RouteLayer
              routeData={routesData3}
              decodedPolyline={decodedPolyline3}
              color='orange'
              isVisible={isRouteVisible[2]}
            />
          </MapContainer>
        )}
        <div className='flex justify-center mb-8 pt-6'>
          {[routesData1, routesData2, routesData3].map((_, index) => (
            <button
              key={index}
              className={`px-4 py-2 mx-2 font-semibold rounded ${
                isRouteVisible[index] ? 'bg-green-500' : 'bg-gray-500'
              }`}
              onClick={() => toggleRouteVisibility(index)}
            >
              {isRouteVisible[index]
                ? `Hide Bus ${index + 1}`
                : `Show Bus ${index + 1}`}
            </button>
          ))}
        </div>
      </section>
    </>
  );
};

export default MapComponent;
