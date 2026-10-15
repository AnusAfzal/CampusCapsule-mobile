import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Photo } from '../../components/common/Photo';
import { ErrorView } from '../../components/common/ErrorView';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';
import { groupApi } from '../../api/groupApi';
import { memoryApi } from '../../api/memoryApi';
import { Memory } from '../../types/models';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const { currentGroup, groups, setGroups, setCurrentGroup } = useGroupStore();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [hasMemoryToday, setHasMemoryToday] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const loadData = async () => {
    setLoadError(null);
    try {
      const userGroups = await groupApi.getUserGroups();
      setGroups(userGroups);

      const active = currentGroup || userGroups[0];
      if (active) {
        setCurrentGroup(active);
        const activeId = (active.id || active._id) as string;
        const memories = await memoryApi.getGroupMemories(activeId, { limit: 10 });
        setRecentMemories(memories);

        // Check if user already added memory today
        const addedToday = memories.some(
          (m) => m.memoryDate === todayStr && ((m.userId as any)?._id === user?.id || (m.userId as any)?.id === user?.id)
        );
        setHasMemoryToday(addedToday);
      }
    } catch (err) {
      console.warn('Failed loading home data:', err);
      setLoadError(err instanceof Error ? err.message : 'Could not load your circle and memories.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingSpinner message="Opening your memory vault..." />
      </ScreenContainer>
    );
  }

  if (loadError) {
    return (
      <ScreenContainer>
        <ErrorView message={loadError} onRetry={loadData} />
      </ScreenContainer>
    );
  }

  // State: No groups joined yet
  if (!currentGroup && groups.length === 0) {
    return (
      <ScreenContainer scrollable>
        <View style={styles.headerBar}>
          <Text style={styles.appTitle}>CampusCapsule</Text>
        </View>
        <EmptyState
          icon="people-outline"
          title="No Friend Circle Yet"
          description="CampusCapsule is a private shared daily archive. Create your university group or join with an invite code."
          actionTitle="Create a Group"
          onAction={() => navigation.navigate('CreateGroup')}
        />
        <Button
          title="Join With Invite Code"
          onPress={() => navigation.navigate('JoinGroup')}
          variant="outline"
          style={{ marginTop: spacing.md }}
        />
      </ScreenContainer>
    );
  }

  const activeGroupId = (currentGroup?.id || currentGroup?._id) as string;

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Top Bar with Group Selector */}
      <View style={styles.headerBar}>
        <View style={styles.groupMeta}>
          <Text style={styles.greeting}>Your circle’s archive</Text>
          <View style={styles.groupTitleRow}>
            <Text style={styles.groupName} numberOfLines={1}>
              {currentGroup?.name}
            </Text>
            {currentGroup?.userRole === 'admin' && (
              <Badge label="Admin" variant="admin" style={{ marginLeft: spacing.sm }} />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => navigation.navigate('Invite', { groupId: activeGroupId })}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add-outline" size={18} color={colors.primary[500]} />
          <Text style={styles.inviteText}>Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Memory Hero Action Card */}
      <Card
        variant="elevated"
        style={[styles.heroCard, hasMemoryToday ? styles.heroCardComplete : null]}
      >
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.heroDateBadge}>
              {format(new Date(), 'EEEE, MMMM d')}
            </Text>
            <Text style={styles.heroTitle}>
              {hasMemoryToday ? "Today's Memory Added!" : "Today's Memory"}
            </Text>
          </View>
          <View style={[styles.heroIconCircle, hasMemoryToday && styles.heroIconCircleDone]}>
            <Ionicons
              name={hasMemoryToday ? 'checkmark' : 'camera'}
              size={24}
              color={hasMemoryToday ? colors.status.success : colors.primary[500]}
            />
          </View>
        </View>

        <Text style={styles.heroSubtitle}>
          {hasMemoryToday
            ? 'Your daily moment is saved in the group archive. You can view it in the timeline.'
            : 'Capture a moment from lectures, study sessions, hostel hangouts, or food spots.'}
        </Text>

        {!hasMemoryToday ? (
          <Button
            title="Add Today's Memory"
            onPress={() => navigation.navigate('MainTabs', { screen: 'AddMemory', params: { initialDate: todayStr } })}
            size="md"
            icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
            style={styles.heroBtn}
          />
        ) : (
          <Button
            title="View in Timeline"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Timeline' })}
            variant="outline"
            size="md"
            style={styles.heroBtn}
          />
        )}
      </Card>

      {/* Quick Access Shortcuts */}
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionTile}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Calendar' })}
          activeOpacity={0.8}
        >
          <View style={styles.tileIconCircle}>
            <Ionicons name="calendar-outline" size={19} color={colors.secondary[600]} />
          </View>
          <Text style={styles.tileTitle}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionTile}
          onPress={() => navigation.navigate('Members', { groupId: activeGroupId })}
          activeOpacity={0.8}
        >
          <View style={styles.tileIconCircle}>
            <Ionicons name="people-outline" size={19} color={colors.secondary[600]} />
          </View>
          <Text style={styles.tileTitle}>Members</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionTile}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Archive' })}
          activeOpacity={0.8}
        >
          <View style={styles.tileIconCircle}>
            <Ionicons name="school-outline" size={19} color={colors.secondary[600]} />
          </View>
          <Text style={styles.tileTitle}>Archive</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionTile}
          onPress={() => navigation.navigate('GroupDetails', { groupId: activeGroupId })}
          activeOpacity={0.8}
        >
          <View style={styles.tileIconCircle}>
            <Ionicons name="settings-outline" size={19} color={colors.secondary[600]} />
          </View>
          <Text style={styles.tileTitle}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Memories Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Memories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Timeline' })}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {recentMemories.length === 0 ? (
        <EmptyState
          icon="camera-outline"
          title="No Memories Yet"
          description="Be the first to preserve a memory for your friend group!"
          actionTitle="Add First Memory"
          onAction={() => navigation.navigate('MainTabs', { screen: 'AddMemory', params: { initialDate: todayStr } })}
        />
      ) : (
        <View style={styles.recentGrid}>
          {recentMemories.slice(0, 4).map((item) => (
            <TouchableOpacity
              key={item.id || item._id}
              style={styles.memoryCard}
              onPress={() => navigation.navigate('MemoryDetail', { memory: item })}
              activeOpacity={0.85}
            >
              <Photo uri={item.imageUrl} style={styles.memoryThumbnail} />
              <View style={styles.memoryMeta}>
                <View style={styles.uploaderRow}>
                  <Avatar name={item.userId?.name || 'Friend'} uri={item.userId?.profileImage} size={22} />
                  <Text style={styles.uploaderName} numberOfLines={1}>
                    {item.userId?.name || 'Friend'}
                  </Text>
                </View>
                <Text style={styles.memoryDateText}>{item.memoryDate}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  appTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  groupMeta: {
    flex: 1,
    marginRight: spacing.md,
  },
  greeting: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: typography.weights.semibold,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  groupName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 4,
  },
  inviteText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary[700],
  },
  heroCard: {
    backgroundColor: colors.light.surfaceSubtle,
    padding: spacing.base,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.borderSubtle,
  },
  heroCardComplete: {
    backgroundColor: colors.secondary[50],
    borderColor: colors.secondary[100],
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroDateBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
    marginTop: 2,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconCircleDone: {
    backgroundColor: colors.status.successBg,
  },
  heroSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.light.textSecondary,
    lineHeight: typography.lineHeights.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  heroBtn: {
    marginTop: spacing.xs,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.light.borderSubtle,
  },
  quickActionTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    marginHorizontal: 2,
    minHeight: 64,
  },
  tileIconCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    backgroundColor: 'transparent',
  },
  tileTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary[500],
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  memoryCard: {
    width: '47.5%',
    backgroundColor: 'transparent',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  memoryThumbnail: {
    width: '100%',
    aspectRatio: 0.9,
    backgroundColor: colors.light.surfaceSubtle,
  },
  memoryMeta: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
  },
  uploaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploaderName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.light.textPrimary,
    flex: 1,
  },
  memoryDateText: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    marginTop: 3,
  },
});
