import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useWeeklyReview, WeeklyReview } from '../../hooks/useWeeklyReview';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';

interface WeeklyReviewModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const {
    getCurrentWeekReview,
    generateWeeklyReview,
    saveWeeklyReview,
    getWeeklyProgressComparison,
    getWeeklyInsightsSummary,
  } = useWeeklyReview();

  const [currentReview, setCurrentReview] = useState<any>(null);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [reflection, setReflection] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [progressComparison, setProgressComparison] = useState<any>(null);
  const [insightsSummary, setInsightsSummary] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      const review = getCurrentWeekReview();
      const comparison = getWeeklyProgressComparison();
      const summary = getWeeklyInsightsSummary();
      
      setCurrentReview(review);
      setProgressComparison(comparison);
      setInsightsSummary(summary);
      
      if (review) {
        const generatedReview = generateWeeklyReview();
        setWeeklyReview(generatedReview);
        setReflection('');
        setGoals(generatedReview.goals);
      }
    }
  }, [visible, getCurrentWeekReview, getWeeklyProgressComparison, getWeeklyInsightsSummary, generateWeeklyReview]);

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals(prev => [...prev, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveReview = () => {
    if (!weeklyReview) return;

    const updatedReview: WeeklyReview = {
      ...weeklyReview,
      reflection,
      goals,
      isCompleted: true,
    };

    saveWeeklyReview(updatedReview);
    Alert.alert('Başarılı', 'Haftalık değerlendirmeniz kaydedildi!');
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Orta';
    return 'Geliştirilmeli';
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
            Haftalık Değerlendirme
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

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {!currentReview ? (
            <View style={{
              alignItems: 'center',
              paddingVertical: 40,
            }}>
              <Text style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: 'center',
              }}>
                Bu hafta henüz yeterli veri yok
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                marginTop: 8,
              }}>
                Daha fazla pomodoro yapın ve görevlerinizi tamamlayın
              </Text>
            </View>
          ) : (
            <>
              {/* Weekly Statistics */}
              <Card style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                  marginBottom: 15,
                }}>
                  📊 Bu Haftanın İstatistikleri
                </Text>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>Pomodorolar:</Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.primary }}>
                    {currentReview.stats.totalPomodoros}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>Tamamlanan Görevler:</Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.primary }}>
                    {currentReview.stats.completedTasks}/{currentReview.stats.totalTasks}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>Toplam Odaklanma:</Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.primary }}>
                    {Math.round(currentReview.stats.totalFocusTime)} dk
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>Kesintiler:</Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.primary }}>
                    {currentReview.stats.interruptions}
                  </Text>
                </View>
              </Card>

              {/* Performance Scores */}
              <Card style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                  marginBottom: 15,
                }}>
                  🎯 Performans Skorları
                </Text>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>Üretkenlik:</Text>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: 'bold', 
                    color: getScoreColor(currentReview.stats.productivityScore) 
                  }}>
                    {currentReview.stats.productivityScore}/100
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>Odaklanma:</Text>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: 'bold', 
                    color: getScoreColor(currentReview.stats.focusScore) 
                  }}>
                    {currentReview.stats.focusScore}/100
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>Tutarlılık:</Text>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: 'bold', 
                    color: getScoreColor(currentReview.stats.consistencyScore) 
                  }}>
                    {currentReview.stats.consistencyScore}/100
                  </Text>
                </View>
              </Card>

              {/* Progress Comparison */}
              {progressComparison?.hasComparison && (
                <Card style={{ marginBottom: 20 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: theme.colors.text,
                    marginBottom: 15,
                  }}>
                    📈 Geçen Hafta ile Karşılaştırma
                  </Text>
                  
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <Text style={{ fontSize: 14, color: theme.colors.text }}>Pomodoro Değişimi:</Text>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: 'bold', 
                      color: progressComparison.pomodoroChange > 0 ? theme.colors.success : theme.colors.error 
                    }}>
                      {progressComparison.pomodoroChange > 0 ? '+' : ''}{progressComparison.pomodoroChange}
                    </Text>
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <Text style={{ fontSize: 14, color: theme.colors.text }}>Görev Değişimi:</Text>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: 'bold', 
                      color: progressComparison.taskChange > 0 ? theme.colors.success : theme.colors.error 
                    }}>
                      {progressComparison.taskChange > 0 ? '+' : ''}{progressComparison.taskChange}
                    </Text>
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <Text style={{ fontSize: 14, color: theme.colors.text }}>Üretkenlik Değişimi:</Text>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: 'bold', 
                      color: progressComparison.productivityChange > 0 ? theme.colors.success : theme.colors.error 
                    }}>
                      {progressComparison.productivityChange > 0 ? '+' : ''}{progressComparison.productivityChange}
                    </Text>
                  </View>
                </Card>
              )}

              {/* AI Insights */}
              {insightsSummary && (
                <Card style={{ marginBottom: 20 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: theme.colors.text,
                    marginBottom: 15,
                  }}>
                    🤖 AI Analizi
                  </Text>
                  
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                    marginBottom: 15,
                  }}>
                    {insightsSummary.message}
                  </Text>
                  
                  {insightsSummary.achievements?.length > 0 && (
                    <View style={{ marginBottom: 15 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: theme.colors.success,
                        marginBottom: 8,
                      }}>
                        🎉 Başarılar:
                      </Text>
                      {insightsSummary.achievements.map((achievement: string, index: number) => (
                        <Text key={index} style={{
                          fontSize: 14,
                          color: theme.colors.textSecondary,
                          marginLeft: 10,
                          marginBottom: 4,
                        }}>
                          • {achievement}
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {insightsSummary.challenges?.length > 0 && (
                    <View style={{ marginBottom: 15 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: theme.colors.error,
                        marginBottom: 8,
                      }}>
                        ⚠️ Zorluklar:
                      </Text>
                      {insightsSummary.challenges.map((challenge: string, index: number) => (
                        <Text key={index} style={{
                          fontSize: 14,
                          color: theme.colors.textSecondary,
                          marginLeft: 10,
                          marginBottom: 4,
                        }}>
                          • {challenge}
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {insightsSummary.recommendations?.length > 0 && (
                    <View style={{ marginBottom: 15 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: theme.colors.primary,
                        marginBottom: 8,
                      }}>
                        💡 Öneriler:
                      </Text>
                      {insightsSummary.recommendations.map((recommendation: string, index: number) => (
                        <Text key={index} style={{
                          fontSize: 14,
                          color: theme.colors.textSecondary,
                          marginLeft: 10,
                          marginBottom: 4,
                        }}>
                          • {recommendation}
                        </Text>
                      ))}
                    </View>
                  )}
                </Card>
              )}

              {/* Personal Reflection */}
              <Card style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                  marginBottom: 15,
                }}>
                  🤔 Kişisel Değerlendirme
                </Text>
                
                <Text style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginBottom: 10,
                }}>
                  Bu hafta hakkında düşüncelerinizi yazın:
                </Text>
                
                <TextInput
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    color: theme.colors.text,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Bu hafta nasıl geçti? Neler öğrendiniz? Hangi zorluklarla karşılaştınız?"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={reflection}
                  onChangeText={setReflection}
                  multiline
                />
              </Card>

              {/* Next Week Goals */}
              <Card style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                  marginBottom: 15,
                }}>
                  🎯 Gelecek Hafta Hedefleri
                </Text>
                
                {goals.map((goal, index) => (
                  <View key={index} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: theme.colors.surface,
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}>
                    <Text style={{
                      fontSize: 14,
                      color: theme.colors.text,
                      flex: 1,
                    }}>
                      {goal}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveGoal(index)}
                      style={{
                        padding: 4,
                      }}
                    >
                      <Text style={{
                        fontSize: 16,
                        color: theme.colors.error,
                      }}>
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                  <TextInput
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.surface,
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 14,
                      color: theme.colors.text,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      marginRight: 10,
                    }}
                    placeholder="Yeni hedef ekleyin..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={newGoal}
                    onChangeText={setNewGoal}
                  />
                  <Button
                    title="Ekle"
                    onPress={handleAddGoal}
                    size="small"
                  />
                </View>
              </Card>
            </>
          )}
        </ScrollView>

        {/* Save Button */}
        {currentReview && (
          <View style={{
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}>
            <Button
              title="Değerlendirmeyi Kaydet"
              onPress={handleSaveReview}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};
