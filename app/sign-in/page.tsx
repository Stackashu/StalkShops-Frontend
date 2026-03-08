import React from 'react';
import Link from 'next/link';

const SignInPage = () => {
    return (
        <div className="flex flex-col min-h-dvh bg-gray-100">
            {/* Red Header */}
            <div className="mainBgColor h-dvh flex items-center justify-center flex-1 ">
                <h1 className="text-white text-4xl font-bold tracking-widest pt-16 h-[250px]">STALK SHOPS</h1>
            </div>

            {/* White Card Panel */}
            <div className="bg-white rounded-t-[40px] flex-1 px-8 py-12 -mt-20 flex flex-col gap-6">

                {/* Title */}
                <h2 className="text-3xl font-semibold text-gray-900">Sign In</h2>

                {/* Form */}
                <div className="flex flex-col gap-6 mt-2">
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-800">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your Email"
                            className="border-b border-gray-300 outline-none py-2 text-sm text-gray-500 bg-transparent"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-800">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="border-b border-gray-300 outline-none py-2 text-sm text-gray-500 bg-transparent"
                        />
                        <div className="flex justify-end mt-1">
                            <a href="#" className="text-xs text-gray-500 hover:underline">Forgot Password?</a>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Link href="/home">
                        <button className="mainBgColor text-white font-semibold py-4 rounded-full text-base w-full mt-2 hover:opacity-90 transition-opacity">
                            Submit
                        </button>
                    </Link>

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

                    {/* Navigate to Sign Up */}
                    <p className="text-center text-sm text-gray-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/sign-up" className="mainTextColor font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
