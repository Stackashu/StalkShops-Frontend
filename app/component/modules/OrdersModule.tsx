'use client';

import React, { useState, useEffect } from 'react';
import MobileLayout from '../MobileLayout';
import { Package, Calendar, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function OrdersModule() {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const role = localStorage.getItem('role') || 'User';
            const endpoint = role === 'Vendor' ? '/api/vendor/transactions' : '/api/user/transactions';
            const token = localStorage.getItem('token');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setTransactions(data.transactions || []);
            } else {
                toast.error(data.error || "Failed to fetch orders");
            }
        } catch (err) {
            toast.error("Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout title="Order History">
            <div className="p-6 font-bitter">
                {loading ? (
                    <div className="flex justify-center py-10">Loading orders...</div>
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Package size={64} className="mb-4 opacity-20" />
                        <p className="font-medium">No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((tx: any) => (
                            <div key={tx._id} className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {tx.itemType === 'Subscription' ? 'Subscription Plan' : 'Pin Package'}
                                        </h3>
                                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                                            <Calendar size={12} />
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-black">₹{tx.amount}</div>
                                        <StatusBadge status={tx.status} />
                                    </div>
                                </div>

                                <div className="h-px bg-gray-50 mb-4" />

                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase text-[10px] tracking-widest">
                                    <Tag size={12} />
                                    ID: {tx.razorpayOrderId}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isSuccess = status === 'completed';
    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase mt-1 ${isSuccess ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
            }`}>
            {isSuccess ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
            {status}
        </div>
    );
}
