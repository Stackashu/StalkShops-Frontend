'use client';

import React, { useState, useEffect } from 'react';
import MobileLayout from '../MobileLayout';
import { Crown, Zap, Shield, Sparkle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface Plan {
    _id: string;
    name: string;
    price: number;
    durationDays: number;
    visibilityRadius: number;
    features: string[];
}

export default function VendorSubscriptionsModule() {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<Plan[]>([
        { _id: '1', name: 'Bronze', price: 99, durationDays: 30, visibilityRadius: 300, features: ['300m Visibility', 'Basic Support'] },
        { _id: '2', name: 'Silver', price: 149, durationDays: 30, visibilityRadius: 500, features: ['500m Visibility', 'Medium Boost', 'Priority Support'] },
        { _id: '3', name: 'Gold', price: 199, durationDays: 30, visibilityRadius: 1200, features: ['1200m Visibility', 'High Boost', 'Direct Ads'] },
    ]);
    const [currentPlan, setCurrentPlan] = useState<any>(null);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        // 1. Fetch Vendor Details (Independently)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setCurrentPlan(data.vendorFound.currentSubscription || null);
            }
        } catch (err) {
            console.error("Failed to fetch vendor details:", err);
        }

        // 2. Fetch Plans (Independently)
        try {
            const plansRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/plans`);
            const plansData = await plansRes.json();
            if (plansRes.ok && plansData.plans && plansData.plans.length > 0) {
                setPlans(plansData.plans);
            }
        } catch (err) {
            console.error("Failed to fetch plans:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout title="Vendor Plans">
            <div className="p-6 pb-20 font-bitter">
                {/* Current Plan Card */}
                <div className="bg-black text-white p-8 rounded-[40px] mb-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full -mr-10 -mt-10 blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Crown size={20} className="text-yellow-400" />
                            <span className="text-sm font-bold opacity-60 uppercase tracking-widest">Your Current Plan</span>
                        </div>
                        <h2 className="text-4xl font-black mb-1">{currentPlan?.name || 'Free Tier'}</h2>
                        <p className="opacity-50 text-sm font-medium mb-6">
                            {currentPlan ? `Expiring on ${new Date(currentPlan.endDate).toLocaleDateString()}` : 'Upgrade to reach more customers.'}
                        </p>

                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 px-4 py-2 rounded-2xl text-xs font-bold border border-white/10 uppercase tracking-tighter">
                                {currentPlan ? 'Active' : 'Basic'}
                            </div>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-6">Vendor Reach Plans</h3>

                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-red-500" /></div>
                ) : (
                    <div className="space-y-6">
                        {plans.map((plan: Plan) => (
                            <div
                                key={plan._id}
                                className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all border-l-4 border-l-red-500 group"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900">{plan.name}</h4>
                                        <div className="flex items-center gap-1 text-red-600 font-bold">
                                            <Zap size={14} className="fill-red-600" />
                                            <span className="text-sm">{plan.visibilityRadius}m Reach</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-black">₹{plan.price}</div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">Per Month</span>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                            <Shield size={14} className="text-green-500" /> {f}
                                        </li>
                                    ))}
                                </ul>

                                <button className="w-full bg-gray-50 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-200 text-gray-900 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                                    <Sparkle size={18} /> Buy {plan.name}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
