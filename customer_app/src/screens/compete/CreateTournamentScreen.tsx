import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ChevronDown, Plus, Trash2 } from 'lucide-react-native';
import { localTournamentService, scoreboardService } from '../../services/api';

export default function CreateTournamentScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  
  const [sports, setSports] = useState<any[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [sportModalVisible, setSportModalVisible] = useState(false);
  
  const [matchName, setMatchName] = useState('');
  const [selectedSport, setSelectedSport] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    scoreboardService.getSports().then((res: any) => {
      setSports(Array.isArray(res) ? res : res?.results || []);
    }).catch(err => console.error("Failed to fetch sports", err))
    .finally(() => setLoadingSports(false));
  }, []);

  // When a sport is selected, pre-fill the minimum required participant rows
  const handleSportSelect = (sport: any) => {
    setSelectedSport(sport);
    setSportModalVisible(false);
    
    // Automatically generate empty participant rows to meet min_players requirement
    const minPlayers = sport.min_players || 2;
    const newParticipants = [];
    for (let i = 0; i < minPlayers; i++) {
      newParticipants.push({ name: '', mobile: '' });
    }
    setParticipants(newParticipants);
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: '', mobile: '' }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const handleSubmit = async () => {
    if (!matchName.trim()) return Alert.alert('Error', 'Please enter a match name');
    if (!selectedSport) return Alert.alert('Error', 'Please select a sport');
    
    // Validate minimum players
    const minPlayers = selectedSport.min_players || 2;
    if (participants.length < minPlayers) {
      return Alert.alert('Error', `At least ${minPlayers} participants are required for ${selectedSport.name}`);
    }

    // Validate that all participants have a name and mobile
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.name.trim() || !p.mobile.trim()) {
        return Alert.alert('Error', `Please fill out Name and Phone Number for Participant ${i + 1}`);
      }
    }

    setLoading(true);
    try {
      await localTournamentService.create({ 
        name: matchName, 
        sport: selectedSport.id,
        participants: participants.map(p => ({
          name: p.name,
          mobile: p.mobile
        }))
      });
      Alert.alert('Success', 'Match created successfully! Invites have been sent.');
      navigation.goBack();
    } catch (e: any) {
      console.error(e.response?.data || e);
      Alert.alert('Error', e.response?.data?.non_field_errors?.[0] || 'Failed to create match. Please try again.');
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
      
      <ScrollView className="p-5" keyboardShouldPersistTaps="handled">
        <Text className="text-white font-bold mb-2">Match Name</Text>
        <TextInput 
          value={matchName} 
          onChangeText={setMatchName} 
          className="bg-[#112B47] text-white p-4 rounded-xl border border-[#1e3a5f] mb-4" 
          placeholderTextColor="#475569" 
          placeholder="e.g. Sunday League" 
        />
        
        <Text className="text-white font-bold mb-2">Sport</Text>
        <TouchableOpacity 
          onPress={() => setSportModalVisible(true)}
          className="bg-[#112B47] p-4 rounded-xl border border-[#1e3a5f] mb-6 flex-row justify-between items-center"
        >
          <Text className={selectedSport ? "text-white" : "text-[#475569]"}>
            {selectedSport ? `${selectedSport.icon} ${selectedSport.name}` : "Select a sport..."}
          </Text>
          {loadingSports ? <ActivityIndicator size="small" color="#DA6F2B" /> : <ChevronDown size={20} color="#94a3b8" />}
        </TouchableOpacity>

        {selectedSport && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white font-bold text-lg">Participants ({participants.length})</Text>
              <Text className="text-[#DA6F2B] font-bold text-xs">Min required: {selectedSport.min_players}</Text>
            </View>
            
            <Text className="text-[#94a3b8] text-xs mb-4">
              Please enter the names and phone numbers of all players or umpires. They will receive an SMS/WhatsApp invite to view their stats.
            </Text>

            {participants.map((p, index) => (
              <View key={index} className="bg-[#112B47] p-4 rounded-xl border border-[#1e3a5f] mb-3 relative">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white font-bold">Participant {index + 1}</Text>
                  {participants.length > (selectedSport.min_players || 2) && (
                    <TouchableOpacity onPress={() => removeParticipant(index)}>
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <TextInput 
                  value={p.name} 
                  onChangeText={(val) => updateParticipant(index, 'name', val)} 
                  className="bg-[#0A1F35] text-white p-3 rounded-lg border border-[#1e3a5f] mb-3" 
                  placeholderTextColor="#475569" 
                  placeholder="Full Name (e.g. John Doe)" 
                />
                
                <TextInput 
                  value={p.mobile} 
                  onChangeText={(val) => updateParticipant(index, 'mobile', val)} 
                  keyboardType="phone-pad"
                  className="bg-[#0A1F35] text-white p-3 rounded-lg border border-[#1e3a5f]" 
                  placeholderTextColor="#475569" 
                  placeholder="Phone Number (e.g. 9876543210)" 
                />
              </View>
            ))}

            <TouchableOpacity onPress={addParticipant} className="bg-[#1e3a5f] py-3 rounded-xl items-center mb-4 flex-row justify-center">
              <Plus size={18} color="#94a3b8" />
              <Text className="text-[#94a3b8] font-bold ml-2">Add Another Participant</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={loading || !selectedSport}
          className={`${(!selectedSport || loading) ? 'bg-[#da6f2b80]' : 'bg-[#DA6F2B]'} py-4 rounded-xl items-center mb-10`}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Start Match</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Sport Selection Modal */}
      <Modal visible={sportModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-[#112B47] rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row justify-between items-center mb-4 border-b border-[#1e3a5f] pb-3">
              <Text className="text-white font-bold text-xl">Select Sport</Text>
              <TouchableOpacity onPress={() => setSportModalVisible(false)}>
                <Text className="text-[#DA6F2B] font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {sports.map(sport => (
                <TouchableOpacity 
                  key={sport.id}
                  onPress={() => handleSportSelect(sport)}
                  className="flex-row items-center py-4 border-b border-[#1e3a5f]"
                >
                  <Text style={{ fontSize: 24 }} className="mr-3">{sport.icon}</Text>
                  <View>
                    <Text className="text-white font-bold text-lg">{sport.name}</Text>
                    <Text className="text-[#94a3b8] text-xs">Min {sport.min_players} participants required</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
