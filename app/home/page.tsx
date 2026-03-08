'use client';

import { useEffect, useState } from 'react';
import VendorHome from '../Vendor/VendorHome';
import UserHome from '../User/UserHome';
// import VendorHome from '../Vendor/VendorHome';
// import UserHome from '../User/UserHome';

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