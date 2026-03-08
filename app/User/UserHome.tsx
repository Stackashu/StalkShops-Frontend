'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { MapAreaProps } from '../component/MapArea';

const MapArea = dynamic<MapAreaProps>(() => import('../component/MapArea'), { ssr: false });
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import SidebarMenu from './SidebarMenu';
import SearchVendors from './SearchVendors';
import LocationSelect from './LocationSelect';

export default function UserHome() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLocationSelectOpen, setIsLocationSelectOpen] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [pickedLocation, setPickedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [searchedLocation, setSearchedLocation] = useState<{ lat: number, lng: number } | null>(null);

    return (
        <div className="relative h-dvh w-full overflow-hidden bg-gray-100 font-bitter">
            {/* Background Map layer */}
            <div className="absolute inset-0 z-0">
                <MapArea
                    isPickingLocation={isPickingLocation}
                    searchedLocation={searchedLocation}
                    onConfirmLocation={(lat: number, lng: number) => {
                        console.log("Confirmed Location:", lat, lng);
                        setPickedLocation({ lat, lng });
                        setIsPickingLocation(false);
                        setIsLocationSelectOpen(true);
                    }}
                    onCancelPicking={() => setIsPickingLocation(false)}
                />
            </div>

            {/* Overlays container ensuring they are above map (z-10+) */}
            {!isPickingLocation && (
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between transition-opacity duration-300">
                    {/* Floating Top Bar (pointer-events-auto so children are clickable) */}
                    <div className="pointer-events-auto pt-4 px-4">
                        <TopBar
                            onOpenSidebar={() => setIsSidebarOpen(true)}
                            onOpenSearch={() => setIsSearchOpen(true)}
                        />
                    </div>

                    {/* Floating Bottom Nav */}
                    <div className="w-full pointer-events-auto">
                        <BottomNav
                            onOpenLocationSelect={() => setIsLocationSelectOpen(true)}
                        />
                    </div>
                </div>
            )}

            {/* Full screen Overlays */}
            <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <SearchVendors isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <LocationSelect
                isOpen={isLocationSelectOpen}
                onClose={() => setIsLocationSelectOpen(false)}
                onSelectLocationMode={() => setIsPickingLocation(true)}
                onSelectSearchedLocation={(lat, lng) => {
                    setSearchedLocation({ lat, lng });
                    setIsLocationSelectOpen(false);
                    setIsPickingLocation(true);
                }}
                pickedLocation={pickedLocation}
            />
        </div>
    );
}
