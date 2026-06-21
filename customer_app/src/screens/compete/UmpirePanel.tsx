import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { localTournamentService, scoreboardService } from '../../services/api';

export default function UmpirePanel() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id, type } = route.params || {};
  const [scores, setScores] = useState<string>('{}');

  const handleUpdate = async () => {
    try {
      const parsed = JSON.parse(scores);
      if (type === 'local') {
        await localTournamentService.updateScoreboard(id, parsed);
      } else {
        await scoreboardService.updateScore(id, parsed);
      }
      Alert.alert('Success', 'Score updated successfully');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Invalid JSON or API error');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Umpire Panel</Text>
        <TouchableOpacity onPress={handleUpdate}>
          <Save size={20} color="#DA6F2B" />
        </TouchableOpacity>
      </View>
      <ScrollView className="p-5">
        <Text className="text-white font-bold mb-2">Update Score JSON</Text>
        <TextInput
          multiline
          numberOfLines={10}
          className="bg-[#112B47] text-white p-4 rounded-xl border border-[#1e3a5f] min-h-[200px]"
          value={scores}
          onChangeText={setScores}
          placeholder='{"Team A": 100, "Team B": 90}'
          placeholderTextColor="#475569"
        />
        <TouchableOpacity onPress={handleUpdate} className="bg-[#DA6F2B] py-4 rounded-xl items-center mt-6">
          <Text className="text-white font-bold text-base">Submit Update</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
