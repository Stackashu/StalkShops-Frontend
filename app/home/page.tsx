'use client';

import { useEffect, useState } from 'react';
import VendorHome from '../vendor/VendorHome';
import UserHome from '../user/UserHome';
// import VendorHome from '../vendor/VendorHome';
// import UserHome from '../user/UserHome';

export default function Home() {
    const [role, setRole] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedRole = localStorage.getItem('role') || 'User';
        setRole(savedRole);
    }, []);

    console.log("renderd");
    if (!mounted) return null;

    if (role === 'Vendor') {
        return <VendorHome />;
    }

    return <UserHome />;
}