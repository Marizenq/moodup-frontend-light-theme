import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { moodApi } from '@/services/api';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [topTriggers, setTopTriggers] = useState<any[]>([]);
    const [statsOverview, setStatsOverview] = useState<any>(null);
    const [period, setPeriod] = useState(30);

    const loadReports = async () => {
        try {
            setLoading(true);
            const [triggersRes, statsRes] = await Promise.all([
                moodApi.getTopTriggers(period),
                moodApi.getStatsOverview(period),
            ]);
            setTopTriggers(triggersRes.data?.triggers || []);
            setStatsOverview(statsRes.data);
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadReports(); }, [period]));

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2dd4bf" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>📊 Relatórios</Text>
            
            {/* Seletor de período */}
            <View style={styles.periodRow}>
                {[7, 30, 90].map(p => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.periodBtn, period === p && styles.periodActive]}
                        onPress={() => setPeriod(p)}
                    >
                        <Text style={styles.periodText}>{p} dias</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {/* Top Gatilhos */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>🎯 Gatilhos mais frequentes</Text>
                {topTriggers.map((trigger, idx) => (
                    <View key={trigger.id} style={styles.triggerItem}>
                        <Text style={styles.triggerRank}>{idx + 1}</Text>
                        <Text style={styles.triggerName}>{trigger.name}</Text>
                        <Text style={styles.triggerCount}>{trigger.total}x</Text>
                    </View>
                ))}
            </View>
            
            {/* Estatísticas gerais */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📈 Visão geral</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statBig}>{statsOverview?.total_entries || 0}</Text>
                        <Text style={styles.statLabel}>registros</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statBig}>{statsOverview?.average_level || '-'}</Text>
                        <Text style={styles.statLabel}>média</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statBig}>{statsOverview?.days_with_entries || 0}</Text>
                        <Text style={styles.statLabel}>dias</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#060912',
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#060912',
    },
    title: {
        color: '#E2E8F0',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 16,
    },
    periodRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    periodBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    periodActive: {
        backgroundColor: 'rgba(45,212,191,0.25)',
    },
    periodText: {
        color: '#CBD5F5',
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: {
        color: '#2dd4bf',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    triggerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    triggerRank: {
        color: '#2dd4bf',
        fontSize: 16,
        fontWeight: 'bold',
        width: 35,
    },
    triggerName: {
        color: '#CBD5E1',
        fontSize: 16,
        flex: 1,
    },
    triggerCount: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statBig: {
        color: '#2dd4bf',
        fontSize: 28,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 4,
    },
});