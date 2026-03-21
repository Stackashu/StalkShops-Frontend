'use client';

import React, { useState, useEffect } from 'react';
import MobileLayout from '../../component/MobileLayout';
import { ShoppingBag, Calendar, MapPin, Store, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PinnedOrders() {
    const [loading, setLoading] = useState(true);
    const [pins, setPins] = useState([]);

    useEffect(() => {
        fetchPinnedOrders();
    }, []);

    const fetchPinnedOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pins`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setPins(data.pins || []);
            } else {
                toast.error(data.error || "Failed to fetch pinned orders");
            }
        } catch (err) {
            toast.error("Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout title="Pinned Orders">
            <div className="p-6 font-bitter">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-4"></div>
                        <p>Loading pinned orders...</p>
                    </div>
                ) : pins.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <ShoppingBag size={64} className="mb-4 opacity-20" />
                        <p className="font-medium">No pinned orders yet</p>
                        <p className="text-sm mt-2">Pins you use will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pins.map((pin: any) => (
                            <div key={pin._id} className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Store className="w-5 h-5 text-red-600" />
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                {pin.deliveredBy?.name || 'Unknown Vendor'}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                                            <Calendar size={12} />
                                            {new Date(pin.createdAt).toLocaleDateString()} at {new Date(pin.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="bg-red-50 p-2 rounded-xl">
                                        <ShoppingBag className="w-5 h-5 text-red-600" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                                        <span>{pin.deliveryLocation}</span>
                                    </div>
                                    
                                    {pin.shopType && (
                                        <div className="inline-block px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            {pin.shopType}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <div className="text-xs text-gray-400">
                                        Vendor ID: {pin.deliveredBy?._id?.slice(-8).toUpperCase()}
                                    </div>
                                    {pin.deliveredBy?.phone && (
                                        <a 
                                            href={`tel:${pin.deliveredBy.phone}`}
                                            className="text-red-600 font-bold text-sm flex items-center gap-1 hover:underline"
                                        >
                                            Contact Vendor <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
