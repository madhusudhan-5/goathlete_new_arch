import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">Payment Methods</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-[#94a3b8]">Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}
