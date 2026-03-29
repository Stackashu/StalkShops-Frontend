'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainPage from './MainPage';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const startServer = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
          method: 'GET',
        });
      } catch (err) {
        console.error("Failed to ping server:", err);
      }
    };
    startServer();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (token) {
        if (role === 'vendor') {
          router.replace('/vendor');
        } else {
          router.replace('/home');
        }
      } else {
        router.replace('/sign-in');
      }
    }, 3500); 

    return () => clearTimeout(timer);
  }, [mounted, router]);

  return <MainPage />;
}
