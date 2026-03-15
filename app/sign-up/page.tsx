"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const SignUpPage = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'user' | 'vendor'>('user');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dob: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async () => {
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const endpoint = role === 'user' ? '/api/user/signup' : '/api/vendor/signup';

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    dob: formData.dob,
                    password: formData.password,
                    role: role
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Account created successfully!");
                router.push('/sign-in');
            } else {
                toast.error(data.error || data.message || "Failed to sign up");
            }
        } catch (err) {
            toast.error("Could not connect to the server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white px-8 pt-12 pb-10">

            {/* Logo / Title */}
            <h1 className="mainTextColor text-4xl font-bold tracking-widest mb-8 text-center">STALK SHOPS</h1>

            {/* Sign Up Heading */}
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">Sign Up</h2>
            <p className="text-gray-500 mb-6 text-sm">Create your account to get started</p>

            {/* Form */}
            <div className="flex flex-col gap-6">

                {step === 1 ? (
                    <>
                        {/* Role Selection */}
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-full mb-2">
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

                        {/* First Name + Last Name */}
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1 flex-1">
                                <label className="text-sm font-semibold text-gray-800">First Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    className="border-b border-gray-300 outline-none py-2 text-sm text-gray-900 bg-transparent focus:border-[#fd3131] transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                                <label className="text-sm font-semibold text-gray-800">Last Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    className="border-b border-gray-300 outline-none py-2 text-sm text-gray-900 bg-transparent focus:border-[#fd3131] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-800">Email <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your Email"
                                className="border-b border-gray-300 outline-none py-2 text-sm text-gray-900 bg-transparent focus:border-[#fd3131] transition-colors"
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-800">Phone <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your Phone Number"
                                className="border-b border-gray-300 outline-none py-2 text-sm text-gray-900 bg-transparent focus:border-[#fd3131] transition-colors"
                            />
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.email || !formData.firstName || !formData.phone}
                            className="mainBgColor text-white font-semibold py-4 rounded-full text-base w-full mt-4 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            Next
                        </button>
                    </>
                ) : (
                    <>
                        {/* Address */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-800">Address <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your Address"
                                className="border-b border-gray-300 outline-none py-2 text-sm text-gray-900 bg-transparent focus:border-[#fd3131] transition-colors"
                            />
                        </div>

                        {/* DOB */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-800">Date of Birth {role === 'vendor' && <span className="text-red-500">*</span>}</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
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
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-800">Confirm Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="border-b border-gray-300 outline-none py-2 text-sm text-gray-900 bg-transparent focus:border-[#fd3131] transition-colors w-full pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="border border-gray-300 text-gray-700 font-semibold py-4 rounded-full text-base flex-1 hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSignUp}
                                disabled={loading || !formData.password || !formData.address || (role === 'vendor' && !formData.dob)}
                                className="mainBgColor text-white font-semibold py-4 rounded-full text-base flex-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? 'Signing Up...' : 'Sign Up'}
                            </button>
                        </div>
                    </>
                )}

                {/* OR Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-xs font-bold text-gray-500 tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-gray-300" />
                </div>

                {/* Google Button */}
                <button className="border border-gray-800 text-gray-900 font-bold py-4 rounded-full text-base w-full hover:bg-gray-50 transition-colors">
                    Google
                </button>

                {/* Navigate to Sign In */}
                <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/sign-in" className="mainTextColor font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;
