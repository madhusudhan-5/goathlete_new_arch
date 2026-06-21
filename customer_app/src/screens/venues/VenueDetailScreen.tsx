import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Clock, Star, Package, ChevronRight } from 'lucide-react-native';
import { venueService, courtService } from '../../services/api';

export default function VenueDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;
  const [venue, setVenue] = useState<any>(null);
  const [courts, setCourts] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      const [v, c] = await Promise.all([
        venueService.getById(id),
        courtService.getByVenue(id),
      ]);
      setVenue(v);
      const courtList = Array.isArray(c) ? c : c?.results || [];
      setCourts(courtList);
      // Equipment from venue JSON field
      setEquipment(v.equipment_rental || []);
    } catch {
      Alert.alert('Error', 'Could not load venue details');
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="h-52 bg-[#1e3a5f] items-center justify-center relative">
          <Text style={{ fontSize: 72 }}>🏟️</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-4 left-4 w-10 h-10 bg-black/40 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          {venue?.status === 'REGISTERED' && (
            <View className="absolute top-4 right-4 bg-green-500/90 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-bold">Verified ✓</Text>
            </View>
          )}
        </View>

        <View className="px-5 pt-5">
          {/* Name & Location */}
          <Text className="text-white font-bold text-2xl mb-1">{venue?.name}</Text>
          <View className="flex-row items-center mb-4">
            <MapPin size={14} color="#94a3b8" />
            <Text className="text-[#94a3b8] text-sm ml-1">{venue?.address}, {venue?.city}</Text>
          </View>

          {/* Facilities */}
          {venue?.facilities?.length > 0 && (
            <View className="mb-5">
              <Text className="text-white font-bold text-sm mb-2">Facilities</Text>
              <View className="flex-row flex-wrap gap-2">
                {venue.facilities.map((f: string, i: number) => (
                  <View key={i} className="bg-[#112B47] rounded-full px-3 py-1.5 border border-[#1e3a5f]">
                    <Text className="text-[#94a3b8] text-xs">{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Courts */}
          <View className="mb-5">
            <Text className="text-white font-bold text-sm mb-3">Available Courts</Text>
            {courts.length === 0 ? (
              <Text className="text-[#94a3b8] text-sm">No courts listed</Text>
            ) : (
              courts.map(court => (
                <TouchableOpacity
                  key={court.id}
                  onPress={() => navigation.navigate('CourtSelect', { venueId: id, courtId: court.id, courtName: court.name })}
                  className="bg-[#112B47] rounded-xl border border-[#1e3a5f] p-4 mb-3 flex-row items-center justify-between"
                  activeOpacity={0.85}
                >
                  <View>
                    <Text className="text-white font-bold text-sm">{court.name}</Text>
                    <Text className="text-[#94a3b8] text-xs mt-0.5">{court.sport_type} • {court.surface_type || 'Standard'}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[#DA6F2B] font-bold text-base">₹{court.price_per_hour}/hr</Text>
                    <Text className="text-[#94a3b8] text-xs">{court.count || 1} court{court.count > 1 ? 's' : ''}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Equipment Rentals */}
          {equipment.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Package size={16} color="#DA6F2B" />
                <Text className="text-white font-bold text-sm ml-2">Equipment Rentals</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {equipment.map((item: any, i: number) => (
                  <View key={i} className="bg-[#112B47] rounded-xl border border-[#1e3a5f] p-3 w-32 items-center">
                    <Text style={{ fontSize: 28 }} className="mb-2">🎒</Text>
                    <Text className="text-white text-xs font-bold text-center" numberOfLines={2}>{item.name}</Text>
                    <Text className="text-[#DA6F2B] text-xs font-semibold mt-1">₹{item.price}/{item.unit || 'hr'}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Now CTA */}
      {courts.length > 0 && (
        <View className="px-5 pb-6 pt-3 border-t border-[#1e3a5f]">
          <TouchableOpacity
            onPress={() => navigation.navigate('CourtSelect', { venueId: id })}
            className="bg-[#DA6F2B] rounded-xl py-4 items-center"
            activeOpacity={0.85}
          >
            <Text className="text-white font-bold text-base">Book a Court</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
