import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useBreakGuide, BreakActivity, BreakSession } from '../../hooks/useBreakGuide';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';

interface BreakGuideModalProps {
  visible: boolean;
  onClose: () => void;
  availableTime?: number;
  energyLevel?: 'low' | 'medium' | 'high';
  mood?: 'tired' | 'stressed' | 'neutral' | 'energized' | 'focused';
}

export const BreakGuideModal: React.FC<BreakGuideModalProps> = ({
  visible,
  onClose,
  availableTime = 5,
  energyLevel = 'medium',
  mood = 'neutral',
}) => {
  const { theme } = useTheme();
  const {
    breakActivities,
    getActivitiesByCategory,
    getQuickBreakSuggestions,
    generateBreakSession,
    getCategoryStats,
  } = useBreakGuide();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<BreakActivity[]>([]);
  const [currentSession, setCurrentSession] = useState<BreakSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const categories = [
    { key: 'all', name: 'Tümü', icon: '🎯' },
    { key: 'stretching', name: 'Germe', icon: '🤸' },
    { key: 'breathing', name: 'Nefes', icon: '🫁' },
    { key: 'movement', name: 'Hareket', icon: '🏃' },
    { key: 'mindfulness', name: 'Farkındalık', icon: '🧘' },
    { key: 'eye-care', name: 'Göz Bakımı', icon: '👁️' },
    { key: 'hydration', name: 'Hidrasyon', icon: '💧' },
  ];

  useEffect(() => {
    if (visible) {
      // Generate a suggested break session
      const session = generateBreakSession(availableTime, energyLevel, mood);
      setCurrentSession(session);
      setSelectedActivities(session.activities);
    }
  }, [visible, availableTime, energyLevel, mood, generateBreakSession]);

  const handleActivitySelect = (activity: BreakActivity) => {
    setSelectedActivities(prev => {
      const exists = prev.some(a => a.id === activity.id);
      if (exists) {
        return prev.filter(a => a.id !== activity.id);
      } else {
        return [...prev, activity];
      }
    });
  };

  const handleStartSession = () => {
    if (selectedActivities.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir aktivite seçin.');
      return;
    }

    const session: BreakSession = {
      id: Date.now().toString(),
      activities: selectedActivities,
      totalDuration: selectedActivities.reduce((sum, a) => sum + a.duration, 0),
      startTime: new Date(),
      isCompleted: false,
      energyLevel,
      mood,
    };

    setCurrentSession(session);
    setIsSessionActive(true);
  };

  const handleCompleteSession = () => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        endTime: new Date(),
        isCompleted: true,
      });
      setIsSessionActive(false);
      Alert.alert('Tebrikler!', 'Mola seansınızı başarıyla tamamladınız!');
    }
  };

  const getFilteredActivities = () => {
    let activities = breakActivities;

    if (selectedCategory && selectedCategory !== 'all') {
      activities = getActivitiesByCategory(selectedCategory as any);
    }

    return activities;
  };

  const getCategoryIcon = (category: string) => {
    const categoryInfo = categories.find(c => c.key === category);
    return categoryInfo?.icon || '🎯';
  };

  const getCategoryColor = (category: string) => {
    const activity = breakActivities.find(a => a.category === category);
    return activity?.color || theme.colors.primary;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'hard': return theme.colors.error;
      default: return theme.colors.text;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return 'Bilinmiyor';
    }
  };

  if (isSessionActive && currentSession) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {/* Session Header */}
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
              Mola Seansı
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

          {/* Session Info */}
          <View style={{
            padding: 20,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 8,
            }}>
              {currentSession.activities.length} aktivite • {currentSession.totalDuration} dakika
            </Text>
            <Text style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}>
              Enerji: {energyLevel === 'high' ? 'Yüksek' : energyLevel === 'low' ? 'Düşük' : 'Orta'} • 
              Ruh Hali: {mood === 'tired' ? 'Yorgun' : mood === 'stressed' ? 'Stresli' : mood === 'energized' ? 'Enerjik' : mood === 'focused' ? 'Odaklı' : 'Nötr'}
            </Text>
          </View>

          {/* Activities List */}
          <ScrollView style={{ flex: 1, padding: 20 }}>
            {currentSession.activities.map((activity, index) => (
              <Card key={activity.id} style={{ marginBottom: 15 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: activity.color,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ fontSize: 20 }}>
                      {activity.icon}
                    </Text>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: theme.colors.text,
                      marginBottom: 4,
                    }}>
                      {index + 1}. {activity.name}
                    </Text>
                    
                    <Text style={{
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginBottom: 8,
                    }}>
                      {activity.description}
                    </Text>
                    
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        marginRight: 15,
                      }}>
                        ⏱️ {activity.duration} dk
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: getDifficultyColor(activity.difficulty),
                        fontWeight: 'bold',
                      }}>
                        {getDifficultyText(activity.difficulty)}
                      </Text>
                    </View>
                    
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.colors.text,
                      marginBottom: 4,
                    }}>
                      Talimatlar:
                    </Text>
                    {activity.instructions.map((instruction, i) => (
                      <Text key={i} style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        marginLeft: 10,
                        marginBottom: 2,
                      }}>
                        {i + 1}. {instruction}
                      </Text>
                    ))}
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>

          {/* Complete Button */}
          <View style={{
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}>
            <Button
              title="Seansı Tamamla"
              onPress={handleCompleteSession}
              style={{ backgroundColor: theme.colors.success }}
            />
          </View>
        </View>
      </Modal>
    );
  }

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
            Mola Rehberi
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
            Mola sürenizi en verimli şekilde değerlendirin. Stretching, nefes egzersizleri ve diğer aktivitelerle enerjinizi yenileyin.
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              onPress={() => setSelectedCategory(category.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedCategory === category.key ? getCategoryColor(category.key) : theme.colors.surface,
                marginRight: 10,
                borderWidth: 1,
                borderColor: selectedCategory === category.key ? getCategoryColor(category.key) : theme.colors.border,
              }}
            >
              <Text style={{
                fontSize: 14,
                color: selectedCategory === category.key ? theme.colors.background : theme.colors.text,
                fontWeight: selectedCategory === category.key ? 'bold' : 'normal',
              }}>
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Activities Summary */}
        {selectedActivities.length > 0 && (
          <View style={{
            padding: 20,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 8,
            }}>
              Seçilen Aktiviteler ({selectedActivities.length})
            </Text>
            <Text style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}>
              Toplam süre: {selectedActivities.reduce((sum, a) => sum + a.duration, 0)} dakika
            </Text>
          </View>
        )}

        {/* Activities List */}
        <ScrollView style={{ flex: 1, padding: 20 }}>
          {getFilteredActivities().map((activity) => {
            const isSelected = selectedActivities.some(a => a.id === activity.id);
            
            return (
              <Card key={activity.id} style={{ marginBottom: 15 }}>
                <TouchableOpacity
                  onPress={() => handleActivitySelect(activity)}
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
                    borderColor: isSelected ? activity.color : theme.colors.border,
                    backgroundColor: isSelected ? activity.color : 'transparent',
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
                        {activity.name}
                      </Text>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: activity.color,
                      }}>
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.background,
                          fontWeight: 'bold',
                        }}>
                          {activity.duration} dk
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={{
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginBottom: 8,
                      lineHeight: 18,
                    }}>
                      {activity.description}
                    </Text>
                    
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: getDifficultyColor(activity.difficulty),
                        marginRight: 15,
                        fontWeight: 'bold',
                      }}>
                        {getDifficultyText(activity.difficulty)}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                      }}>
                        {activity.category === 'stretching' ? '🤸' : 
                         activity.category === 'breathing' ? '🫁' :
                         activity.category === 'movement' ? '🏃' :
                         activity.category === 'mindfulness' ? '🧘' :
                         activity.category === 'eye-care' ? '👁️' : '💧'} {activity.category}
                      </Text>
                    </View>
                    
                    <View style={{ marginBottom: 8 }}>
                      <Text style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        marginBottom: 4,
                      }}>
                        Faydalar:
                      </Text>
                      {activity.benefits.slice(0, 2).map((benefit, index) => (
                        <Text key={index} style={{
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                          marginLeft: 10,
                        }}>
                          • {benefit}
                        </Text>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            );
          })}
        </ScrollView>

        {/* Start Session Button */}
        {selectedActivities.length > 0 && (
          <View style={{
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}>
            <Button
              title={`Seansı Başlat (${selectedActivities.reduce((sum, a) => sum + a.duration, 0)} dk)`}
              onPress={handleStartSession}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};
