'use client';

import React, { useState, useEffect } from 'react';

import SidebarMenu from '../component/SidebarMenu';
import TopBar from '../component/TopBar';
import MapArea from '../component/MapArea';
import LogoutDialog from '../component/LogoutDialog';
import { MapAreaHandle } from '../component/MapArea';
import { Play, Pause, LogOut, Loader2, LocateFixed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../../hooks/useSocket';
import { toast } from 'react-toastify';
import VendorBottomNav from './VendorBottomNav';

export default function VendorHome() {
    const router = useRouter();
    const mapRef = React.useRef<MapAreaHandle>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [vendorData, setVendorData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const lastLocationRef = React.useRef<{ lat: number, lng: number } | null>(null);

    const [nearbyOrdersCount, setNearbyOrdersCount] = useState<number>(0);
    const [completedToday, setCompletedToday] = useState<number>(0);
    const locationIntervalRef = React.useRef<any>(null);

    // Socket.io integration
    const socket = useSocket(undefined, vendorData?._id);

    useEffect(() => {
        fetchVendorProfile();
        localStorage.setItem('role', 'vendor');
        return () => {
            if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
        };
    }, []);

    const fetchVendorProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setVendorData(data.vendorFound);
            } else {
                toast.error("Session expired");
                router.push('/login');
            }
        } catch (err) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchVendorStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCompletedToday(data.completedToday);
            }
        } catch (err) {
            console.error("Failed to fetch vendor stats:", err);
        }
    };

    useEffect(() => {
        if (vendorData?._id) {
            fetchVendorStats();
            const interval = setInterval(fetchVendorStats, 60000); // Update stats every minute
            return () => clearInterval(interval);
        }
    }, [vendorData?._id]);

    const sendLocationUpdate = (lat: number, lng: number) => {
        if (!vendorData?._id) return;
        
        // Check if location actually changed
        const last = lastLocationRef.current;
        if (last && last.lat === lat && last.lng === lng) {
            console.log(`[Socket] Location unchanged (${lat}, ${lng}), skipping update.`);
            return;
        }

        console.log(`[Socket] Emitting location update: ${lat}, ${lng}`);
        socket?.emit("vendor_update_location", {
            vendorId: vendorData._id,
            lat,
            lng
        });
        lastLocationRef.current = { lat, lng };
    };

    const handleToggleTracking = () => {
        const nextState = !isTracking;
        setIsTracking(nextState);

        if (nextState) {
            console.log("[Socket] Emitting vendor_start_serving");
            // Get current location then emit
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                socket?.emit("vendor_start_serving", {
                    vendorId: vendorData?._id,
                    lat: latitude,
                    lng: longitude
                });
                lastLocationRef.current = { lat: latitude, lng: longitude };
                
                // Start periodic updates
                const interval = setInterval(() => {
                    navigator.geolocation.getCurrentPosition((p) => {
                        sendLocationUpdate(p.coords.latitude, p.coords.longitude);
                    });
                }, 5000); // Optimized: Every 5 seconds
                locationIntervalRef.current = interval;
                toast.success("You are now live on the map!");
            });
        } else {
            console.log("[Socket] Emitting vendor_stop_serving");
            socket?.emit("vendor_stop_serving", {
                vendorId: vendorData?._id
            });
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
                locationIntervalRef.current = null;
            }
            toast.info("You are no longer visible to users.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/sign-in');
    };

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-red-600" size={40} />
        </div>
    );

    return (
        <div className="relative h-dvh w-full overflow-hidden bg-gray-100 font-bitter">
            {/* Background Map Layer */}
            <div className="absolute inset-0 z-0">
                <MapArea 
                    ref={mapRef}
                    isVendorMode={true} 
                    isTracking={isTracking} 
                    onDataUpdate={(data) => setNearbyOrdersCount(data.activePinsCount)}
                />
            </div>

            {/* Top Navigation Overlay */}
            <div className="absolute top-4 left-0 right-0 px-4 z-50 pointer-events-none flex flex-col gap-2">
                <div className="pointer-events-auto">
                    <TopBar 
                        onOpenSidebar={() => setIsSidebarOpen(true)} 
                        onLogout={() => setIsLogoutDialogOpen(true)}
                        userName={vendorData?.name}
                        middleAction={
                            <button
                                onClick={handleToggleTracking}
                                className={`w-full h-12 rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                                    isTracking 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-white text-red-600 border border-gray-100'
                                }`}
                            >
                                {isTracking ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                {isTracking ? 'STOP SERVING' : 'START SERVING'}
                            </button>
                        }
                    />
                </div>
            </div>

            {/* Bottom Overlay (Locate Me) */}
            <div className="absolute bottom-32 left-0 right-0 px-6 z-50 pointer-events-none flex flex-col gap-4">
                {/* Locate Me Button Overlay - same as user */}
                <div className="flex justify-end pr-0 pb-4">
                    <button
                        onClick={() => mapRef.current?.handleLocateMe()}
                        className="pointer-events-auto w-14 h-14 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        title="Locate Me"
                    >
                        <LocateFixed className="w-7 h-7 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Sidebar Overlay */}
            <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Bottom Nav Stats */}
            <VendorBottomNav 
                completedToday={completedToday} 
                nearbyOrders={nearbyOrdersCount} 
            />

            {/* Logout Confirmation Dialog */}
            <LogoutDialog
                isOpen={isLogoutDialogOpen}
                onClose={() => setIsLogoutDialogOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}
