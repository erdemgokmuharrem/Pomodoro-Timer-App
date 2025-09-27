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
  useEnergyAnalysis,
  EnergyRecommendation,
} from '../../hooks/useEnergyAnalysis';
import { useTheme } from '../../hooks/useTheme';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

interface EnergyRecommendationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRecommendation?: (recommendation: EnergyRecommendation) => void;
}

export const EnergyRecommendationsModal: React.FC<
  EnergyRecommendationsModalProps
> = ({ visible, onClose, onSelectRecommendation }) => {
  const { theme } = useTheme();
  const {
    energyLevel,
    energyPatterns,
    recommendations,
    getTaskRecommendations,
    getBreakRecommendations,
  } = useEnergyAnalysis();

  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'task' | 'break' | 'activity' | 'environment'
  >('all');
  const [filteredRecommendations, setFilteredRecommendations] = useState<
    EnergyRecommendation[]
  >([]);

  useEffect(() => {
    let filtered = recommendations;

    if (selectedCategory !== 'all') {
      filtered = recommendations.filter(rec => rec.type === selectedCategory);
    }

    setFilteredRecommendations(filtered);
  }, [recommendations, selectedCategory]);

  const handleSelectRecommendation = (recommendation: EnergyRecommendation) => {
    if (onSelectRecommendation) {
      onSelectRecommendation(recommendation);
    }
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.text;
    }
  };

  const getEnergyLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'task':
        return '📝';
      case 'break':
        return '☕';
      case 'activity':
        return '🏃';
      case 'environment':
        return '🌍';
      default:
        return '💡';
    }
  };

  const categories = [
    { key: 'all', label: 'Tümü', icon: '💡' },
    { key: 'task', label: 'Görevler', icon: '📝' },
    { key: 'break', label: 'Molalar', icon: '☕' },
    { key: 'activity', label: 'Aktiviteler', icon: '🏃' },
    { key: 'environment', label: 'Ortam', icon: '🌍' },
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
            Enerji Önerileri
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

        {/* Energy Level Indicator */}
        <View
          style={{
            padding: 20,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: getEnergyLevelColor(energyLevel.level),
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
              Mevcut Enerji:{' '}
              {energyLevel.level === 'high'
                ? 'Yüksek'
                : energyLevel.level === 'low'
                  ? 'Düşük'
                  : 'Orta'}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}
          >
            Enerji seviyenize göre öneriler sunuluyor
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
          {categories.map(category => (
            <TouchableOpacity
              key={category.key}
              onPress={() => setSelectedCategory(category.key as any)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedCategory === category.key
                    ? theme.colors.primary
                    : theme.colors.surface,
                marginRight: 10,
                borderWidth: 1,
                borderColor:
                  selectedCategory === category.key
                    ? theme.colors.primary
                    : theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color:
                    selectedCategory === category.key
                      ? theme.colors.background
                      : theme.colors.text,
                  fontWeight:
                    selectedCategory === category.key ? 'bold' : 'normal',
                }}
              >
                {category.icon} {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommendations List */}
        <ScrollView style={{ flex: 1, padding: 20 }}>
          {filteredRecommendations.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 40,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                Bu kategoride öneri bulunamadı
              </Text>
            </View>
          ) : (
            filteredRecommendations.map(recommendation => (
              <Card key={recommendation.id} style={{ marginBottom: 15 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>
                    {recommendation.icon}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 5,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: theme.colors.text,
                          flex: 1,
                        }}
                      >
                        {recommendation.title}
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          backgroundColor: getPriorityColor(
                            recommendation.priority
                          ),
                          marginLeft: 10,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: theme.colors.background,
                            fontWeight: 'bold',
                          }}
                        >
                          {recommendation.priority.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.colors.textSecondary,
                        marginBottom: 8,
                        lineHeight: 20,
                      }}
                    >
                      {recommendation.description}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                          marginRight: 15,
                        }}
                      >
                        ⏱️ {recommendation.estimatedDuration} dk
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        🔋{' '}
                        {recommendation.energyLevel === 'high'
                          ? 'Yüksek'
                          : recommendation.energyLevel === 'low'
                            ? 'Düşük'
                            : 'Orta'}{' '}
                        Enerji
                      </Text>
                    </View>

                    <View style={{ marginBottom: 15 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                          marginBottom: 5,
                        }}
                      >
                        Faydalar:
                      </Text>
                      {recommendation.benefits.map((benefit, index) => (
                        <Text
                          key={index}
                          style={{
                            fontSize: 12,
                            color: theme.colors.textSecondary,
                            marginLeft: 10,
                          }}
                        >
                          • {benefit}
                        </Text>
                      ))}
                    </View>

                    <Button
                      title="Uygula"
                      onPress={() => handleSelectRecommendation(recommendation)}
                      size="small"
                    />
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
