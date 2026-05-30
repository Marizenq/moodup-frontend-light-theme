import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { api } from "@/services/api";
import { router } from "expo-router";

export default function AdminLayout() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const response = await api.get('/me');
            console.log('🔍 AdminLayout - /me response:', response.data);
            console.log('🔍 Role:', response.data?.user?.role);
            
            if (response.data?.user?.role === 'admin') {
                console.log('✅ É admin, permitindo acesso');
                setIsAdmin(true);
            } else {
                console.log('❌ Não é admin, redirecionando');
                setIsAdmin(false);
                router.replace('/');
            }
        } catch (error) {
            console.error('Erro ao verificar admin:', error);
            setIsAdmin(false);
            router.replace('/');
        }
    };

    if (isAdmin === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#060912' }}>
                <ActivityIndicator size="large" color="#2dd4bf" />
            </View>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <Stack>
            <Stack.Screen name="auditoria" options={{ title: 'Auditoria', headerShown: true }} />
        </Stack>
    );
}