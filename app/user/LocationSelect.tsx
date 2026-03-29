'use client';

import { ArrowLeft, MapPin, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import DialogBox from '../component/DialogBox';

interface LocationSelectProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocationMode: () => void;
    onSelectSearchedLocation: (lat: number, lng: number) => void;
    pickedLocation?: { lat: number; lng: number } | null;
    onPinSuccess?: () => void;
    onRemoveLocation?: () => void;
}

interface PhotonFeature {
    type: "Feature";
    geometry: {
        coordinates: [number, number]; // [lon, lat]
        type: "Point";
    };
    properties: {
        osm_id: number;
        name?: string;
        city?: string;
        state?: string;
        country?: string;
        street?: string;
    };
}

export default function LocationSelect({ isOpen, onClose, onSelectLocationMode, onSelectSearchedLocation, pickedLocation, onPinSuccess, onRemoveLocation }: LocationSelectProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const [pinDuration, setPinDuration] = useState<string>('');
    const [searchResults, setSearchResults] = useState<PhotonFeature[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [pickedLocationName, setPickedLocationName] = useState('');

    // Reverse geocode picked location to get actual place name
    useEffect(() => {
        if (!pickedLocation) {
            setPickedLocationName('');
            return;
        }

        const fetchLocationName = async () => {
            try {
                const res = await fetch(`https://photon.komoot.io/reverse?lat=${pickedLocation.lat}&lon=${pickedLocation.lng}`);
                const data = await res.json();
                if (data.features && data.features.length > 0) {
                    const p = data.features[0].properties;
                    const displayName = [p.name, p.street, p.city, p.state].filter(Boolean).join(', ');
                    setSearchQuery('');
                    setPickedLocationName(displayName || 'Pinned Location');
                } else {
                    setSearchQuery('');
                    setPickedLocationName('Pinned Location');
                }
            } catch (err) {
                console.error("Reverse geocoding failed", err);
                setSearchQuery('');
                setPickedLocationName('Pinned Location');
            }
        };

        fetchLocationName();
    }, [pickedLocation]);

    // Debounced API search for external locations
    useEffect(() => {
        if (!searchQuery) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                // Using Photon API as requested - added bbox for India (minLon, minLat, maxLon, maxLat)
                const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=10&bbox=68.1,6.7,97.4,35.5`);
                const data = await res.json();
                setSearchResults(data.features || []);
            } catch (error) {
                console.error("Error fetching locations:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    if (!isOpen) return null;

    const handleSelectOption = () => {
        onClose();
        onSelectLocationMode();
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col border-4 border-blue-400">
            <div className="p-4 flex items-center gap-4">
                <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="px-4 pb-4">
                <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search your location"
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-200 rounded-full">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                </div>
            </div>

            {pickedLocationName && !searchQuery && (
                <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full shrink-0">
                        <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-0.5">Selected Location</div>
                        <div className="text-sm font-semibold text-gray-800 line-clamp-1">{pickedLocationName}</div>
                    </div>
                    {onRemoveLocation && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveLocation();
                            }}
                            className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                            title="Remove Location"
                        >
                            <X className="w-5 h-5 text-blue-600" />
                        </button>
                    )}
                </div>
            )}

            <div className="px-4 py-4 border-b border-gray-100">
                <button
                    onClick={handleSelectOption}
                    className="flex items-center gap-3 w-full text-left"
                >
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold text-gray-700">Pin your location on Map</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col">
                    {isSearching ? (
                        <div className="py-8 text-center text-gray-500">Searching...</div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((result: any, i) => {
                            const p = result?.properties || {};
                            const geom = result?.geometry?.coordinates || [0, 0];
                            const displayName = p.name
                                ? [p.name, p.street, p.city, p.state].filter(Boolean).join(', ')
                                : result?.display_name || 'Unknown Location';

                            return (
                                <button
                                    key={p.osm_id || result?.place_id || i}
                                    onClick={() => {
                                        // Handle both Photon (lon, lat) and old Nominatim (lat, lon) formats for safety
                                        const lat = geom[1] || parseFloat(result.lat) || 0;
                                        const lng = geom[0] || parseFloat(result.lon) || 0;
                                        onSelectSearchedLocation(lat, lng);
                                    }}
                                    className="py-4 flex items-center gap-3 px-3 border-b border-gray-100 text-left w-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                >
                                    <MapPin className="w-10 h-10 stroke-1" />
                                    <span className="font-semibold text-gray-800 line-clamp-2">{displayName}</span>
                                </button>
                            );
                        })
                    ) : searchQuery && searchQuery !== 'Your Location' ? (
                        <div className="py-8 text-center text-gray-500">
                            No locations found
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Pin Location Button (only shows if we have picked a location) */}
            {pickedLocation && (
                <div className="p-4 border-t border-gray-100 bg-white mt-auto">
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white py-4 rounded-full font-bold shadow-md text-lg transition-all"
                    >
                        Pin this location
                    </button>
                </div>
            )}

            {/* Dialog Box for Pinning Location Details */}
            <DialogBox
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Select details for your pin"
            >
                <div className="flex flex-col gap-6">
                    {/* Item Type Selection */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold text-gray-700">What are you selling?</label>
                        <div className="flex flex-wrap gap-2">
                            {['Samosa', 'Milk', 'Chai', 'Vegetables', 'Fruits'].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setSelectedType(item)}
                                    className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${selectedType === item
                                        ? 'bg-red-600 border-red-600 text-white shadow-md'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600'
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Pin active until (Select Time)
                        </label>
                        <div className="flex gap-4">
                            <select
                                className="flex-1 h-[50px] px-3 border border-gray-200 rounded-lg outline-none focus:border-red-500 bg-gray-50 text-gray-800 font-medium cursor-pointer"
                                value={pinDuration.split(':')[0] || ''}
                                onChange={(e) => {
                                    const h = e.target.value;
                                    // Reset minute when changing hour to ensure validity
                                    setPinDuration(`${h}:`);
                                }}
                            >
                                <option value="" disabled>Hour</option>
                                {(() => {
                                    const currentH = new Date().getHours();
                                    return Array.from({ length: 24 - currentH }, (_, i) => currentH + i).map(hour => (
                                        <option key={hour} value={hour.toString().padStart(2, '0')}>
                                            {hour.toString().padStart(2, '0')}
                                        </option>
                                    ));
                                })()}
                            </select>

                            <select
                                className={`flex-1 h-[50px] px-3 border border-gray-200 rounded-lg outline-none focus:border-red-500 bg-gray-50 text-gray-800 font-medium cursor-pointer ${!pinDuration.split(':')[0] ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                value={pinDuration.split(':')[1] || ''}
                                onChange={(e) => {
                                    const h = pinDuration.split(':')[0];
                                    if (h) setPinDuration(`${h}:${e.target.value}`);
                                }}
                                disabled={!pinDuration.split(':')[0]}
                            >
                                <option value="" disabled>Minute</option>
                                {(() => {
                                    const selectedH = parseInt(pinDuration.split(':')[0] || '-1');
                                    if (selectedH === -1) return null;

                                    const d = new Date();
                                    const startMin = selectedH === d.getHours() ? d.getMinutes() : 0;
                                    return Array.from({ length: 60 - startMin }, (_, i) => startMin + i).map(min => (
                                        <option key={min} value={min.toString().padStart(2, '0')}>
                                            {min.toString().padStart(2, '0')}
                                        </option>
                                    ));
                                })()}
                            </select>
                        </div>
                        <span className="text-xs text-gray-500">Select a time between now and midnight today.</span>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem('token');
                                const [hours, minutes] = pinDuration.split(':');
                                const expiryAt = new Date();
                                expiryAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pins`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        deliveryLocation: pickedLocationName,
                                        lat: pickedLocation?.lat,
                                        lng: pickedLocation?.lng,
                                        deliveredBy: '65f0a0a0a0a0a0a0a0a0a0a0', // Placeholder or dynamic vendor ID
                                        shopType: selectedType, // Using selectedType as shopType
                                        item: selectedType, // Using selectedType as item for now
                                        expiryTime: expiryAt.toISOString()
                                    })
                                });

                                const data = await response.json();
                                if (response.ok) {
                                    const toast = (await import('react-toastify')).toast;
                                    toast.success("Location pinned successfully!");
                                    
                                    // Clear local state
                                    setSelectedType('');
                                    setPinDuration('');
                                    setPickedLocationName('');
                                    setSearchResults([]);
                                    setSearchQuery('');
                                    
                                    if (onPinSuccess) onPinSuccess();
                                    setIsDialogOpen(false);
                                    onClose();
                                } else {
                                    const toast = (await import('react-toastify')).toast;
                                    toast.error(data.error || "Failed to pin location");
                                }
                            } catch (err) {
                                console.error("Pinning error:", err);
                                const toast = (await import('react-toastify')).toast;
                                toast.error("Connection error");
                            }
                        }}
                        disabled={!selectedType || pinDuration.length < 4 || !pinDuration.includes(':')}
                        className="w-full bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold mt-2 transition-colors"
                    >
                        Save Pin Location
                    </button>
                </div>
            </DialogBox>
        </div>
    );
}
