import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Clock, Calendar } from 'lucide-react-native';
import { courtService } from '../../services/api';

export default function SlotSelectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { venueId, courtId, courtName, pricePerHour } = route.params || {};

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(true);

  const durations = [1, 1.5, 2, 2.5, 3];

  // Generate 7 days from today
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => { loadSlots(); }, [selectedDate]);

  const loadSlots = async () => {
    setLoading(true);
    setSelectedSlot(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const data = await courtService.getAvailability(courtId, dateStr);
      setSlots(Array.isArray(data) ? data : data?.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const handleProceed = () => {
    if (!selectedSlot) {
      Alert.alert('Select Slot', 'Please select a time slot first');
      return;
    }
    const total = (selectedSlot.price || pricePerHour) * duration;
    navigation.navigate('BookingConfirm', {
      venueId,
      courtId,
      courtName,
      date: selectedDate.toISOString(),
      startTime: selectedSlot.start_time || selectedSlot.time,
      duration,
      pricePerHour: selectedSlot.price || pricePerHour,
      total,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text className="text-white font-bold text-xl">Select Slot</Text>
          <Text className="text-[#94a3b8] text-xs">{courtName}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date Picker */}
        <View className="py-4">
          <Text className="text-white font-bold text-sm px-5 mb-3">Pick a Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            {dates.map((d, i) => {
              const isSelected = d.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedDate(d)}
                  className={`w-16 h-20 rounded-2xl items-center justify-center border ${isSelected ? 'bg-[#DA6F2B] border-[#DA6F2B]' : 'bg-[#112B47] border-[#1e3a5f]'}`}
                >
                  <Text className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-[#94a3b8]'}`}>
                    {d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()}
                  </Text>
                  <Text className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-white'}`}>{d.getDate()}</Text>
                  <Text className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#94a3b8]'}`}>
                    {d.toLocaleDateString('en-IN', { month: 'short' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Duration */}
        <View className="px-5 mb-5">
          <Text className="text-white font-bold text-sm mb-3">Duration</Text>
          <View className="flex-row gap-2">
            {durations.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setDuration(d)}
                className={`px-4 py-2.5 rounded-xl border ${duration === d ? 'bg-[#DA6F2B] border-[#DA6F2B]' : 'bg-[#112B47] border-[#1e3a5f]'}`}
              >
                <Text className={`text-sm font-bold ${duration === d ? 'text-white' : 'text-[#94a3b8]'}`}>{d}h</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Slots */}
        <View className="px-5 mb-24">
          <Text className="text-white font-bold text-sm mb-3">Available Slots</Text>
          {loading ? (
            <ActivityIndicator color="#DA6F2B" />
          ) : slots.length === 0 ? (
            <View className="items-center py-8">
              <Text style={{ fontSize: 36 }} className="mb-2">📅</Text>
              <Text className="text-[#94a3b8] text-sm">No slots available for this date</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {slots.map((slot: any, i: number) => {
                const isSelected = selectedSlot === slot;
                const isAvailable = slot.is_available ?? slot.available ?? true;
                return (
                  <TouchableOpacity
                    key={i}
                    disabled={!isAvailable}
                    onPress={() => setSelectedSlot(slot)}
                    className={`px-4 py-3 rounded-xl border ${
                      !isAvailable
                        ? 'bg-[#0A1F35] border-[#1e3a5f] opacity-40'
                        : isSelected
                        ? 'bg-[#DA6F2B] border-[#DA6F2B]'
                        : 'bg-[#112B47] border-[#1e3a5f]'
                    }`}
                    style={{ minWidth: 90 }}
                  >
                    <Text className={`text-sm font-bold text-center ${isSelected ? 'text-white' : isAvailable ? 'text-white' : 'text-[#475569]'}`}>
                      {slot.start_time || slot.time}
                    </Text>
                    {slot.price && (
                      <Text className={`text-[10px] text-center mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#94a3b8]'}`}>
                        ₹{slot.price}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-[#0A1F35] border-t border-[#1e3a5f]">
        {selectedSlot && (
          <View className="flex-row justify-between mb-3">
            <Text className="text-[#94a3b8] text-sm">{selectedSlot.start_time || selectedSlot.time} • {duration}h</Text>
            <Text className="text-[#DA6F2B] font-bold text-sm">
              Total: ₹{((selectedSlot.price || pricePerHour) * duration).toFixed(0)}
            </Text>
          </View>
        )}
        <TouchableOpacity
          onPress={handleProceed}
          disabled={!selectedSlot}
          className="bg-[#DA6F2B] rounded-xl py-4 items-center"
          style={{ opacity: !selectedSlot ? 0.5 : 1 }}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-base">Proceed to Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
