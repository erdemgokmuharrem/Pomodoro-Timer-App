import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  useComplexityScore,
  ComplexityScore,
} from '../../hooks/useComplexityScore';
import { usePomodoroStore, Task } from '../../store/usePomodoroStore';
import { useTheme } from '../../hooks/useTheme';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

interface ComplexityScoreModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTask?: Task | null;
}

export const ComplexityScoreModal: React.FC<ComplexityScoreModalProps> = ({
  visible,
  onClose,
  selectedTask,
}) => {
  const { theme } = useTheme();
  const { tasks } = usePomodoroStore();
  const {
    getTaskComplexity,
    getComplexityStats,
    getComplexityTrends,
    getComplexityInsights,
    getTasksByComplexity,
  } = useComplexityScore();

  const [selectedTaskComplexity, setSelectedTaskComplexity] =
    useState<ComplexityScore | null>(null);
  const [complexityStats, setComplexityStats] = useState<any>(null);
  const [complexityTrends, setComplexityTrends] = useState<any>(null);
  const [complexityInsights, setComplexityInsights] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (selectedTask) {
        const complexity = getTaskComplexity(selectedTask);
        setSelectedTaskComplexity(complexity);
      }

      const stats = getComplexityStats();
      const trends = getComplexityTrends();
      const insights = getComplexityInsights();

      setComplexityStats(stats);
      setComplexityTrends(trends);
      setComplexityInsights(insights);
    }
  }, [
    visible,
    selectedTask,
    getTaskComplexity,
    getComplexityStats,
    getComplexityTrends,
    getComplexityInsights,
  ]);

  const getComplexityLevelColor = (level: string) => {
    switch (level) {
      case 'simple':
        return theme.colors.success;
      case 'moderate':
        return theme.colors.warning;
      case 'complex':
        return theme.colors.error;
      case 'very-complex':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const getComplexityLevelText = (level: string) => {
    switch (level) {
      case 'simple':
        return 'Basit';
      case 'moderate':
        return 'Orta';
      case 'complex':
        return 'Karmaşık';
      case 'very-complex':
        return 'Çok Karmaşık';
      default:
        return 'Bilinmiyor';
    }
  };

  const getComplexityLevelIcon = (level: string) => {
    switch (level) {
      case 'simple':
        return '🟢';
      case 'moderate':
        return '🟡';
      case 'complex':
        return '🟠';
      case 'very-complex':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getFactorColor = (value: number) => {
    if (value < 0.3) return theme.colors.success;
    if (value < 0.6) return theme.colors.warning;
    return theme.colors.error;
  };

  const getFactorText = (value: number) => {
    if (value < 0.3) return 'Düşük';
    if (value < 0.6) return 'Orta';
    return 'Yüksek';
  };

  const complexityLevels = [
    { key: 'all', name: 'Tümü', icon: '📊' },
    { key: 'simple', name: 'Basit', icon: '🟢' },
    { key: 'moderate', name: 'Orta', icon: '🟡' },
    { key: 'complex', name: 'Karmaşık', icon: '🟠' },
    { key: 'very-complex', name: 'Çok Karmaşık', icon: '🔴' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text,
            }}
          >
            Karmaşıklık Analizi
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.primary,
              }}
            >
              Kapat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected Task Complexity */}
        {selectedTaskComplexity && (
          <View
            style={{
              padding: 20,
              backgroundColor: theme.colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 10,
              }}
            >
              Seçilen Görev Analizi
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: getComplexityLevelColor(
                    selectedTaskComplexity.level
                  ),
                  marginRight: 10,
                }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                }}
              >
                {getComplexityLevelIcon(selectedTaskComplexity.level)}{' '}
                {getComplexityLevelText(selectedTaskComplexity.level)}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                  marginLeft: 10,
                }}
              >
                ({selectedTaskComplexity.overall}/100)
              </Text>
            </View>

            {/* Complexity Factors */}
            <View style={{ marginBottom: 15 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Karmaşıklık Faktörleri:
              </Text>
              {Object.entries(selectedTaskComplexity.factors).map(
                ([key, value]) => (
                  <View
                    key={key}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        textTransform: 'capitalize',
                      }}
                    >
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: 60,
                          height: 4,
                          backgroundColor: theme.colors.border,
                          borderRadius: 2,
                          marginRight: 8,
                        }}
                      >
                        <View
                          style={{
                            width: `${value * 100}%`,
                            height: '100%',
                            backgroundColor: getFactorColor(value),
                            borderRadius: 2,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          color: getFactorColor(value),
                          fontWeight: 'bold',
                        }}
                      >
                        {getFactorText(value)}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>

            {/* Recommendations */}
            {selectedTaskComplexity.recommendations.length > 0 && (
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Öneriler:
                </Text>
                {selectedTaskComplexity.recommendations.map(
                  (recommendation, index) => (
                    <Text
                      key={index}
                      style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        marginLeft: 10,
                        marginBottom: 4,
                      }}
                    >
                      • {recommendation}
                    </Text>
                  )
                )}
              </View>
            )}
          </View>
        )}

        {/* Complexity Level Filter */}
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
          {complexityLevels.map(level => (
            <TouchableOpacity
              key={level.key}
              onPress={() => setSelectedLevel(level.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedLevel === level.key
                    ? theme.colors.primary
                    : theme.colors.surface,
                marginRight: 10,
                borderWidth: 1,
                borderColor:
                  selectedLevel === level.key
                    ? theme.colors.primary
                    : theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color:
                    selectedLevel === level.key
                      ? theme.colors.background
                      : theme.colors.text,
                  fontWeight: selectedLevel === level.key ? 'bold' : 'normal',
                }}
              >
                {level.icon} {level.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Complexity Statistics */}
        {complexityStats && (
          <View style={{ padding: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 15,
              }}
            >
              Genel İstatistikler
            </Text>

            <Card style={{ marginBottom: 15 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: theme.colors.text,
                  }}
                >
                  Ortalama Karmaşıklık
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.colors.primary,
                  }}
                >
                  {complexityStats.averageComplexity}/100
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                }}
              >
                Tüm görevlerin ortalama karmaşıklık skoru
              </Text>
            </Card>

            {/* Complexity Distribution */}
            <Card style={{ marginBottom: 15 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                  marginBottom: 10,
                }}
              >
                Karmaşıklık Dağılımı
              </Text>
              {Object.entries(complexityStats.complexityDistribution).map(
                ([level, count]) => (
                  <View
                    key={level}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.colors.text,
                      }}
                    >
                      {getComplexityLevelIcon(level)}{' '}
                      {getComplexityLevelText(level)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: getComplexityLevelColor(level),
                      }}
                    >
                      {count as number} görev
                    </Text>
                  </View>
                )
              )}
            </Card>

            {/* Most Complex Tasks */}
            {complexityStats.mostComplexTasks.length > 0 && (
              <Card style={{ marginBottom: 15 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: theme.colors.text,
                    marginBottom: 10,
                  }}
                >
                  En Karmaşık Görevler
                </Text>
                {complexityStats.mostComplexTasks
                  .slice(0, 3)
                  .map((item: any, index: number) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.colors.text,
                          flex: 1,
                        }}
                      >
                        {item.task.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: getComplexityLevelColor(item.level),
                          fontWeight: 'bold',
                        }}
                      >
                        {item.score}/100
                      </Text>
                    </View>
                  ))}
              </Card>
            )}
          </View>
        )}

        {/* Complexity Insights */}
        {complexityInsights && (
          <View style={{ padding: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 15,
              }}
            >
              Analiz ve Öneriler
            </Text>

            <Card style={{ marginBottom: 15 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                  marginBottom: 10,
                }}
              >
                Trend Analizi
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Karmaşıklık trendi:{' '}
                {complexityTrends.trend === 'increasing'
                  ? '📈 Artıyor'
                  : complexityTrends.trend === 'decreasing'
                    ? '📉 Azalıyor'
                    : '📊 Stabil'}
              </Text>
              {complexityTrends.change !== 0 && (
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Değişim: %{Math.abs(complexityTrends.change)}
                </Text>
              )}
            </Card>

            {/* Recommendations */}
            {complexityInsights.recommendations.length > 0 && (
              <Card>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: theme.colors.text,
                    marginBottom: 10,
                  }}
                >
                  Öneriler
                </Text>
                {complexityInsights.recommendations.map(
                  (recommendation: string, index: number) => (
                    <Text
                      key={index}
                      style={{
                        fontSize: 14,
                        color: theme.colors.textSecondary,
                        marginLeft: 10,
                        marginBottom: 8,
                      }}
                    >
                      • {recommendation}
                    </Text>
                  )
                )}
              </Card>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};
