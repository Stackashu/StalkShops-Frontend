'use client';

import { ArrowLeft, Coffee, Carrot } from 'lucide-react';
import { useState } from 'react';

interface SearchVendorsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchVendors({ isOpen, onClose }: SearchVendorsProps) {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col border-4 border-blue-400">
            <div className="p-4 flex items-center gap-4">
                <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="px-4 pb-4">
                <div className="bg-gray-100 rounded-lg p-3">
                    <input
                        type="text"
                        placeholder="Search You Vendors here...."
                        className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="px-4 py-2 flex justify-between gap-2 flex-wrap pb-4 no-scrollbar">
                <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1 whitespace-nowrap shadow-sm">
                    <Coffee className="w-4 h-4" />
                    <span className="font-semibold text-sm">Chai wala</span>
                </button>
                <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1 whitespace-nowrap shadow-sm">
                    <Carrot className="w-4 h-4" />
                    <span className="font-semibold text-sm">Vegetables</span>
                </button>
                <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1 whitespace-nowrap shadow-sm">
                    <Coffee className="w-4 h-4" />
                    <span className="font-semibold text-sm">Chai wala</span>
                </button>
                <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1 whitespace-nowrap shadow-sm">
                    <Coffee className="w-4 h-4" />
                    <span className="font-semibold text-sm">Chai wala</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-8 py-4 px-6 border-b border-gray-100">
                            <Carrot className="w-6 h-6" />
                            <span className="font-semibold">Vegetables</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
