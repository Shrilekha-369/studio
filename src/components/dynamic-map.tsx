"use client";

import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import('@/components/map-component').then(mod => mod.MapComponent), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center rounded-lg"><p>Loading map...</p></div>
});

export default DynamicMap;
