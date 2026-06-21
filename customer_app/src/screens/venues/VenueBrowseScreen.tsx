import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
  TextInput, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, MapPin, Filter, Star } from 'lucide-react-native';
import { venueService } from '../../services/api';

export default function VenueBrowseScreen() {
  const navigation = useNavigation<any>();
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSport, setActiveSport] = useState('All');
  const searchTimer = useRef<NodeJS.Timeout>();

  const sports = ['All', 'Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball'];

  const loadVenues = async (q?: string) => {
    try {
      const params: any = {};
      if (q) params.search = q;
      if (activeSport !== 'All') params.sport = activeSport.toUpperCase();
      const data = await venueService.getAll(params);
      setVenues(Array.isArray(data) ? data : data?.results || []);
    } catch (e) {
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVenues(); }, [activeSport]);

  const handleSearch = (text: string) => {
    setSearch(text);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadVenues(text), 500);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVenues(search);
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl flex-1">Find a Venue</Text>
      </View>

      {/* Search */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-[#112B47] rounded-xl border border-[#1e3a5f] px-4 py-3">
          <Search size={18} color="#94a3b8" />
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Search venues, cities..."
            placeholderTextColor="#475569"
            style={{ flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 14 }}
          />
        </View>
      </View>

      {/* Sport Filter */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {sports.map(sport => (
            <TouchableOpacity
              key={sport}
              onPress={() => setActiveSport(sport)}
              className={`px-4 py-2 rounded-full border ${activeSport === sport ? 'bg-[#DA6F2B] border-[#DA6F2B]' : 'bg-[#112B47] border-[#1e3a5f]'}`}
            >
              <Text className={`text-sm font-semibold ${activeSport === sport ? 'text-white' : 'text-[#94a3b8]'}`}>{sport}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#DA6F2B" size="large" />
        </View>
      ) : (
        <FlatList
          data={venues}
          keyExtractor={item => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DA6F2B" />}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text style={{ fontSize: 48 }} className="mb-4">🏟️</Text>
              <Text className="text-white font-bold text-lg mb-2">No venues found</Text>
              <Text className="text-[#94a3b8] text-sm text-center">Try a different search or sport</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('VenueDetail', { id: item.id })}
              className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] overflow-hidden"
              activeOpacity={0.85}
            >
              <View className="h-32 bg-[#1e3a5f] items-center justify-center">
                <Text style={{ fontSize: 48 }}>🏟️</Text>
              </View>
              <View className="p-4">
                <Text className="text-white font-bold text-base">{item.name}</Text>
                <View className="flex-row items-center mt-1 mb-2">
                  <MapPin size={12} color="#94a3b8" />
                  <Text className="text-[#94a3b8] text-xs ml-1">{item.address}, {item.city}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row gap-1">
                    {(item.courts || []).slice(0, 3).map((c: any, i: number) => (
                      <View key={i} className="bg-[#0A1F35] rounded-full px-2 py-0.5">
                        <Text className="text-[#94a3b8] text-[10px]">{c.sport_type}</Text>
                      </View>
                    ))}
                  </View>
                  {item.courts?.[0] && (
                    <Text className="text-[#DA6F2B] text-sm font-bold">₹{item.courts[0].price_per_hour}/hr</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
