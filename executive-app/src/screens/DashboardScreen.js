import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { authService } from '../services/authService';
import { venueService } from '../services/venueService';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    loadVenues();
  }, []);

  const loadUserData = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadVenues = async () => {
    try {
      setLoading(true);
      const data = await venueService.getMyVenues();
      setVenues(data);
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVenues();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Login');
  };

  const stats = {
    total: venues.length,
    preRegistered: venues.filter(v => v.status === 'PRE_REGISTERED' || v.status === 'PENDING').length,
    registered: venues.filter(v => v.status === 'REGISTERED' || v.status === 'ACTIVE').length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Executive'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: COLORS.orange }]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Venues</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.navy }]}>
            <Text style={styles.statNumber}>{stats.preRegistered}</Text>
            <Text style={styles.statLabel}>Pre-Registered</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#28A745' }]}>
            <Text style={styles.statNumber}>{stats.registered}</Text>
            <Text style={styles.statLabel}>Registered</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              try {
                navigation.navigate('PreRegisterVenue');
              } catch (error) {
                console.error('Error navigating to PreRegisterVenue:', error);
              }
            }}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>+</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Pre-Register New Venue</Text>
              <Text style={styles.actionSubtitle}>Quick venue pre-registration form</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              try {
                navigation.navigate('AddVenue');
              } catch (error) {
                console.error('Error navigating to AddVenue:', error);
              }
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#28A745' }]}>
              <Text style={styles.actionIcon}>📝</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Full Venue Registration</Text>
              <Text style={styles.actionSubtitle}>Complete venue registration with all details</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('VenueList')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: COLORS.navy }]}>
              <Text style={styles.actionIcon}>🏢</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View My Venues</Text>
              <Text style={styles.actionSubtitle}>Manage your registered venues</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Venues */}
        {venues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Venues</Text>
              <TouchableOpacity onPress={() => navigation.navigate('VenueList')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {venues.slice(0, 3).map((venue) => (
              <View key={venue.id} style={styles.venueCard}>
                <View style={styles.venueInfo}>
                  <Text style={styles.venueName}>{venue.name}</Text>
                  <Text style={styles.venueLocation}>{venue.city}, {venue.state}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  (venue.status === 'REGISTERED' || venue.status === 'ACTIVE') ? styles.statusRegistered : styles.statusPending
                ]}>
                  <Text style={styles.statusText}>
                    {(venue.status === 'REGISTERED' || venue.status === 'ACTIVE') ? 'Registered' : 'Pre-Registered'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  greeting: {
    fontSize: SIZES.font,
    color: COLORS.grey,
  },
  userName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.lightGrey,
  },
  logoutText: {
    color: COLORS.navy,
    fontWeight: '600',
  },
  scrollContent: {
    padding: SIZES.padding * 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.white,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  viewAll: {
    color: COLORS.orange,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    fontWeight: '500',
  },
  venueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  venueLocation: {
    fontSize: SIZES.small,
    color: COLORS.grey,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusRegistered: {
    backgroundColor: '#28A745',
  },
  statusPending: {
    backgroundColor: '#FFC107',
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
});

