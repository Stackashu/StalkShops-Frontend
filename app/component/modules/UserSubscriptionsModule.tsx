'use client';

import React, { useState, useEffect } from 'react';
import MobileLayout from '../MobileLayout';
import { Crown, Zap, Shield, Sparkle, Loader2, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

interface Package {
    _id: string;
    name: string;
    price: number;
    pinCount: number;
}

export default function UserSubscriptionsModule() {
    const [loading, setLoading] = useState(true);
    const [packages, setPackages] = useState<Package[]>([
        { _id: '1', name: 'Starter', price: 99, pinCount: 10 },
        { _id: '2', name: 'Growth', price: 189, pinCount: 20 },
        { _id: '3', name: 'Pro', price: 449, pinCount: 50 },
    ]);
    const [userPins, setUserPins] = useState(0);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        // 1. Fetch User Details to get current pins (Independently)
        try {
            const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await userRes.json();
            if (userRes.ok) {
                setUserPins(userData.userFound.pins || 0);
            }
        } catch (err) {
            console.error("Failed to fetch user pins:", err);
        }

        // 2. Fetch Pin Packages (Independently)
        try {
            const pkgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/packages`);
            const pkgData = await pkgRes.json();
            if (pkgRes.ok && pkgData.packages && pkgData.packages.length > 0) {
                setPackages(pkgData.packages);
            }
        } catch (err) {
            console.error("Failed to fetch packages:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (pkgId: string) => {
        toast.info("Payment gateway integration coming soon!");
        // Logic for Razorpay order creation would go here
    };

    return (
        <MobileLayout title="Pin Subscriptions">
            <div className="p-6 pb-20 font-bitter">
                {/* Current Pins Card */}
                <div className="bg-black text-white p-8 rounded-[40px] mb-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full -mr-10 -mt-10 blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin size={20} className="text-red-500" />
                            <span className="text-sm font-bold opacity-60 uppercase tracking-widest">Your Inventory</span>
                        </div>
                        <h2 className="text-4xl font-black mb-1">{userPins} Pins</h2>
                        <p className="opacity-50 text-sm font-medium mb-6">
                            Available in your account. Buy more to not get Worry about your Shopping.
                        </p>

                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 px-4 py-2 rounded-2xl text-xs font-bold border border-white/10 uppercase tracking-tighter">
                                Active Package
                            </div>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-6">Purchase Pin Packages</h3>

                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-red-500" /></div>
                ) : (
                    <div className="space-y-6">
                        {packages.map((pkg: Package) => (
                            <div
                                key={pkg._id}
                                className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all border-l-4 border-l-red-500 group"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900">{pkg.name}</h4>
                                        <div className="flex items-center gap-1 text-red-600 font-bold">
                                            <Shield size={14} className="fill-red-600" />
                                            <span className="text-sm">{pkg.pinCount} PINS</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-black">₹{pkg.price}</div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">One-time</span>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                        <Zap size={14} className="text-yellow-500" /> Higher Search Visibility
                                    </li>
                                    <li className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                        <Sparkle size={14} className="text-blue-500" /> Premium Map Highlighting
                                    </li>
                                </ul>

                                <button 
                                    onClick={() => handleBuy(pkg._id)}
                                    className="w-full bg-gray-50 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-200 text-gray-900 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkle size={18} /> Buy {pkg.pinCount} Pins
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
