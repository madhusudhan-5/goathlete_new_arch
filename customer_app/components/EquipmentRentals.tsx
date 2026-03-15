import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ShoppingBag, CircleDot } from 'lucide-react-native';

interface EquipmentRentalsProps {
    isDark: boolean;
}

export function EquipmentRentals({ isDark }: EquipmentRentalsProps) {
    const bgColor = isDark ? 'bg-[#112B47] border-[#1e3a5f]' : 'bg-white border-[#e2e8f0]';
    const imgBg = isDark ? 'bg-[#0A1F35]' : 'bg-[#f8f9fa]';
    const textColor = isDark ? 'text-white' : 'text-[#0A1F35]';

    const rentals = [
        { id: 1, name: 'Pro Tennis Racket', price: '₹150 / hr', icon: <ShoppingBag size={24} color={isDark ? '#FFFFFF' : '#0A1F35'} /> },
        { id: 2, name: 'Football Size 5', price: '₹50 / session', icon: <CircleDot size={24} color={isDark ? '#FFFFFF' : '#0A1F35'} /> },
        { id: 3, name: 'Batting Pads', price: '₹100 / hr', icon: <ShoppingBag size={24} color={isDark ? '#FFFFFF' : '#0A1F35'} /> }
    ];

    return (
        <View className="w-full">
            <Text className={`font-[SpaceGrotesk_700Bold] text-base mb-3 ${textColor}`}>
                Equipment Rentals
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full pb-2">
                <View className="flex-row gap-3">
                    {rentals.map((item) => (
                        <TouchableOpacity key={item.id} className={`w-[140px] rounded-xl border p-3 flex-col gap-2 ${bgColor}`}>
                            <View className={`w-full h-20 rounded-lg items-center justify-center ${imgBg}`}>
                                {item.icon}
                            </View>
                            <Text className={`font-[SpaceGrotesk_700Bold] text-xs ${textColor}`} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text className="text-[#DA6F2B] font-[Manrope_700Bold] text-[11px]">
                                {item.price}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
