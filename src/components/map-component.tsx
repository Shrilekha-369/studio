"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix for default icon path issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const position: [number, number] = [18.4875, -67.1279]; // ONE Fitness Studio Aguadilla

  useEffect(() => {
    // This is a workaround for a bug in react-leaflet in React 18 strict mode
    // that causes the map to be initialized twice.
    if (mapRef.current && (mapRef.current as any)._leaflet_id) {
      return;
    }
  }, []);

  return (
      <MapContainer whenReady={() => {
          if (mapRef.current) (mapRef.current as any)._leaflet_id = true;
      }} center={position} zoom={15} scrollWheelZoom={false} className="h-full w-full rounded-lg">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            One Fitness Studio <br /> Aguadilla, PR
          </Popup>
        </Marker>
      </MapContainer>
  );
}
