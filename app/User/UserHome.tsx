'use client';

// user id  pedehi2482@faxzu.com
// password test1
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { LocateFixed } from 'lucide-react';
import { toast } from 'react-toastify';

const MapArea = dynamic<MapAreaProps>(() => import('../component/MapArea'), { ssr: false });
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import SidebarMenu from './SidebarMenu';
import SearchVendors from './SearchVendors';
import LocationSelect from './LocationSelect';
import LocationGuard from '../component/LocationGuard';
import LogoutDialog from '../component/LogoutDialog';
import { MapAreaHandle, MapAreaProps } from '../component/MapArea';



export const UserHome = () => {
    const router = useRouter();
    const mapRef = useRef<MapAreaHandle>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLocationSelectOpen, setIsLocationSelectOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [pickedLocation, setPickedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [searchedLocation, setSearchedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role') || 'User';
                const endpoint = role === 'Vendor' ? '/api/vendor' : '/api/user';
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setUserData(data.userFound || data.vendorFound);
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        toast.success("Logged out successfully");
        router.push('/sign-in');
    };

    return (
        <LocationGuard>
            <div className="relative h-dvh w-full overflow-hidden bg-gray-100 font-bitter">
                {/* Background Map layer */}
                <div className="absolute inset-0 z-0">
                    <MapArea
                        ref={mapRef}
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
                                onLogout={() => setIsLogoutDialogOpen(true)}
                            />
                        </div>

                        {/* Center Right Floating Buttons (Locate Me) */}
                        <div className="absolute right-4 bottom-36 pointer-events-auto">
                            <button
                                onClick={() => mapRef.current?.handleLocateMe()}
                                className="w-14 h-14 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                                title="Locate Me"
                            >
                                <LocateFixed className="w-7 h-7 text-gray-400" />
                            </button>
                        </div>

                        {/* Floating Bottom Nav */}
                        <div className="w-full pointer-events-auto">
                            <BottomNav
                                onOpenLocationSelect={() => {
                                    if ((userData?.pins || 0) > 0) {
                                        setIsLocationSelectOpen(true);
                                    } else {
                                        const role = localStorage.getItem('role')?.toLowerCase() || 'user';
                                        router.push(`/${role}/manage-subscriptions`);
                                    }
                                }}
                                pins={userData?.pins || 0}
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

                {/* Logout Confirmation Dialog */}
                <LogoutDialog
                    isOpen={isLogoutDialogOpen}
                    onClose={() => setIsLogoutDialogOpen(false)}
                    onConfirm={handleLogout}
                />
            </div>
        </LocationGuard>
    );
}
