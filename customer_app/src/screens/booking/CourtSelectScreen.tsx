import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { courtService } from '../../services/api';

export default function CourtSelectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { venueId, courtId, courtName } = route.params || {};
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If courtId passed directly, skip selection
    if (courtId) {
      navigation.replace('SlotSelect', { venueId, courtId, courtName });
      return;
    }
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      const data = await courtService.getByVenue(venueId);
      setCourts(Array.isArray(data) ? data : data?.results || []);
    } catch {
      Alert.alert('Error', 'Could not load courts');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#0A1F35] items-center justify-center">
      <ActivityIndicator size="large" color="#DA6F2B" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">Select Court</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        {courts.map(court => (
          <TouchableOpacity
            key={court.id}
            onPress={() => navigation.navigate('SlotSelect', { venueId, courtId: court.id, courtName: court.name, pricePerHour: court.price_per_hour })}
            className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-5 flex-row items-center justify-between"
            activeOpacity={0.85}
          >
            <View className="flex-1">
              <Text className="text-white font-bold text-base">{court.name}</Text>
              <Text className="text-[#94a3b8] text-xs mt-0.5">{court.sport_type}</Text>
              {court.surface_type && (
                <Text className="text-[#94a3b8] text-xs">{court.surface_type} surface</Text>
              )}
            </View>
            <View className="items-end mr-3">
              <Text className="text-[#DA6F2B] font-bold text-lg">₹{court.price_per_hour}</Text>
              <Text className="text-[#94a3b8] text-xs">per hour</Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
