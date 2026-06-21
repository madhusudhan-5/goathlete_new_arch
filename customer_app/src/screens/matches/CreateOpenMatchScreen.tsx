import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { openMatchService } from '../../services/api';

export default function CreateOpenMatchScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sport: '', venue: '', date: '', start_time: '', duration: '1', spots: '10', price: '150', skill: 'All Levels'
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // API integration here (currently bypassed for dev)
      Alert.alert('Success', 'Match created successfully!');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not create match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">Create Match</Text>
      </View>
      <ScrollView className="p-5">
        <View className="bg-[#112B47] p-5 rounded-2xl border border-[#1e3a5f] mb-6">
          <Text className="text-white font-bold mb-2">Sport ID</Text>
          <TextInput value={form.sport} onChangeText={t => setForm({...form, sport: t})} className="bg-[#0A1F35] text-white p-3 rounded-xl border border-[#1e3a5f] mb-4" placeholderTextColor="#475569" placeholder="e.g. 1 (Cricket)" />
          
          <Text className="text-white font-bold mb-2">Venue ID</Text>
          <TextInput value={form.venue} onChangeText={t => setForm({...form, venue: t})} className="bg-[#0A1F35] text-white p-3 rounded-xl border border-[#1e3a5f] mb-4" placeholderTextColor="#475569" placeholder="e.g. 1" />
          
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-white font-bold mb-2">Date</Text>
              <TextInput value={form.date} onChangeText={t => setForm({...form, date: t})} className="bg-[#0A1F35] text-white p-3 rounded-xl border border-[#1e3a5f]" placeholderTextColor="#475569" placeholder="YYYY-MM-DD" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold mb-2">Time</Text>
              <TextInput value={form.start_time} onChangeText={t => setForm({...form, start_time: t})} className="bg-[#0A1F35] text-white p-3 rounded-xl border border-[#1e3a5f]" placeholderTextColor="#475569" placeholder="HH:MM:SS" />
            </View>
          </View>
          
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-white font-bold mb-2">Spots</Text>
              <TextInput value={form.spots} onChangeText={t => setForm({...form, spots: t})} keyboardType="number-pad" className="bg-[#0A1F35] text-white p-3 rounded-xl border border-[#1e3a5f]" placeholderTextColor="#475569" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold mb-2">Price/Player</Text>
              <TextInput value={form.price} onChangeText={t => setForm({...form, price: t})} keyboardType="number-pad" className="bg-[#0A1F35] text-white p-3 rounded-xl border border-[#1e3a5f]" placeholderTextColor="#475569" />
            </View>
          </View>
          
          <Text className="text-white font-bold mb-2">Skill Level</Text>
          <TextInput value={form.skill} onChangeText={t => setForm({...form, skill: t})} className="bg-[#0A1F35] text-white p-3 rounded-xl border border-[#1e3a5f] mb-4" placeholderTextColor="#475569" />
          
          <TouchableOpacity onPress={handleSubmit} className="bg-[#DA6F2B] py-4 rounded-xl items-center mt-2">
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Create Open Match</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
