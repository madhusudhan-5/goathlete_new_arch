import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../constants/theme';
import { venueService } from '../services/venueService';

export default function PreRegisterVenueScreen({ navigation }) {
  console.log('PreRegisterVenueScreen: Component mounting...');
  
  const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
      name: '',
      address: '',
      city: '',
      email: '',
      phone: '',
      latitude: '',
      longitude: '',
    });

    // Meeting schedule - Different handling for web vs native
    const isWeb = Platform.OS === 'web';
    // Initialize dates safely - avoid Date() constructor issues on Android
    const getInitialDate = () => {
      if (isWeb) return '';
      try {
        return new Date();
      } catch (error) {
        console.error('Date initialization error:', error);
        return new Date(Date.now());
      }
    };
    const [meetingDate, setMeetingDate] = useState(getInitialDate());
    const [meetingTime, setMeetingTime] = useState(getInitialDate());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setMeetingDate(selectedDate);
      if (errors.meetingDate) {
        setErrors({ ...errors, meetingDate: null });
      }
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setMeetingTime(selectedTime);
      if (errors.meetingTime) {
        setErrors({ ...errors, meetingTime: null });
      }
    }
  };

  const formatDate = (date) => {
    if (isWeb) return date; // For web, it's already a string
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Select Date';
    }
    try {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Select Date';
    }
  };

  const formatTime = (time) => {
    if (isWeb) return time; // For web, it's already a string
    if (!time || !(time instanceof Date) || isNaN(time.getTime())) {
      return 'Select Time';
    }
    try {
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Time formatting error:', error);
      return 'Select Time';
    }
  };

  const getLocation = async () => {
    try {
      console.log('Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      setLoading(true);
      console.log('Getting current position...');
      const location = await Location.getCurrentPositionAsync({});
      console.log('Location received:', location.coords);
      
      const lat = location.coords.latitude.toString();
      const lon = location.coords.longitude.toString();
      
      // Update both latitude and longitude at once to avoid race condition
      setFormData({
        ...formData,
        latitude: lat,
        longitude: lon
      });
      
      // Clear location error when location is successfully picked
      if (errors.location) {
        setErrors({ ...errors, location: null });
      }
      
      console.log('Location updated - Lat:', lat, 'Long:', lon);
      Alert.alert('Success', 'Location captured successfully');
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    console.log('=== VALIDATION CHECK ===');
    console.log('formData.latitude:', formData.latitude, 'Type:', typeof formData.latitude);
    console.log('formData.longitude:', formData.longitude, 'Type:', typeof formData.longitude);
    
    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    // Check location more explicitly
    const hasLatitude = formData.latitude && formData.latitude.toString().trim() !== '';
    const hasLongitude = formData.longitude && formData.longitude.toString().trim() !== '';
    
    console.log('hasLatitude:', hasLatitude);
    console.log('hasLongitude:', hasLongitude);
    
    if (!hasLatitude || !hasLongitude) {
      newErrors.location = 'Please pick location';
      console.log('Location validation FAILED');
    } else {
      console.log('Location validation PASSED');
    }
    
    // Validate date based on platform
    if (isWeb) {
      if (!meetingDate.trim()) {
        newErrors.meetingDate = 'Meeting date is required';
      }
    } else {
      if (!meetingDate || !(meetingDate instanceof Date)) {
        newErrors.meetingDate = 'Meeting date is required';
      }
    }
    
    // Validate time based on platform
    if (isWeb) {
      if (!meetingTime.trim()) {
        newErrors.meetingTime = 'Meeting time is required';
      }
    } else {
      if (!meetingTime || !(meetingTime instanceof Date)) {
        newErrors.meetingTime = 'Meeting time is required';
      }
    }
    
    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    console.log('Validation result:', Object.keys(newErrors).length === 0 ? 'PASS' : 'FAIL');
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('=== Starting Pre-Registration Submission ===');
    console.log('Form Data:', formData);
    console.log('Meeting Date:', meetingDate);
    console.log('Meeting Time:', meetingTime);
    console.log('Platform:', Platform.OS);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setLoading(true);
    try {
      // Combine date and time based on platform
      let meetingDateTime;
      
      if (isWeb) {
        // Web: strings in format YYYY-MM-DD and HH:MM
        meetingDateTime = `${meetingDate}T${meetingTime}:00`;
      } else {
        // Native: Date objects - validate before using
        if (!meetingDate || !(meetingDate instanceof Date) || isNaN(meetingDate.getTime())) {
          throw new Error('Invalid meeting date');
        }
        if (!meetingTime || !(meetingTime instanceof Date) || isNaN(meetingTime.getTime())) {
          throw new Error('Invalid meeting time');
        }
        const dateStr = meetingDate.toISOString().split('T')[0];
        const hours = meetingTime.getHours().toString().padStart(2, '0');
        const minutes = meetingTime.getMinutes().toString().padStart(2, '0');
        meetingDateTime = `${dateStr}T${hours}:${minutes}:00`;
      }
      
      console.log('Meeting DateTime:', meetingDateTime);

      const payload = {
        ...formData,
        meeting_datetime: meetingDateTime,
        status: 'PRE_REGISTERED',
      };
      console.log('Submitting payload:', payload);

      const response = await venueService.preRegisterVenue(payload);
      console.log('Response received:', response);
      
      // Navigate immediately to success screen
      navigation.replace('PreRegisterSuccess');
    } catch (error) {
      console.error('Pre-registration error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.error || error.message || 'Failed to pre-register venue'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pre-Register Venue</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Venue Information</Text>
        <Text style={styles.subtitle}>
          Provide basic venue details to get started
        </Text>

        {/* Venue Name */}
        <View>
          <View style={[styles.inputContainer, errors.name && styles.inputError]}>
            <Text style={styles.icon}>🏟️</Text>
            <TextInput
              style={styles.input}
              placeholder="Venue Name *"
              placeholderTextColor={COLORS.grey}
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Address */}
        <View>
          <View style={[styles.inputContainer, errors.address && styles.inputError]}>
            <Text style={styles.icon}>📍</Text>
            <TextInput
              style={styles.input}
              placeholder="Address *"
              placeholderTextColor={COLORS.grey}
              value={formData.address}
              onChangeText={(text) => updateField('address', text)}
              multiline
            />
          </View>
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        {/* City */}
        <View>
          <View style={[styles.inputContainer, errors.city && styles.inputError]}>
            <Text style={styles.icon}>🏙️</Text>
            <TextInput
              style={styles.input}
              placeholder="City *"
              placeholderTextColor={COLORS.grey}
              value={formData.city}
              onChangeText={(text) => updateField('city', text)}
            />
          </View>
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>

        {/* Email */}
        <View>
          <View style={[styles.inputContainer, errors.email && styles.inputError]}>
            <Text style={styles.icon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor={COLORS.grey}
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Phone */}
        <View>
          <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
            <Text style={styles.icon}>📞</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              placeholderTextColor={COLORS.grey}
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              keyboardType="phone-pad"
            />
          </View>
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Location Picker */}
        <View>
          <TouchableOpacity
            style={[
              styles.locationButton,
              formData.latitude && formData.longitude && styles.locationButtonSuccess
            ]}
            onPress={getLocation}
            disabled={loading || !!(formData.latitude && formData.longitude)}
          >
            <Text style={styles.locationIcon}>
              {formData.latitude && formData.longitude ? '✓' : '📍'}
            </Text>
            <Text style={styles.locationButtonText}>
              {formData.latitude && formData.longitude ? 'Location Captured' : 'Pick Location'}
            </Text>
          </TouchableOpacity>
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        {/* Location Display */}
        {(formData.latitude && formData.longitude) ? (
          <View style={styles.locationDisplay}>
            <Text style={styles.sectionLabel}>Location Details:</Text>
            
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Text style={styles.icon}>📍</Text>
              <TextInput
                style={[styles.input, styles.disabledText]}
                placeholder="Address"
                placeholderTextColor={COLORS.grey}
                value={formData.address}
                editable={false}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.disabledInput, styles.halfWidth, styles.marginRight]}>
                <Text style={styles.icon}>🌐</Text>
                <TextInput
                  style={[styles.input, styles.disabledText]}
                  placeholder="Latitude"
                  placeholderTextColor={COLORS.grey}
                  value={String(parseFloat(formData.latitude).toFixed(6))}
                  editable={false}
                />
              </View>
              <View style={[styles.inputContainer, styles.disabledInput, styles.halfWidth, styles.marginLeft]}>
                <Text style={styles.icon}>🌐</Text>
                <TextInput
                  style={[styles.input, styles.disabledText]}
                  placeholder="Longitude"
                  placeholderTextColor={COLORS.grey}
                  value={String(parseFloat(formData.longitude).toFixed(6))}
                  editable={false}
                />
              </View>
            </View>
          </View>
        ) : null}

        {/* Meeting Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Meeting Schedule:</Text>

          {/* Meeting Date */}
          <View>
            {isWeb ? (
              // Web: Text input
              <View style={[styles.inputContainer, errors.meetingDate && styles.inputError]}>
                <Text style={styles.icon}>📅</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Meeting Date (YYYY-MM-DD) *"
                  placeholderTextColor={COLORS.grey}
                  value={meetingDate}
                  onChangeText={(text) => {
                    setMeetingDate(text);
                    if (errors.meetingDate) {
                      setErrors({ ...errors, meetingDate: null });
                    }
                  }}
                />
              </View>
            ) : (
              // Native: Date picker
              <TouchableOpacity
                style={[styles.inputContainer, errors.meetingDate && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.icon}>📅</Text>
                <Text style={styles.input}>
                  {formatDate(meetingDate)}
                </Text>
              </TouchableOpacity>
            )}
            {errors.meetingDate && <Text style={styles.errorText}>{errors.meetingDate}</Text>}
          </View>

          {/* Meeting Time */}
          <View>
            {isWeb ? (
              // Web: Text input
              <View style={[styles.inputContainer, errors.meetingTime && styles.inputError]}>
                <Text style={styles.icon}>🕐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Meeting Time (HH:MM) *"
                  placeholderTextColor={COLORS.grey}
                  value={meetingTime}
                  onChangeText={(text) => {
                    setMeetingTime(text);
                    if (errors.meetingTime) {
                      setErrors({ ...errors, meetingTime: null });
                    }
                  }}
                />
              </View>
            ) : (
              // Native: Time picker
              <TouchableOpacity
                style={[styles.inputContainer, errors.meetingTime && styles.inputError]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.icon}>🕐</Text>
                <Text style={styles.input}>
                  {formatTime(meetingTime)}
                </Text>
              </TouchableOpacity>
            )}
            {errors.meetingTime && <Text style={styles.errorText}>{errors.meetingTime}</Text>}
          </View>

          {/* Date/Time Pickers for Native */}
          {!isWeb && showDatePicker && meetingDate instanceof Date && !isNaN(meetingDate.getTime()) && (
            <DateTimePicker
              value={meetingDate}
              mode="date"
              display={Platform.OS === 'android' ? 'default' : 'spinner'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {!isWeb && showTimePicker && meetingTime instanceof Date && !isNaN(meetingTime.getTime()) && (
            <DateTimePicker
              value={meetingTime}
              mode="time"
              display={Platform.OS === 'android' ? 'default' : 'spinner'}
              onChange={onTimeChange}
            />
          )}

          {/* Help text only for web */}
          {isWeb && (
            <View style={styles.helpBox}>
              <Text style={styles.helpText}>
                Date format: 2026-01-05{'\n'}
                Time format: 14:30 (24-hour format)
              </Text>
            </View>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            This is a pre-registration. Our team will contact you for complete
            venue registration and verification.
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Pre-Registration</Text>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
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
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: 24,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.grey,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.small,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.navy,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
  },
  halfWidth: {
    flex: 1,
  },
  marginRight: {
    marginRight: 8,
  },
  marginLeft: {
    marginLeft: 8,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGrey,
  },
  disabledText: {
    color: COLORS.grey,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.orange,
    borderRadius: SIZES.buttonRadius,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  locationButtonSuccess: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
    color: COLORS.white,
  },
  locationButtonText: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 12,
  },
  locationDisplay: {
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.navy,
    lineHeight: 20,
  },
  helpBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: SIZES.radius,
    padding: 12,
    marginTop: 8,
  },
  helpText: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    lineHeight: 18,
  },
  footer: {
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  submitButton: {
    backgroundColor: COLORS.orange,
    borderRadius: SIZES.buttonRadius,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
});

