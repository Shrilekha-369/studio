"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';

// Fix for default icon path issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export function MapComponent() {
  const position: [number, number] = [18.4875, -67.1279]; // ONE Fitness Studio Aguadilla
  const [map, setMap] = useState<L.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const mapInstance = L.map(mapRef.current).setView(position, 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      L.marker(position).addTo(mapInstance)
        .bindPopup('One Fitness Studio <br /> Aguadilla, PR')
        .openPopup();
      
      setMap(mapInstance);
    }
  }, [map, position]);

  return (
    <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="rounded-lg" />
  );
}
