import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SidebarMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
    const router = useRouter();
    const [role, setRole] = useState('User');

    useEffect(() => {
        const savedRole = localStorage.getItem('role')?.toLowerCase() || 'User';
        setRole(savedRole);
    }, [isOpen]);

    const MENU_ITEMS = [
        { name: 'Profile', path: `/${role}/profile` },
        { name: 'Change Password', path: `/${role}/change-password` },
        { name: 'Settings', path: `/${role}/settings` },
        { name: 'Subscriptions', path: `/${role}/manage-subscriptions` },
        { name: 'Orders', path: `/${role}/orders` },
    ];
    return (
        <>
            {/* ... backdrop ... */}
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
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-red-100">
                        <span className="text-white font-bold text-2xl">SS</span>
                    </div>

                    <nav className="flex flex-col">
                        {MENU_ITEMS.map((item, index) => (
                            <Link
                                key={index}
                                href={item.path}
                                className="text-left py-4 border-b border-gray-50 text-lg font-bold text-gray-800 hover:text-red-600 transition-colors"
                                onClick={onClose}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <button
                            className="text-left py-4 border-b border-gray-50 text-lg font-bold text-gray-400"
                            onClick={onClose}
                        >
                            Privacy Policy
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-6 flex justify-end">
                    <button 
                        onClick={() => {
                            router.push(`/${role}/support`);
                            onClose();
                        }}
                        className="flex flex-col items-center gap-1 hover:text-red-600 transition-all active:scale-90"
                    >
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
