'use client';

import React from 'react';
import { CheckCircle2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface VendorBottomNavProps {
    completedToday: number;
    nearbyOrders: number;
}

export default function VendorBottomNav({ completedToday, nearbyOrders }: VendorBottomNavProps) {
    return (
        <div className="fixed bottom-10 left-0 right-0 px-4 z-50 pointer-events-none mb-safe">
            <div className="max-w-md mx-auto pointer-events-auto">
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[32px] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
                >
                    <div className="flex items-center">
                        {/* Completed Today section */}
                        <div className="flex-1 flex flex-col items-center justify-center py-2 relative overflow-hidden group">
                            <span className="text-2xl font-black text-gray-900 relative">{completedToday}</span>
                            <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-1.5 mb-0.5 relative">
                                <CheckCircle2 size={12} className="text-red-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">COMPLETED TODAY</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-10 bg-gray-100" />

                        {/* Active Nearby section */}
                        <div className="flex-1 flex flex-col items-center justify-center py-2 relative overflow-hidden group">
                            
                            <span className="text-2xl font-black text-red-600 relative">{nearbyOrders}</span>
                            <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-1.5 mb-0.5 relative">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">ACTIVE NEAR ME</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
