import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMNS = 7; // 7 colunas para os dias da semana
const DAY_SIZE = (width - 60) / COLUMNS;

interface MoodCalendarProps {
  data: any[];
}

export default function MoodCalendar({ data }: MoodCalendarProps) {
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getMoodColor = (level: number) => {
    const colors = {
      1: ['#ef4444', '#dc2626'],
      2: ['#f97316', '#ea580c'],
      3: ['#eab308', '#ca8a04'],
      4: ['#84cc16', '#65a30d'],
      5: ['#22c55e', '#16a34a'],
    };
    return colors[level as keyof typeof colors] || ['#334155', '#1e293b'];
  };
  
  const getMoodEmoji = (level: number) => {
    const emojis = {
      1: '😞',
      2: '😕',
      3: '😐',
      4: '🙂',
      5: '😁',
    };
    return emojis[level as keyof typeof emojis] || '📅';
  };
  
  const getMoodText = (level: number) => {
    const texts = {
      1: 'Muito mal',
      2: 'Mal',
      3: 'Neutro',
      4: 'Bem',
      5: 'Ótimo',
    };
    return texts[level as keyof typeof texts] || '';
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };
  
  // Gerar dias do mês atual com correção de timezone
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Dias vazios no início
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      // Criar data no formato YYYY-MM-DD sem timezone
      const yearStr = year.toString();
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = i.toString().padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
      
      // Buscar mood comparando apenas a data (sem timezone)
      const mood = data.find(m => {
        const moodDate = m.date?.split('T')[0];
        return moodDate === dateStr;
      });
      
      days.push({ day: i, mood, date: dateStr });
    }
    
    return days;
  };
  
  const days = getDaysInMonth();
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  
  // Dividir os dias em linhas de COLUMNS colunas
  const chunkArray = (arr: any[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };
  
  const rows = chunkArray(days, COLUMNS);
  
  return (
    <View>
      {/* Cabeçalho com navegação */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#2dd4bf" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#2dd4bf" />
        </TouchableOpacity>
      </View>
      
      {/* Botão para voltar ao mês atual */}
      {currentDate.getMonth() !== new Date().getMonth() && (
        <TouchableOpacity onPress={goToCurrentMonth} style={styles.currentMonthButton}>
          <Text style={styles.currentMonthText}>⏺ Voltar para mês atual</Text>
        </TouchableOpacity>
      )}
      
      {/* 🔥 LINHA COM OS DIAS DA SEMANA */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendário */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.calendarRow}>
              {row.map((item, colIndex) => {
                if (!item) {
                  return <View key={colIndex} style={styles.emptyDay} />;
                }
                
                const hasMood = !!item.mood;
                const level = item.mood?.level;
                const colors = level ? getMoodColor(level) : ['#1e293b', '#0f172a'];
                
                return (
                  <Pressable
                    key={colIndex}
                    onPress={() => hasMood && setSelectedMood(item.mood)}
                    disabled={!hasMood}
                    style={styles.dayPressable}
                  >
                    <LinearGradient
                      colors={colors}
                      style={[styles.dayGradient, !hasMood && styles.emptyDayGradient]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={[styles.dayNumber, !hasMood && styles.emptyDayText]}>
                        {item.day}
                      </Text>
                      {hasMood && (
                        <Text style={styles.dayEmoji}>
                          {getMoodEmoji(level)}
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                );
              })}
              {/* Completar a linha com dias vazios se necessário */}
              {row.length < COLUMNS && 
                Array(COLUMNS - row.length).fill(null).map((_, idx) => (
                  <View key={`empty-${idx}`} style={styles.emptyDay} />
                ))
              }
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* Modal de detalhes do dia */}
      <Modal visible={!!selectedMood} transparent animationType="fade">
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setSelectedMood(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>
                {getMoodEmoji(selectedMood?.level)}
              </Text>
              <TouchableOpacity 
                style={styles.modalClose}
                onPress={() => setSelectedMood(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Data corrigida sem timezone */}
            <Text style={styles.modalDate}>
              {selectedMood?.date ? (() => {
                const originalDate = selectedMood.date.split('T')[0];
                const [year, month, day] = originalDate.split('-');
                const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                const dataObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                return `${diasSemana[dataObj.getDay()]}, ${day} de ${meses[parseInt(month) - 1]} de ${year}`;
              })() : ''}
            </Text>
            
            <View style={styles.modalLevelContainer}>
              <Text style={styles.modalLevelLabel}>Nível:</Text>
              <Text style={[styles.modalLevelValue, { color: selectedMood?.level ? getMoodColor(selectedMood.level)[0] : '#2dd4bf' }]}>
                {selectedMood?.level}/5 - {getMoodText(selectedMood?.level)}
              </Text>
            </View>
            
            {selectedMood?.note && (
              <View style={styles.modalNoteContainer}>
                <Text style={styles.modalNoteLabel}>📝 Nota:</Text>
                <Text style={styles.modalNote}>{selectedMood.note}</Text>
              </View>
            )}
            
            {selectedMood?.triggers && selectedMood.triggers.length > 0 && (
              <View style={styles.modalTriggersContainer}>
                <Text style={styles.modalTriggersLabel}>🎯 Gatilhos:</Text>
                <View style={styles.modalTriggersList}>
                  {selectedMood.triggers.map((trigger: any, idx: number) => (
                    <View key={idx} style={styles.modalTriggerTag}>
                      <Text style={styles.modalTriggerText}>
                        {trigger.name || trigger}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
    backgroundColor: 'rgba(45,212,191,0.1)',
    borderRadius: 20,
  },
  monthTitle: {
    color: '#2dd4bf',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentMonthButton: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(45,212,191,0.15)',
    borderRadius: 16,
  },
  currentMonthText: {
    color: '#2dd4bf',
    fontSize: 12,
  },
  // 🔥 ESTILOS PARA OS DIAS DA SEMANA
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekDayCell: {
    width: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  emptyDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
  },
  dayPressable: {
    width: DAY_SIZE,
    height: DAY_SIZE,
  },
  dayGradient: {
    width: DAY_SIZE - 6,
    height: DAY_SIZE - 6,
    margin: 3,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDayGradient: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  dayNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyDayText: {
    color: '#334155',
  },
  dayEmoji: {
    fontSize: 14,
    marginTop: 2,
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
    marginBottom: 16,
  },
  modalEmoji: {
    fontSize: 48,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalDate: {
    color: '#2dd4bf',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalLevelLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginRight: 8,
  },
  modalLevelValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalNoteContainer: {
    marginBottom: 16,
  },
  modalNoteLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  modalNote: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  modalTriggersContainer: {
    marginBottom: 8,
  },
  modalTriggersLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  modalTriggersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTriggerTag: {
    backgroundColor: 'rgba(45,212,191,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2dd4bf',
  },
  modalTriggerText: {
    color: '#2dd4bf',
    fontSize: 12,
  },
});