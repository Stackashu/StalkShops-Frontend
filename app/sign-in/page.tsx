"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const SignInPage = () => {
    const router = useRouter();
    const [role, setRole] = useState<'user' | 'vendor'>('user');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');
        if (token) {
            if (savedRole === 'vendor') {
                router.replace('/vendor');
            } else {
                router.replace('/home');
            }
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = role === 'user' ? '/api/user/login' : '/api/vendor/login';
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store token in local storage
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', role);

                toast.success(`Logged in as ${role === 'vendor' ? 'Vendor' : 'User'}!`);

                // Redirect based on role
                if (role === 'vendor') {
                    router.push('/vendor');
                } else {
                    router.push('/home');
                }
            } else {
                toast.error(data.error || data.message || "Invalid credentials");
            }
        } catch (err) {
            toast.error("Could not connect to the server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-dvh bg-gray-100">
            {/* Red Header */}
            <div className="mainBgColor min-h-[20dvh] flex items-center justify-center">
                <h1 className="text-white text-4xl font-bold tracking-widest ">STALK SHOPS</h1>
            </div>

            {/* White Card Panel */}
            <div className="bg-white rounded-t-[40px] flex-1 px-8 py-10 -mt-8 flex flex-col gap-6 shadow-2xl">

                {/* Title */}
                <h2 className="text-3xl font-semibold text-gray-900">Sign In</h2>

                {/* Role Switcher */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-full">
                    <button
                        onClick={() => setRole('user')}
                        className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${role === 'user' ? 'mainBgColor text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        User
                    </button>
                    <button
                        onClick={() => setRole('vendor')}
                        className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${role === 'vendor' ? 'mainBgColor text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Vendor
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="flex flex-col gap-6 mt-2">
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-800">Email <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your Email"
                            className="border-b border-gray-300 outline-none py-2 text-sm text-gray-900 bg-transparent focus:border-[#fd3131] transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-800">Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="border-b border-gray-300 outline-none py-2 text-sm text-gray-900 bg-transparent focus:border-[#fd3131] transition-colors w-full pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-end mt-1">
                            <a href="#" className="text-xs text-gray-500 hover:underline">Forgot Password?</a>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mainBgColor text-white font-semibold py-4 rounded-full text-base w-full mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    {/* OR Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-300" />
                        <span className="text-xs font-bold text-gray-500 tracking-widest">OR</span>
                        <div className="flex-1 h-px bg-gray-300" />
                    </div>

                    {/* Google Button */}
                    <button type="button" className="border border-gray-800 text-gray-900 font-bold py-4 rounded-full text-base w-full hover:bg-gray-50 transition-colors">
                        Google
                    </button>

                    {/* Navigate to Sign Up */}
                    <p className="text-center text-sm text-gray-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/sign-up" className="mainTextColor font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignInPage;
