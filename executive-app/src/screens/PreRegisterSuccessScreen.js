import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export default function PreRegisterSuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✅</Text>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Pre-Registration Successful!</Text>
        <Text style={styles.message}>
          Thank you for pre-registering your venue with GoAthlete.
        </Text>
        <Text style={styles.submessage}>
          Our team will review your information and contact you within 24-48
          hours to complete the registration process.
        </Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What's Next?</Text>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              Our team will verify your venue details
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              We'll schedule a meeting for complete registration
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>
              You'll receive a confirmation email shortly
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('VenueList')}
        >
          <Text style={styles.primaryButtonText}>View My Venues</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.secondaryButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: 80,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: SIZES.large,
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  submessage: {
    fontSize: SIZES.medium,
    color: COLORS.grey,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.orange,
  },
  infoTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: SIZES.medium,
    color: COLORS.orange,
    marginRight: 8,
    fontWeight: 'bold',
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.grey,
    lineHeight: 20,
  },
  footer: {
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  primaryButton: {
    backgroundColor: COLORS.orange,
    borderRadius: SIZES.buttonRadius,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.buttonRadius,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.navy,
  },
  secondaryButtonText: {
    color: COLORS.navy,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
});

