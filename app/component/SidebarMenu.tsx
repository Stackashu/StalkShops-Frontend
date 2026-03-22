import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SidebarMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
    const router = useRouter();
    const [role, setRole] = useState('user');
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const savedRole = localStorage.getItem('role')?.toLowerCase() || 'user';
        setRole(savedRole);
        if (isOpen) {
            fetchProfile(savedRole);
        }
    }, [isOpen]);

    const fetchProfile = async (currentRole: string) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = currentRole === 'vendor' ? '/api/vendor' : '/api/user';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(data.userFound || data.vendorFound);
            }
        } catch (err) {
            console.error("Failed to fetch sidebar profile:", err);
        }
    };

    const MENU_ITEMS = [
        { name: 'Profile', path: `/${role}/profile` },
        { name: 'Change Password', path: `/${role}/change-password` },
        { name: 'Settings', path: `/${role}/settings` },
        { name: 'Subscriptions', path: `/${role}/manage-subscriptions` },
        { name: 'Orders', path: `/${role}/orders` },
    ];
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
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-100 overflow-hidden shrink-0">
                            {profile?.profileImage ? (
                                <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold text-2xl">SS</span>
                            )}
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-lg font-black text-gray-900 truncate">{profile?.name || 'StalkShops User'}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{role}</span>
                        </div>
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
