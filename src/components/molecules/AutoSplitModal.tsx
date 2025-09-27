import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAutoSplit } from '../../hooks/useAutoSplit';
import { usePomodoroStore, Task } from '../../store/usePomodoroStore';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';

interface AutoSplitModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTask?: Task | null;
}

export const AutoSplitModal: React.FC<AutoSplitModalProps> = ({
  visible,
  onClose,
  selectedTask,
}) => {
  const { theme } = useTheme();
  const { tasks } = usePomodoroStore();
  const {
    getSplittableTasks,
    getSplitSuggestions,
    autoSplitTask,
    bulkSplitTasks,
    splitRules,
  } = useAutoSplit();

  const [splittableTasks, setSplittableTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [splitSuggestions, setSplitSuggestions] = useState<Record<string, any>>({});

  useEffect(() => {
    if (visible) {
      const splittable = getSplittableTasks();
      setSplittableTasks(splittable);
      
      // Get suggestions for each task
      const suggestions: Record<string, any> = {};
      splittable.forEach(task => {
        const suggestion = getSplitSuggestions(task);
        if (suggestion) {
          suggestions[task.id] = suggestion;
        }
      });
      setSplitSuggestions(suggestions);
    }
  }, [visible, getSplittableTasks, getSplitSuggestions]);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === splittableTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(splittableTasks.map(task => task.id));
    }
  };

  const handleSplitSelected = () => {
    if (selectedTasks.length === 0) {
      Alert.alert('Uyarı', 'Lütfen bölmek istediğiniz görevleri seçin.');
      return;
    }

    Alert.alert(
      'Görevleri Böl',
      `${selectedTasks.length} görevi bölmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Böl',
          style: 'destructive',
          onPress: () => {
            const results = bulkSplitTasks(selectedTasks);
            Alert.alert(
              'Başarılı',
              `${results.length} görev başarıyla bölündü ve ${results.reduce((sum, r) => sum + r.splitTasks.length, 0)} yeni görev oluşturuldu.`
            );
            setSelectedTasks([]);
            onClose();
          },
        },
      ]
    );
  };

  const handleSplitSingle = (task: Task) => {
    const suggestion = splitSuggestions[task.id];
    if (!suggestion) return;

    Alert.alert(
      'Görev Böl',
      `"${task.title}" görevini ${suggestion.suggestedParts} parçaya bölmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Böl',
          style: 'destructive',
          onPress: () => {
            const result = autoSplitTask(task);
            if (result) {
              Alert.alert(
                'Başarılı',
                `Görev ${result.splitTasks.length} parçaya bölündü.`
              );
              onClose();
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
          }}>
            Otomatik Görev Bölme
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{
              fontSize: 16,
              color: theme.colors.primary,
            }}>
              Kapat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={{
          padding: 20,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}>
          <Text style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
          }}>
            Uzun görevler otomatik olarak daha küçük parçalara bölünebilir. Bu, görevleri daha yönetilebilir hale getirir ve ilerleme takibini kolaylaştırır.
          </Text>
        </View>

        {/* Bulk Actions */}
        {splittableTasks.length > 0 && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}>
            <TouchableOpacity
              onPress={handleSelectAll}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
                backgroundColor: selectedTasks.length === splittableTasks.length 
                  ? theme.colors.primary 
                  : theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.primary,
              }}
            >
              <Text style={{
                fontSize: 14,
                color: selectedTasks.length === splittableTasks.length 
                  ? theme.colors.background 
                  : theme.colors.primary,
                fontWeight: '600',
              }}>
                {selectedTasks.length === splittableTasks.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
              </Text>
            </TouchableOpacity>
            
            {selectedTasks.length > 0 && (
              <TouchableOpacity
                onPress={handleSplitSelected}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                  backgroundColor: theme.colors.error,
                }}
              >
                <Text style={{
                  fontSize: 14,
                  color: theme.colors.background,
                  fontWeight: '600',
                }}>
                  Seçilenleri Böl ({selectedTasks.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tasks List */}
        <ScrollView style={{ flex: 1, padding: 20 }}>
          {splittableTasks.length === 0 ? (
            <View style={{
              alignItems: 'center',
              paddingVertical: 40,
            }}>
              <Text style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: 'center',
              }}>
                Bölünebilecek görev bulunamadı
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                marginTop: 8,
              }}>
                Uzun görevler (4+ pomodoro) otomatik olarak bölünebilir
              </Text>
            </View>
          ) : (
            splittableTasks.map((task) => {
              const suggestion = splitSuggestions[task.id];
              const isSelected = selectedTasks.includes(task.id);
              
              return (
                <Card key={task.id} style={{ marginBottom: 15 }}>
                  <TouchableOpacity
                    onPress={() => handleTaskSelect(task.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Selection Checkbox */}
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                      marginTop: 2,
                    }}>
                      {isSelected && (
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.background,
                          fontWeight: 'bold',
                        }}>
                          ✓
                        </Text>
                      )}
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      {/* Task Info */}
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 8,
                      }}>
                        <Text style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: theme.colors.text,
                          flex: 1,
                        }}>
                          {task.title}
                        </Text>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginLeft: 10,
                        }}>
                          <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: getPriorityColor(task.priority),
                            marginRight: 6,
                          }} />
                          <Text style={{
                            fontSize: 12,
                            color: theme.colors.textSecondary,
                          }}>
                            {task.estimatedPomodoros} pomodoro
                          </Text>
                        </View>
                      </View>
                      
                      {task.description && (
                        <Text style={{
                          fontSize: 14,
                          color: theme.colors.textSecondary,
                          marginBottom: 8,
                          lineHeight: 18,
                        }}>
                          {task.description}
                        </Text>
                      )}
                      
                      {/* Split Suggestion */}
                      {suggestion && (
                        <View style={{
                          backgroundColor: theme.colors.surface,
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 8,
                        }}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: theme.colors.text,
                            marginBottom: 4,
                          }}>
                            🔄 Bölme Önerisi: {suggestion.strategy}
                          </Text>
                          <Text style={{
                            fontSize: 12,
                            color: theme.colors.textSecondary,
                          }}>
                            {suggestion.suggestedParts} parçaya bölünecek • ~{Math.round(suggestion.estimatedTime / 60)} saat
                          </Text>
                        </View>
                      )}
                      
                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <View style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          marginBottom: 8,
                        }}>
                          {task.tags.slice(0, 3).map((tag, index) => (
                            <View
                              key={index}
                              style={{
                                backgroundColor: theme.colors.surface,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 12,
                                marginRight: 6,
                                marginBottom: 4,
                              }}
                            >
                              <Text style={{
                                fontSize: 12,
                                color: theme.colors.textSecondary,
                              }}>
                                #{tag}
                              </Text>
                            </View>
                          ))}
                          {task.tags.length > 3 && (
                            <Text style={{
                              fontSize: 12,
                              color: theme.colors.textSecondary,
                            }}>
                              +{task.tags.length - 3} daha
                            </Text>
                          )}
                        </View>
                      )}
                      
                      {/* Single Split Button */}
                      <Button
                        title="Tekil Böl"
                        onPress={() => handleSplitSingle(task)}
                        size="small"
                        variant="secondary"
                      />
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
