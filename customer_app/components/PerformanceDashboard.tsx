import React from 'react';
import { View, Text } from 'react-native';
import { ChevronRight, ArrowUp } from 'lucide-react-native';

interface PerformanceDashboardProps {
    matchesPlayed: number;
    winRate: number;
    cityRank: number;
    isDark: boolean;
}

export function PerformanceDashboard({ matchesPlayed, winRate, cityRank, isDark }: PerformanceDashboardProps) {
    return (
        <View
            className={`w-full rounded-2xl flex-col ${isDark ? 'bg-[#112B47] border border-[#1e3a5f]' : 'bg-[#0A1F35]'}`}
            style={{
                shadowColor: isDark ? '#000000' : '#0A1F35',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isDark ? 0.4 : 0.2,
                shadowRadius: 20,
                elevation: 10,
            }}
        >
            <View className="flex-row w-full justify-between items-center px-5 py-4">
                <Text className="text-white font-[SpaceGrotesk_700Bold] text-sm">
                    Player Performance
                </Text>
                <View className="flex-row items-center gap-1">
                    <Text className="text-[#DA6F2B] font-[Manrope_600SemiBold] text-xs">
                        View Stats
                    </Text>
                    <ChevronRight size={14} color="#DA6F2B" />
                </View>
            </View>

            <View className="flex-row w-full justify-between items-center px-5 pb-5">

                <View className="flex-col items-center gap-1">
                    <Text className="text-white font-[SpaceGrotesk_700Bold] text-2xl">{matchesPlayed}</Text>
                    <Text className="text-[#94a3b8] font-[Manrope_500Medium] text-xs">Matches</Text>
                </View>

                <View className="flex-col items-center gap-1">
                    <Text className="text-white font-[SpaceGrotesk_700Bold] text-2xl">{winRate}%</Text>
                    <Text className="text-[#94a3b8] font-[Manrope_500Medium] text-xs">Win Rate</Text>
                </View>

                <View className="flex-col items-center gap-1">
                    <View className="flex-row items-center gap-1">
                        <Text className="text-white font-[SpaceGrotesk_700Bold] text-2xl">{cityRank}</Text>
                        <ArrowUp size={14} color="#DA6F2B" />
                    </View>
                    <Text className="text-[#94a3b8] font-[Manrope_500Medium] text-xs">City Rank</Text>
                </View>

            </View>
        </View>
    );
}
