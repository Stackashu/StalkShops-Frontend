"use client"
import LocationGuard from '../component/LocationGuard';

export default function VendorHome() {
    return (
        <LocationGuard>
            <div className="flex items-center justify-center p-4 h-full bg-white text-black font-bitter">
                <h1 className="text-2xl font-bold text-red-500">Vendor Dashboard</h1>
            </div>
        </LocationGuard>
    );
}
