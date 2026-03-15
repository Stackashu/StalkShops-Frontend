'use client';

import React from 'react';
import MobileLayout from '../MobileLayout';
import { Bell, Shield, Smartphone, Globe, Info, Heart } from 'lucide-react';

export default function SettingsModule() {
    return (
        <MobileLayout title="Settings">
            <div className="p-6 font-bitter">
                <h2 className="text-xs font-bold text-gray-400 uppercase mb-4 ml-1">General Settings</h2>
                <div className="bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100">
                    <SettingItem icon={<Bell className="text-blue-500" />} label="Push Notifications" toggle />
                    <SettingItem icon={<Shield className="text-green-500" />} label="Privacy & Security" />
                    <SettingItem icon={<Smartphone className="text-purple-500" />} label="Display Preferences" />
                </div>

                <h2 className="text-xs font-bold text-gray-400 uppercase mt-10 mb-4 ml-1">Account Info</h2>
                <div className="bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100">
                    <SettingItem icon={<Globe className="text-orange-500" />} label="Language" value="English" />
                    <SettingItem icon={<Info className="text-gray-500" />} label="App Version" value="1.0.4 r1" />
                </div>

                <div className="mt-12 flex flex-col items-center">
                    <div className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                        Made with <Heart size={14} className="text-red-500 fill-red-500" /> by StalkShops Team
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}

function SettingItem({ icon, label, toggle, value }: any) {
    const [isEnabled, setIsEnabled] = React.useState(true);

    return (
        <div className="flex items-center justify-between p-5 hover:bg-gray-100/50 transition-colors border-b border-white last:border-0 cursor-pointer font-bitter">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    {icon}
                </div>
                <span className="font-semibold text-gray-900">{label}</span>
            </div>
            
            {toggle ? (
                <button 
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${isEnabled ? 'bg-red-500' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${isEnabled ? 'left-7' : 'left-1'}`} />
                </button>
            ) : value ? (
                <span className="text-sm font-bold text-gray-400">{value}</span>
            ) : (
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                </div>
            )}
        </div>
    );
}
