import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Users, Plus, MapPin, Clock } from 'lucide-react-native';
import { openMatchService } from '../../services/api';

export default function OpenMatchesScreen() {
  const navigation = useNavigation<any>();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await openMatchService.getAll();
      setMatches(Array.isArray(data) ? data : data?.results || []);
    } catch { setMatches([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleJoin = async (match: any) => {
    if (match.filled_spots >= match.total_spots) {
      Alert.alert('Match Full', 'This match is already full.');
      return;
    }
    // Navigate to confirm booking screen bypassing razorpay
    navigation.navigate('BookingConfirm', {
      venueId: match.venue,
      courtId: match.venue, // Using venue ID as placeholder
      courtName: `${match.sport_name} Match - ${match.venue_name}`,
      date: match.date,
      startTime: match.start_time,
      duration: match.duration_hours,
      pricePerHour: match.price_per_player,
      total: match.price_per_player, // Flat rate
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl flex-1">Join a Match</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateOpenMatch')} className="bg-[#DA6F2B] rounded-full px-4 py-2 flex-row items-center">
          <Plus size={14} color="#fff" />
          <Text className="text-white text-xs font-bold ml-1">Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#DA6F2B" /></View> : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DA6F2B" />} contentContainerStyle={{ padding: 20, gap: 12 }}>
          {matches.length === 0 ? (
            <View className="items-center py-16">
              <Text style={{ fontSize: 64 }} className="mb-4">🏃</Text>
              <Text className="text-white font-bold text-xl mb-2">No open matches</Text>
              <Text className="text-[#94a3b8] text-sm text-center mb-6">Be the first to create one and invite others to join!</Text>
            </View>
          ) : matches.map(m => (
            <View key={m.id} className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-4">
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-white font-bold text-base">{m.sport_name} Match</Text>
                  <Text className="text-[#94a3b8] text-xs mt-0.5">{m.skill_level || 'All Skill Levels'}</Text>
                </View>
                <View className="bg-green-500/20 rounded-full px-3 py-1">
                  <Text className="text-green-400 text-[10px] font-bold">{m.total_spots - m.filled_spots} spots left</Text>
                </View>
              </View>
              
              <View className="flex-row items-center mb-2">
                <MapPin size={14} color="#94a3b8" />
                <Text className="text-[#94a3b8] text-sm ml-2">{m.venue_name}</Text>
              </View>
              <View className="flex-row items-center mb-4">
                <Clock size={14} color="#94a3b8" />
                <Text className="text-[#94a3b8] text-sm ml-2">{m.date} • {m.start_time} ({m.duration_hours}h)</Text>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-[#1e3a5f]">
                <View className="flex-row items-center">
                  <Users size={16} color="#DA6F2B" />
                  <Text className="text-white font-bold text-sm ml-2">{m.filled_spots}/{m.total_spots} Joined</Text>
                </View>
                <TouchableOpacity onPress={() => handleJoin(m)} className="bg-[#DA6F2B] rounded-xl px-6 py-2" activeOpacity={0.85}>
                  <Text className="text-white font-bold">Join for ₹{m.price_per_player}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
