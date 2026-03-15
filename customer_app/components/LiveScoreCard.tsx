import React from 'react';
import { View, Text } from 'react-native';

interface LiveScoreCardProps {
    leagueName: string;
    team1: string;
    team2: string;
    score: string;
    status: string;
    isDark: boolean;
}

export function LiveScoreCard({ leagueName, team1, team2, score, status, isDark }: LiveScoreCardProps) {
    const textColor = isDark ? 'text-white' : 'text-[#0A1F35]';

    return (
        <View className="w-full">
            <Text className={`font-[SpaceGrotesk_700Bold] text-base mb-3 ${textColor}`}>
                Live Matches
            </Text>

            <View
                className="w-full bg-[#DA6F2B] rounded-2xl p-4 flex-col gap-3"
                style={{
                    shadowColor: '#DA6F2B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 14,
                    elevation: 8,
                }}
            >
                <View className="flex-row w-full justify-between items-center">
                    <Text className="text-white font-[Manrope_600SemiBold] text-xs">
                        {leagueName}
                    </Text>
                    <View className="bg-white rounded pl-1.5 pr-2 py-0.5 flex-row items-center gap-1">
                        <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <Text className="text-red-500 font-[SpaceGrotesk_700Bold] text-[10px]">
                            {status}
                        </Text>
                    </View>
                </View>

                <View className="flex-row w-full justify-between items-center">
                    <Text className="text-white font-[SpaceGrotesk_700Bold] text-lg flex-1">
                        {team1}
                    </Text>
                    <Text className="text-[#0A1F35] font-[SpaceGrotesk_700Bold] text-2xl px-4">
                        {score}
                    </Text>
                    <Text className="text-white font-[SpaceGrotesk_700Bold] text-lg flex-1 text-right">
                        {team2}
                    </Text>
                </View>
            </View>
        </View>
    );
}
