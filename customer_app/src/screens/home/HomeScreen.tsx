import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
  ActivityIndicator, FlatList, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useDrawerStatus } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import {
  Menu, Bell, MapPin, Zap, Users, ChevronRight,
  Plus, RefreshCw, Trophy, Package,
} from 'lucide-react-native';
import {
  playerService, bannerService, venueService,
  scoreboardService, openMatchService,
} from '../../services/api';
import { APP_CONFIG, LOG_API_CALLS } from '../../config/env';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [nearbyVenues, setNearbyVenues] = useState<any[]>([]);
  const [openMatches, setOpenMatches] = useState<any[]>([]);
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [locationError, setLocationError] = useState(false);

  // Hero slider
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerTimer = useRef<NodeJS.Timeout>();

  // ─── Load all data ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [profileData, statsData, bannersData, liveData, openData] = await Promise.allSettled([
        playerService.getProfile(),
        playerService.getStats(),
        bannerService.getActive(),
        scoreboardService.getLiveMatches(),
        openMatchService.getAll({ status: 'OPEN', limit: 5 }),
      ]);

      if (profileData.status === 'fulfilled') setUser(profileData.value);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (bannersData.status === 'fulfilled') {
        const bData = bannersData.value;
        setBanners(Array.isArray(bData) ? bData : bData?.results || []);
      }
      if (liveData.status === 'fulfilled') {
        const matches = liveData.value;
        if (matches?.length) setLiveMatch(matches[0]);
      }
      if (openData.status === 'fulfilled') {
        const od = openData.value;
        setOpenMatches(Array.isArray(od) ? od : od?.results || []);
      }
    } catch (e) {
      if (LOG_API_CALLS) console.warn('[Home] Load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Geo-location for nearby venues ────────────────────────────────────────
  const loadNearbyVenues = useCallback(() => {
    Geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          if (LOG_API_CALLS) console.log(`[DEV] Location: ${latitude}, ${longitude}`);
          const data = await venueService.getNearby(latitude, longitude, APP_CONFIG.nearbyVenuesRadius);
          setNearbyVenues(Array.isArray(data) ? data.slice(0, APP_CONFIG.nearbyVenuesLimit) : data?.results?.slice(0, APP_CONFIG.nearbyVenuesLimit) || []);
        } catch (e) {
          if (LOG_API_CALLS) console.warn('[Home] Nearby venues error:', e);
        }
      },
      err => {
        setLocationError(true);
        if (LOG_API_CALLS) console.warn('[DEV] Geolocation error:', err.message);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    loadData();
    loadNearbyVenues();
  }, []);

  // ─── Auto-scroll hero banner ────────────────────────────────────────────────
  useEffect(() => {
    if (banners.length <= 1) return;
    bannerTimer.current = setInterval(() => {
      setActiveBanner(prev => {
        const next = (prev + 1) % banners.length;
        bannerScrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(bannerTimer.current);
  }, [banners.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    loadNearbyVenues();
    setRefreshing(false);
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : 'P';

  // ─── Render Hero Banner item ────────────────────────────────────────────────
  const renderBanner = (banner: any, index: number) => {
    const colors = ['#DA6F2B', '#0A1F35', '#1e3a5f', '#7c3aed'];
    const bg = colors[index % colors.length];
    const onPress = () => {
      if (banner.link_type === 'TOURNAMENT') {
        navigation.navigate('CompeteTab', { screen: 'CompeteMain' });
      } else if (banner.link_type === 'VENUE' && banner.link_id) {
        navigation.navigate('HomeTab', { screen: 'VenueDetail', params: { id: banner.link_id } });
      } else if (banner.link_type === 'OPEN_MATCH') {
        navigation.navigate('HomeTab', { screen: 'OpenMatches' });
      }
    };
    return (
      <TouchableOpacity
        key={index}
        onPress={onPress}
        activeOpacity={0.9}
        style={{ width: SCREEN_WIDTH - 40, marginHorizontal: 4 }}
      >
        <View
          className="rounded-2xl p-5 justify-between"
          style={{
            backgroundColor: bg,
            height: 160,
            shadowColor: bg,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {banner.link_type !== 'NONE' && (
            <View className="flex-row items-center">
              <View className="bg-white/20 rounded-full px-2 py-0.5 flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1" />
                <Text className="text-white text-[10px] font-bold">{banner.link_type}</Text>
              </View>
            </View>
          )}
          <View>
            <Text className="text-white font-bold text-lg leading-6">{banner.title}</Text>
            {banner.subtitle ? (
              <Text className="text-white/75 text-xs mt-1">{banner.subtitle}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <HomeScreenSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DA6F2B" />}
      >
        {/* ─── Header ───────────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
          <TouchableOpacity onPress={openDrawer} className="w-10 h-10 items-center justify-center">
            <Menu size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-white font-bold text-sm">GoAthlete</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileTab', { screen: 'Notifications' })}
            className="w-10 h-10 bg-[#112B47] rounded-full items-center justify-center border border-[#1e3a5f]"
          >
            <Bell size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ─── Greeting ─────────────────────────────────────────────────── */}
        <View className="px-5 mb-5">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#DA6F2B] items-center justify-center mr-3">
              <Text className="text-white font-bold text-sm">{initials}</Text>
            </View>
            <View>
              <Text className="text-white font-bold text-xl">Hi, {user?.first_name || 'Athlete'} 👋</Text>
              <Text className="text-[#94a3b8] text-xs">Ready to dominate today?</Text>
            </View>
          </View>
        </View>

        {/* ─── Performance Mini Dashboard ────────────────────────────────── */}
        <View className="mx-5 mb-6 bg-[#112B47] rounded-2xl p-4 border border-[#1e3a5f]"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 }}>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-bold text-sm">Player Performance</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProfileTab', { screen: 'Performance' })}
              className="flex-row items-center"
            >
              <Text className="text-[#DA6F2B] text-xs mr-1">View Stats</Text>
              <ChevronRight size={12} color="#DA6F2B" />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between">
            {[
              { label: 'Matches', value: stats?.matches_played || 0 },
              { label: 'Win Rate', value: `${stats?.win_rate || 0}%` },
              { label: 'City Rank', value: stats?.city_rank || '—' },
              { label: 'Tournaments', value: stats?.tournaments_played || 0 },
            ].map(item => (
              <View key={item.label} className="items-center">
                <Text className="text-white font-bold text-xl">{item.value}</Text>
                <Text className="text-[#94a3b8] text-[10px] mt-0.5">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Hero Slider ─────────────────────────────────────────────── */}
        <View className="mb-6">
          <Text className="text-white font-bold text-base px-5 mb-3">Featured</Text>
          {banners.length > 0 ? (
            <>
              <ScrollView
                ref={bannerScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                decelerationRate="fast"
                snapToInterval={SCREEN_WIDTH - 32}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                onMomentumScrollEnd={e => {
                  const newIndex = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
                  setActiveBanner(newIndex);
                }}
              >
                {banners.map(renderBanner)}
              </ScrollView>
              {banners.length > 1 && (
                <View className="flex-row justify-center mt-3 gap-1">
                  {banners.map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: i === activeBanner ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: i === activeBanner ? '#DA6F2B' : '#1e3a5f',
                      }}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            /* Fallback: show live match card */
            liveMatch && (
              <TouchableOpacity
                className="mx-5 rounded-2xl p-5 bg-[#DA6F2B]"
                onPress={() => navigation.navigate('CompeteTab', { screen: 'MatchDetail', params: { id: liveMatch.id } })}
                activeOpacity={0.85}
              >
                <View className="flex-row items-center mb-2">
                  <View className="w-2 h-2 rounded-full bg-white mr-2" />
                  <Text className="text-white/80 text-xs font-bold">LIVE MATCH</Text>
                </View>
                <Text className="text-white font-bold text-lg">
                  {liveMatch.team_a_name} vs {liveMatch.team_b_name}
                </Text>
                <Text className="text-white/80 text-sm mt-1">{liveMatch.tournament_name}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* ─── Quick Actions ────────────────────────────────────────────── */}
        <View className="px-5 mb-6">
          <Text className="text-white font-bold text-base mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-3">
            {[
              { icon: <MapPin size={20} color="#FFFFFF" />, label: 'Book Venue', bg: '#0A1F35', onPress: () => navigation.navigate('HomeTab', { screen: 'VenueBrowse' }) },
              { icon: <Trophy size={20} color="#FFFFFF" />, label: 'Tournaments', bg: '#DA6F2B', onPress: () => navigation.navigate('CompeteTab') },
              { icon: <Zap size={20} color="#FFFFFF" />, label: 'Live Scores', bg: '#1e3a5f', onPress: () => navigation.navigate('HomeTab', { screen: 'OpenMatches' }) },
              { icon: <Package size={20} color="#FFFFFF" />, label: 'Rent Gear', bg: '#7c3aed', onPress: () => navigation.navigate('HomeTab', { screen: 'VenueBrowse' }) },
            ].map(action => (
              <TouchableOpacity
                key={action.label}
                onPress={action.onPress}
                activeOpacity={0.85}
                style={{ width: '47.5%', height: 90, backgroundColor: action.bg, borderRadius: 16, padding: 14, justifyContent: 'space-between' }}
              >
                <View className="w-9 h-9 rounded-xl bg-white/20 items-center justify-center">
                  {action.icon}
                </View>
                <Text className="text-white font-bold text-sm">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Nearby Venues ────────────────────────────────────────────── */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <View className="flex-row items-center">
              <MapPin size={16} color="#DA6F2B" />
              <Text className="text-white font-bold text-base ml-1.5">Nearby Venues</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('HomeTab', { screen: 'VenueBrowse' })}>
              <Text className="text-[#DA6F2B] text-xs font-semibold">See All</Text>
            </TouchableOpacity>
          </View>

          {locationError ? (
            <View className="mx-5 bg-[#112B47] rounded-xl p-4 border border-[#1e3a5f]">
              <Text className="text-[#94a3b8] text-sm text-center">
                📍 Enable location to see nearby venues
              </Text>
            </View>
          ) : nearbyVenues.length === 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {[1, 2, 3].map(i => <VenueCardSkeleton key={i} />)}
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {nearbyVenues.map(venue => (
                <TouchableOpacity
                  key={venue.id}
                  onPress={() => navigation.navigate('HomeTab', { screen: 'VenueDetail', params: { id: venue.id } })}
                  className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] overflow-hidden"
                  style={{ width: 200 }}
                  activeOpacity={0.85}
                >
                  <View className="h-24 bg-[#1e3a5f] items-center justify-center">
                    <Text style={{ fontSize: 36 }}>🏟️</Text>
                  </View>
                  <View className="p-3">
                    <Text className="text-white font-bold text-sm" numberOfLines={1}>{venue.name}</Text>
                    <View className="flex-row items-center mt-1">
                      <MapPin size={10} color="#94a3b8" />
                      <Text className="text-[#94a3b8] text-xs ml-1" numberOfLines={1}>{venue.city}</Text>
                    </View>
                    {venue.courts?.[0] && (
                      <Text className="text-[#DA6F2B] text-xs font-semibold mt-1.5">
                        From ₹{venue.courts[0].price_per_hour}/hr
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ─── Open Matches (PLAYO-style) ───────────────────────────────── */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <View className="flex-row items-center">
              <Users size={16} color="#DA6F2B" />
              <Text className="text-white font-bold text-base ml-1.5">Join & Play</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('HomeTab', { screen: 'OpenMatches' })}>
              <Text className="text-[#DA6F2B] text-xs font-semibold">All Matches</Text>
            </TouchableOpacity>
          </View>

          {openMatches.length === 0 ? (
            <View className="mx-5 bg-[#112B47] rounded-xl p-5 border border-[#1e3a5f] items-center">
              <Text style={{ fontSize: 32 }} className="mb-2">🏃</Text>
              <Text className="text-white font-semibold text-sm mb-1">No open matches nearby</Text>
              <Text className="text-[#94a3b8] text-xs text-center mb-4">Be the first to create one and split the booking cost!</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('HomeTab', { screen: 'CreateOpenMatch' })}
                className="bg-[#DA6F2B] rounded-xl px-5 py-2.5 flex-row items-center"
              >
                <Plus size={14} color="#fff" />
                <Text className="text-white font-bold text-sm ml-1.5">Create Match</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {openMatches.map((match: any) => (
                <TouchableOpacity
                  key={match.id}
                  onPress={() => navigation.navigate('HomeTab', { screen: 'OpenMatches' })}
                  className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-4"
                  style={{ width: 200 }}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontSize: 28 }} className="mb-2">{getSportEmoji(match.sport_name)}</Text>
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>{match.sport_name} Match</Text>
                  <Text className="text-[#94a3b8] text-xs mt-0.5" numberOfLines={1}>{match.venue_name}</Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <View className="bg-green-500/20 rounded-full px-2 py-0.5">
                      <Text className="text-green-400 text-[10px] font-bold">
                        {match.total_spots - match.filled_spots} spots left
                      </Text>
                    </View>
                    <Text className="text-[#DA6F2B] text-xs font-bold">₹{match.price_per_player}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ─── Live Scoreboard ──────────────────────────────────────────── */}
        {liveMatch && (
          <View className="px-5 mb-8">
            <Text className="text-white font-bold text-base mb-3">Live Scoreboard</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CompeteTab', { screen: 'MatchDetail', params: { id: liveMatch.id } })}
              className="bg-[#DA6F2B] rounded-2xl p-4"
              activeOpacity={0.85}
              style={{ shadowColor: '#DA6F2B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white/80 text-xs font-medium">{liveMatch.tournament_name}</Text>
                <View className="flex-row items-center bg-white/20 rounded-full px-2 py-0.5">
                  <View className="w-1.5 h-1.5 rounded-full bg-white mr-1" />
                  <Text className="text-white text-[10px] font-bold">LIVE</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-bold text-base flex-1">{liveMatch.team_a_name}</Text>
                <Text className="text-white font-bold text-2xl px-4">
                  {liveMatch.team_a_score ?? 0} - {liveMatch.team_b_score ?? 0}
                </Text>
                <Text className="text-white font-bold text-base flex-1 text-right">{liveMatch.team_b_name}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getSportEmoji(sport?: string): string {
  const map: Record<string, string> = {
    CRICKET: '🏏', FOOTBALL: '⚽', BASKETBALL: '🏀',
    BADMINTON: '🏸', TENNIS: '🎾', VOLLEYBALL: '🏐',
    HOCKEY: '🏑', KABADDI: '🤼',
  };
  return map[sport?.toUpperCase() || ''] || '🏆';
}

// ─── Skeleton Components ───────────────────────────────────────────────────────
function VenueCardSkeleton() {
  return (
    <View className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] mr-3" style={{ width: 200 }}>
      <View className="h-24 bg-[#1e3a5f] rounded-t-2xl" />
      <View className="p-3">
        <View className="h-3.5 bg-[#1e3a5f] rounded-full w-3/4 mb-2" />
        <View className="h-2.5 bg-[#1e3a5f] rounded-full w-1/2" />
      </View>
    </View>
  );
}

function HomeScreenSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
        <View className="w-10 h-10 bg-[#112B47] rounded-full" />
        <View className="h-3 w-24 bg-[#112B47] rounded-full" />
        <View className="w-10 h-10 bg-[#112B47] rounded-full" />
      </View>
      <View className="px-5">
        <View className="h-4 w-48 bg-[#112B47] rounded-full mb-2" />
        <View className="h-3 w-32 bg-[#112B47] rounded-full mb-6" />
        <View className="h-24 bg-[#112B47] rounded-2xl mb-6" />
        <View className="h-40 bg-[#112B47] rounded-2xl mb-6" />
      </View>
    </SafeAreaView>
  );
}
