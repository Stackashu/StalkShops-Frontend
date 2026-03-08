'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Leaflet types can be imported safely as they are erased at runtime
import type { Map as LeafletMap, DivIcon } from 'leaflet';
import { MapPin, LocateFixed } from 'lucide-react';

const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);

// Sample markers data
const VENDORS = [
    { id: 1, name: 'Chai Wala', lat: 28.6139, lng: 77.2090, iconUrl: '/icons/truck.png' },
    { id: 2, name: 'Vegetables', lat: 28.6239, lng: 77.2190, iconUrl: '/icons/truck.png' },
];

export interface MapAreaProps {
    isPickingLocation?: boolean;
    onConfirmLocation?: (lat: number, lng: number) => void;
    onCancelPicking?: () => void;
    searchedLocation?: { lat: number, lng: number } | null;
}

export default function MapArea({ isPickingLocation = false, onConfirmLocation, onCancelPicking, searchedLocation }: MapAreaProps) {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]);
    // Used to track where the map is currently centered while dragging
    const [currentCenter, setCurrentCenter] = useState<[number, number] | null>(null);
    const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

    useEffect(() => {
        setMounted(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => {
                    console.error("Error getting location:", err);
                }
            );
        }
    }, [isPickingLocation]); // Re-prompt/update if they enter picking mode

    // Fly to searched location when it changes
    useEffect(() => {
        if (searchedLocation && mapInstance) {
            setPosition([searchedLocation.lat, searchedLocation.lng]);
            mapInstance.flyTo([searchedLocation.lat, searchedLocation.lng], 15, { animate: true });
        }
    }, [searchedLocation, mapInstance]);

    if (!mounted) {
        return <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">Loading Map...</div>;
    }

    const createCustomIcon = (name: string, iconUrl?: string) => {
        // Safe to require L here because this function only runs when mounted on client,
        // and react-leaflet has already been loaded.
        const L = require('leaflet');

        // Generate HTML for the custom divIcon matching the design
        const htmlString = `
      <div class="flex flex-col items-center justify-center -mt-6">
        <div class="bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-gray-800 border border-gray-100 mb-1 whitespace-nowrap">
          ${name}
        </div>
        <div class="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center shadow-lg text-white">
          <svg xmlns="http://www.svg.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
        </div>
      </div>
    `;

        return L.divIcon({
            html: htmlString,
            className: '', // important to clear default leaflet styles
            iconSize: [60, 60],
            iconAnchor: [30, 30],
        });
    };

    // Custom component to update map center dynamically and track center during drag
    const MapCenterHandler = ({ initialLat, initialLng }: { initialLat: number; initialLng: number }) => {
        // react-leaflet exposes useMap and useMapEvents hook
        const { useMap, useMapEvents } = require('react-leaflet');
        const map = useMap();

        useEffect(() => {
            if (!map) return;
            // Only force set view if we aren't picking, otherwise let user drag freely
            if (!isPickingLocation) {
                map.setView([initialLat, initialLng], map.getZoom(), { animate: false });
            }
        }, [initialLat, initialLng, map, isPickingLocation]);

        useMapEvents({
            moveend: () => {
                if (!map) return;
                const center = map.getCenter();
                setCurrentCenter([center.lat, center.lng]);
            }
        });

        return null;
    };

    return (
        <div className="relative h-full w-full">
            <MapContainer
                key={`map-${isPickingLocation ? 'picking' : 'viewing'}`}
                center={position}
                zoom={14}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
                zoomControl={false}
                ref={setMapInstance}
            >
                <MapCenterHandler initialLat={position[0]} initialLng={position[1]} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Marker for User's Current Location */}
                {!isPickingLocation && (
                    <Marker
                        position={position}
                        icon={createCustomIcon("You Are Here")}
                    />
                )}

                {/* Vendors */}
                {!isPickingLocation && VENDORS.map(vendor => (
                    <Marker
                        key={vendor.id}
                        position={[vendor.lat, vendor.lng]}
                        icon={createCustomIcon(vendor.name)}
                    />
                ))}
            </MapContainer>

            {/* Picking Location Overlays */}
            {isPickingLocation && (
                <>
                    {/* Top Back/Cancel Button Overlay */}
                    <div className="absolute top-6 left-4 z-50 pointer-events-auto">
                        <button
                            onClick={onCancelPicking}
                            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        >
                            <svg xmlns="http://www.svg.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                    </div>

                    {/* Center Pin Overlay (fixed to exact center point of the view) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-50 pointer-events-none drop-shadow-xl flex flex-col items-center">
                        <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 mb-1 rounded-full shadow-lg">
                            Pick Location
                        </div>
                        <MapPin className="w-10 h-10 text-red-500 fill-red-100/50 relative top-1" />
                    </div>

                    {/* Locate Me Button Overlay (bottom right, above confirm button) */}
                    <div className="absolute bottom-28 right-4 z-50 pointer-events-auto">
                        <button
                            onClick={() => {
                                if (mapInstance && position) {
                                    mapInstance.flyTo(position, 15, { animate: true });
                                }
                            }}
                            className="w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        >
                            <LocateFixed className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>

                    {/* Confirm Button Overlay at Bottom */}
                    <div className="absolute bottom-8 left-0 w-full px-6 z-50 pointer-events-auto">
                        <button
                            onClick={() => {
                                if (onConfirmLocation && currentCenter) {
                                    onConfirmLocation(currentCenter[0], currentCenter[1]);
                                } else if (onConfirmLocation) {
                                    // Fallback if they didn't drag at all
                                    onConfirmLocation(position[0], position[1]);
                                }
                            }}
                            className="w-full bg-red-600 active:bg-red-700 text-white py-4 rounded-full font-bold shadow-lg text-lg flex justify-center items-center transition-colors"
                        >
                            Confirm Location
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
