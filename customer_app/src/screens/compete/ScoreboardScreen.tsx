import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, RefreshCw, Zap } from 'lucide-react-native';
import { scoreboardService, localTournamentService } from '../../services/api';
import { APP_CONFIG } from '../../config/env';

export default function ScoreboardScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id, type } = route.params || {};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const pollTimer = useRef<NodeJS.Timeout>();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      let result;
      if (type === 'local') {
        result = await localTournamentService.getById(id);
      } else {
        result = await scoreboardService.getMatchDetails(id);
      }
      setData(result);
      setLastUpdated(new Date());
    } catch (e) {
      if (!silent) Alert.alert('Error', 'Could not load scoreboard');
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    load();
    // Poll every 10s if match is live
    pollTimer.current = setInterval(() => {
      if (data?.status === 'LIVE' || data?.status === 'ACTIVE') {
        load(true);
      }
    }, APP_CONFIG.liveScoreRefreshInterval);
    return () => clearInterval(pollTimer.current);
  }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const isLive = data?.status === 'LIVE' || data?.status === 'ACTIVE';

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#0A1F35] items-center justify-center">
      <ActivityIndicator size="large" color="#DA6F2B" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-white font-bold text-base">{data?.name || data?.tournament_name || 'Scoreboard'}</Text>
          {isLive && (
            <View className="flex-row items-center mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
              <Text className="text-red-400 text-[10px] font-bold">LIVE</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <RefreshCw size={20} color="#DA6F2B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DA6F2B" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Score display */}
        {type === 'local' && data?.scoreboard && (
          <LocalScoreboard data={data} onUpdateScore={() => navigation.navigate('UmpirePanel', { id, type })} />
        )}
        {type !== 'local' && data && (
          <FormalScoreboard data={data} onAwards={() => navigation.navigate('MatchAwards', { id })} />
        )}

        {/* Participants / Players */}
        <View className="px-5 mb-5">
          <Text className="text-white font-bold text-sm mb-3 uppercase tracking-wider text-[#94a3b8]">
            {type === 'local' ? 'Participants' : 'Players'}
          </Text>
          {(data?.participants || []).map((p: any, i: number) => (
            <View key={p.id || i} className="bg-[#112B47] rounded-xl border border-[#1e3a5f] p-4 mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-[#DA6F2B] items-center justify-center mr-3">
                  <Text className="text-white font-bold text-xs">{i + 1}</Text>
                </View>
                <View>
                  <Text className="text-white font-semibold text-sm">{p.name}</Text>
                  <Text className="text-[#94a3b8] text-xs">{p.mobile}</Text>
                </View>
              </View>
              {p.score && (
                <View>
                  {Object.entries(p.score).map(([k, v]: any) => (
                    <Text key={k} className="text-[#DA6F2B] text-xs font-bold text-right">{k}: {v}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View className="px-5 pb-8">
          <Text className="text-[#475569] text-xs text-center">
            Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
            {isLive ? ' • Auto-refreshes every 10s' : ''}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LocalScoreboard({ data, onUpdateScore }: { data: any; onUpdateScore: () => void }) {
  const scoreboard = data.scoreboard || {};
  return (
    <View className="p-5">
      <View className="bg-[#DA6F2B] rounded-2xl p-5 mb-4"
        style={{ shadowColor: '#DA6F2B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 }}>
        <Text className="text-white/80 text-xs mb-2">{data.sport_name || 'Sport'}</Text>
        {Object.entries(scoreboard).length > 0 ? (
          Object.entries(scoreboard).map(([key, value]: any) => (
            <View key={key} className="flex-row justify-between py-1">
              <Text className="text-white font-bold">{key}</Text>
              <Text className="text-white/80">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Text>
            </View>
          ))
        ) : (
          <Text className="text-white/60 text-sm">No scores recorded yet</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={onUpdateScore}
        className="bg-[#112B47] rounded-xl py-3 items-center border border-[#1e3a5f]"
        activeOpacity={0.85}
      >
        <Text className="text-[#DA6F2B] font-bold text-sm">Update Scores</Text>
      </TouchableOpacity>
    </View>
  );
}

function FormalScoreboard({ data, onAwards }: { data: any; onAwards: () => void }) {
  return (
    <View className="p-5">
      {data.scorecard && Object.keys(data.scorecard).length > 0 ? (
        <View className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-4 mb-4">
          <Text className="text-white font-bold text-sm mb-3">Match Score</Text>
          {Object.entries(data.scorecard).map(([k, v]: any) => (
            <View key={k} className="flex-row justify-between py-1">
              <Text className="text-[#94a3b8] text-sm">{k}</Text>
              <Text className="text-white text-sm font-bold">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-4 mb-4 items-center">
          <Text className="text-[#94a3b8] text-sm">Match score not yet updated</Text>
        </View>
      )}
      {data.status === 'COMPLETED' && (
        <TouchableOpacity onPress={onAwards} className="bg-[#DA6F2B] rounded-xl py-3 items-center" activeOpacity={0.85}>
          <Text className="text-white font-bold text-sm">🏅 View Awards</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
