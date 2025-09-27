import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGamificationStore } from '../../store/useGamificationStore';
import Card from '../atoms/Card';

const BadgeShowcase: React.FC = () => {
  const { badges, recentBadges } = useGamificationStore();

  const displayBadges =
    recentBadges.length > 0 ? recentBadges : badges.slice(0, 3);

  if (displayBadges.length === 0) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Son Rozetler</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesContainer}
      >
        {displayBadges.map(badge => (
          <View key={badge.id} style={styles.badge}>
            <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
            </View>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDate}>
              {new Date(badge.earnedAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  badgesContainer: {
    gap: 16,
  },
  badge: {
    alignItems: 'center',
    minWidth: 80,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDate: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default BadgeShowcase;
