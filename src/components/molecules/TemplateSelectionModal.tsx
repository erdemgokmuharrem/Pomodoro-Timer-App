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
import { useTemplateStore, TaskTemplate, TemplateCategory } from '../../store/useTemplateStore';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';

interface TemplateSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: TaskTemplate) => void;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const { theme } = useTheme();
  const { addTask } = usePomodoroStore();
  const {
    templates,
    categories,
    getTemplatesByCategory,
    getMostUsedTemplates,
    getRecentTemplates,
    searchTemplates,
    useTemplate,
  } = useTemplateStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<TaskTemplate[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'recent' | 'popular'>('all');

  useEffect(() => {
    if (visible) {
      updateFilteredTemplates();
    }
  }, [visible, selectedCategory, searchQuery, viewMode]);

  const updateFilteredTemplates = () => {
    let templates = useTemplateStore.getState().templates;

    // Filter by category
    if (selectedCategory) {
      templates = getTemplatesByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }

    // Filter by view mode
    if (viewMode === 'recent') {
      templates = getRecentTemplates();
    } else if (viewMode === 'popular') {
      templates = getMostUsedTemplates();
    }

    setFilteredTemplates(templates);
  };

  const handleSelectTemplate = (template: TaskTemplate) => {
    // Use template and create task
    const usedTemplate = useTemplate(template.id);
    if (!usedTemplate) return;

    const newTask = {
      title: usedTemplate.name,
      description: usedTemplate.description,
      estimatedPomodoros: usedTemplate.estimatedPomodoros,
      priority: usedTemplate.priority,
      tags: usedTemplate.tags,
      isCompleted: false,
      completedPomodoros: 0,
    };

    addTask(newTask);
    
    if (onSelectTemplate) {
      onSelectTemplate(usedTemplate);
    }
    
    onClose();
    Alert.alert('Başarılı', `"${usedTemplate.name}" şablonu kullanılarak görev oluşturuldu!`);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📁';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || theme.colors.primary;
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
            Görev Şablonları
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

        {/* Search Bar */}
        <View style={{
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}>
          <TextInput
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: theme.colors.text,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
            placeholder="Şablon ara..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* View Mode Tabs */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}>
          {[
            { key: 'all', label: 'Tümü', icon: '📋' },
            { key: 'recent', label: 'Son Kullanılan', icon: '🕒' },
            { key: 'popular', label: 'Popüler', icon: '⭐' },
          ].map((mode) => (
            <TouchableOpacity
              key={mode.key}
              onPress={() => setViewMode(mode.key as any)}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: viewMode === mode.key ? theme.colors.primary : 'transparent',
                marginRight: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 12,
                color: viewMode === mode.key ? theme.colors.background : theme.colors.text,
                fontWeight: viewMode === mode.key ? 'bold' : 'normal',
              }}>
                {mode.icon} {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
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
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedCategory === null ? theme.colors.primary : theme.colors.surface,
              marginRight: 10,
              borderWidth: 1,
              borderColor: selectedCategory === null ? theme.colors.primary : theme.colors.border,
            }}
          >
            <Text style={{
              fontSize: 14,
              color: selectedCategory === null ? theme.colors.background : theme.colors.text,
              fontWeight: selectedCategory === null ? 'bold' : 'normal',
            }}>
              📁 Tümü
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedCategory === category.id ? getCategoryColor(category.id) : theme.colors.surface,
                marginRight: 10,
                borderWidth: 1,
                borderColor: selectedCategory === category.id ? getCategoryColor(category.id) : theme.colors.border,
              }}
            >
              <Text style={{
                fontSize: 14,
                color: selectedCategory === category.id ? theme.colors.background : theme.colors.text,
                fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
              }}>
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Templates List */}
        <ScrollView style={{ flex: 1, padding: 20 }}>
          {filteredTemplates.length === 0 ? (
            <View style={{
              alignItems: 'center',
              paddingVertical: 40,
            }}>
              <Text style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: 'center',
              }}>
                {searchQuery ? 'Arama kriterlerine uygun şablon bulunamadı' : 'Henüz şablon eklenmemiş'}
              </Text>
            </View>
          ) : (
            filteredTemplates.map((template) => (
              <Card key={template.id} style={{ marginBottom: 15 }}>
                <TouchableOpacity
                  onPress={() => handleSelectTemplate(template)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: getCategoryColor(template.category),
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ fontSize: 20 }}>
                      {template.icon}
                    </Text>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 5,
                    }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: theme.colors.text,
                        flex: 1,
                      }}>
                        {template.name}
                      </Text>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: getCategoryColor(template.category),
                      }}>
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.background,
                          fontWeight: 'bold',
                        }}>
                          {template.estimatedPomodoros} pomodoro
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={{
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginBottom: 8,
                      lineHeight: 20,
                    }}>
                      {template.description}
                    </Text>
                    
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        marginRight: 15,
                      }}>
                        {template.priority === 'high' ? '🔴' : template.priority === 'medium' ? '🟡' : '🟢'} {template.priority === 'high' ? 'Yüksek' : template.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                      }}>
                        📊 {template.usageCount} kullanım
                      </Text>
                    </View>
                    
                    {template.tags.length > 0 && (
                      <View style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginBottom: 10,
                      }}>
                        {template.tags.map((tag, index) => (
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
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Card>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
