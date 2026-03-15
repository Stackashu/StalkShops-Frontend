'use client';

import React from 'react';
import { LogOut, X } from 'lucide-react';

interface LogoutDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutDialog({ isOpen, onClose, onConfirm }: LogoutDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-6">
            {/* Backdrop with Blur */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Dialog Card */}
            <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <LogOut className="w-8 h-8 text-red-500" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Logout</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Are you sure you want to log out? You will need to sign in again to access your account.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={onConfirm}
                            className="w-full bg-red-600 text-white font-bold py-4 rounded-full shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
                        >
                            Logout
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-50 text-gray-600 font-bold py-4 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
