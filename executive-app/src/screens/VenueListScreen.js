import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { venueService } from '../services/venueService';

export default function VenueListScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
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

  const renderVenueItem = ({ item }) => {
    const isRegistered = item.status === 'REGISTERED';
    const isPreRegistered = item.status === 'PRE_REGISTERED';
    
    return (
      <TouchableOpacity style={styles.venueCard}>
        <View style={styles.venueHeader}>
          <Text style={styles.venueName}>{item.name}</Text>
          <View style={[
            styles.statusBadge,
            isRegistered ? styles.statusRegistered : 
            isPreRegistered ? styles.statusPreRegistered : 
            styles.statusPending
          ]}>
            <Text style={styles.statusText}>
              {isRegistered ? 'Registered' : 
               isPreRegistered ? 'Pre-Registered' : 
               'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.venueDetail}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{item.address}</Text>
        </View>

        <View style={styles.venueDetail}>
          <Text style={styles.detailIcon}>🏙️</Text>
          <Text style={styles.detailText}>{item.city}{item.state ? `, ${item.state}` : ''}{item.pincode ? ` - ${item.pincode}` : ''}</Text>
        </View>

        {item.phone && (
          <View style={styles.venueDetail}>
            <Text style={styles.detailIcon}>📞</Text>
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
        )}

        {item.email && (
          <View style={styles.venueDetail}>
            <Text style={styles.detailIcon}>✉️</Text>
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        )}

        <View style={styles.venueFooter}>
          <Text style={styles.dateText}>
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Venues</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddVenue')}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {venues.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏢</Text>
          <Text style={styles.emptyText}>No venues yet</Text>
          <Text style={styles.emptySubtext}>Start by pre-registering your first venue</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddVenue')}
          >
            <Text style={styles.addButtonText}>Add Venue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={venues}
          renderItem={renderVenueItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  backIcon: {
    fontSize: 28,
    color: COLORS.navy,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  addIcon: {
    fontSize: 32,
    color: COLORS.orange,
    fontWeight: 'bold',
  },
  listContent: {
    padding: SIZES.padding * 2,
  },
  venueCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  venueName: {
    flex: 1,
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusRegistered: {
    backgroundColor: '#28A745',
  },
  statusPreRegistered: {
    backgroundColor: COLORS.navy,
  },
  statusPending: {
    backgroundColor: '#FFC107',
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  venueDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.grey,
  },
  venueFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  dateText: {
    fontSize: SIZES.small,
    color: COLORS.grey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: SIZES.medium,
    color: COLORS.grey,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: COLORS.orange,
    borderRadius: SIZES.buttonRadius,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
});

