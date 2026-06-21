import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { localTournamentService } from '../../services/api';

export default function CreateTournamentScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', sport_id: '' });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await localTournamentService.create({ name: form.name, sport: form.sport_id });
      Alert.alert('Success', 'Local match created!');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to create match');
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
        <Text className="text-white font-bold text-xl">Create Local Match</Text>
      </View>
      <ScrollView className="p-5">
        <Text className="text-white font-bold mb-2">Match Name</Text>
        <TextInput value={form.name} onChangeText={t => setForm({...form, name: t})} className="bg-[#112B47] text-white p-4 rounded-xl border border-[#1e3a5f] mb-4" placeholderTextColor="#475569" placeholder="e.g. Sunday League" />
        
        <Text className="text-white font-bold mb-2">Sport ID</Text>
        <TextInput value={form.sport_id} onChangeText={t => setForm({...form, sport_id: t})} keyboardType="number-pad" className="bg-[#112B47] text-white p-4 rounded-xl border border-[#1e3a5f] mb-6" placeholderTextColor="#475569" placeholder="1 = Cricket, 2 = Football" />

        <TouchableOpacity onPress={handleSubmit} className="bg-[#DA6F2B] py-4 rounded-xl items-center">
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Create Match</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
