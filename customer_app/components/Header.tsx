import React from 'react';
import { View, Text } from 'react-native';
import { Bell } from 'lucide-react-native';

interface HeaderProps {
    userName: string;
    avatarLetter: string;
    isDark: boolean;
}

export function Header({ userName, avatarLetter, isDark }: HeaderProps) {
    return (
        <View className="flex-row w-full justify-between items-center px-5 py-4">
            <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? '#DA6F2B' : '#0A1F35' }}>
                    <Text className="text-white font-[SpaceGrotesk_700Bold] text-lg">{avatarLetter}</Text>
                </View>
                <View className="flex-col gap-0.5">
                    <Text className="text-xl font-[SpaceGrotesk_700Bold] dark:text-white" style={{ color: isDark ? '#FFFFFF' : '#0A1F35' }}>
                        Hi, {userName} 👋
                    </Text>
                    <Text className="text-[#6c757d] dark:text-[#94a3b8] font-[Manrope_500Medium] text-sm">
                        Ready to dominate?
                    </Text>
                </View>
            </View>

            <View className={`w-10 h-10 rounded-full items-center justify-center border ${isDark ? 'bg-[#112B47] border-[#1e3a5f]' : 'bg-[#f8f9fa] border-[#e2e8f0]'}`}>
                <Bell size={18} color={isDark ? '#FFFFFF' : '#0A1F35'} />
            </View>
        </View>
    );
}
