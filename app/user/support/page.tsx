'use client';

import React from 'react';
import MobileLayout from '../../component/MobileLayout';
import { Headset, Mail, Phone, MessageSquare, ExternalLink } from 'lucide-react';

export default function SupportPage() {
    const contactMethods = [
        {
            icon: <Phone className="w-6 h-6 text-green-500" />,
            title: "Call Us",
            value: "+91 81000 00000",
            action: "tel:+918100000000"
        },
        {
            icon: <Mail className="w-6 h-6 text-blue-500" />,
            title: "Email Support",
            value: "support@stalkshops.com",
            action: "mailto:support@stalkshops.com"
        },
        {
            icon: <MessageSquare className="w-6 h-6 text-red-500" />,
            title: "WhatsApp",
            value: "Chat with us",
            action: "https://wa.me/918100000000"
        }
    ];

    return (
        <MobileLayout title="Help & Support">
            <div className="p-6 font-bitter">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Headset className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we help?</h2>
                    <p className="text-gray-500">We're here to assist you with any questions or issues you might have.</p>
                </div>

                <div className="space-y-4">
                    {contactMethods.map((method, index) => (
                        <a 
                            key={index}
                            href={method.action}
                            target={method.action.startsWith('http') ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 bg-white border border-gray-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            <div className="bg-gray-50 p-3 rounded-2xl">
                                {method.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{method.title}</h3>
                                <p className="text-gray-500 text-sm">{method.value}</p>
                            </div>
                            <ExternalLink size={16} className="text-gray-300" />
                        </a>
                    ))}
                </div>

                <div className="mt-12 bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Technical Support</h3>
                        <p className="text-gray-400 text-sm mb-6">Experienced any bugs or app issues? Let our dev team know.</p>
                        <button className="bg-white text-black font-black px-6 py-3 rounded-2xl text-sm hover:bg-gray-100 transition-colors">
                            Report a Bug
                        </button>
                    </div>
                    <div className="absolute -right-8 -bottom-8 opacity-10">
                        <Headset size={160} />
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-10">
                    StalkShops Support is available 24/7 for premium subscribers.
                </p>
            </div>
        </MobileLayout>
    );
}
