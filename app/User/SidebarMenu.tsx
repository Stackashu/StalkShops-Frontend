'use client';

import { LogOut } from 'lucide-react';

interface SidebarMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-8">
                        <span className="text-white font-bold text-2xl">SS</span>
                    </div>

                    <nav className="flex flex-col">
                        {['Profile', 'Change Password', 'Settings', 'Manage Subscriptions', 'Orders', 'Privacy Policy'].map((item, index) => (
                            <button
                                key={index}
                                className="text-left py-4 border-b border-gray-100 text-lg font-medium text-gray-600 hover:text-black transition-colors"
                                onClick={onClose}
                            >
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 flex justify-end">
                    <button className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center">
                            <span className="text-xl font-bold">Q</span>
                        </div>
                        <span className="text-xs font-medium">Support</span>
                    </button>
                </div>
            </div>
        </>
    );
}
