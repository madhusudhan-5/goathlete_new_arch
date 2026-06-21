import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronDown, Check, User } from 'lucide-react-native';
import { playerService } from '../../services/api';
import { colors, spacing, typography, radius } from '../../theme/tokens';

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];
const FITNESS_OPTIONS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'];

const FITNESS_LABELS: Record<string, string> = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
    PROFESSIONAL: 'Professional',
};

const GENDER_LABELS: Record<string, string> = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
};

function SelectModal({
    visible,
    title,
    options,
    labels,
    selected,
    onSelect,
    onClose,
}: {
    visible: boolean;
    title: string;
    options: string[];
    labels: Record<string, string>;
    selected: string;
    onSelect: (v: string) => void;
    onClose: () => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' }}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={{
                    backgroundColor: colors.background.cardDark,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    paddingTop: spacing.lg,
                    paddingBottom: spacing.xxl,
                }}>
                    <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.heading.h3.size,
                        fontWeight: typography.heading.h3.weight,
                        fontFamily: typography.fontFamily,
                        textAlign: 'center',
                        marginBottom: spacing.md,
                        paddingHorizontal: spacing.lg,
                    }}>
                        {title}
                    </Text>
                    <View style={{ height: 1, backgroundColor: colors.divider, marginBottom: spacing.sm }} />
                    {options.map(opt => (
                        <TouchableOpacity
                            key={opt}
                            onPress={() => { onSelect(opt); onClose(); }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingHorizontal: spacing.lg,
                                paddingVertical: spacing.md,
                            }}
                        >
                            <Text style={{
                                color: selected === opt ? colors.brand.accent : colors.text.primary,
                                fontSize: typography.body.large.size,
                                fontFamily: typography.fontFamily,
                                fontWeight: selected === opt ? '700' : '400',
                            }}>
                                {labels[opt] ?? opt}
                            </Text>
                            {selected === opt && <Check size={20} color={colors.brand.accent} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

export default function EditProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [city, setCity] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [fitnessLevel, setFitnessLevel] = useState('BEGINNER');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [avatarLetter, setAvatarLetter] = useState('P');

    const [genderModal, setGenderModal] = useState(false);
    const [fitnessModal, setFitnessModal] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await playerService.getProfileFresh();
            setFirstName(data.first_name || '');
            setLastName(data.last_name || '');
            setCity(data.city || '');
            setDob(data.date_of_birth || '');
            setGender(data.gender || '');
            setFitnessLevel(data.fitness_level || 'BEGINNER');
            setHeight(data.height ? String(data.height) : '');
            setWeight(data.weight ? String(data.weight) : '');
            setAvatarLetter(data.first_name ? data.first_name[0].toUpperCase() : 'P');
        } catch {
            Alert.alert('Error', 'Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!firstName.trim()) {
            Alert.alert('Validation', 'First name is required.');
            return;
        }
        try {
            setSaving(true);
            await playerService.updateProfile({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                city: city.trim(),
                date_of_birth: dob || null,
                gender: gender || null,
                fitness_level: fitnessLevel,
                height: height ? parseFloat(height) : null,
                weight: weight ? parseFloat(weight) : null,
            });
            Alert.alert('✅ Saved', 'Profile updated successfully.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.detail || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        backgroundColor: colors.background.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.divider,
        color: colors.text.dark,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.body.large.size,
        fontFamily: typography.fontFamily,
        marginBottom: spacing.sm,
    };

    const labelStyle = {
        color: colors.text.secondary,
        fontSize: typography.body.small.size,
        fontFamily: typography.fontFamily,
        marginBottom: 6,
        marginTop: spacing.sm,
    };

    const sectionTitle = {
        color: colors.text.primary,
        fontSize: typography.heading.h3.size,
        fontWeight: typography.heading.h3.weight as any,
        fontFamily: typography.fontFamily,
        marginBottom: spacing.sm,
        marginTop: spacing.lg,
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={colors.brand.accent} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: colors.background.cardDark,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.sm }}>
                        <ChevronLeft size={26} color={colors.brand.accent} />
                    </TouchableOpacity>
                    <Text style={{
                        flex: 1,
                        fontSize: typography.heading.h2.size,
                        fontWeight: typography.heading.h2.weight,
                        color: colors.text.primary,
                        fontFamily: typography.fontFamily,
                    }}>
                        Edit Profile
                    </Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        style={{
                            backgroundColor: saving ? '#555' : colors.brand.accent,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.xs,
                            borderRadius: radius.pill,
                        }}
                    >
                        {saving
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Text style={{ color: '#fff', fontWeight: '700', fontFamily: typography.fontFamily }}>Save</Text>
                        }
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ padding: spacing.lg }} showsVerticalScrollIndicator={false}>

                    {/* Avatar */}
                    <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                        <View style={{
                            width: 96,
                            height: 96,
                            borderRadius: 48,
                            backgroundColor: colors.brand.accent,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: spacing.sm,
                        }}>
                            <Text style={{ fontSize: 40, color: '#fff', fontWeight: '700' }}>{avatarLetter}</Text>
                        </View>
                        <Text style={{ color: colors.text.secondary, fontSize: typography.body.small.size, fontFamily: typography.fontFamily }}>
                            Profile picture (initials-based)
                        </Text>
                    </View>

                    {/* Personal Info */}
                    <Text style={sectionTitle}>Personal Information</Text>

                    <Text style={labelStyle}>First Name *</Text>
                    <TextInput
                        style={inputStyle}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First name"
                        placeholderTextColor={colors.text.muted}
                    />

                    <Text style={labelStyle}>Last Name</Text>
                    <TextInput
                        style={inputStyle}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last name"
                        placeholderTextColor={colors.text.muted}
                    />

                    <Text style={labelStyle}>City</Text>
                    <TextInput
                        style={inputStyle}
                        value={city}
                        onChangeText={setCity}
                        placeholder="e.g. Bengaluru"
                        placeholderTextColor={colors.text.muted}
                    />

                    <Text style={labelStyle}>Date of Birth (YYYY-MM-DD)</Text>
                    <TextInput
                        style={inputStyle}
                        value={dob}
                        onChangeText={setDob}
                        placeholder="e.g. 1995-08-15"
                        placeholderTextColor={colors.text.muted}
                        keyboardType="numbers-and-punctuation"
                    />

                    {/* Gender Picker */}
                    <Text style={labelStyle}>Gender</Text>
                    <TouchableOpacity
                        onPress={() => setGenderModal(true)}
                        style={{
                            ...inputStyle,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: gender ? colors.text.dark : colors.text.muted, fontFamily: typography.fontFamily, fontSize: typography.body.large.size }}>
                            {gender ? GENDER_LABELS[gender] : 'Select gender'}
                        </Text>
                        <ChevronDown size={18} color={colors.text.muted} />
                    </TouchableOpacity>

                    {/* Fitness Section */}
                    <Text style={sectionTitle}>Fitness Profile</Text>

                    {/* Fitness Level Picker */}
                    <Text style={labelStyle}>Fitness Level</Text>
                    <TouchableOpacity
                        onPress={() => setFitnessModal(true)}
                        style={{
                            ...inputStyle,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: colors.text.dark, fontFamily: typography.fontFamily, fontSize: typography.body.large.size }}>
                            {FITNESS_LABELS[fitnessLevel] ?? fitnessLevel}
                        </Text>
                        <ChevronDown size={18} color={colors.text.muted} />
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        <View style={{ flex: 1 }}>
                            <Text style={labelStyle}>Height (cm)</Text>
                            <TextInput
                                style={inputStyle}
                                value={height}
                                onChangeText={setHeight}
                                placeholder="e.g. 175"
                                placeholderTextColor={colors.text.muted}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={labelStyle}>Weight (kg)</Text>
                            <TextInput
                                style={inputStyle}
                                value={weight}
                                onChangeText={setWeight}
                                placeholder="e.g. 72"
                                placeholderTextColor={colors.text.muted}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Gender Modal */}
            <SelectModal
                visible={genderModal}
                title="Select Gender"
                options={GENDER_OPTIONS}
                labels={GENDER_LABELS}
                selected={gender}
                onSelect={setGender}
                onClose={() => setGenderModal(false)}
            />

            {/* Fitness Modal */}
            <SelectModal
                visible={fitnessModal}
                title="Fitness Level"
                options={FITNESS_OPTIONS}
                labels={FITNESS_LABELS}
                selected={fitnessLevel}
                onSelect={setFitnessLevel}
                onClose={() => setFitnessModal(false)}
            />
        </SafeAreaView>
    );
}
