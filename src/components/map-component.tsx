"use client";

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix for default icon path issue with webpack
// This is a common workaround for issues with Next.js and Leaflet's default icon paths.
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
}


export function MapComponent() {
  const position: [number, number] = [12.9839, 77.6693]; // New Bengaluru Address
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Initialize map only if the ref is set and the map instance doesn't exist.
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView(position, 15);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.marker(position).addTo(map)
        .bindPopup('One Fitness Studio <br /> Bengaluru, KA')
        .openPopup();
    }

    // Cleanup function to run when the component unmounts.
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array to ensure this runs only once on mount and cleans up on unmount.

  return (
    <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="rounded-lg" />
  );
}
