import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react-native';
import { bookingService } from '../../services/api';

const STATUS_TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];
const STATUS_FILTER: Record<string, string> = { Upcoming: 'CONFIRMED', Completed: 'COMPLETED', Cancelled: 'CANCELLED' };

export default function BookingsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = activeTab !== 'All' ? { status: STATUS_FILTER[activeTab] } : {};
      const data = await bookingService.getMyBookings(params);
      setBookings(Array.isArray(data) ? data : data?.results || []);
    } catch { setBookings([]); } finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { load(); }, [activeTab]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const getStatusColor = (s: string) => ({ CONFIRMED: '#22c55e', PENDING: '#DA6F2B', COMPLETED: '#94a3b8', CANCELLED: '#ef4444' }[s] || '#94a3b8');

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <Text className="text-white font-bold text-xl flex-1">My Bookings</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HomeTab', { screen: 'VenueBrowse' })}
          className="bg-[#DA6F2B] rounded-full px-4 py-2">
          <Text className="text-white text-xs font-bold">+ New</Text>
        </TouchableOpacity>
      </View>

      <View className="py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {STATUS_TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => { setActiveTab(tab); setLoading(true); }}
              className={`px-4 py-2 rounded-full border ${activeTab === tab ? 'bg-[#DA6F2B] border-[#DA6F2B]' : 'bg-[#112B47] border-[#1e3a5f]'}`}>
              <Text className={`text-sm font-semibold ${activeTab === tab ? 'text-white' : 'text-[#94a3b8]'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#DA6F2B" /></View> : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DA6F2B" />}
          contentContainerStyle={{ padding: 20, gap: 12 }}
        >
          {bookings.length === 0 ? (
            <View className="items-center py-16">
              <Text style={{ fontSize: 64 }} className="mb-4">📅</Text>
              <Text className="text-white font-bold text-xl mb-2">No bookings</Text>
              <Text className="text-[#94a3b8] text-sm text-center mb-6">Book a venue to get started!</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HomeTab', { screen: 'VenueBrowse' })}
                className="bg-[#DA6F2B] rounded-xl px-6 py-3">
                <Text className="text-white font-bold">Browse Venues</Text>
              </TouchableOpacity>
            </View>
          ) : bookings.map(b => (
            <TouchableOpacity key={b.id} onPress={() => navigation.navigate('BookingDetail', { id: b.id })}
              className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-4" activeOpacity={0.85}>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white font-bold text-sm">{b.court_name || b.venue_name}</Text>
                <View style={{ backgroundColor: `${getStatusColor(b.status)}20`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: getStatusColor(b.status), fontSize: 10, fontWeight: 'bold' }}>{b.status}</Text>
                </View>
              </View>
              <View className="flex-row items-center mb-1">
                <Calendar size={12} color="#94a3b8" />
                <Text className="text-[#94a3b8] text-xs ml-1">{b.booking_date} • {b.start_time}</Text>
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-[#94a3b8] text-xs">{b.duration_hours}h • {b.booking_id}</Text>
                <Text className="text-[#DA6F2B] font-bold text-sm">₹{b.total_amount}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
