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
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(
    task?.estimatedPomodoros?.toString() || '1'
  );
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [tags, setTags] = useState(task?.tags?.join(', ') || '');

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

    const tagsArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedPomodoros: estimatedPomodorosNum,
      priority,
      tags: tagsArray,
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
    setTags('');
  };

  const handleClose = () => {
    onClose();
    if (mode === 'create') {
      resetForm();
    }
  };

  const PriorityButton = ({ value, label }: { value: Task['priority']; label: string }) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === value && styles.priorityButtonActive,
      ]}
      onPress={() => setPriority(value)}
    >
      <Text
        style={[
          styles.priorityButtonText,
          priority === value && styles.priorityButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
            <TextInput
              style={styles.input}
              placeholder="Etiketler (virgülle ayırın)"
              value={tags}
              onChangeText={setTags}
              maxLength={200}
            />
            <Text style={styles.helpText}>
              Örnek: iş, acil, proje, toplantı
            </Text>
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
});

export default TaskModal;
