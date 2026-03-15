import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { bookingService } from '../../services/api';
import { BookingCard } from '../../components/booking/BookingCard';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography, radius } from '../../theme/tokens';

export default function BookingsScreen() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const router = useRouter();

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getMyBookings();
            setBookings(data);
        } catch (e) {
            console.error('Failed to load bookings:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = (bookingId: string) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bookingService.cancel(bookingId);
                            Alert.alert('Success', 'Booking cancelled successfully');
                            loadBookings();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel booking');
                        }
                    }
                }
            ]
        );
    };

    const filterBookings = (status: string) => {
        const now = new Date();
        return bookings.filter((booking: any) => {
            const bookingDate = new Date(booking.booking_date);

            if (status === 'upcoming') {
                return bookingDate >= now && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED';
            } else if (status === 'past') {
                return bookingDate < now || booking.status === 'COMPLETED';
            } else {
                return booking.status === 'CANCELLED';
            }
        });
    };

    const filteredBookings = filterBookings(activeTab);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen }}>
            {/* Header */}
            <View style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                backgroundColor: colors.background.cardDark,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider
            }}>
                <Text style={{
                    fontSize: typography.heading.h1.size,
                    fontWeight: typography.heading.h1.weight,
                    color: colors.text.primary,
                    fontFamily: typography.fontFamily,
                    marginBottom: spacing.xxs
                }}>
                    My Bookings
                </Text>
                <Text style={{
                    color: colors.text.secondary,
                    fontSize: typography.body.regular.size,
                    fontFamily: typography.fontFamily
                }}>
                    View and manage your bookings
                </Text>
            </View>

            {/* Tabs */}
            <View style={{
                flexDirection: 'row',
                backgroundColor: colors.background.cardDark,
                paddingHorizontal: spacing.lg,
                paddingBottom: spacing.xs,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider
            }}>
                <TouchableOpacity
                    onPress={() => setActiveTab('upcoming')}
                    style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === 'upcoming' ? colors.brand.accent : 'transparent'
                    }}
                >
                    <Text style={{
                        textAlign: 'center',
                        fontWeight: typography.body.large.weight,
                        color: activeTab === 'upcoming' ? colors.brand.accent : colors.text.secondary,
                        fontFamily: typography.fontFamily,
                        fontSize: typography.body.regular.size
                    }}>
                        Upcoming
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('past')}
                    style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === 'past' ? colors.brand.accent : 'transparent'
                    }}
                >
                    <Text style={{
                        textAlign: 'center',
                        fontWeight: typography.body.large.weight,
                        color: activeTab === 'past' ? colors.brand.accent : colors.text.secondary,
                        fontFamily: typography.fontFamily,
                        fontSize: typography.body.regular.size
                    }}>
                        Past
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('cancelled')}
                    style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === 'cancelled' ? colors.brand.accent : 'transparent'
                    }}
                >
                    <Text style={{
                        textAlign: 'center',
                        fontWeight: typography.body.large.weight,
                        color: activeTab === 'cancelled' ? colors.brand.accent : colors.text.secondary,
                        fontFamily: typography.fontFamily,
                        fontSize: typography.body.regular.size
                    }}>
                        Cancelled
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={loadBookings}
                        tintColor={colors.brand.accent}
                    />
                }
            >
                {loading ? (
                    <View style={{ paddingVertical: spacing.xxl }}>
                        <ActivityIndicator size="large" color={colors.brand.accent} />
                    </View>
                ) : filteredBookings.length === 0 ? (
                    <View style={{ paddingVertical: spacing.xxl, alignItems: 'center' }}>
                        <Text style={{ fontSize: 64, marginBottom: spacing.md }}>📅</Text>
                        <Text style={{
                            color: colors.text.secondary,
                            textAlign: 'center',
                            fontSize: typography.heading.h3.size,
                            fontWeight: typography.heading.h3.weight,
                            marginBottom: spacing.xs,
                            fontFamily: typography.fontFamily
                        }}>
                            No {activeTab} bookings
                        </Text>
                        <Text style={{
                            color: colors.text.muted,
                            textAlign: 'center',
                            fontSize: typography.body.small.size,
                            marginBottom: spacing.lg,
                            fontFamily: typography.fontFamily
                        }}>
                            {activeTab === 'upcoming' ? 'Book a court to get started!' : 'Your bookings will appear here'}
                        </Text>
                        {activeTab === 'upcoming' && (
                            <Button
                                variant="primary"
                                onPress={() => router.push('/')}
                            >
                                Browse Venues
                            </Button>
                        )}
                    </View>
                ) : (
                    filteredBookings.map((booking: any) => (
                        <BookingCard
                            key={booking.id}
                            booking={{
                                id: booking.id,
                                court_name: booking.court?.name || 'Court',
                                venue_name: booking.court?.venue?.name || 'Venue',
                                booking_date: booking.booking_date,
                                start_time: booking.start_time,
                                duration_hours: booking.duration_hours,
                                total_amount: booking.total_amount,
                                status: booking.status,
                                booking_type: booking.booking_type
                            }}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
