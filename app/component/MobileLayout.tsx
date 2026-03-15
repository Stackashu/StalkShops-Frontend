'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface MobileLayoutProps {
    title: string;
    children: React.ReactNode;
    rightAction?: React.ReactNode;
}

export default function MobileLayout({ title, children, rightAction }: MobileLayoutProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col h-dvh w-full bg-white font-bitter overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                
                <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
                    {title}
                </h1>

                <div className="w-10">
                    {rightAction || <div className="w-10 h-10" />}
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto pb-10">
                {children}
            </main>
        </div>
    );
}
