'use client';

import { MapPin, LayoutList, ShoppingBag, Headset } from 'lucide-react';

interface BottomNavProps {
    onOpenLocationSelect: () => void;
    pins?: number;
}

export default function BottomNav({ onOpenLocationSelect, pins = 0 }: BottomNavProps) {
    return (
        <div className="relative">
            {/* Floating Action Button for Location */}
            <div className="absolute bottom-20 right-4">
                <button
                    onClick={onOpenLocationSelect}
                    className="w-14 h-14 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-105 transition-transform relative"
                >
                    <MapPin className="w-6 h-6 text-red-500" />
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-white shadow-sm">
                        {pins}
                    </div>
                </button>
            </div>

            {/* Bottom Navigation Bar */}
            <div className=" absolute bottom-0 w-full bg-white px-6-safe pt-2  flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-2xl">
                <button className="flex flex-col items-center gap-1 p-2 flex-1">
                    <LayoutList className="w-6 h-6 text-black" />
                    <span className="text-xs font-semibold">Subscription</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 flex-1">
                    <ShoppingBag className="w-6 h-6 text-black" />
                    <span className="text-xs font-semibold"> Pinned Orders</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 flex-1">
                    <Headset className="w-6 h-6 text-black" />
                    <span className="text-xs font-semibold">Support</span>
                </button>
            </div>
        </div>
    );
}
