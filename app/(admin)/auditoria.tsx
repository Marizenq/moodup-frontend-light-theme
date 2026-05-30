import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Modal,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

type Log = {
    id: number;
    user_id: number;
    action: string;
    description: string;
    ip_address: string;
    created_at: string;
    user_name: string;
    user_email: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
};

// 🔥 CORREÇÃO: Verificar o caminho correto do role
const checkIsAdmin = async (): Promise<boolean> => {
    try {
        const response = await api.get('/me');
        console.log('🔍 checkIsAdmin - Resposta:', response.data);
        console.log('🔍 Role encontrado:', response.data?.user?.role);
        const isUserAdmin = response.data?.user?.role === 'admin';
        console.log('🔍 É admin?', isUserAdmin);
        return isUserAdmin;
    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        return false;
    }
};

export default function Auditoria() {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [logs, setLogs] = useState<Log[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [userStats, setUserStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'logs' | 'users'>('logs');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [showActionFilter, setShowActionFilter] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [updatingRole, setUpdatingRole] = useState(false);

    useFocusEffect(
        useCallback(() => {
            verifyAdminAndLoad();
        }, [activeTab, selectedAction])
    );

    const verifyAdminAndLoad = async () => {
        const admin = await checkIsAdmin();
        setIsAdmin(admin);
        
        if (admin) {
            await loadData();
        } else {
            Alert.alert('Acesso negado', 'Você não tem permissão para acessar esta área.');
            router.back();
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            
            if (activeTab === 'logs') {
                const params: any = { limit: 100 };
                if (selectedAction) params.action = selectedAction;
                
                const logsRes = await api.get('/admin/activity-logs', { params });
                console.log('📋 Logs recebidos:', logsRes.data);
                setLogs(logsRes.data?.logs?.data || []);
                setStats(logsRes.data?.stats);
            } else {
                const usersRes = await api.get('/admin/users');
                console.log('👥 Usuários recebidos:', usersRes.data);
                setUsers(usersRes.data?.users?.data || []);
                setUserStats(usersRes.data?.stats);
            }
        } catch (error: any) {
            console.error('Erro ao carregar:', error);
            console.error('Status:', error?.response?.status);
            console.error('Mensagem:', error?.response?.data);
            if (error?.response?.status === 403) {
                Alert.alert('Acesso negado', 'Você não tem permissão de administrador.');
                router.back();
            } else {
                Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível carregar os dados');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleUpdateRole = async () => {
        if (!selectedUser) return;
        
        setUpdatingRole(true);
        try {
            const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';
            await api.put(`/admin/users/${selectedUser.id}/role`, { role: newRole });
            Alert.alert('Sucesso', `Usuário ${selectedUser.name} agora é ${newRole === 'admin' ? 'Administrador' : 'Usuário comum'}`);
            setShowUserModal(false);
            loadData();
        } catch (error: any) {
            Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível alterar a role');
        } finally {
            setUpdatingRole(false);
        }
    };

    const getActionIcon = (action: string): string => {
        const icons: Record<string, string> = {
            'LOGIN': 'log-in-outline',
            'CREATE_MOOD': 'add-circle-outline',
            'UPDATE_MOOD': 'create-outline',
            'DELETE_MOOD': 'trash-outline',
            'FEEDBACK_SENT': 'chatbubble-outline',
            'UPDATE_USER_ROLE': 'people-outline',
        };
        return icons[action] || 'document-text-outline';
    };

    const getActionColor = (action: string): string => {
        const colors: Record<string, string> = {
            'LOGIN': '#22c55e',
            'CREATE_MOOD': '#2dd4bf',
            'UPDATE_MOOD': '#eab308',
            'DELETE_MOOD': '#ef4444',
            'FEEDBACK_SENT': '#8b5cf6',
            'UPDATE_USER_ROLE': '#f97316',
        };
        return colors[action] || '#94A3B8';
    };

    const getActionLabel = (action: string): string => {
        const labels: Record<string, string> = {
            'LOGIN': 'Login',
            'CREATE_MOOD': 'Criou humor',
            'UPDATE_MOOD': 'Editou humor',
            'DELETE_MOOD': 'Deletou humor',
            'FEEDBACK_SENT': 'Enviou feedback',
            'UPDATE_USER_ROLE': 'Alterou permissão',
        };
        return labels[action] || action;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Data desconhecida';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR') + ' ' + 
               date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const actions = [...new Set(logs.map(log => log.action))];

    if (!isAdmin) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2dd4bf" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📋 Auditoria</Text>
            
            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'logs' && styles.tabActive]}
                    onPress={() => setActiveTab('logs')}
                >
                    <Ionicons name="document-text-outline" as any size={20} color={activeTab === 'logs' ? '#2dd4bf' : '#94A3B8'} />
                    <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>Atividades</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && styles.tabActive]}
                    onPress={() => setActiveTab('users')}
                >
                    <Ionicons name="people-outline" as any size={20} color={activeTab === 'users' ? '#2dd4bf' : '#94A3B8'} />
                    <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>Usuários</Text>
                </TouchableOpacity>
            </View>
            
            {/* Estatísticas */}
            {activeTab === 'logs' && stats && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{stats.total || 0}</Text>
                            <Text style={styles.statLabel}>Total de ações</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{stats.last_7_days || 0}</Text>
                            <Text style={styles.statLabel}>Últimos 7 dias</Text>
                        </View>
                        {stats.by_action?.slice(0, 3).map((item: any, idx: number) => (
                            <View key={idx} style={styles.statCardSmall}>
                                <Text style={styles.statValueSmall}>{item.total}</Text>
                                <Text style={styles.statLabelSmall}>{getActionLabel(item.action)}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
            
            {activeTab === 'users' && userStats && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{userStats.total || 0}</Text>
                            <Text style={styles.statLabel}>Total usuários</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{userStats.admins || 0}</Text>
                            <Text style={styles.statLabel}>Administradores</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{userStats.new_this_month || 0}</Text>
                            <Text style={styles.statLabel}>Novos este mês</Text>
                        </View>
                    </View>
                </ScrollView>
            )}
            
            {/* Filtro de ação */}
            {activeTab === 'logs' && actions.length > 0 && (
                <View style={styles.filterContainer}>
                    <TouchableOpacity 
                        style={styles.filterButton}
                        onPress={() => setShowActionFilter(!showActionFilter)}
                    >
                        <Ionicons name="filter-outline" as any size={18} color="#2dd4bf" />
                        <Text style={styles.filterButtonText}>
                            {selectedAction ? getActionLabel(selectedAction) : 'Filtrar por ação'}
                        </Text>
                        <Ionicons name={showActionFilter ? 'chevron-up' : 'chevron-down'} as any size={16} color="#94A3B8" />
                    </TouchableOpacity>
                    
                    {showActionFilter && (
                        <View style={styles.filterDropdown}>
                            <TouchableOpacity 
                                style={styles.filterOption}
                                onPress={() => {
                                    setSelectedAction('');
                                    setShowActionFilter(false);
                                }}
                            >
                                <Text style={styles.filterOptionText}>Todas as ações</Text>
                            </TouchableOpacity>
                            {actions.map(action => (
                                <TouchableOpacity 
                                    key={action}
                                    style={styles.filterOption}
                                    onPress={() => {
                                        setSelectedAction(action);
                                        setShowActionFilter(false);
                                    }}
                                >
                                    <Text style={styles.filterOptionText}>{getActionLabel(action)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}
            
            {/* Lista de Logs */}
            {activeTab === 'logs' && (
                <ScrollView 
                    style={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2dd4bf" />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#2dd4bf" />
                        </View>
                    ) : logs.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" as any size={64} color="#334155" />
                            <Text style={styles.emptyText}>Nenhuma atividade registrada</Text>
                        </View>
                    ) : (
                        logs.map((log) => (
                            <View key={log.id} style={styles.logItem}>
                                <View style={[styles.logIcon, { backgroundColor: getActionColor(log.action) + '20' }]}>
                                    <Ionicons name={getActionIcon(log.action) as any} size={24} color={getActionColor(log.action)} />
                                </View>
                                <View style={styles.logContent}>
                                    <View style={styles.logHeader}>
                                        <Text style={styles.logAction}>{getActionLabel(log.action)}</Text>
                                        <Text style={styles.logTime}>{formatDate(log.created_at)}</Text>
                                    </View>
                                    <Text style={styles.logDescription}>{log.description}</Text>
                                    <View style={styles.logFooter}>
                                        <Text style={styles.logUser}>
                                            <Ionicons name="person-outline" as any size={12} color="#64748B" /> {log.user_name || 'Usuário'}
                                        </Text>
                                        <Text style={styles.logIp}>
                                            <Ionicons name="globe-outline" as any size={12} color="#64748B" /> {log.ip_address || 'IP não registrado'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
            
            {/* Lista de Usuários */}
            {activeTab === 'users' && (
                <ScrollView 
                    style={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2dd4bf" />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#2dd4bf" />
                        </View>
                    ) : users.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" as any size={64} color="#334155" />
                            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
                        </View>
                    ) : (
                        users.map((user) => (
                            <TouchableOpacity 
                                key={user.id} 
                                style={styles.userItem}
                                onPress={() => {
                                    setSelectedUser(user);
                                    setShowUserModal(true);
                                }}
                            >
                                <View style={styles.userAvatar}>
                                    <Text style={styles.userInitial}>{user.name?.charAt(0) || 'U'}</Text>
                                </View>
                                <View style={styles.userContent}>
                                    <Text style={styles.userName}>{user.name}</Text>
                                    <Text style={styles.userEmail}>{user.email}</Text>
                                    <View style={styles.userFooter}>
                                        <Text style={styles.userDate}>
                                            Cadastro: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                        </Text>
                                        <View style={[styles.userRole, user.role === 'admin' && styles.userRoleAdmin]}>
                                            <Text style={[styles.userRoleText, user.role === 'admin' && styles.userRoleTextAdmin]}>
                                                {user.role === 'admin' ? 'Admin' : 'Usuário'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" as any size={20} color="#334155" />
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}
            
            {/* Modal de edição de usuário */}
            <Modal visible={showUserModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Gerenciar usuário</Text>
                            <TouchableOpacity onPress={() => setShowUserModal(false)}>
                                <Ionicons name="close" as any size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedUser && (
                            <>
                                <View style={styles.modalUserInfo}>
                                    <View style={styles.modalUserAvatar}>
                                        <Text style={styles.modalUserInitial}>{selectedUser.name?.charAt(0) || 'U'}</Text>
                                    </View>
                                    <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                                    <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                                </View>
                                
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionLabel}>Permissão atual</Text>
                                    <View style={[styles.modalRoleBadge, selectedUser.role === 'admin' && styles.modalRoleBadgeAdmin]}>
                                        <Text style={[styles.modalRoleText, selectedUser.role === 'admin' && styles.modalRoleTextAdmin]}>
                                            {selectedUser.role === 'admin' ? 'Administrador' : 'Usuário comum'}
                                        </Text>
                                    </View>
                                </View>
                                
                                <TouchableOpacity 
                                    style={[styles.modalButton, selectedUser.role === 'admin' ? styles.modalButtonDanger : styles.modalButtonSuccess]}
                                    onPress={handleUpdateRole}
                                    disabled={updatingRole}
                                >
                                    {updatingRole ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.modalButtonText}>
                                            {selectedUser.role === 'admin' ? 'Remover permissões de admin' : 'Tornar administrador'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                
                                <Text style={styles.modalWarning}>
                                    ⚠️ Esta ação será registrada no log de auditoria
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
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
    tabBar: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: 'rgba(45,212,191,0.15)',
    },
    tabText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#2dd4bf',
    },
    statsScroll: {
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    statCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    statCardSmall: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    statValue: {
        color: '#2dd4bf',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statValueSmall: {
        color: '#2dd4bf',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#94A3B8',
        fontSize: 11,
        marginTop: 4,
    },
    statLabelSmall: {
        color: '#94A3B8',
        fontSize: 10,
        marginTop: 2,
    },
    filterContainer: {
        marginBottom: 16,
        position: 'relative',
        zIndex: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(45,212,191,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    filterButtonText: {
        color: '#2dd4bf',
        fontSize: 13,
    },
    filterDropdown: {
        position: 'absolute',
        top: 40,
        left: 0,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 8,
        minWidth: 150,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    filterOption: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    filterOptionText: {
        color: '#CBD5E1',
        fontSize: 14,
    },
    listContainer: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 14,
        marginTop: 12,
    },
    logItem: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        marginBottom: 8,
    },
    logIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    logContent: {
        flex: 1,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    logAction: {
        color: '#E2E8F0',
        fontSize: 14,
        fontWeight: '600',
    },
    logTime: {
        color: '#64748B',
        fontSize: 11,
    },
    logDescription: {
        color: '#94A3B8',
        fontSize: 13,
        marginBottom: 6,
    },
    logFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    logUser: {
        color: '#64748B',
        fontSize: 11,
    },
    logIp: {
        color: '#64748B',
        fontSize: 11,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        marginBottom: 8,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(45,212,191,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    userInitial: {
        color: '#2dd4bf',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userContent: {
        flex: 1,
    },
    userName: {
        color: '#E2E8F0',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    userEmail: {
        color: '#94A3B8',
        fontSize: 13,
        marginBottom: 4,
    },
    userFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userDate: {
        color: '#64748B',
        fontSize: 11,
    },
    userRole: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    userRoleAdmin: {
        backgroundColor: 'rgba(45,212,191,0.15)',
    },
    userRoleText: {
        color: '#94A3B8',
        fontSize: 10,
    },
    userRoleTextAdmin: {
        color: '#2dd4bf',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 20,
        width: '85%',
        maxWidth: 340,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#E2E8F0',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalUserInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalUserAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(45,212,191,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    modalUserInitial: {
        color: '#2dd4bf',
        fontSize: 28,
        fontWeight: 'bold',
    },
    modalUserName: {
        color: '#E2E8F0',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    modalUserEmail: {
        color: '#94A3B8',
        fontSize: 14,
    },
    modalSection: {
        marginBottom: 20,
    },
    modalSectionLabel: {
        color: '#94A3B8',
        fontSize: 12,
        marginBottom: 8,
    },
    modalRoleBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    modalRoleBadgeAdmin: {
        backgroundColor: 'rgba(45,212,191,0.15)',
    },
    modalRoleText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    modalRoleTextAdmin: {
        color: '#2dd4bf',
    },
    modalButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    modalButtonSuccess: {
        backgroundColor: '#2dd4bf',
    },
    modalButtonDanger: {
        backgroundColor: 'rgba(239,68,68,0.2)',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalWarning: {
        color: '#64748B',
        fontSize: 11,
        textAlign: 'center',
    },
});