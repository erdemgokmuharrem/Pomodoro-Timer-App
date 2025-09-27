import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useContextFilters, ContextFilter, FilterGroup } from '../../hooks/useContextFilters';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';

interface ContextFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters?: (filteredTasks: any[]) => void;
}

export const ContextFiltersModal: React.FC<ContextFiltersModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const { theme } = useTheme();
  const {
    activeFilters,
    filterGroups,
    filteredTasks,
    toggleFilter,
    clearAllFilters,
    getFilterStats,
    getQuickFilterSuggestions,
    createFilterGroups,
  } = useContextFilters();

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [quickSuggestions, setQuickSuggestions] = useState<ContextFilter[]>([]);

  useEffect(() => {
    if (visible) {
      createFilterGroups();
      setQuickSuggestions(getQuickFilterSuggestions());
    }
  }, [visible, createFilterGroups, getQuickFilterSuggestions]);

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(filteredTasks);
    }
    onClose();
  };

  const handleQuickFilter = (filter: ContextFilter) => {
    toggleFilter(filter);
  };

  const stats = getFilterStats();

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'tag': return '🏷️';
      case 'priority': return '⚡';
      case 'duration': return '⏱️';
      case 'status': return '📊';
      case 'date': return '📅';
      default: return '🔍';
    }
  };

  const getFilterColor = (filter: ContextFilter) => {
    return filter.color || theme.colors.primary;
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
            Görev Filtreleri
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

        {/* Filter Stats */}
        <View style={{
          padding: 20,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.colors.text,
              }}>
                {stats.filteredCount} / {stats.totalTasks} görev
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
              }}>
                {stats.activeFilterCount} aktif filtre
              </Text>
            </View>
            {stats.isFiltered && (
              <TouchableOpacity
                onPress={clearAllFilters}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: theme.colors.error,
                  borderRadius: 6,
                }}
              >
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.background,
                  fontWeight: 'bold',
                }}>
                  Temizle
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Suggestions */}
        {quickSuggestions.length > 0 && (
          <View style={{ padding: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 12,
            }}>
              Hızlı Öneriler
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  onPress={() => handleQuickFilter(suggestion)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: activeFilters.some(f => f.id === suggestion.id) 
                      ? getFilterColor(suggestion) 
                      : theme.colors.surface,
                    marginRight: 10,
                    borderWidth: 1,
                    borderColor: activeFilters.some(f => f.id === suggestion.id) 
                      ? getFilterColor(suggestion) 
                      : theme.colors.border,
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    color: activeFilters.some(f => f.id === suggestion.id) 
                      ? theme.colors.background 
                      : theme.colors.text,
                    fontWeight: activeFilters.some(f => f.id === suggestion.id) ? 'bold' : 'normal',
                  }}>
                    {suggestion.icon} {suggestion.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filter Groups */}
        <ScrollView style={{ flex: 1, padding: 20 }}>
          {filterGroups.map((group) => (
            <Card key={group.id} style={{ marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 8,
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                }}>
                  {getFilterIcon(group.filters[0]?.type || '')} {group.name}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                }}>
                  {selectedGroup === group.id ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              {selectedGroup === group.id && (
                <View style={{ marginTop: 12 }}>
                  {group.filters.map((filter) => (
                    <TouchableOpacity
                      key={filter.id}
                      onPress={() => toggleFilter(filter)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        borderRadius: 8,
                        backgroundColor: activeFilters.some(f => f.id === filter.id) 
                          ? getFilterColor(filter) + '20' 
                          : 'transparent',
                        marginBottom: 8,
                      }}
                    >
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: activeFilters.some(f => f.id === filter.id) 
                          ? getFilterColor(filter) 
                          : theme.colors.border,
                        marginRight: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        {activeFilters.some(f => f.id === filter.id) && (
                          <Text style={{
                            fontSize: 12,
                            color: theme.colors.background,
                            fontWeight: 'bold',
                          }}>
                            ✓
                          </Text>
                        )}
                      </View>
                      
                      <Text style={{
                        fontSize: 14,
                        color: theme.colors.text,
                        flex: 1,
                      }}>
                        {filter.icon} {filter.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>
          ))}
        </ScrollView>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <View style={{
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 12,
            }}>
              Aktif Filtreler
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activeFilters.map((filter) => (
                <View
                  key={filter.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: getFilterColor(filter),
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginRight: 8,
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.background,
                    marginRight: 6,
                  }}>
                    {filter.icon} {filter.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleFilter(filter)}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: theme.colors.background,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: 10,
                      color: getFilterColor(filter),
                      fontWeight: 'bold',
                    }}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Footer Buttons */}
        <View style={{
          flexDirection: 'row',
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}>
          <Button
            title="Temizle"
            onPress={clearAllFilters}
            variant="secondary"
            style={{ flex: 1, marginRight: 10 }}
          />
          <Button
            title="Uygula"
            onPress={handleApplyFilters}
            style={{ flex: 1, marginLeft: 10 }}
          />
        </View>
      </View>
    </Modal>
  );
};
