import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { Menu, Plus, Trophy, Clock, CheckCircle, Filter } from 'lucide-react-native';
import { tournamentService, localTournamentService, scoreboardService } from '../../services/api';

const STATUS_TABS = ['All', 'Upcoming', 'Ongoing', 'Completed'];
const STATUS_MAP: Record<string, string> = {
  'Upcoming': 'UPCOMING', 'Ongoing': 'ONGOING', 'Completed': 'COMPLETED',
};

export default function CompeteScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('All');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [localTournaments, setLocalTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const params = activeTab !== 'All' ? { status: STATUS_MAP[activeTab] } : {};
      const [t, lt] = await Promise.allSettled([
        tournamentService.getAll(params),
        localTournamentService.getAll(),
      ]);
      if (t.status === 'fulfilled') {
        const td = t.value;
        setTournaments(Array.isArray(td) ? td : td?.results || []);
      }
      if (lt.status === 'fulfilled') {
        const ltd = lt.value;
        setLocalTournaments(Array.isArray(ltd) ? ltd : ltd?.results || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeTab]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const getSportEmoji = (sport?: string) => {
    const map: Record<string, string> = { CRICKET: '🏏', FOOTBALL: '⚽', BASKETBALL: '🏀', BADMINTON: '🏸', TENNIS: '🎾', VOLLEYBALL: '🏐', HOCKEY: '🏑', KABADDI: '🤼' };
    return map[sport?.toUpperCase() || ''] || '🏆';
  };

  const getStatusColor = (s: string) => ({ UPCOMING: '#DA6F2B', ONGOING: '#22c55e', COMPLETED: '#94a3b8', DRAFT: '#475569' }[s] || '#94a3b8');

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Menu size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Compete</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateTournament')}
          className="bg-[#DA6F2B] rounded-full w-9 h-9 items-center justify-center"
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Status tabs */}
      <View className="mb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {STATUS_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => { setActiveTab(tab); setLoading(true); }}
              className={`px-4 py-2 rounded-full border ${activeTab === tab ? 'bg-[#DA6F2B] border-[#DA6F2B]' : 'bg-[#112B47] border-[#1e3a5f]'}`}
            >
              <Text className={`text-sm font-semibold ${activeTab === tab ? 'text-white' : 'text-[#94a3b8]'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DA6F2B" />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="flex-1 items-center py-16"><ActivityIndicator size="large" color="#DA6F2B" /></View>
        ) : (
          <>
            {/* Formal Tournaments */}
            {tournaments.length > 0 && (
              <View className="px-5 mb-5">
                <Text className="text-white font-bold text-sm mb-3 uppercase tracking-wider text-[#94a3b8]">Official Tournaments</Text>
                {tournaments.map(t => (
                  <TouchableOpacity
                    key={t.id || t.tournament_id}
                    onPress={() => navigation.navigate('TournamentDetail', { id: t.id })}
                    className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-4 mb-3"
                    activeOpacity={0.85}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <Text style={{ fontSize: 24 }} className="mr-2">{getSportEmoji(t.sport_name)}</Text>
                        <View>
                          <Text className="text-white font-bold text-sm">{t.name}</Text>
                          <Text className="text-[#94a3b8] text-xs">{t.tournament_id}</Text>
                        </View>
                      </View>
                      <View style={{ backgroundColor: `${getStatusColor(t.status)}20`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: getStatusColor(t.status), fontSize: 10, fontWeight: 'bold' }}>{t.status}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[#94a3b8] text-xs">{t.start_date} → {t.end_date}</Text>
                      <Text className="text-[#94a3b8] text-xs">{t.location || t.venue_name || ''}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Local Tournaments */}
            {localTournaments.length > 0 && (
              <View className="px-5 mb-5">
                <Text className="text-white font-bold text-sm mb-3 uppercase tracking-wider text-[#94a3b8]">Local Matches</Text>
                {localTournaments.map(lt => (
                  <TouchableOpacity
                    key={lt.id}
                    onPress={() => navigation.navigate('Scoreboard', { id: lt.id, type: 'local' })}
                    className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-4 mb-3 flex-row items-center"
                    activeOpacity={0.85}
                  >
                    <Text style={{ fontSize: 28 }} className="mr-3">{getSportEmoji(lt.sport_name)}</Text>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-sm">{lt.name}</Text>
                      <Text className="text-[#94a3b8] text-xs">{lt.sport_name} • {lt.participants_count || 0} players</Text>
                    </View>
                    <View className={`rounded-full px-2 py-0.5 ${lt.status === 'ACTIVE' ? 'bg-green-500/20' : 'bg-[#1e3a5f]'}`}>
                      <Text className={`text-[10px] font-bold ${lt.status === 'ACTIVE' ? 'text-green-400' : 'text-[#94a3b8]'}`}>
                        {lt.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {tournaments.length === 0 && localTournaments.length === 0 && (
              <View className="items-center py-16 px-8">
                <Text style={{ fontSize: 64 }} className="mb-4">🏆</Text>
                <Text className="text-white font-bold text-xl mb-2 text-center">No tournaments yet</Text>
                <Text className="text-[#94a3b8] text-sm text-center mb-6">Create your first tournament or local match to get started!</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateTournament')}
                  className="bg-[#DA6F2B] rounded-xl px-6 py-3 flex-row items-center"
                  activeOpacity={0.85}
                >
                  <Plus size={16} color="#fff" />
                  <Text className="text-white font-bold ml-2">Create Tournament</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
