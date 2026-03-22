import { User, LogOut } from 'lucide-react';
import React from 'react';

interface TopBarProps {
    onMenuClick?: () => void;
    onOpenSidebar?: () => void;
    onOpenSearch?: () => void;
    onLogout?: () => void;
    userName?: string;
    middleAction?: React.ReactNode;
}

export default function TopBar({ onMenuClick, onOpenSidebar, onOpenSearch, onLogout, userName, middleAction }: TopBarProps) {
    // Handle both vendor and user prop names
    const handleMenuClick = onOpenSidebar || onMenuClick;

    return (
        <div className="flex items-center gap-3 w-full">
            {/* Profile Icon */}
            <button
                onClick={handleMenuClick}
                className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
                <User className="w-6 h-6 text-gray-500" />
            </button>

            {/* Search Bar / middleAction */}
            {middleAction ? (
                <div className="flex-1 h-12 flex items-center">
                    {middleAction}
                </div>
            ) : (
                <div className="flex-1 h-12 bg-white rounded-full shadow-lg flex items-center px-5 text-gray-500 transition-colors border border-gray-100 overflow-hidden">
                    <span className="text-sm truncate">
                        {userName ? `Hi, ${userName}` : 'Search Samosa , chai ....'}
                    </span>
                </div>
            )}

            {/* Logout Icon (top right) */}
            {onLogout && (
                <button 
                    onClick={onLogout}
                    className="shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                    <LogOut className="w-6 h-6 text-red-400" />
                </button>
            )}
        </div>
    );
}
