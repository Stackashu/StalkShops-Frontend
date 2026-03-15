import { User, LogOut } from 'lucide-react';
import React from 'react';

interface TopBarProps {
    onOpenSidebar: () => void;
    onOpenSearch: () => void;
    onLogout: () => void;
}

export default function TopBar({ onOpenSidebar, onOpenSearch, onLogout }: TopBarProps) {
    return (
        <div className="flex items-center gap-3 w-full">
            {/* Profile Icon */}
            <button
                onClick={onOpenSidebar}
                className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
                <User className="w-6 h-6 text-gray-500" />
            </button>

            {/* Search Bar */}
            <button
                onClick={onOpenSearch}
                className="flex-1 h-12 bg-white rounded-full shadow-lg flex items-center px-5 text-gray-500 hover:bg-gray-50 transition-colors border border-gray-100"
            >
                <span className="text-sm">Search Samosa , chai ....</span>
            </button>

            {/* Logout Icon (top right) */}
            <button 
                onClick={onLogout}
                className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
                <LogOut className="w-6 h-6 text-red-400" />
            </button>
        </div>
    );
}
