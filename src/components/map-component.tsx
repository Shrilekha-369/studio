"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

export function MapComponent() {
  const position = { lat: 34.052235, lng: -118.243683 }; // Placeholder: Los Angeles City Hall
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-full w-full bg-muted flex items-center justify-center rounded-lg">
        <div className="text-center p-4">
          <p className="font-semibold">Map Could Not Be Loaded</p>
          <p className="text-muted-foreground text-sm">
            Google Maps API Key is missing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={position}
        defaultZoom={15}
        mapId="one-fitness-map"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        className="rounded-lg"
      >
        <AdvancedMarker position={position} />
      </Map>
    </APIProvider>
  );
}
