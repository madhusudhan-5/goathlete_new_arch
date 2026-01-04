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
  Image,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { COLORS, SIZES } from '../constants/theme';
import { venueService } from '../services/venueService';

// Equipment options
const EQUIPMENT_OPTIONS = [
  'Tennis Racket',
  'Cricket Bat',
  'Cricket Ball',
  'Badminton Racket',
  'Shuttlecock',
  'Football',
  'Basketball',
  'Volleyball',
  'Table Tennis Racket',
  'Table Tennis Ball',
  'Hockey Stick',
  'Rugby Ball',
  'Baseball Bat',
  'Baseball',
  'Golf Club',
  'Golf Ball',
  'Other',
];

// Sports options
const SPORTS_OPTIONS = [
  'Badminton',
  'Tennis',
  'Cricket',
  'Football',
  'Basketball',
  'Volleyball',
  'Table Tennis',
  'Squash',
  'Hockey',
  'Rugby',
  'Baseball',
  'Golf',
  'Swimming',
  'Athletics',
  'Other',
];

export default function AddVenueScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Step 1: Venue Basic Details
  const [venueDetails, setVenueDetails] = useState({
    name: '',
    description: '',  // NEW
    address: '',
    city: '',
    state: '',
    pincode: '',
    email: '',
    phone: '',
    latitude: '',
    longitude: '',
    aadhar_number: '',
    pan_number: '',
    gst_number: '',
  });

  // License Documents
  const [licenseDocuments, setLicenseDocuments] = useState({
    aadhar: null,
    pan: null,
    gst: null,
  });

  // Step 2: Venue Facilities (NEW)
  const [facilities, setFacilities] = useState([]);

  // Step 3: Media Upload (exactly 2 images required)
  const [images, setImages] = useState([]);

  // Step 4: Meeting Schedule
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  // Step 5: Add Courts
  const [courts, setCourts] = useState([]);
  const [currentCourt, setCurrentCourt] = useState({
    name: '',
    sport_type: '',
    surface_type: '',  // NEW
    count: '1',
  });

  // Step 5: Open Hours (NEW)
  const [openHours, setOpenHours] = useState({
    Monday: { open: '06:00', close: '22:00', isOpen: true },
    Tuesday: { open: '06:00', close: '22:00', isOpen: true },
    Wednesday: { open: '06:00', close: '22:00', isOpen: true },
    Thursday: { open: '06:00', close: '22:00', isOpen: true },
    Friday: { open: '06:00', close: '22:00', isOpen: true },
    Saturday: { open: '06:00', close: '22:00', isOpen: false },
    Sunday: { open: '06:00', close: '22:00', isOpen: false },
  });

  // Step 6: Equipment Rental (NEW - Optional)
  const [equipment, setEquipment] = useState([]);
  const [currentEquipment, setCurrentEquipment] = useState({
    name: '',
    price: '',
    unit: 'hour',
  });

  // Step 7: Court Slots & Pricing (NEW)
  const [courtSlots, setCourtSlots] = useState({});  // Will store slots per court: {courtIndex: [{day, startTime, endTime, price}]}
  const [selectedCourtForSlots, setSelectedCourtForSlots] = useState(0);
  const [currentSlot, setCurrentSlot] = useState({
    day: 'Monday',
    start_time: '06:00',
    end_time: '07:00',
    price: '',
  });

  // Step 9: Adventures/Other Activities
  const [adventureType, setAdventureType] = useState(''); // 'adventure' or 'other'
  const [activities, setActivities] = useState([]);
  const [currentActivity, setCurrentActivity] = useState({
    name: '',
    description: '',
    price: '',
  });

  const updateVenueDetail = (field, value) => {
    setVenueDetails({ ...venueDetails, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  // ============================================
  // STEP 1: VENUE BASIC DETAILS
  // ============================================
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      
      const lat = location.coords.latitude.toString();
      const lon = location.coords.longitude.toString();
      
      // Update both at once to avoid race condition
      setVenueDetails({
        ...venueDetails,
        latitude: lat,
        longitude: lon
      });
      
      // Clear location error
      if (errors.location) {
        setErrors({ ...errors, location: null });
      }
      
      Alert.alert('Success', 'Location captured successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Convert to base64
        let base64Data = '';
        try {
          if (Platform.OS === 'web') {
            // For web, read as base64 using FileReader
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            base64Data = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result.split(',')[1]; // Remove data:mime;base64, prefix
                resolve(base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } else {
            // For mobile, use FileSystem
            base64Data = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          }
        } catch (error) {
          console.error('Error converting to base64:', error);
          Alert.alert('Error', 'Failed to process document');
          return;
        }
        
        setLicenseDocuments({
          ...licenseDocuments,
          [type]: {
            name: asset.name,
            base64: base64Data,
            mimeType: asset.mimeType || 'application/pdf',
          },
        });
        Alert.alert('Success', `${type.toUpperCase()} document uploaded successfully`);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    console.log('Validating Step 1...');
    console.log('Venue Details:', venueDetails);
    console.log('License Documents:', licenseDocuments);
    
    if (!venueDetails.name.trim()) {
      newErrors.name = 'Venue name is required';
    }
    if (!venueDetails.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!venueDetails.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!venueDetails.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    // Email validation
    if (!venueDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(venueDetails.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    const hasLatitude = venueDetails.latitude && venueDetails.latitude.toString().trim() !== '';
    const hasLongitude = venueDetails.longitude && venueDetails.longitude.toString().trim() !== '';
    
    if (!hasLatitude || !hasLongitude) {
      newErrors.location = 'Please pick location';
    }

    // Aadhar validation - required and must be 12 digits
    if (!venueDetails.aadhar_number || !venueDetails.aadhar_number.trim()) {
      newErrors.aadhar = 'Aadhar number is required';
    } else if (!/^\d{12}$/.test(venueDetails.aadhar_number)) {
      newErrors.aadhar = 'Aadhar must be exactly 12 digits';
    }
    
    // PAN validation - required and must be 10 characters in correct format
    if (!venueDetails.pan_number || !venueDetails.pan_number.trim()) {
      newErrors.pan = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(venueDetails.pan_number)) {
      newErrors.pan = 'PAN format invalid (e.g., ABCDE1234F)';
    }
    
    // GST validation - optional but if provided, must be 15 characters in correct format
    if (venueDetails.gst_number && venueDetails.gst_number.trim()) {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(venueDetails.gst_number)) {
        newErrors.gst = 'GST format invalid (15 characters)';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation Errors:', newErrors);
      // Don't show alert, errors will be displayed inline
    } else {
      console.log('Validation passed!');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // STEP 2: MEDIA UPLOAD
  // ============================================
  const pickImages = async () => {
    if (images.length >= 2) {
      Alert.alert('Limit Reached', 'Maximum 2 images allowed');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Convert to base64
      let base64Data = '';
      try {
        if (Platform.OS === 'web') {
          // For web, read as base64 using FileReader
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result.split(',')[1]; // Remove data:mime;base64, prefix
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          // For mobile, use FileSystem
          base64Data = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
        
        setImages([...images, {
          uri: asset.uri, // Keep for preview
          base64: base64Data,
          mimeType: 'image/jpeg',
        }]);
      } catch (error) {
        console.error('Error converting image to base64:', error);
        Alert.alert('Error', 'Failed to process image');
      }
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateStep2 = () => {
    if (images.length !== 2) {
      Alert.alert('Required', 'Exactly 2 images are required');
      return false;
    }
    return true;
  };

  // ============================================
  // STEP 3: MEETING SCHEDULE
  // ============================================
  const validateStep3 = () => {
    if (!meetingDate.trim()) {
      Alert.alert('Required', 'Meeting date is required');
      return false;
    }
    if (!meetingTime.trim()) {
      Alert.alert('Required', 'Meeting time is required');
      return false;
    }
    return true;
  };

  // ============================================
  // STEP 4: ADD COURTS
  // ============================================
  const addCourt = () => {
    if (!currentCourt.name.trim()) {
      Alert.alert('Required', 'Court name is required');
      return;
    }
    if (!currentCourt.sport_type.trim()) {
      Alert.alert('Required', 'Sport type is required');
      return;
    }
    if (!currentCourt.surface_type.trim()) {
      Alert.alert('Required', 'Surface type is required');
      return;
    }
    if (!currentCourt.count || parseInt(currentCourt.count) < 1) {
      Alert.alert('Invalid', 'Court count must be at least 1');
      return;
    }

    setCourts([...courts, { ...currentCourt }]);
    setCurrentCourt({ name: '', sport_type: '', surface_type: '', count: '1' });
  };

  const removeCourt = (index) => {
    setCourts(courts.filter((_, i) => i !== index));
  };

  const validateStep4 = () => {
    if (courts.length === 0) {
      Alert.alert('Required', 'At least 1 court is required');
      return false;
    }
    return true;
  };

  const validateStep5 = () => {
    // Step 5 (courts) is already validated in validateStep4
    return true;
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const handleNext = () => {
    console.log('handleNext called, current step:', step);
    let isValid = false;

    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        // Facilities are optional, so always valid
        isValid = true;
        break;
      case 3:
        isValid = validateStep2();
        break;
      case 4:
        isValid = validateStep3();
        break;
      case 5:
        isValid = validateStep4();
        break;
      case 6:
        // Open hours are optional, so always valid
        isValid = true;
        break;
      case 7:
        // Equipment rental is optional, so always valid
        isValid = true;
        break;
      case 8:
        // Court slots are optional, so always valid
        isValid = true;
        break;
      case 9:
        // Adventures/Other are optional, so always valid
        isValid = true;
        break;
      default:
        isValid = true;
    }

    console.log('Validation result:', isValid);

    if (isValid) {
      if (step < 9) {
        console.log('Moving to step', step + 1);
        setStep(step + 1);
      } else {
        console.log('Submitting form');
        handleSubmit();
      }
    } else {
      console.log('Validation failed, staying on step', step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Combine date and time into ISO format
      const meetingDateTime = `${meetingDate}T${meetingTime}:00`;

      // Prepare images as base64 array
      const imagesBase64 = images.map(img => ({
        data: img.base64,
        mimeType: img.mimeType || 'image/jpeg',
      }));

      // Prepare payload
      const payload = {
        ...venueDetails,
        facilities: facilities,  // NEW
        open_hours: openHours,   // NEW
        equipment_rental: equipment,  // NEW
        adventure_type: adventureType,  // NEW
        activities: activities,  // NEW
        court_slots: courtSlots,  // NEW
        meeting_datetime: meetingDateTime,
        courts: courts,
        status: 'PRE_REGISTERED',
        images: imagesBase64,
        // Add license documents as base64
        aadhar_document: licenseDocuments.aadhar?.base64 || '',
        pan_document: licenseDocuments.pan?.base64 || '',
        gst_document: licenseDocuments.gst?.base64 || '',
      };

      console.log('Submitting payload with base64 documents...');
      console.log('Payload keys:', Object.keys(payload));
      console.log('Venue name:', payload.name);
      console.log('Images count:', imagesBase64.length);
      console.log('Courts count:', courts.length);
      
      await venueService.preRegisterVenue(payload);

      // Navigate to success screen
      navigation.replace('VenueSuccess');
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert(
        'Error',
        JSON.stringify(error.response?.data) || error.response?.data?.error || 'Failed to pre-register venue'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER STEPS
  // ============================================
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
        <View
          key={s}
          style={[styles.stepDot, step >= s && styles.stepDotActive]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Venue Basic Details</Text>

      {/* Venue Name */}
      <View>
        <View style={[styles.inputContainer, errors.name && styles.inputError]}>
          <Text style={styles.icon}>📍</Text>
          <TextInput
            style={styles.input}
            placeholder="Venue Name *"
            placeholderTextColor={COLORS.grey}
            value={venueDetails.name}
            onChangeText={(text) => updateVenueDetail('name', text)}
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
            value={venueDetails.address}
            onChangeText={(text) => updateVenueDetail('address', text)}
          />
        </View>
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
      </View>

      {/* Description */}
      <View>
        <View style={[styles.inputContainer, styles.textAreaContainer, errors.description && styles.inputError]}>
          <Text style={styles.icon}>📝</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description *"
            placeholderTextColor={COLORS.grey}
            value={venueDetails.description}
            onChangeText={(text) => updateVenueDetail('description', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>

      {/* City */}
      <View>
        <View style={[styles.inputContainer, errors.city && styles.inputError]}>
          <Text style={styles.icon}>🏙️</Text>
          <TextInput
            style={styles.input}
            placeholder="City *"
            placeholderTextColor={COLORS.grey}
            value={venueDetails.city}
            onChangeText={(text) => updateVenueDetail('city', text)}
          />
        </View>
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor={COLORS.grey}
            value={venueDetails.state}
            onChangeText={(text) => updateVenueDetail('state', text)}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            placeholderTextColor={COLORS.grey}
            value={venueDetails.pincode}
            onChangeText={(text) => updateVenueDetail('pincode', text)}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Email */}
      <View>
        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
          <Text style={styles.icon}>✉️</Text>
          <TextInput
            style={styles.input}
            placeholder="Venue Email *"
            placeholderTextColor={COLORS.grey}
            value={venueDetails.email}
            onChangeText={(text) => updateVenueDetail('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.icon}>📞</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor={COLORS.grey}
          value={venueDetails.phone}
          onChangeText={(text) => updateVenueDetail('phone', text)}
          keyboardType="phone-pad"
        />
      </View>

      {/* Location Button */}
      <View>
        <TouchableOpacity
          style={[
            styles.locationButton,
            venueDetails.latitude && venueDetails.longitude && styles.locationButtonSuccess
          ]}
          onPress={getLocation}
          disabled={loading || (venueDetails.latitude && venueDetails.longitude)}
        >
          <Text style={styles.locationIcon}>
            {venueDetails.latitude && venueDetails.longitude ? '✓' : '📍'}
          </Text>
          <Text style={styles.locationButtonText}>
            {venueDetails.latitude && venueDetails.longitude ? 'Location Captured' : 'Pick Location'}
          </Text>
        </TouchableOpacity>
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
      </View>

      {venueDetails.latitude && venueDetails.longitude && (
        <>
          {/* Address Display (Read-only) */}
          <View style={styles.inputContainer}>
            <Text style={styles.icon}>📍</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              placeholder="Address"
              value={venueDetails.address}
              editable={false}
            />
          </View>

          {/* Latitude & Longitude Display */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.icon}>🌐</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                placeholder="Latitude"
                placeholderTextColor={COLORS.grey}
                value={venueDetails.latitude ? String(parseFloat(venueDetails.latitude).toFixed(6)) : ''}
                editable={false}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.icon}>🌐</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                placeholder="Longitude"
                placeholderTextColor={COLORS.grey}
                value={venueDetails.longitude ? String(parseFloat(venueDetails.longitude).toFixed(6)) : ''}
                editable={false}
              />
            </View>
          </View>
        </>
      )}

      {/* License Documents Section */}
      <Text style={styles.sectionTitle}>License Documents</Text>
      
      {/* Aadhar Number */}
      <View style={styles.inputContainer}>
        <Text style={styles.icon}>🆔</Text>
        <TextInput
          style={[styles.input, errors.aadhar && styles.inputError]}
          placeholder="Aadhar Number * (12 digits)"
          placeholderTextColor={COLORS.grey}
          value={venueDetails.aadhar_number}
          onChangeText={(text) => {
            updateVenueDetail('aadhar_number', text);
            // Clear error on change
            if (errors.aadhar) {
              setErrors({...errors, aadhar: null});
            }
          }}
          keyboardType="number-pad"
          maxLength={12}
        />
      </View>
      {errors.aadhar && (
        <Text style={styles.errorText}>{errors.aadhar}</Text>
      )}

      {/* Aadhar Document Upload */}
      <TouchableOpacity 
        style={[styles.uploadDocButton, licenseDocuments.aadhar && styles.uploadDocButtonSuccess]}
        onPress={() => pickDocument('aadhar')}
      >
        <Text style={styles.uploadDocIcon}>
          {licenseDocuments.aadhar ? '✓' : '📄'}
        </Text>
        <Text style={styles.uploadDocText}>
          {licenseDocuments.aadhar ? 'Aadhar Uploaded' : 'Upload Aadhar Document *'}
        </Text>
      </TouchableOpacity>
      {licenseDocuments.aadhar && licenseDocuments.aadhar.name && (
        <Text style={styles.documentName}>{`📎 ${String(licenseDocuments.aadhar.name)}`}</Text>
      )}

      {/* PAN Number */}
      <View style={styles.inputContainer}>
        <Text style={styles.icon}>🆔</Text>
        <TextInput
          style={[styles.input, errors.pan && styles.inputError]}
          placeholder="PAN Number * (e.g., ABCDE1234F)"
          placeholderTextColor={COLORS.grey}
          value={venueDetails.pan_number}
          onChangeText={(text) => {
            updateVenueDetail('pan_number', text.toUpperCase());
            // Clear error on change
            if (errors.pan) {
              setErrors({...errors, pan: null});
            }
          }}
          autoCapitalize="characters"
          maxLength={10}
        />
      </View>
      {errors.pan && (
        <Text style={styles.errorText}>{errors.pan}</Text>
      )}

      {/* PAN Document Upload */}
      <TouchableOpacity 
        style={[styles.uploadDocButton, licenseDocuments.pan && styles.uploadDocButtonSuccess]}
        onPress={() => pickDocument('pan')}
      >
        <Text style={styles.uploadDocIcon}>
          {licenseDocuments.pan ? '✓' : '📄'}
        </Text>
        <Text style={styles.uploadDocText}>
          {licenseDocuments.pan ? 'PAN Uploaded' : 'Upload PAN Document *'}
        </Text>
      </TouchableOpacity>
      {licenseDocuments.pan && licenseDocuments.pan.name && (
        <Text style={styles.documentName}>{`📎 ${String(licenseDocuments.pan.name)}`}</Text>
      )}

      {/* GST Number (Optional) */}
      <View style={styles.inputContainer}>
        <Text style={styles.icon}>🆔</Text>
        <TextInput
          style={[styles.input, errors.gst && styles.inputError]}
          placeholder="GST Number (Optional, 15 chars)"
          placeholderTextColor={COLORS.grey}
          value={venueDetails.gst_number}
          onChangeText={(text) => {
            updateVenueDetail('gst_number', text.toUpperCase());
            // Clear error on change
            if (errors.gst) {
              setErrors({...errors, gst: null});
            }
          }}
          autoCapitalize="characters"
          maxLength={15}
        />
      </View>
      {errors.gst && (
        <Text style={styles.errorText}>{errors.gst}</Text>
      )}

      {/* GST Document Upload (Optional) */}
      {venueDetails.gst_number && (
        <>
          <TouchableOpacity 
            style={[styles.uploadDocButton, licenseDocuments.gst && styles.uploadDocButtonSuccess]}
            onPress={() => pickDocument('gst')}
          >
            <Text style={styles.uploadDocIcon}>
              {licenseDocuments.gst ? '✓' : '📄'}
            </Text>
            <Text style={styles.uploadDocText}>
              {licenseDocuments.gst ? 'GST Uploaded' : 'Upload GST Document (Optional)'}
            </Text>
          </TouchableOpacity>
          {licenseDocuments.gst && licenseDocuments.gst.name && (
            <Text style={styles.documentName}>{`📎 ${String(licenseDocuments.gst.name)}`}</Text>
          )}
        </>
      )}
    </ScrollView>
  );

  // Facilities options
  const FACILITIES_OPTIONS = [
    { id: 'parking', name: 'Parking', icon: '🅿️' },
    { id: 'washroom', name: 'Washroom', icon: '🚻' },
    { id: 'locker', name: 'Locker', icon: '🔐' },
    { id: 'drinking_water', name: 'Drinking Water', icon: '💧' },
    { id: 'flood_lights', name: 'Flood Lights', icon: '💡' },
    { id: 'changing_room', name: 'Changing Room', icon: '👔' },
    { id: 'seating_area', name: 'Seating Area', icon: '🪑' },
    { id: 'cafeteria', name: 'Cafeteria', icon: '🍽️' },
    { id: 'first_aid', name: 'First Aid', icon: '🏥' },
  ];

  const toggleFacility = (facilityId) => {
    if (facilities.includes(facilityId)) {
      setFacilities(facilities.filter(id => id !== facilityId));
    } else {
      setFacilities([...facilities, facilityId]);
    }
  };

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Select Venue Facilities</Text>
      <Text style={styles.subtitle}>Choose all facilities available at your venue</Text>

      <View style={styles.facilitiesGrid}>
        {FACILITIES_OPTIONS.map((facility) => (
          <TouchableOpacity
            key={facility.id}
            style={[
              styles.facilityCard,
              facilities.includes(facility.id) && styles.facilityCardSelected
            ]}
            onPress={() => toggleFacility(facility.id)}
          >
            <Text style={styles.facilityIcon}>{facility.icon}</Text>
            <Text style={[
              styles.facilityName,
              facilities.includes(facility.id) && styles.facilityNameSelected
            ]}>
              {facility.name}
            </Text>
            {facilities.includes(facility.id) && (
              <View style={styles.facilityCheck}>
                <Text style={styles.facilityCheckmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Upload Venue Images</Text>
      <Text style={styles.subtitle}>Upload exactly 2 photos of your venue</Text>

      <TouchableOpacity
        style={styles.uploadBox}
        onPress={pickImages}
        disabled={images.length >= 2}
      >
        <Text style={styles.uploadIcon}>⬆️</Text>
        <Text style={styles.uploadText}>Upload Photos</Text>
        <Text style={styles.uploadSubtext}>
          {images.length}/2 images uploaded
        </Text>
      </TouchableOpacity>

      <View style={styles.imagesGrid}>
        {images.map((image, index) => (
          <View key={index} style={styles.imagePreview}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 2 && (
          <TouchableOpacity style={styles.addImageBox} onPress={pickImages}>
            <Text style={styles.addImageText}>+</Text>
            <Text style={styles.addImageLabel}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Meeting Schedule</Text>
      <Text style={styles.subtitle}>Schedule a meeting date and time</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.icon}>📅</Text>
        <TextInput
          style={styles.input}
          placeholder="Meeting Date (YYYY-MM-DD) *"
          placeholderTextColor={COLORS.grey}
          value={meetingDate}
          onChangeText={setMeetingDate}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.icon}>🕐</Text>
        <TextInput
          style={styles.input}
          placeholder="Meeting Time (HH:MM) *"
          placeholderTextColor={COLORS.grey}
          value={meetingTime}
          onChangeText={setMeetingTime}
        />
      </View>

      <View style={styles.helpBox}>
        <Text style={styles.helpText}>
          Date format: 2026-01-05{'\n'}
          Time format: 14:30 (24-hour format)
        </Text>
      </View>
    </ScrollView>
  );

  const renderStep5 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Add Courts</Text>
      <Text style={styles.subtitle}>Add sports courts available at your venue</Text>

      {/* Current Court Input */}
      <View style={styles.courtInputSection}>
        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🏀</Text>
          <TextInput
            style={styles.input}
            placeholder="Court Name *"
            placeholderTextColor={COLORS.grey}
            value={currentCourt.name}
            onChangeText={(text) =>
              setCurrentCourt({ ...currentCourt, name: text })
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>⚽</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={currentCourt.sport_type}
              style={styles.picker}
              onValueChange={(itemValue) => setCurrentCourt({ ...currentCourt, sport_type: itemValue })}
            >
              <Picker.Item label="Select Sport Type *" value="" />
              {SPORTS_OPTIONS.map((sport) => (
                <Picker.Item key={sport} label={sport} value={sport} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🎾</Text>
          <TextInput
            style={styles.input}
            placeholder="Surface Type (e.g., Clay, Grass) *"
            placeholderTextColor={COLORS.grey}
            value={currentCourt.surface_type}
            onChangeText={(text) =>
              setCurrentCourt({ ...currentCourt, surface_type: text })
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🔢</Text>
          <TextInput
            style={styles.input}
            placeholder="Court Count *"
            placeholderTextColor={COLORS.grey}
            value={currentCourt.count}
            onChangeText={(text) =>
              setCurrentCourt({ ...currentCourt, count: text })
            }
            keyboardType="number-pad"
          />
        </View>

        <TouchableOpacity style={styles.addCourtButton} onPress={addCourt}>
          <Text style={styles.addCourtButtonText}>+ Add Court</Text>
        </TouchableOpacity>
      </View>

      {/* Courts List */}
      {courts.length > 0 && (
        <View style={styles.courtsListSection}>
          <Text style={styles.courtsListTitle}>{`Added Courts (${courts.length})`}</Text>
          {courts.map((court, index) => (
            <View key={index} style={styles.courtCard}>
              <View style={styles.courtInfo}>
                <Text style={styles.courtName}>{court.name || 'Court'}</Text>
                <Text style={styles.courtDetails}>
                  {`${court.sport_type || 'Sport'} • ${court.surface_type || 'Surface'} • ${court.count || '1'} court(s)`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeCourtButton}
                onPress={() => removeCourt(index)}
              >
                <Text style={styles.removeCourtText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  // ============================================
  // STEP 6: OPEN HOURS CONFIGURATION
  // ============================================
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const toggleDay = (day) => {
    setOpenHours({
      ...openHours,
      [day]: { ...openHours[day], isOpen: !openHours[day].isOpen }
    });
  };
  
  const updateTime = (day, field, value) => {
    setOpenHours({
      ...openHours,
      [day]: { ...openHours[day], [field]: value }
    });
  };
  
  const copyToAll = () => {
    const monday = openHours.Monday;
    const newHours = {};
    days.forEach(day => {
      newHours[day] = { ...monday };
    });
    setOpenHours(newHours);
  };

  const renderStep6 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Set Venue Open Hours</Text>
      <Text style={styles.subtitle}>Configure weekly open hours for your venue</Text>

      {days.map(day => (
        <View key={day} style={styles.dayRow}>
          <View style={styles.dayHeader}>
            <TouchableOpacity 
              style={[styles.dayToggle, openHours[day].isOpen && styles.dayToggleActive]}
              onPress={() => toggleDay(day)}
            >
              <Text style={styles.dayToggleText}>{openHours[day].isOpen ? '✓' : '○'}</Text>
            </TouchableOpacity>
            <Text style={styles.dayName}>{day}</Text>
        </View>

          {openHours[day].isOpen ? (
            <View style={styles.timeRow}>
              <View style={[styles.inputContainer, styles.timeInput]}>
                <Text style={styles.icon}>🕐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="06:00"
                  placeholderTextColor={COLORS.grey}
                  value={openHours[day].open}
                  onChangeText={(text) => updateTime(day, 'open', text)}
                />
              </View>
              <Text style={styles.timeSeparator}>-</Text>
              <View style={[styles.inputContainer, styles.timeInput]}>
                <Text style={styles.icon}>🕐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="22:00"
                  placeholderTextColor={COLORS.grey}
                  value={openHours[day].close}
                  onChangeText={(text) => updateTime(day, 'close', text)}
                />
              </View>
            </View>
          ) : (
            <Text style={styles.closedText}>Closed</Text>
          )}
        </View>
      ))}
      
      <TouchableOpacity style={styles.copyButton} onPress={copyToAll}>
        <Text style={styles.copyButtonText}>Copy Monday to All Days</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ============================================
  // STEP 7: EQUIPMENT RENTAL MANAGER
  // ============================================
  const addEquipment = () => {
    if (!currentEquipment.name.trim() || !currentEquipment.price) {
      Alert.alert('Required', 'Please enter equipment name and price');
      return;
    }
    setEquipment([...equipment, { ...currentEquipment, id: Date.now(), enabled: true }]);
    setCurrentEquipment({ name: '', price: '', unit: 'hour' });
  };

  const removeEquipment = (id) => {
    setEquipment(equipment.filter(eq => eq.id !== id));
  };

  const toggleEquipment = (id) => {
    setEquipment(equipment.map(eq => 
      eq.id === id ? { ...eq, enabled: !eq.enabled } : eq
    ));
  };

  const renderStep7 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Equipment Rental (Optional)</Text>
      <Text style={styles.subtitle}>List equipment available for rent</Text>
      
      {/* Add Equipment Form */}
      <View style={styles.equipmentForm}>
        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🎾</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={currentEquipment.name}
              style={styles.picker}
              onValueChange={(itemValue) => setCurrentEquipment({...currentEquipment, name: itemValue})}
            >
              <Picker.Item label="Select Equipment" value="" />
              {EQUIPMENT_OPTIONS.map((equip) => (
                <Picker.Item key={equip} label={equip} value={equip} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={[styles.inputContainer, {flex: 1, marginRight: 8}]}>
            <Text style={styles.icon}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="Price"
              placeholderTextColor={COLORS.grey}
              value={currentEquipment.price}
              onChangeText={(text) => setCurrentEquipment({...currentEquipment, price: text})}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputContainer, {flex: 1, marginLeft: 8}]}>
            <Text style={styles.icon}>⏱️</Text>
            <TextInput
              style={styles.input}
              placeholder="Unit"
              placeholderTextColor={COLORS.grey}
              value={currentEquipment.unit}
              onChangeText={(text) => setCurrentEquipment({...currentEquipment, unit: text})}
            />
          </View>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={addEquipment}>
          <Text style={styles.addButtonText}>+ Add Equipment</Text>
        </TouchableOpacity>
      </View>
      
      {/* Equipment List */}
      {equipment.map(eq => (
        <View key={eq.id} style={styles.equipmentCard}>
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>{eq.name}</Text>
            <Text style={styles.equipmentPrice}>{`₹${eq.price}/${eq.unit}`}</Text>
          </View>
          <View style={styles.equipmentActions}>
            <TouchableOpacity onPress={() => toggleEquipment(eq.id)} style={{marginRight: 16}}>
              <Text style={[styles.toggleText, eq.enabled && styles.toggleTextActive]}>
                {eq.enabled ? 'ON' : 'OFF'}
          </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeEquipment(eq.id)}>
              <Text style={styles.removeText}>🗑️</Text>
            </TouchableOpacity>
        </View>
        </View>
      ))}
    </ScrollView>
  );

  // ============================================
  // STEP 8: COURT SLOTS & PRICING
  // ============================================
  // ============================================
  // STEP 8: COURT SLOTS & PRICING
  // ============================================
  const addSlot = () => {
    if (!currentSlot.price || parseFloat(currentSlot.price) <= 0) {
      Alert.alert('Required', 'Please enter a valid price per hour');
      return;
    }

    const courtIndex = selectedCourtForSlots;
    const newSlot = {
      ...currentSlot,
      id: Date.now(),
    };

    setCourtSlots({
      ...courtSlots,
      [courtIndex]: [...(courtSlots[courtIndex] || []), newSlot],
    });

    setCurrentSlot({
      day: 'Monday',
      start_time: '06:00',
      end_time: '07:00',
      price: '',
    });
  };

  const removeSlot = (courtIndex, slotId) => {
    setCourtSlots({
      ...courtSlots,
      [courtIndex]: courtSlots[courtIndex].filter(slot => slot.id !== slotId),
    });
  };

  const renderStep8 = () => {
    if (courts.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Please add courts first (Step 5)</Text>
        </View>
      );
    }
    
    const selectedCourt = courts[selectedCourtForSlots];
    const courtSlotsForSelected = courtSlots[selectedCourtForSlots] || [];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>Court Slots & Hourly Pricing (Optional)</Text>
        <Text style={styles.subtitle}>Set different prices for each time slot</Text>
        
        {/* Court Selector */}
        <Text style={styles.slotFormTitle}>{`Select Court: ${selectedCourt.name}`}</Text>
        {courts.length > 1 && (
          <View style={styles.inputContainer}>
            <Text style={styles.icon}>🏟️</Text>
            <TextInput
              style={styles.input}
              placeholder="Court Index (0, 1, 2...)"
              placeholderTextColor={COLORS.grey}
              value={String(selectedCourtForSlots)}
              onChangeText={(text) => {
                const index = parseInt(text) || 0;
                if (index >= 0 && index < courts.length) {
                  setSelectedCourtForSlots(index);
                }
              }}
              keyboardType="number-pad"
            />
          </View>
        )}

        {/* Add Slot Form */}
        <View style={styles.slotForm}>
          <Text style={styles.slotFormTitle}>{`Add Time Slot for ${selectedCourt.name}`}</Text>
          
          {/* Day Selector */}
          <View style={styles.inputContainer}>
            <Text style={styles.icon}>📅</Text>
            <TextInput
              style={styles.input}
              placeholder="Day (e.g., Monday)"
              placeholderTextColor={COLORS.grey}
              value={currentSlot.day}
              onChangeText={(text) => setCurrentSlot({...currentSlot, day: text})}
            />
        </View>

          {/* Time Range */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, {flex: 1, marginRight: 8}]}>
              <Text style={styles.icon}>🕐</Text>
              <TextInput
                style={styles.input}
                placeholder="Start (HH:MM)"
                placeholderTextColor={COLORS.grey}
                value={currentSlot.start_time}
                onChangeText={(text) => setCurrentSlot({...currentSlot, start_time: text})}
              />
            </View>
            <View style={[styles.inputContainer, {flex: 1, marginLeft: 8}]}>
              <Text style={styles.icon}>🕐</Text>
              <TextInput
                style={styles.input}
                placeholder="End (HH:MM)"
                placeholderTextColor={COLORS.grey}
                value={currentSlot.end_time}
                onChangeText={(text) => setCurrentSlot({...currentSlot, end_time: text})}
              />
            </View>
          </View>

          {/* Price */}
          <View style={styles.inputContainer}>
            <Text style={styles.icon}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="Price per hour *"
              placeholderTextColor={COLORS.grey}
              value={currentSlot.price}
              onChangeText={(text) => setCurrentSlot({...currentSlot, price: text})}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addSlot}>
            <Text style={styles.addButtonText}>+ Add Slot</Text>
          </TouchableOpacity>
        </View>

        {/* Slots List */}
        {courtSlotsForSelected.length > 0 && (
          <View style={styles.slotsListSection}>
            <Text style={styles.courtsListTitle}>
              Added Slots ({courtSlotsForSelected.length})
          </Text>
            {courtSlotsForSelected.map((slot) => (
              <View key={slot.id} style={styles.slotCard}>
                <View style={styles.slotInfo}>
                  <Text style={styles.slotDay}>{slot.day || 'Day'}</Text>
                  <Text style={styles.slotTime}>
                    {`${slot.start_time || '00:00'} - ${slot.end_time || '00:00'}`}
                  </Text>
                  <Text style={styles.slotPrice}>{`₹${slot.price || '0'}/hour`}</Text>
        </View>
                <TouchableOpacity onPress={() => removeSlot(selectedCourtForSlots, slot.id)}>
                  <Text style={styles.removeText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            💡 Tip: You can skip this step and configure slots later in the dashboard
          </Text>
        </View>
      </ScrollView>
    );
  };

  // ============================================
  // STEP 9: ADVENTURES / OTHER ACTIVITIES
  // ============================================
  const addActivity = () => {
    if (!currentActivity.name.trim()) {
      Alert.alert('Required', 'Activity name is required');
      return;
    }
    setActivities([...activities, { ...currentActivity, id: Date.now() }]);
    setCurrentActivity({ name: '', description: '', price: '' });
  };

  const removeActivity = (id) => {
    setActivities(activities.filter(act => act.id !== id));
  };

  const renderStep9 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Adventures / Other Activities (Optional)</Text>
      <Text style={styles.subtitle}>Select type and add activities</Text>
      
      {/* Type Selection */}
      <View style={styles.typeSelectionContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            adventureType === 'adventure' && styles.typeButtonActive
          ]}
          onPress={() => setAdventureType('adventure')}
        >
          <Text style={[
            styles.typeButtonText,
            adventureType === 'adventure' && styles.typeButtonTextActive
          ]}>
            🏔️ Adventures
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            adventureType === 'other' && styles.typeButtonActive
          ]}
          onPress={() => setAdventureType('other')}
        >
          <Text style={[
            styles.typeButtonText,
            adventureType === 'other' && styles.typeButtonTextActive
          ]}>
            🎯 Other Activities
          </Text>
        </TouchableOpacity>
        </View>

      {adventureType && (
        <>
          {/* Add Activity Form */}
          <View style={styles.equipmentForm}>
            <View style={styles.inputContainer}>
              <Text style={styles.icon}>🎯</Text>
              <TextInput
                style={styles.input}
                placeholder="Activity Name *"
                placeholderTextColor={COLORS.grey}
                value={currentActivity.name}
                onChangeText={(text) => setCurrentActivity({...currentActivity, name: text})}
              />
      </View>

            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Text style={styles.icon}>📝</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                placeholderTextColor={COLORS.grey}
                value={currentActivity.description}
                onChangeText={(text) => setCurrentActivity({...currentActivity, description: text})}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
        </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.icon}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="Price (Optional)"
                placeholderTextColor={COLORS.grey}
                value={currentActivity.price}
                onChangeText={(text) => setCurrentActivity({...currentActivity, price: text})}
                keyboardType="numeric"
              />
      </View>

            <TouchableOpacity style={styles.addButton} onPress={addActivity}>
              <Text style={styles.addButtonText}>+ Add Activity</Text>
            </TouchableOpacity>
          </View>
          
          {/* Activities List */}
          {activities.length > 0 && (
            <View style={styles.activitiesSection}>
              <Text style={styles.courtsListTitle}>
                Added Activities ({activities.length})
        </Text>
              {activities.map(activity => (
                <View key={activity.id} style={styles.equipmentCard}>
                  <View style={styles.equipmentInfo}>
                    <Text style={styles.equipmentName}>{activity.name}</Text>
                    {activity.description && (
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                    )}
                    {activity.price && (
                      <Text style={styles.equipmentPrice}>{`₹${activity.price}`}</Text>
                    )}
      </View>
                  <TouchableOpacity onPress={() => removeActivity(activity.id)}>
                    <Text style={styles.removeText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pre-Register Venue</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}
      {step === 7 && renderStep7()}
      {step === 8 && renderStep8()}
      {step === 9 && renderStep9()}

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>
              {step === 9 ? 'Submit' : 'Continue'}
            </Text>
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.white,
  },
  stepDot: {
    width: 32,
    height: 4,
    backgroundColor: COLORS.lightGrey,
    marginHorizontal: 4,
    borderRadius: 2,
  },
  stepDotActive: {
    backgroundColor: COLORS.orange,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: 20,
  },
  stepTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.grey,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 120,
    paddingVertical: SIZES.padding,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.small,
    marginTop: -8,
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
  },
  row: {
    flexDirection: 'row',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.orange,
    borderRadius: SIZES.buttonRadius,
    padding: SIZES.padding,
    marginVertical: 12,
  },
  locationButtonSuccess: {
    backgroundColor: COLORS.success,
  },
  locationIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  locationButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGrey,
    color: COLORS.grey,
  },
  locationInfo: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 12,
  },
  locationText: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    marginBottom: 4,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  facilityCard: {
    width: '30%',
    minWidth: 100,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.lightGrey,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  facilityCardSelected: {
    borderColor: COLORS.orange,
    backgroundColor: '#FFF5F0',
  },
  facilityIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  facilityName: {
    fontSize: SIZES.small,
    color: COLORS.navy,
    textAlign: 'center',
    fontWeight: '500',
  },
  facilityNameSelected: {
    color: COLORS.orange,
    fontWeight: 'bold',
  },
  facilityCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityCheckmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  uploadBox: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.lightGrey,
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: SIZES.medium,
    color: COLORS.navy,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: SIZES.small,
    color: COLORS.grey,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: SIZES.radius,
    position: 'relative',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  addImageBox: {
    width: 150,
    height: 150,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.lightGrey,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  addImageText: {
    fontSize: 40,
    color: COLORS.grey,
  },
  addImageLabel: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginTop: 20,
  },
  infoText: {
    fontSize: SIZES.small,
    color: COLORS.grey,
  },
  courtInputSection: {
    marginBottom: 24,
  },
  addCourtButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.orange,
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: 8,
  },
  addCourtButtonText: {
    color: COLORS.orange,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  courtsListSection: {
    marginTop: 20,
  },
  courtsListTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 12,
  },
  courtCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  courtDetails: {
    fontSize: SIZES.small,
    color: COLORS.grey,
  },
  removeCourtButton: {
    padding: 8,
  },
  removeCourtText: {
    fontSize: 20,
  },
  summarySection: {
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: SIZES.medium,
    color: COLORS.navy,
    fontWeight: '600',
  },
  footer: {
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey,
  },
  button: {
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  // Step 6: Open Hours styles
  dayRow: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayToggleActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  dayToggleText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  dayName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.navy,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
  },
  timeSeparator: {
    marginHorizontal: 8,
    fontSize: SIZES.large,
    color: COLORS.grey,
  },
  closedText: {
    fontSize: SIZES.medium,
    color: COLORS.grey,
    fontStyle: 'italic',
  },
  copyButton: {
    backgroundColor: COLORS.navy,
    borderRadius: SIZES.buttonRadius,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  copyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  // Step 7: Equipment Rental styles
  equipmentForm: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: COLORS.orange,
    borderRadius: SIZES.buttonRadius,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  equipmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  equipmentPrice: {
    fontSize: SIZES.small,
    color: COLORS.grey,
  },
  equipmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: COLORS.success,
  },
  removeText: {
    fontSize: 20,
  },
  // Step 8: Court Slots styles
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.grey,
    textAlign: 'center',
  },
  courtSlotSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
  },
  courtSlotTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  courtSlotSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    marginBottom: 12,
  },
  // Picker style
  picker: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.navy,
  },
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  // Step 9: Adventures/Other styles
  typeSelectionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.lightGrey,
    padding: SIZES.padding,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  typeButtonActive: {
    borderColor: COLORS.orange,
    backgroundColor: '#FFF5F0',
  },
  typeButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.grey,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: COLORS.orange,
  },
  activitiesSection: {
    marginTop: 20,
  },
  activityDescription: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    marginTop: 4,
    marginBottom: 4,
  },
  // License Upload styles
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginTop: 24,
    marginBottom: 12,
  },
  uploadDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGrey,
    borderRadius: SIZES.buttonRadius,
    padding: SIZES.padding,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGrey,
    borderStyle: 'dashed',
  },
  uploadDocButtonSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.success,
    borderStyle: 'solid',
  },
  uploadDocIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  uploadDocText: {
    color: COLORS.navy,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  documentName: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    marginBottom: 12,
    marginLeft: 8,
  },
  // Slot Management styles
  slotForm: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
  },
  slotFormTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 12,
  },
  slotsListSection: {
    marginTop: 20,
  },
  slotCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  slotInfo: {
    flex: 1,
  },
  slotDay: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  slotTime: {
    fontSize: SIZES.small,
    color: COLORS.grey,
    marginBottom: 4,
  },
  slotPrice: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.orange,
  },
});
