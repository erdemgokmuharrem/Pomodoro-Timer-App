import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGamification } from '../../hooks/useGamification';
import Card from '../atoms/Card';

const BadgeShowcase: React.FC = () => {
  const { getRecentBadges, getTotalBadges, getRarityColor } = useGamification();
  const recentBadges = getRecentBadges(3);
  const badgeStats = getTotalBadges();

  const BadgeItem = ({ badge, isUnlocked }: { badge: any; isUnlocked: boolean }) => (
    <View style={[styles.badgeItem, !isUnlocked && styles.badgeItemLocked]}>
      <Text style={[styles.badgeIcon, !isUnlocked && styles.badgeIconLocked]}>
        {badge.icon}
      </Text>
      <Text style={[styles.badgeName, !isUnlocked && styles.badgeNameLocked]}>
        {badge.name}
      </Text>
      <View 
        style={[
          styles.rarityIndicator, 
          { backgroundColor: getRarityColor(badge.rarity) }
        ]} 
      />
    </View>
  );

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rozetler</Text>
        <Text style={styles.stats}>
          {badgeStats.unlocked} / {badgeStats.total}
        </Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesContainer}
      >
        {recentBadges.length > 0 ? (
          recentBadges.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} isUnlocked={true} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Henüz rozet kazanılmamış</Text>
            <Text style={styles.emptySubtext}>Pomodoro yapmaya başlayın!</Text>
          </View>
        )}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  stats: {
    fontSize: 14,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgesContainer: {
    gap: 12,
  },
  badgeItem: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    minWidth: 80,
    position: 'relative',
  },
  badgeItemLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeIconLocked: {
    opacity: 0.3,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#9CA3AF',
  },
  rarityIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default BadgeShowcase;
