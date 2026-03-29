'use client';

// user id  pedehi2482@faxzu.com
// password test1 updated to 0000
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { LocateFixed } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSocket } from '../../hooks/useSocket';
import { requestNotificationPermission } from '../utils/notifications';

const MapArea = dynamic<MapAreaProps>(() => import('../component/MapArea'), { ssr: false });
import TopBar from '../component/TopBar';
import BottomNav from './BottomNav';
import SidebarMenu from '../component/SidebarMenu';
import SearchVendors from './SearchVendors';
import LocationSelect from './LocationSelect';
// import PermissionGuard from '../component/PermissionGuard';
import LogoutDialog from '../component/LogoutDialog';
import { MapAreaHandle, MapAreaProps } from '../component/MapArea';



export default function UserHome() {
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

    // Socket.io integration
    const socket = useSocket(userData?._id);

    useEffect(() => {
        // Send initial location and start heartbeats if allowed
        if (userData?._id && navigator.geolocation) {
            const sendUpdate = () => {
                navigator.geolocation.getCurrentPosition((pos) => {
                    socket?.emit("user_update_location", {
                        userId: userData._id,
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                });
            };
            
            sendUpdate();
            const interval = setInterval(sendUpdate, 30000); // Every 30s
            return () => clearInterval(interval);
        }
    }, [userData?._id, socket]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role')?.toLowerCase() || 'user';
            const endpoint = role === 'vendor' ? '/api/vendor' : '/api/user';
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

    useEffect(() => {
        localStorage.setItem('role', 'user');
        fetchProfile();

        // Refetch pin count whenever user returns to the tab/window
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchProfile();
            }
        };
        const handleFocus = () => fetchProfile();

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        // FCM Permission
        requestNotificationPermission();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        toast.success("Logged out successfully");
        router.push('/sign-in');
    };

    return (
        // <LocationGuard>
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
                                userName={userData?.name}
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
                    onRemoveLocation={() => setPickedLocation(null)}
                    onPinSuccess={() => {
                        mapRef.current?.refreshPins();
                        fetchProfile();
                        setPickedLocation(null);
                    }}
                />

                {/* Logout Confirmation Dialog */}
                <LogoutDialog
                    isOpen={isLogoutDialogOpen}
                    onClose={() => setIsLogoutDialogOpen(false)}
                    onConfirm={handleLogout}
                />
            </div>
        // {/* </PermissionGuard> */}
    );
}
