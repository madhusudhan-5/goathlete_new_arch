import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Edit, Calendar, Award, Bell, CreditCard, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { authService, playerService } from '../../services/api';
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { colors, spacing, typography, radius } from '../../theme/tokens';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const [profileData, statsData] = await Promise.all([
                playerService.getProfile(),
                playerService.getStats().catch(() => ({
                    total_bookings: 0,
                    tournaments_played: 0,
                    matches_won: 0
                }))
            ]);
            setUser(profileData);
            setStats(statsData);
        } catch (e) {
            console.error('Failed to load profile:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await authService.logout();
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.brand.accent} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen }}>
            <ScrollView>
                {/* Profile Header */}
                <View style={{ backgroundColor: colors.background.cardDark, padding: spacing.lg, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.divider, marginBottom: spacing.md }}>
                    <View style={{ width: 96, height: 96, backgroundColor: colors.brand.accent, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }}>
                        <User size={48} color={colors.text.primary} />
                    </View>
                    <Text style={{ fontSize: typography.heading.h1.size, fontWeight: typography.heading.h1.weight, color: colors.text.primary, fontFamily: typography.fontFamily, marginBottom: spacing.xxs }}>
                        {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Player'}
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: typography.body.regular.size, fontFamily: typography.fontFamily }}>
                        {user?.phone || 'No phone number'}
                    </Text>
                    {user?.email && (
                        <Text style={{ color: colors.text.muted, fontSize: typography.body.small.size, marginTop: spacing.xxs, fontFamily: typography.fontFamily }}>
                            {user.email}
                        </Text>
                    )}
                </View>

                {/* Stats */}
                <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
                    <Text style={{ fontSize: typography.heading.h2.size, fontWeight: typography.heading.h2.weight, color: colors.text.primary, fontFamily: typography.fontFamily, marginBottom: spacing.sm }}>
                        My Stats
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs }}>
                        <Card padding="md" style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={{ fontSize: 32, fontWeight: typography.heading.h1.weight, color: colors.brand.accent, fontFamily: typography.fontFamily }}>
                                {stats?.total_bookings || 0}
                            </Text>
                            <Text style={{ fontSize: typography.body.small.size, color: colors.text.muted, marginTop: spacing.xxs, fontFamily: typography.fontFamily }}>
                                Bookings
                            </Text>
                        </Card>
                        <Card padding="md" style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={{ fontSize: 32, fontWeight: typography.heading.h1.weight, color: colors.status.success, fontFamily: typography.fontFamily }}>
                                {stats?.tournaments_played || 0}
                            </Text>
                            <Text style={{ fontSize: typography.body.small.size, color: colors.text.muted, marginTop: spacing.xxs, fontFamily: typography.fontFamily }}>
                                Tournaments
                            </Text>
                        </Card>
                        <Card padding="md" style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={{ fontSize: 32, fontWeight: typography.heading.h1.weight, color: colors.status.warning, fontFamily: typography.fontFamily }}>
                                {stats?.matches_won || 0}
                            </Text>
                            <Text style={{ fontSize: typography.body.small.size, color: colors.text.muted, marginTop: spacing.xxs, fontFamily: typography.fontFamily }}>
                                Wins
                            </Text>
                        </Card>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
                    <Text style={{ fontSize: typography.heading.h2.size, fontWeight: typography.heading.h2.weight, color: colors.text.primary, fontFamily: typography.fontFamily, marginBottom: spacing.sm }}>
                        Account
                    </Text>

                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.background.card, borderRadius: radius.lg, marginBottom: spacing.xs }}>
                        <Edit size={20} color={colors.text.dark} style={{ marginRight: spacing.sm }} />
                        <Text style={{ color: colors.text.dark, fontWeight: typography.body.large.weight, flex: 1, fontFamily: typography.fontFamily }}>
                            Edit Profile
                        </Text>
                        <ChevronRight size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.background.card, borderRadius: radius.lg, marginBottom: spacing.xs }} onPress={() => router.push('/(tabs)/bookings')}>
                        <Calendar size={20} color={colors.text.dark} style={{ marginRight: spacing.sm }} />
                        <Text style={{ color: colors.text.dark, fontWeight: typography.body.large.weight, flex: 1, fontFamily: typography.fontFamily }}>
                            My Bookings
                        </Text>
                        <ChevronRight size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.background.card, borderRadius: radius.lg, marginBottom: spacing.xs }}>
                        <Award size={20} color={colors.text.dark} style={{ marginRight: spacing.sm }} />
                        <Text style={{ color: colors.text.dark, fontWeight: typography.body.large.weight, flex: 1, fontFamily: typography.fontFamily }}>
                            Badges & Achievements
                        </Text>
                        <ChevronRight size={20} color={colors.text.muted} />
                    </TouchableOpacity>
                </View>

                {/* Settings */}
                <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
                    <Text style={{ fontSize: typography.heading.h2.size, fontWeight: typography.heading.h2.weight, color: colors.text.primary, fontFamily: typography.fontFamily, marginBottom: spacing.sm }}>
                        Settings
                    </Text>

                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.background.card, borderRadius: radius.lg, marginBottom: spacing.xs }}>
                        <Bell size={20} color={colors.text.dark} style={{ marginRight: spacing.sm }} />
                        <Text style={{ color: colors.text.dark, fontWeight: typography.body.large.weight, flex: 1, fontFamily: typography.fontFamily }}>
                            Notifications
                        </Text>
                        <ChevronRight size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.background.card, borderRadius: radius.lg, marginBottom: spacing.xs }}>
                        <CreditCard size={20} color={colors.text.dark} style={{ marginRight: spacing.sm }} />
                        <Text style={{ color: colors.text.dark, fontWeight: typography.body.large.weight, flex: 1, fontFamily: typography.fontFamily }}>
                            Payment Methods
                        </Text>
                        <ChevronRight size={20} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.background.card, borderRadius: radius.lg, marginBottom: spacing.xs }}>
                        <HelpCircle size={20} color={colors.text.dark} style={{ marginRight: spacing.sm }} />
                        <Text style={{ color: colors.text.dark, fontWeight: typography.body.large.weight, flex: 1, fontFamily: typography.fontFamily }}>
                            Help & Support
                        </Text>
                        <ChevronRight size={20} color={colors.text.muted} />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.status.error + '20', borderRadius: radius.lg }} onPress={handleLogout}>
                        <LogOut size={20} color={colors.status.error} style={{ marginRight: spacing.sm }} />
                        <Text style={{ color: colors.status.error, fontWeight: typography.body.large.weight, flex: 1, fontFamily: typography.fontFamily }}>
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
