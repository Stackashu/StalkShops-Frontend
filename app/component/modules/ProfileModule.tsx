'use client';

import React, { useState, useEffect } from 'react';
import MobileLayout from '../MobileLayout';
import { User as UserIcon, Mail, Phone, MapPin, Edit2, Check, X, Calendar, Hash, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProfileModule() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        const savedRole = (localStorage.getItem('role') || 'user').toLowerCase();
        const token = localStorage.getItem('token');
        setRole(savedRole);
        fetchProfile(savedRole, token);
    }, []);

    const fetchProfile = async (currentRole: string, token: string | null) => {
        try {
            const endpoint = currentRole === 'vendor' ? '/api/vendor' : '/api/user';
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (response.ok) {
                const actualData = data.userFound || data.vendorFound;
                setUserData(actualData);
                setFormData(actualData);
            } else {
                toast.error(data.error || "Failed to fetch profile");
            }
        } catch (err) {
            toast.error("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = role === 'vendor' ? '/api/vendor/updateVendor' : '/api/user/updateUser';
            const payload = role === 'vendor' ? formData : { userData: formData, ...formData };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                setUserData(formData);
                setIsEditing(false);
                toast.success("Profile updated successfully");
            } else {
                toast.error(data.error || "Update failed");
            }
        } catch (err) {
            toast.error("Connection error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-40 font-bitter">Loading Profile...</div>;

    return (
        <MobileLayout
            title="Profile"
            rightAction={
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={saving}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-800 active:scale-90 transition-all disabled:opacity-50"
                >
                    {isEditing ? (saving ? '...' : <Check size={20} className="text-green-600" />) : <Edit2 size={20} />}
                </button>
            }
        >
            <div className="p-6">
                <div className="flex flex-col items-center mb-8 font-bitter">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg overflow-hidden relative">
                        {userData?.profileImage ? (
                            <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-12 h-12 text-red-500" />
                        )}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-[10px] font-bold">
                                CHANGE
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{userData?.name || 'User'}</h2>
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{role}</span>
                </div>

                <div className="space-y-6">
                    <Field
                        label="Full Name"
                        value={formData?.name}
                        isEditing={isEditing}
                        onChange={(val: string) => setFormData({ ...formData, name: val })}
                        icon={<UserIcon size={20} />}
                    />
                    <Field
                        label="Email Address"
                        value={formData?.email}
                        isEditing={false}
                        icon={<Mail size={20} />}
                    />
                    <Field
                        label="Phone Number"
                        value={formData?.phone}
                        isEditing={isEditing}
                        onChange={(val: string) => setFormData({ ...formData, phone: val })}
                        icon={<Phone size={20} />}
                    />
                    <Field
                        label="Address"
                        value={formData?.address}
                        isEditing={isEditing}
                        onChange={(val: string) => setFormData({ ...formData, address: val })}
                        icon={<MapPin size={20} />}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            label="DOB"
                            value={formData?.dob ? new Date(formData.dob).toLocaleDateString() : 'Not provided'}
                            isEditing={false}
                            icon={<Calendar size={20} />}
                        />
                        <Field
                            label="Pins Left"
                            value={formData?.pins?.toString() || '0'}
                            isEditing={false}
                            icon={<Hash size={20} />}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            label="Subscription Status"
                            value={formData?.status || 'active'}
                            isEditing={false}
                            icon={<ShieldCheck size={20} />}
                        />
                        <Field
                            label="Current Subscription Ends"
                            value={formData?.trialEndDate ? new Date(formData.trialEndDate).toLocaleDateString() : 'N/A'}
                            isEditing={false}
                            icon={<Clock size={20} />}
                        />
                    </div>
                    {role === 'vendor' && (
                        <Field
                            label="Business Details"
                            value={formData?.businessInfo}
                            isEditing={isEditing}
                            onChange={(val: string) => setFormData({ ...formData, businessInfo: val })}
                            icon={<MapPin size={20} />}
                        />
                    )}
                </div>

                {isEditing && (
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setFormData(userData);
                        }}
                        className="w-full mt-8 py-4 text-gray-500 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 rounded-2xl transition-all font-bitter"
                    >
                        <X size={20} /> Cancel Changes
                    </button>
                )}
            </div>
        </MobileLayout>
    );
}

function Field({ label, value, isEditing, onChange, icon }: any) {
    return (
        <div className="relative font-bitter">
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">{label}</label>
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${isEditing ? 'border-red-200 bg-red-50/10' : 'border-gray-100 bg-gray-50/30'} transition-all`}>
                <div className="text-gray-400 shrink-0">{icon}</div>
                {isEditing ? (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="bg-transparent w-full outline-none text-gray-900 font-medium"
                    />
                ) : (
                    <div className="text-gray-900 font-medium truncate">{value || 'Not provided'}</div>
                )}
            </div>
        </div>
    );
}
