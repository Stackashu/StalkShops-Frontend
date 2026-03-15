'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, ShieldAlert, Navigation } from 'lucide-react';

interface LocationGuardProps {
    children: React.ReactNode;
}

type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

export default function LocationGuard({ children }: LocationGuardProps) {
    const [permission, setPermission] = useState<PermissionStatus>('unknown');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkPermission = useCallback(async () => {
        if (!navigator.permissions || !navigator.permissions.query) {
            setPermission('unknown');
            setIsLoading(false);
            return;
        }

        try {
            const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
            setPermission(status.state as PermissionStatus);
            
            status.onchange = () => {
                setPermission(status.state as PermissionStatus);
            };
        } catch (err) {
            console.error("Error querying permission:", err);
            setPermission('unknown');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const requestLocation = useCallback(() => {
        setIsLoading(true);
        setError(null);
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPermission('granted');
                setIsLoading(false);
            },
            (err) => {
                console.error("Geolocation error:", err);
                if (err.code === err.PERMISSION_DENIED) {
                    setPermission('denied');
                } else {
                    setError("Could not retrieve your location. Please check your GPS/Network.");
                }
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    useEffect(() => {
        checkPermission();
    }, [checkPermission]);

    // Automatically try to get location if it's already granted or unknown
    useEffect(() => {
        if (permission === 'prompt') {
            requestLocation();
        }
    }, [permission, requestLocation]);

    if (isLoading && permission === 'unknown') {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-9999">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 font-bold">Checking Location Access...</p>
            </div>
        );
    }

    if (permission === 'denied' || (permission === 'prompt' && !isLoading)) {
        return (
            <div className="fixed inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-9999 p-6 text-center">
                <div className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full border border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <MapPin className="w-10 h-10 text-red-500" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Location Required</h2>
                    <p className="text-gray-500 font-medium mb-8">
                        To find nearby shops and pin your own location, we need access to your device's GPS.
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-start gap-2 text-left">
                            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={requestLocation}
                        disabled={isLoading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Navigation className="w-5 h-5 fill-current" />
                                <span>Enable Location Access</span>
                            </>
                        )}
                    </button>

                    <div className="mt-6 p-4 bg-gray-50 rounded-xl w-full">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">How to fix</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            If you blocked access, click the <strong className="text-gray-700">lock icon</strong> in your address bar and toggle <strong className="text-gray-700">Location</strong> to "On".
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
