'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';

// Leaflet types can be imported safely as they are erased at runtime
import type { Map as LeafletMap } from 'leaflet';
import { MapPin, LocateFixed, Store, Calendar } from 'lucide-react';

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
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

export interface MapAreaProps {
    isPickingLocation?: boolean;
    onConfirmLocation?: (lat: number, lng: number) => void;
    onCancelPicking?: () => void;
    searchedLocation?: { lat: number, lng: number } | null;
    ref?: React.Ref<MapAreaHandle>;
}

export interface MapAreaHandle {
    handleLocateMe: () => void;
    refreshPins: () => void;
}

// Sub-component for individual Pin Markers to handle detail fetching
const PinMarker = ({ pin }: { pin: any }) => {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchDetails = async () => {
        if (details) return; // Only fetch once
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pins/${pin.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setDetails(data.pin);
        } catch (err) {
            console.error("Failed to fetch pin details:", err);
        } finally {
            setLoading(false);
        }
    };

    const createCustomIcon = (name: string, iconUrl?: string, isUserPin?: boolean) => {
        const L = require('leaflet');
        const colorClass = isUserPin ? 'bg-blue-600 text-white' : 'bg-white text-gray-800';
        
        const htmlString = `
      <div class="flex flex-col items-center justify-center -mt-6">
        <div class="${colorClass} px-3 py-1 rounded-full shadow-md text-[10px] border border-gray-100 mb-1 whitespace-nowrap uppercase tracking-tighter font-bold">
          ${name}
        </div>
        <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-lg border-2 border-white">
          ${iconUrl 
            ? `<img src="${iconUrl}" class="w-full h-full object-cover" />`
            : `<div class="w-full h-full ${isUserPin ? 'bg-blue-600' : 'bg-red-500'} flex items-center justify-center shadow-inner">
                <div class="w-3 h-3 bg-white rounded-full"></div>
               </div>`
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

    return (
        <Marker
            position={[pin.lat, pin.lng]}
            icon={createCustomIcon(pin.item || "Pinned Order", undefined, true)}
            eventHandlers={{
                click: fetchDetails,
            }}
        >
            <Popup className="custom-marker-popup">
                <div className="p-2 min-w-[180px] font-bitter">
                    <h4 className="font-bold text-red-600 text-[10px] mb-1 uppercase tracking-wider">PINNED ORDER</h4>
                    
                    {loading ? (
                        <div className="py-4 text-center text-xs text-gray-400">Loading details...</div>
                    ) : (
                        <>
                            <div className="text-gray-900 font-bold text-base mb-0.5">{details?.item || pin.item || 'Generic Item'}</div>
                            <div className="text-[10px] text-gray-400 mb-3 font-mono">ID: {(details?._id || pin.id)?.slice(-8).toUpperCase()}</div>
                            
                            <div className="space-y-2 text-[12px]">
                                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-1.5 rounded-lg">
                                    <Store size={14} className="text-red-500 shrink-0" />
                                    <span className="font-medium">{details?.shopType || pin.shopType || 'Not specified'}</span>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600 px-1">
                                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{details?.deliveryLocation || pin.deliveryLocation}</span>
                                </div>
                                
                                {details?.deliveredBy && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
                                        <div className="text-[9px] text-gray-400 uppercase font-bold">Selected Vendor</div>
                                        <div className="text-gray-800 font-bold">{details.deliveredBy.name}</div>
                                        <div className="text-gray-500 text-[10px]">{details.deliveredBy.phone}</div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-red-50 border-dashed text-red-600 font-bold justify-center bg-red-50/30 rounded-lg py-1">
                                    <Calendar size={14} />
                                    <span>Until {new Date(details?.expiryAt || pin.expiryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Popup>
        </Marker>
    );
};

const MapArea = forwardRef<MapAreaHandle, MapAreaProps>(({ isPickingLocation = false, onConfirmLocation, onCancelPicking, searchedLocation }, ref) => {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]);
    const [hasCentered, setHasCentered] = useState(false);
    // Used to track where the map is currently centered while dragging
    const [currentCenter, setCurrentCenter] = useState<[number, number] | null>(null);
    const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
    
    // Dynamic data
    const [vendors, setVendors] = useState<any[]>([]);
    const [activePins, setActivePins] = useState<any[]>([]);

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

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch Vendors
            const vendorRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/all`);
            const vendorData = await vendorRes.json();
            if (vendorRes.ok) setVendors(vendorData.vendors || []);

            // Fetch Active Pins (Redis) - GLOBAL for the map
            const pinRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pins/map-active`);
            const pinData = await pinRes.json();
            if (pinRes.ok) setActivePins(pinData.activePins || []);

        } catch (err) {
            console.error("Failed to fetch map data:", err);
        }
    };

    useImperativeHandle(ref, () => ({
        handleLocateMe,
        refreshPins: fetchData
    }));

    // Fetch Vendors and Active Pins
    useEffect(() => {
        if (mounted) {
            fetchData();
            const interval = setInterval(fetchData, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [mounted]);

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
        const colorClass = 'bg-white text-gray-800';
        
        const htmlString = `
      <div class="flex flex-col items-center justify-center -mt-6">
        <div class="${colorClass} px-3 py-1 rounded-full shadow-md text-[10px] border border-gray-100 mb-1 whitespace-nowrap uppercase tracking-tighter">
          ${name}
        </div>
        <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-md">
          ${iconUrl 
            ? `<img src="${iconUrl}" class="w-full h-full object-cover" />`
            : `<div class="w-full h-full bg-red-50 flex items-center justify-center font-bold text-xs">SS</div>`
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

                {!isPickingLocation && vendors.map((vendor: any) => (
                    <Marker
                        key={vendor._id}
                        position={[vendor.lat, vendor.lng]}
                        icon={createCustomIcon(vendor.name, './Thela1.png')}
                    />
                ))}

                {!isPickingLocation && activePins.map((pin: any) => (
                    <PinMarker key={pin.id} pin={pin} />
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
