import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export default function VenueSuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <View style={styles.confetti}>
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.confettiPiece,
                  {
                    backgroundColor: i % 2 === 0 ? COLORS.orange : '#4A90E2',
                    transform: [
                      { rotate: `${i * 45}deg` },
                      { translateX: 40 + i * 5 },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Venue Added Successfully!</Text>
        <Text style={styles.message}>
          Your sports venue has been added successfully and is now live.
        </Text>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('VenueList')}
        >
          <Text style={styles.primaryButtonText}>View Venue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 3,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkMark: {
    fontSize: 60,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  confetti: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -40,
    left: -40,
  },
  confettiPiece: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: SIZES.medium,
    color: COLORS.grey,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: COLORS.orange,
    borderRadius: SIZES.buttonRadius,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
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
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.navy,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
});

