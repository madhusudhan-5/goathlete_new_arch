import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Award, Trophy } from 'lucide-react-native';

export default function MatchAwardsScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">Match Awards</Text>
      </View>
      <ScrollView className="p-5">
        <View className="items-center py-10">
          <View className="w-24 h-24 rounded-full bg-[#DA6F2B] items-center justify-center mb-6 shadow-lg"
            style={{ shadowColor: '#DA6F2B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 }}>
            <Award size={48} color="#fff" />
          </View>
          <Text className="text-white font-bold text-2xl mb-2">Man of the Match</Text>
          <Text className="text-[#DA6F2B] text-xl font-bold mb-4">Player Name</Text>
          <Text className="text-[#94a3b8] text-center mb-10">Outstanding performance in the finals.</Text>
          
          <View className="bg-[#112B47] w-full p-5 rounded-2xl border border-[#1e3a5f]">
            <Text className="text-white font-bold mb-4">Other Awards</Text>
            <View className="flex-row items-center mb-3">
              <Trophy size={16} color="#fbbf24" />
              <Text className="text-white ml-3">Best Bowler: Player Y</Text>
            </View>
            <View className="flex-row items-center">
              <Trophy size={16} color="#fbbf24" />
              <Text className="text-white ml-3">Best Fielder: Player Z</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
