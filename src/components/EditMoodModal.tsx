import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert
} from 'react-native';
import { moodApi } from '@/services/api';

interface EditMoodModalProps {
    visible: boolean;
    mood: any;
    onClose: () => void;
    onSave: () => void;
}

export default function EditMoodModal({ visible, mood, onClose, onSave }: EditMoodModalProps) {
    const [level, setLevel] = useState(3);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedTriggerIds, setSelectedTriggerIds] = useState<number[]>([]);
    const [availableTriggers, setAvailableTriggers] = useState<any[]>([]);

    // Carregar triggers disponíveis da API
    useEffect(() => {
        if (visible) {
            loadTriggers();
        }
    }, [visible]);

    const loadTriggers = async () => {
        try {
            const response = await moodApi.getTriggers();
            console.log("📋 Resposta triggers:", response.data);
            
            // 🔥 CORREÇÃO: Extrair os triggers corretamente
            let triggersData = [];
            if (response.data?.data && Array.isArray(response.data.data)) {
                triggersData = response.data.data;
            } else if (Array.isArray(response.data)) {
                triggersData = response.data;
            } else {
                triggersData = [];
            }
            
            console.log("✅ Triggers carregados:", triggersData.length);
            setAvailableTriggers(triggersData);
        } catch (error) {
            console.error('Erro ao carregar triggers:', error);
            setAvailableTriggers([]); // Garante que seja um array mesmo com erro
        }
    };

    useEffect(() => {
        if (mood) {
            setLevel(mood.level || 3);
            setNote(mood.note || '');
            // Extrair os IDs dos triggers do mood
            if (mood.triggers && Array.isArray(mood.triggers)) {
                const triggerIds = mood.triggers.map((t: any) => t.id);
                setSelectedTriggerIds(triggerIds);
            } else {
                setSelectedTriggerIds([]);
            }
        }
    }, [mood]);

    const toggleTrigger = (triggerId: number) => {
        setSelectedTriggerIds(prev =>
            prev.includes(triggerId)
                ? prev.filter(id => id !== triggerId)
                : [...prev, triggerId]
        );
    };

    const handleSave = async () => {
        if (!level) {
            Alert.alert('Erro', 'Selecione um nível emocional');
            return;
        }

        setLoading(true);
        try {
            await moodApi.update(mood.id, {
                level: level,
                note: note.trim() || undefined,
                trigger_ids: selectedTriggerIds.length > 0 ? selectedTriggerIds : undefined
            });
            
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar:', error?.response?.data || error.message);
            Alert.alert('Erro', 'Não foi possível salvar as alterações');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Editar registro</Text>
                    
                    <Text style={styles.label}>Nível emocional (1-5)</Text>
                    <View style={styles.levelContainer}>
                        {[1, 2, 3, 4, 5].map(l => (
                            <TouchableOpacity
                                key={l}
                                style={[
                                    styles.levelButton,
                                    level === l && styles.levelActive
                                ]}
                                onPress={() => setLevel(l)}
                            >
                                <Text style={styles.levelText}>{l}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    
                    <Text style={styles.label}>Gatilhos</Text>
                    {availableTriggers.length > 0 ? (
                        <View style={styles.triggerContainer}>
                            {availableTriggers.map(trigger => (
                                <TouchableOpacity
                                    key={trigger.id}
                                    style={[
                                        styles.triggerButton,
                                        selectedTriggerIds.includes(trigger.id) && styles.triggerActive
                                    ]}
                                    onPress={() => toggleTrigger(trigger.id)}
                                >
                                    <Text style={styles.triggerText}>{trigger.name || trigger.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.mutedText}>Carregando gatilhos...</Text>
                    )}
                    
                    <Text style={styles.label}>Nota (opcional)</Text>
                    <TextInput
                        style={styles.input}
                        value={note}
                        onChangeText={setNote}
                        placeholder="Como você se sentiu?"
                        placeholderTextColor="#666"
                        multiline
                        numberOfLines={3}
                    />
                    
                    <View style={styles.buttonRow}>
                        <TouchableOpacity 
                            style={styles.cancelButton} 
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.saveButton} 
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveText}>Salvar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1a1f2e',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    title: {
        color: '#2dd4bf',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        color: '#94A3B8',
        marginTop: 15,
        marginBottom: 10,
        fontSize: 14,
    },
    levelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 5,
    },
    levelButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelActive: {
        backgroundColor: '#2dd4bf',
    },
    levelText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    triggerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 5,
    },
    triggerButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    triggerActive: {
        backgroundColor: '#2dd4bf',
    },
    triggerText: {
        color: '#fff',
        fontSize: 14,
    },
    mutedText: {
        color: '#94A3B8',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 10,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 12,
        color: '#fff',
        textAlignVertical: 'top',
        minHeight: 80,
        fontSize: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    cancelText: {
        color: '#fff',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#2dd4bf',
        alignItems: 'center',
    },
    saveText: {
        color: '#02120F',
        fontWeight: 'bold',
        fontSize: 16,
    },
});