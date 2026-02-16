import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { authService } from '../../services/api';
import { View, ActivityIndicator } from 'react-native';

export default function AuthIndex() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
    };

    if (isAuthenticated === null) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
