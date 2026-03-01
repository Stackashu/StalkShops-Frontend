import React from 'react';
import Link from 'next/link';

const SignUpPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white px-8 pt-12 pb-10">

            {/* Logo / Title */}
            <h1 className="mainTextColor text-4xl font-bold tracking-widest mb-8">STALK SHOPS</h1>

            {/* Sign Up Heading */}
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Sign Up</h2>

            {/* Form */}
            <div className="flex flex-col gap-6">

                {/* First Name + Last Name */}
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-sm font-semibold text-gray-800">First Name</label>
                        <input
                            type="text"
                            placeholder="First Name"
                            className="border-b border-gray-300 outline-none py-2 text-sm text-gray-400 bg-transparent"
                        />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-sm font-semibold text-gray-800">Last Name</label>
                        <input
                            type="text"
                            placeholder="Last Name"
                            className="border-b border-gray-300 outline-none py-2 text-sm text-gray-400 bg-transparent"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-800">Email</label>
                    <input
                        type="email"
                        placeholder="Enter your Email"
                        className="border-b border-gray-300 outline-none py-2 text-sm text-gray-400 bg-transparent"
                    />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-800">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="border-b border-gray-300 outline-none py-2 text-sm text-gray-400 bg-transparent"
                    />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-800">Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Confirm your password"
                        className="border-b border-gray-300 outline-none py-2 text-sm text-gray-400 bg-transparent"
                    />
                </div>

                {/* Sign Up Button */}
                <button className="mainBgColor text-white font-semibold py-4 rounded-full text-base w-full mt-2 hover:opacity-90 transition-opacity">
                    Sign Up
                </button>

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
