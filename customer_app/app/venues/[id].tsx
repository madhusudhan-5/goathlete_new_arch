import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Star, ChevronRight } from 'lucide-react-native';
import { venueService, courtService } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CourtCard } from '../../components/booking/CourtCard';
import { colors, spacing, typography, radius } from '../../theme/tokens';

export default function VenueDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [venue, setVenue] = useState<any>(null);
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadVenueDetails();
    }, [id]);

    const loadVenueDetails = async () => {
        try {
            setLoading(true);
            const [venueData, courtsData] = await Promise.all([
                venueService.getById(id as string),
                courtService.getByVenue(id as string)
            ]);
            setVenue(venueData);
            setCourts(courtsData);
        } catch (e) {
            console.error('Failed to load venue details:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.brand.accent} />
            </SafeAreaView>
        );
    }

    if (!venue) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.text.secondary, fontFamily: typography.fontFamily }}>Venue not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen }}>
            <ScrollView>
                {/* Header Image */}
                <View style={{
                    backgroundColor: colors.background.cardDark,
                    height: 240,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Text style={{ fontSize: 80 }}>🏟️</Text>
                </View>

                {/* Venue Info */}
                <View style={{
                    backgroundColor: colors.background.screen,
                    paddingHorizontal: spacing.lg,
                    paddingTop: spacing.lg,
                    marginTop: -spacing.lg,
                    borderTopLeftRadius: radius.xl,
                    borderTopRightRadius: radius.xl
                }}>
                    <Card padding="lg" style={{ marginBottom: spacing.md }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: typography.heading.h1.size,
                                    fontWeight: typography.heading.h1.weight,
                                    color: colors.text.dark,
                                    fontFamily: typography.fontFamily,
                                    marginBottom: spacing.xs
                                }}>
                                    {venue.name}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xxs }}>
                                    <MapPin size={14} color={colors.text.muted} />
                                    <Text style={{ color: colors.text.muted, fontSize: typography.body.small.size, fontFamily: typography.fontFamily }}>
                                        {venue.address}
                                    </Text>
                                </View>
                                <Text style={{ color: colors.text.muted, fontSize: typography.body.small.size, fontFamily: typography.fontFamily }}>
                                    {venue.city}, {venue.state} - {venue.pincode}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, backgroundColor: colors.status.warning + '20', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill }}>
                                <Star size={14} color={colors.status.warning} fill={colors.status.warning} />
                                <Text style={{ color: colors.text.dark, fontWeight: typography.body.large.weight, fontSize: typography.body.small.size, fontFamily: typography.fontFamily }}>
                                    4.5
                                </Text>
                            </View>
                        </View>

                        {/* Contact Info */}
                        <View style={{ backgroundColor: colors.background.cardDark + '40', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md }}>
                            <Text style={{ fontSize: typography.body.small.size, color: colors.text.muted, marginBottom: spacing.xs, fontFamily: typography.fontFamily }}>
                                Contact
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                                <Phone size={14} color={colors.text.dark} />
                                <Text style={{ color: colors.text.dark, fontWeight: typography.body.large.weight, fontFamily: typography.fontFamily }}>
                                    {venue.contact_number}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                                <Mail size={14} color={colors.text.dark} />
                                <Text style={{ color: colors.text.dark, fontWeight: typography.body.large.weight, fontFamily: typography.fontFamily }}>
                                    {venue.contact_email}
                                </Text>
                            </View>
                        </View>

                        {/* Amenities */}
                        <View>
                            <Text style={{
                                fontSize: typography.heading.h3.size,
                                fontWeight: typography.heading.h3.weight,
                                color: colors.text.dark,
                                fontFamily: typography.fontFamily,
                                marginBottom: spacing.sm
                            }}>
                                Amenities
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                                <Badge variant="info" size="small">🅿️ Parking</Badge>
                                <Badge variant="info" size="small">🚿 Changing Rooms</Badge>
                                <Badge variant="info" size="small">☕ Cafe</Badge>
                                <Badge variant="info" size="small">💡 Floodlights</Badge>
                            </View>
                        </View>
                    </Card>

                    {/* Available Courts */}
                    <View style={{ marginBottom: spacing.lg }}>
                        <Text style={{
                            fontSize: typography.heading.h2.size,
                            fontWeight: typography.heading.h2.weight,
                            color: colors.text.primary,
                            fontFamily: typography.fontFamily,
                            marginBottom: spacing.md
                        }}>
                            Available Courts ({courts.length})
                        </Text>
                        {courts.map((court: any) => (
                            <CourtCard
                                key={court.id}
                                court={court}
                                onPress={() => router.push(`/booking/select-slot?venueId=${id}&courtId=${court.id}`)}
                                selectable
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={{
                backgroundColor: colors.background.cardDark,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderTopWidth: 1,
                borderTopColor: colors.divider
            }}>
                <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onPress={() => router.push(`/booking/select-court?venueId=${id}`)}
                >
                    Book a Court
                </Button>
            </View>
        </SafeAreaView>
    );
}
