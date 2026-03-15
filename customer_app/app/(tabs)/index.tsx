import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { Header } from '@/components/Header';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { QuickActionGrid } from '@/components/QuickActionGrid';
import { LiveScoreCard } from '@/components/LiveScoreCard';
import { EquipmentRentals } from '@/components/EquipmentRentals';
import { playerService, scoreboardService } from '../../services/api';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    user: { name: 'Player', avatar: 'P' },
    performance: { matches: 0, winRate: 0, cityRank: 0 },
    liveMatch: { league: 'Loading...', team1: '...', team2: '...', score: '- - -', status: '' }
  });

  const loadDashboardData = async () => {
    try {
      const [profileData, statsData, matchesData] = await Promise.all([
        playerService.getProfile().catch(() => null),
        playerService.getStats().catch(() => null),
        scoreboardService.getLiveMatches().catch(() => [])
      ]);

      const liveMatch = matchesData && matchesData.length > 0 ? matchesData[0] : null;

      setDashboardData({
        user: {
          name: profileData?.first_name || 'Player',
          avatar: profileData?.first_name ? profileData.first_name[0].toUpperCase() : 'P'
        },
        performance: {
          matches: statsData?.matches_played || 0,
          winRate: statsData?.win_rate || 0,
          cityRank: statsData?.city_rank || 0
        },
        liveMatch: liveMatch ? {
          league: liveMatch.tournament_name || 'Tournament Match',
          team1: liveMatch.team_a_name || 'Team 1',
          team2: liveMatch.team_b_name || 'Team 2',
          score: `${liveMatch.team_a_score} - ${liveMatch.team_b_score}`,
          status: liveMatch.status === 'LIVE' ? "LIVE IN PLAY" : "AWAITING"
        } : { league: 'No Live Matches', team1: 'N/A', team2: 'N/A', score: '0 - 0', status: 'INACTIVE' }
      });
    } catch (e) {
      console.log('Error Loading Dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0A1F35' : '#FFFFFF' }}>
      <Header
        userName={dashboardData.user.name}
        avatarLetter={dashboardData.user.avatar}
        isDark={isDark}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DA6F2B" />
        }
      >
        <View className="flex-1 px-5 pt-2 pb-8 gap-y-6">
          <PerformanceDashboard
            matchesPlayed={dashboardData.performance.matches}
            winRate={dashboardData.performance.winRate}
            cityRank={dashboardData.performance.cityRank}
            isDark={isDark}
          />

          <QuickActionGrid isDark={isDark} />

          <LiveScoreCard
            leagueName={dashboardData.liveMatch.league}
            team1={dashboardData.liveMatch.team1}
            team2={dashboardData.liveMatch.team2}
            score={dashboardData.liveMatch.score}
            status={dashboardData.liveMatch.status}
            isDark={isDark}
          />

          <EquipmentRentals isDark={isDark} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
