'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';

// Leaflet types can be imported safely as they are erased at runtime
import type { Map as LeafletMap } from 'leaflet';
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
    { id: 1, name: 'Chai Wala', lat: 28.6139, lng: 77.2090, iconUrl: './Thela1.png' },
    { id: 2, name: 'Vegetables', lat: 28.6239, lng: 77.2190, iconUrl: './Thela1.png' },
];

export interface MapAreaProps {
    isPickingLocation?: boolean;
    onConfirmLocation?: (lat: number, lng: number) => void;
    onCancelPicking?: () => void;
    searchedLocation?: { lat: number, lng: number } | null;
    ref?: React.Ref<MapAreaHandle>;
}

export interface MapAreaHandle {
    handleLocateMe: () => void;
}

const MapArea = forwardRef<MapAreaHandle, MapAreaProps>(({ isPickingLocation = false, onConfirmLocation, onCancelPicking, searchedLocation }, ref) => {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]);
    const [hasCentered, setHasCentered] = useState(false);
    // Used to track where the map is currently centered while dragging
    const [currentCenter, setCurrentCenter] = useState<[number, number] | null>(null);
    const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

    const handleLocateMe = () => {
        if (mapInstance && position) {
            mapInstance.flyTo(position, 15, { animate: true });
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setPosition(newPos);
                mapInstance?.flyTo(newPos, 15);
            });
        }
    };

    useImperativeHandle(ref, () => ({
        handleLocateMe
    }));

    useEffect(() => {
        setMounted(true);
        if (navigator.geolocation && !hasCentered) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                    setPosition(newPos);
                    if (mapInstance && !hasCentered) {
                        mapInstance.setView(newPos, 14);
                        setHasCentered(true);
                    }
                },
                (err) => console.log("Map initial position fallback:", err)
            );
        }
    }, [mapInstance, hasCentered]);

    // Fly to searched location when it changes
    useEffect(() => {
        if (searchedLocation && mapInstance) {
            mapInstance.flyTo([searchedLocation.lat, searchedLocation.lng], 15, { animate: true });
        }
    }, [searchedLocation, mapInstance]);

    if (!mounted) {
        return <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">Loading Map...</div>;
    }

    const createCustomIcon = (name: string, iconUrl?: string) => {
        const L = require('leaflet');
        const htmlString = `
      <div class="flex flex-col items-center justify-center -mt-6">
        <div class="bg-white px-3 py-1 rounded-full shadow-md text-[10px]  text-gray-800 border border-gray-100 mb-1 whitespace-nowrap uppercase tracking-tighter">
          ${name}
        </div>
        <div class="w-10 h-10 rounded-full  overflow-hidden  flex items-center justify-center">
          ${iconUrl 
            ? `<img src="${iconUrl}" class="w-full h-full object-cover" />`
            : `<div class="w-full h-full bg-red-50 flex items-center justify-center  font-bold text-xs">SS</div>`
          }
        </div>
      </div>    
    `;

        return L.divIcon({
            html: htmlString,
            className: '', 
            iconSize: [60, 60],
            iconAnchor: [30, 30],
        });
    };

    // Custom component to track center during drag
    const MapEventsHandler = () => {
        const { useMapEvents } = require('react-leaflet');
        
        useMapEvents({
            moveend: (e: any) => {
                const map = e.target;
                const center = map.getCenter();
                setCurrentCenter([center.lat, center.lng]);
            }
        });

        return null;
    };

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={position}
                zoom={14}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
                zoomControl={false}
                ref={setMapInstance}
            >
                <MapEventsHandler />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {!isPickingLocation && (
                    <Marker
                        position={position}
                        icon={createCustomIcon("You Are Here")}
                    />
                )}

                {!isPickingLocation && VENDORS.map(vendor => (
                    <Marker
                        key={vendor.id}
                        position={[vendor.lat, vendor.lng]}
                        icon={createCustomIcon(vendor.name, vendor.iconUrl)}
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

                    {/* Center Pin Overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-50 pointer-events-none drop-shadow-xl flex flex-col items-center">
                        <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 mb-1 rounded-full shadow-lg">
                            Pick Location
                        </div>
                        <MapPin className="w-10 h-10 text-red-500 fill-red-100/50 relative top-1" />
                    </div>

                    {/* Locate Me Button Overlay - Styled to match "pin location" request */}
                    <div className="absolute bottom-40 right-4 z-50 pointer-events-auto">
                        <button
                            onClick={handleLocateMe}
                            className="w-14 h-14 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                            title="Locate Me"
                        >
                            <LocateFixed className="w-10 h-10 text-gray-700" />
                        </button>
                    </div>

                    {/* Confirm Button Overlay */}
                    <div className="absolute bottom-8 left-0 w-full px-6 z-50 pointer-events-auto">
                        <button
                            onClick={() => {
                                if (onConfirmLocation && currentCenter) {
                                    onConfirmLocation(currentCenter[0], currentCenter[1]);
                                } else if (onConfirmLocation) {
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
});

MapArea.displayName = 'MapArea';
export default MapArea;
