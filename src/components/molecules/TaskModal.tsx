import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { usePomodoroStore, Task } from '../../store/usePomodoroStore';
import { useTagStore } from '../../store/useTagStore';
import { useTheme } from '../../components/ThemeProvider';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  task?: Task | null;
  mode: 'create' | 'edit';
}

const TaskModal: React.FC<TaskModalProps> = ({ visible, onClose, task, mode }) => {
  const { addTask, updateTask } = usePomodoroStore();
  const { tags: availableTags, recentTags, incrementUsage } = useTagStore();
  const { theme, isDark } = useTheme();
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(
    task?.estimatedPomodoros?.toString() || '1'
  );
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Görev başlığı boş olamaz');
      return;
    }

    const estimatedPomodorosNum = parseInt(estimatedPomodoros);
    if (isNaN(estimatedPomodorosNum) || estimatedPomodorosNum < 1) {
      Alert.alert('Hata', 'Geçerli bir pomodoro sayısı girin');
      return;
    }

    // Increment usage for selected tags
    selectedTags.forEach(tagName => {
      incrementUsage(tagName);
    });

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedPomodoros: estimatedPomodorosNum,
      priority,
      tags: selectedTags,
      completedPomodoros: task?.completedPomodoros || 0,
      isCompleted: task?.isCompleted || false,
    };

    if (mode === 'create') {
      addTask(taskData);
    } else if (task) {
      updateTask(task.id, taskData);
    }

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEstimatedPomodoros('1');
    setPriority('medium');
    setSelectedTags([]);
    setNewTagName('');
    setShowTagInput(false);
  };

  const handleClose = () => {
    onClose();
    if (mode === 'create') {
      resetForm();
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const PriorityButton = ({ value, label }: { value: Task['priority']; label: string }) => {
    const isSelected = priority === value;
    const color = getPriorityColor(value);
    
    return (
      <TouchableOpacity
        style={[
          styles.priorityButton,
          isSelected && { backgroundColor: color, borderColor: color },
        ]}
        onPress={() => setPriority(value)}
      >
        <Text
          style={[
            styles.priorityButtonText,
            isSelected && { color: 'white' },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>İptal</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {mode === 'create' ? 'Yeni Görev' : 'Görev Düzenle'}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Kaydet</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Görev Bilgileri</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Görev başlığı"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama (opsiyonel)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Tahmini pomodoro sayısı"
              value={estimatedPomodoros}
              onChangeText={setEstimatedPomodoros}
              keyboardType="numeric"
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Öncelik</Text>
            <View style={styles.priorityContainer}>
              <PriorityButton value="low" label="Düşük" />
              <PriorityButton value="medium" label="Orta" />
              <PriorityButton value="high" label="Yüksek" />
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Etiketler</Text>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <View style={styles.selectedTagsContainer}>
                {selectedTags.map((tagName, index) => {
                  const tag = availableTags.find(t => t.name === tagName);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.selectedTag, { backgroundColor: tag?.color || '#6B7280' }]}
                      onPress={() => setSelectedTags(selectedTags.filter(t => t !== tagName))}
                    >
                      <Text style={styles.selectedTagEmoji}>{tag?.emoji || '🏷️'}</Text>
                      <Text style={styles.selectedTagText}>{tagName}</Text>
                      <Text style={styles.removeTagText}>×</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Available Tags */}
            <View style={styles.availableTagsContainer}>
              <Text style={styles.availableTagsTitle}>Son Kullanılan Etiketler</Text>
              <View style={styles.tagsGrid}>
                {recentTags.slice(0, 8).map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.availableTag,
                      { backgroundColor: tag.color },
                      selectedTags.includes(tag.name) && styles.availableTagSelected,
                    ]}
                    onPress={() => {
                      if (selectedTags.includes(tag.name)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag.name));
                      } else {
                        setSelectedTags([...selectedTags, tag.name]);
                      }
                    }}
                  >
                    <Text style={styles.availableTagEmoji}>{tag.emoji}</Text>
                    <Text style={styles.availableTagText}>{tag.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Add New Tag */}
            {!showTagInput ? (
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={() => setShowTagInput(true)}
              >
                <Text style={styles.addTagButtonText}>+ Yeni Etiket Ekle</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.newTagContainer}>
                <TextInput
                  style={styles.newTagInput}
                  placeholder="Etiket adı"
                  value={newTagName}
                  onChangeText={setNewTagName}
                  maxLength={20}
                />
                <TouchableOpacity
                  style={styles.addNewTagButton}
                  onPress={() => {
                    if (newTagName.trim()) {
                      setSelectedTags([...selectedTags, newTagName.trim()]);
                      setNewTagName('');
                      setShowTagInput(false);
                    }
                  }}
                >
                  <Text style={styles.addNewTagButtonText}>Ekle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelNewTagButton}
                  onPress={() => {
                    setNewTagName('');
                    setShowTagInput(false);
                  }}
                >
                  <Text style={styles.cancelNewTagButtonText}>İptal</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cancelButton: {
    fontSize: 16,
    color: '#64748B',
  },
  saveButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  priorityButtonTextActive: {
    color: 'white',
  },
  helpText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: -8,
    marginBottom: 8,
  },
  // Tag styles
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  selectedTagEmoji: {
    fontSize: 14,
  },
  selectedTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  removeTagText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  availableTagsContainer: {
    marginBottom: 16,
  },
  availableTagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  availableTagSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  availableTagEmoji: {
    fontSize: 14,
  },
  availableTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  addTagButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  newTagContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  newTagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'white',
  },
  addNewTagButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addNewTagButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelNewTagButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelNewTagButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TaskModal;
