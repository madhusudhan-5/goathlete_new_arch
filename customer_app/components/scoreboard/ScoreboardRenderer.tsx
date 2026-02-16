import React from 'react';
import { View, Text } from 'react-native';

interface ScoreboardRendererProps {
    template: any;
    score: any;
}

export default function ScoreboardRenderer({ template, score }: ScoreboardRendererProps) {
    if (!template || !score) return null;

    const { sport_code } = template;

    // Use specific renderer based on sport code, falling back to generic
    switch (sport_code) {
        case 'CRICKET':
            return <CricketScoreboard template={template} score={score} />;
        case 'FOOTBALL':
            return <FootballScoreboard template={template} score={score} />;
        default:
            return <GenericScoreboard template={template} score={score} />;
    }
}

function CricketScoreboard({ template, score }: ScoreboardRendererProps) {
    // Extract key stats based on template "scoring_fields"
    // Assuming score structure matches the template keys
    // Example: score = { innings: [{ team: 'A', runs: 120, wickets: 3, overs: 15.2 }] }

    const currentInning = score.current_inning || {};
    const battingTeam = currentInning.batting_team || 'Team';

    return (
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-end mb-4">
                <View>
                    <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">BATTING</Text>
                    <Text className="text-3xl font-bold text-gray-900">
                        {currentInning.runs}/{currentInning.wickets}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">OVERS</Text>
                    <Text className="text-3xl font-bold text-gray-900">{currentInning.overs}</Text>
                </View>
            </View>

            <View className="bg-gray-50 p-3 rounded-lg flex-row justify-between">
                <View>
                    <Text className="text-gray-400 text-xs font-bold">CRR</Text>
                    <Text className="text-gray-800 font-bold">{currentInning.crr || '0.0'}</Text>
                </View>
                <View>
                    <Text className="text-gray-400 text-xs font-bold">RR</Text>
                    <Text className="text-gray-800 font-bold">{currentInning.rrr || '-'}</Text>
                </View>
                <View>
                    <Text className="text-gray-400 text-xs font-bold">TARGET</Text>
                    <Text className="text-gray-800 font-bold">{currentInning.target || '-'}</Text>
                </View>
            </View>

            <View className="mt-4 pt-4 border-t border-gray-100">
                <Text className="text-center text-primary font-medium">
                    {currentInning.summary_text || `${battingTeam} needs ${currentInning.runs_needed || 0} runs to win`}
                </Text>
            </View>
        </View>
    );
}

function FootballScoreboard({ template, score }: ScoreboardRendererProps) {
    // Example score: { home_goals: 2, away_goals: 1, time: '75:00' }
    return (
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
            <Text className="text-red-500 font-bold mb-2">{score.match_time || "00:00"}</Text>

            <View className="flex-row items-center justify-center w-full mb-4">
                <Text className="text-5xl font-bold text-gray-900">{score.team_a_score || 0}</Text>
                <Text className="text-2xl text-gray-300 mx-6 font-light">-</Text>
                <Text className="text-5xl font-bold text-gray-900">{score.team_b_score || 0}</Text>
            </View>

            <View className="flex-row space-x-2">
                {/* Example cards/stats rendering */}
                {score.events?.map((event: any, idx: number) => (
                    <Text key={idx} className="text-xs text-gray-500">
                        {event.time}' {event.player_name} ({event.type})
                    </Text>
                ))}
            </View>
        </View>
    );
}

function GenericScoreboard({ template, score }: ScoreboardRendererProps) {
    const fields = template.scoring_fields || {};

    return (
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <Text className="text-center font-bold text-gray-400 mb-4 uppercase tracking-widest">{template.sport_name}</Text>
            <View className="flex-row flex-wrap">
                {Object.keys(fields).map((key) => (
                    <View key={key} className="w-1/2 p-2">
                        <Text className="text-gray-500 text-xs uppercase font-bold">{fields[key].label}</Text>
                        <Text className="text-xl font-bold">{score[key] || '-'}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
