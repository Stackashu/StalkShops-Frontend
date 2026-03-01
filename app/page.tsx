'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainPage from './MainPage';

// ─────────────────────────────────────────────
// 🔑 AUTH KEY — set to true once backend is ready
const IS_LOGGED_IN = false;
// ─────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      if (IS_LOGGED_IN) {
        router.replace('/home');
      } else {
        router.replace('/sign-in');
      }
    }, 3500); 

    return () => clearTimeout(timer);
  }, [mounted, router]);

  return <MainPage />;
}
