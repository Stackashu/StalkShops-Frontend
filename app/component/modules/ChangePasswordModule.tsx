'use client';

import React, { useState } from 'react';
import MobileLayout from '../MobileLayout';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function ChangePasswordModule() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error("New passwords don't match");
        }

        setLoading(true);
        try {
            const role = localStorage.getItem('role') || 'User';
            const endpoint = role === 'Vendor' ? '/api/vendor/changePassword' : '/api/user/changePassword';
            const token = localStorage.getItem('token');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Password updated successfully");
                router.back();
            } else {
                toast.error(data.error || "Failed to update password");
            }
        } catch (err) {
            toast.error("Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout title="Security">
            <div className="p-6 font-bitter">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                    <p className="text-gray-500 text-sm text-center mt-1">
                        Ensure your account is using a strong password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <PasswordField
                        label="Current Password"
                        value={formData.oldPassword}
                        show={showOld}
                        setShow={setShowOld}
                        onChange={(val: string) => setFormData({ ...formData, oldPassword: val })}
                    />

                    <div className="h-px bg-gray-100 my-2" />

                    <PasswordField
                        label="New Password"
                        value={formData.newPassword}
                        show={showNew}
                        setShow={setShowNew}
                        onChange={(val: string) => setFormData({ ...formData, newPassword: val })}
                    />

                    <PasswordField
                        label="Confirm New Password"
                        value={formData.confirmPassword}
                        show={showNew}
                        setShow={setShowNew}
                        onChange={(val: string) => setFormData({ ...formData, confirmPassword: val })}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 mt-8 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Updating...' : <><ShieldCheck size={20} /> Update Password</>}
                    </button>
                </form>
            </div>
        </MobileLayout>
    );
}

function PasswordField({ label, value, show, setShow, onChange }: any) {
    return (
        <div className="font-bitter">
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block ml-1">{label}</label>
            <div className="relative group">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-100 p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all font-medium"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>
    );
}
