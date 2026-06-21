import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Users, Calendar, MapPin, Trophy } from 'lucide-react-native';
import { tournamentService } from '../../services/api';

export default function TournamentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tournamentService.getById(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SafeAreaView className="flex-1 bg-[#0A1F35] items-center justify-center"><ActivityIndicator color="#DA6F2B" /></SafeAreaView>;

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl flex-1">{data?.name || 'Tournament'}</Text>
      </View>
      <ScrollView className="p-5">
        <View className="bg-[#112B47] p-4 rounded-2xl border border-[#1e3a5f] mb-4">
          <View className="flex-row items-center mb-2">
            <Trophy size={16} color="#DA6F2B" />
            <Text className="text-white font-bold ml-2">{data?.sport_name} Tournament</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <MapPin size={16} color="#94a3b8" />
            <Text className="text-[#94a3b8] ml-2">{data?.location || data?.venue_name}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Calendar size={16} color="#94a3b8" />
            <Text className="text-[#94a3b8] ml-2">{data?.start_date} to {data?.end_date}</Text>
          </View>
          <View className="flex-row items-center">
            <Users size={16} color="#94a3b8" />
            <Text className="text-[#94a3b8] ml-2">{data?.total_teams} / {data?.max_teams} Teams Joined</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Scoreboard', { id })} className="bg-[#DA6F2B] py-3 rounded-xl items-center mb-4">
          <Text className="text-white font-bold">View Scoreboard</Text>
        </TouchableOpacity>
        
        <Text className="text-white font-bold mb-2">Description & Rules</Text>
        <Text className="text-[#94a3b8] leading-5">{data?.description || 'No description provided.'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
