import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Search, Bell } from 'lucide-react-native';
import { venueService } from '../../services/api';
import { VenueCard } from '../../components/booking/VenueCard';
import { colors, spacing, typography, radius } from '../../theme/tokens';

export default function HomeScreen() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const router = useRouter();

  const sports = ['All', 'Badminton', 'Tennis', 'Cricket', 'Football', 'Squash'];

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const data = await venueService.getAll();
      setVenues(data);
    } catch (e) {
      console.error('Failed to load venues:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadVenues();
      return;
    }
    try {
      setLoading(true);
      const data = await venueService.search(searchQuery);
      setVenues(data);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = selectedSport === 'All'
    ? venues
    : venues.filter((v: any) => v.sports?.includes(selectedSport));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadVenues} tintColor={colors.brand.accent} />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
            <View>
              <Text style={{ color: colors.text.secondary, fontSize: typography.body.regular.size, fontFamily: typography.fontFamily }}>
                Discover
              </Text>
              <Text style={{
                fontSize: typography.heading.h1.size,
                fontWeight: typography.heading.h1.weight,
                color: colors.text.primary,
                fontFamily: typography.fontFamily,
                marginTop: spacing.xxs
              }}>
                Venues Near You
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: colors.background.cardDark,
                padding: spacing.sm,
                borderRadius: radius.pill
              }}
            >
              <Bell size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.card,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.divider
          }}>
            <Search size={20} color={colors.text.muted} style={{ marginRight: spacing.xs }} />
            <TextInput
              style={{
                flex: 1,
                fontSize: typography.body.regular.size,
                color: colors.text.dark,
                fontFamily: typography.fontFamily
              }}
              placeholder="Search venues, sports..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                loadVenues();
              }}>
                <Text style={{ color: colors.text.muted, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sport Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport}
                onPress={() => setSelectedSport(sport)}
                style={{
                  marginRight: spacing.sm,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  borderRadius: radius.pill,
                  backgroundColor: selectedSport === sport ? colors.brand.accent : colors.background.card,
                  borderWidth: selectedSport === sport ? 0 : 1,
                  borderColor: colors.divider,
                }}
              >
                <Text
                  style={{
                    fontWeight: typography.body.large.weight,
                    color: selectedSport === sport ? colors.text.primary : colors.text.dark,
                    fontFamily: typography.fontFamily,
                    fontSize: typography.body.regular.size
                  }}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Venues List */}
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}>
          {loading ? (
            <View style={{ paddingVertical: spacing.xxl }}>
              <ActivityIndicator size="large" color={colors.brand.accent} />
            </View>
          ) : filteredVenues.length === 0 ? (
            <View style={{ paddingVertical: spacing.xxl, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: spacing.md }}>🏟️</Text>
              <Text style={{ color: colors.text.secondary, textAlign: 'center', fontFamily: typography.fontFamily }}>
                No venues found
              </Text>
              <Text style={{ color: colors.text.muted, textAlign: 'center', fontSize: typography.body.small.size, marginTop: spacing.xs, fontFamily: typography.fontFamily }}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filteredVenues.map((venue: any) => (
              <VenueCard
                key={venue.id}
                venue={{
                  id: venue.id,
                  name: venue.name,
                  city: venue.city,
                  address: venue.address,
                  rating: 4.5,
                  distance: '2.5 km'
                }}
                onPress={() => router.push(`/venues/${venue.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
