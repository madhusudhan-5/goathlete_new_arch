import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Package, Trophy, Activity } from 'lucide-react-native';

interface QuickActionGridProps {
    isDark: boolean;
}

export function QuickActionGrid({ isDark }: QuickActionGridProps) {
    const bgColor = isDark ? 'bg-[#112B47] border-[#1e3a5f]' : 'bg-[#f8f9fa] border-[#e2e8f0]';
    const textColor = isDark ? 'text-white' : 'text-[#0A1F35]';

    return (
        <View className="w-full">
            <Text className={`font-[SpaceGrotesk_700Bold] text-base mb-3 ${textColor}`}>
                Quick Actions
            </Text>

            <View className="flex-row flex-wrap justify-between w-full">
                {/* Book Venue */}
                <TouchableOpacity className={`w-[48%] h-24 rounded-2xl border p-4 justify-between mb-3 ${bgColor}`}>
                    <View className="w-8 h-8 rounded-lg bg-[#0A1F35] items-center justify-center">
                        <MapPin size={16} color="#FFFFFF" />
                    </View>
                    <Text className={`font-[SpaceGrotesk_700Bold] text-sm ${textColor}`}>Book Venue</Text>
                </TouchableOpacity>

                {/* Rent Gear */}
                <TouchableOpacity className={`w-[48%] h-24 rounded-2xl border p-4 justify-between mb-3 ${bgColor}`}>
                    <View className="w-8 h-8 rounded-lg bg-[#DA6F2B] items-center justify-center">
                        <Package size={16} color="#FFFFFF" />
                    </View>
                    <Text className={`font-[SpaceGrotesk_700Bold] text-sm ${textColor}`}>Rent Gear</Text>
                </TouchableOpacity>

                {/* Tournaments */}
                <TouchableOpacity className={`w-[48%] h-24 rounded-2xl border p-4 justify-between ${bgColor}`}>
                    <View className="w-8 h-8 rounded-lg bg-[#0A1F35] items-center justify-center">
                        <Trophy size={16} color="#FFFFFF" />
                    </View>
                    <Text className={`font-[SpaceGrotesk_700Bold] text-sm ${textColor}`}>Tournaments</Text>
                </TouchableOpacity>

                {/* Live Scores */}
                <TouchableOpacity className={`w-[48%] h-24 rounded-2xl border p-4 justify-between ${bgColor}`}>
                    <View className="w-8 h-8 rounded-lg bg-[#DA6F2B] items-center justify-center">
                        <Activity size={16} color="#FFFFFF" />
                    </View>
                    <Text className={`font-[SpaceGrotesk_700Bold] text-sm ${textColor}`}>Live Scores</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
