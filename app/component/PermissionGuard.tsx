'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Bell, ShieldAlert, Navigation, Settings } from 'lucide-react';

interface PermissionGuardProps {
    children: React.ReactNode;
}

type Status = 'granted' | 'denied' | 'prompt' | 'unknown';

export default function PermissionGuard({ children }: PermissionGuardProps) {
    const [geoStatus, setGeoStatus] = useState<Status>('unknown');
    const [notifStatus, setNotifStatus] = useState<Status>('unknown');
    const [isLoading, setIsLoading] = useState(true);

    const checkPermissions = useCallback(async () => {
        if (typeof window === 'undefined') return;

        try {
            // Check Geolocation
            if (navigator.permissions && navigator.permissions.query) {
                const geo = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
                setGeoStatus(geo.state as Status);
                geo.onchange = () => setGeoStatus(geo.state as Status);

                const notif = await navigator.permissions.query({ name: 'notifications' as PermissionName });
                setNotifStatus(notif.state as Status);
                notif.onchange = () => setNotifStatus(notif.state as Status);
            } else {
                // Fallback for browsers without permissions.query
                setGeoStatus('unknown');
                setNotifStatus(Notification.permission as Status);
            }
        } catch (err) {
            console.error("Error checking permissions:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkPermissions();
    }, [checkPermissions]);

    const requestLocation = () => {
        navigator.geolocation.getCurrentPosition(
            () => setGeoStatus('granted'),
            () => setGeoStatus('denied'),
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    const requestNotification = async () => {
        const res = await Notification.requestPermission();
        setNotifStatus(res as Status);
    };

    const allGranted = geoStatus === 'granted' && notifStatus === 'granted';

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Verifying Permissions...</p>
            </div>
        );
    }

    if (!allGranted) {
        return (
            <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-8 rounded-[32px] shadow-2xl max-w-md w-full border border-gray-100">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Access Required</h2>
                        <p className="text-gray-500 font-medium">
                            StalkShops needs your location and notifications to keep you updated in real-time.
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {/* Location Status */}
                        <div className={`p-4 rounded-2xl border-2 transition-all ${geoStatus === 'granted' ? 'border-green-100 bg-green-50' : 'border-red-50 bg-red-50/50'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${geoStatus === 'granted' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Device Location</p>
                                        <p className="text-xs text-gray-500 capitalize">{geoStatus}</p>
                                    </div>
                                </div>
                                {geoStatus !== 'granted' && (
                                    <button 
                                        onClick={requestLocation}
                                        className="bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        Enable
                                    </button>
                                )}
                                {geoStatus === 'granted' && (
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notification Status */}
                        <div className={`p-4 rounded-2xl border-2 transition-all ${notifStatus === 'granted' ? 'border-green-100 bg-green-50' : 'border-red-50 bg-red-50/50'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notifStatus === 'granted' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Push Notifications</p>
                                        <p className="text-xs text-gray-500 capitalize">{notifStatus}</p>
                                    </div>
                                </div>
                                {notifStatus !== 'granted' && (
                                    <button 
                                        onClick={requestNotification}
                                        className="bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        Enable
                                    </button>
                                )}
                                {notifStatus === 'granted' && (
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {(geoStatus === 'denied' || notifStatus === 'denied') && (
                        <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-amber-900">Permissions Blocked</p>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    You have blocked access. Please click the <strong className="text-amber-900">lock icon</strong> in your browser address bar and enable both Location and Notifications.
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Your data is used only to show nearby thelas
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
