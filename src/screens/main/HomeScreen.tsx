import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addDays, format, getISOWeek, isSameWeek, parseISO, startOfWeek } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorView } from '../../components/common/ErrorView';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Photo } from '../../components/common/Photo';
import { groupApi } from '../../api/groupApi';
import { memoryApi } from '../../api/memoryApi';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';
import { Memory } from '../../types/models';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const { currentGroup, groups, setGroups, setCurrentGroup } = useGroupStore();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [hasMemoryToday, setHasMemoryToday] = useState(false);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const activeGroupId = currentGroup?.id || currentGroup?._id;

  const loadData = useCallback(async () => {
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
        setHasMemoryToday(
          memories.some(
            (memory) =>
              memory.memoryDate === todayStr &&
              ((memory.userId as any)?._id === user?.id ||
                (memory.userId as any)?.id === user?.id)
          )
        );
      } else {
        setRecentMemories([]);
        setHasMemoryToday(false);
      }
    } catch (err) {
      console.warn('Failed loading home data:', err);
      setLoadError(err instanceof Error ? err.message : 'Could not load your circle and memories.');
    } finally {
      setLoading(false);
    }
  }, [currentGroup, setCurrentGroup, setGroups, todayStr, user?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingSpinner message="Gathering your moments..." />
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

  if (!currentGroup && groups.length === 0) {
    return (
      <ScreenContainer scrollable>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Ionicons name="images-outline" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>Moment</Text>
        </View>
        <EmptyState
          icon="people-outline"
          title="Your circle starts here"
          description="Create a private archive for your friends or join one with an invite code."
          actionTitle="Create a circle"
          onAction={() => navigation.navigate('CreateGroup')}
        />
        <Button
          title="Join with invite code"
          onPress={() => navigation.navigate('JoinGroup')}
          variant="outline"
          style={styles.emptyJoinButton}
        />
      </ScreenContainer>
    );
  }

  const weekMemories = recentMemories
    .filter((memory) => isSameWeek(parseISO(memory.memoryDate), today, { weekStartsOn: 1 }))
    .sort((first, second) => first.memoryDate.localeCompare(second.memoryDate))
    .filter(
      (memory, index, memories) =>
        memories.findIndex((candidate) => candidate.memoryDate === memory.memoryDate) === index
    );
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekRange = `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d')}`;

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.groupMeta}>
          <View style={styles.groupTitleRow}>
            <Text style={styles.groupName} numberOfLines={1}>
              {currentGroup?.name}
            </Text>
            {currentGroup?.userRole === 'admin' ? <Badge label="Admin" variant="neutral" /> : null}
          </View>
          <Text style={styles.greeting} numberOfLines={1}>
            {currentGroup?.description || 'Your circle’s shared archive'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => navigation.navigate('Invite', { groupId: activeGroupId as string })}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Invite friends"
        >
          <Ionicons name="person-add-outline" size={17} color={colors.light.textPrimary} />
          <Text style={styles.inviteText}>Invite</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.archiveSummary}>
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryIcon}>
            <Ionicons name="school-outline" size={17} color={colors.light.textPrimary} />
          </View>
          <Text style={styles.summaryTitle}>Circle archive</Text>
          {typeof currentGroup?.memoryCount === 'number' ? (
            <Text style={styles.summaryCount}>{currentGroup.memoryCount} memories</Text>
          ) : null}
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryBottomRow}>
          <Text style={styles.summarySubtitle}>
            {typeof currentGroup?.memberCount === 'number'
              ? `${currentGroup.memberCount} ${currentGroup.memberCount === 1 ? 'member' : 'members'}`
              : 'Private circle'}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('GroupDetails', { groupId: activeGroupId as string })}
            accessibilityRole="button"
            accessibilityLabel="Open circle settings"
          >
            <Text style={styles.summaryLink}>Circle details</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Calendar' })}
        >
          <Ionicons name="calendar-outline" size={14} color={colors.light.textPrimary} />
          <Text style={styles.actionText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Timeline' })}
        >
          <Ionicons name="images-outline" size={14} color={colors.light.textPrimary} />
          <Text style={styles.actionText}>Timeline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.addMemoryButton]}
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'AddMemory',
              params: { initialDate: todayStr },
            })
          }
        >
          <Ionicons name="add" size={15} color="#FFFFFF" />
          <Text style={[styles.actionText, styles.addMemoryText]}>Add Memory</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.weekHeadingRow}>
          <Text style={styles.weekTitle}>Week {getISOWeek(today)}</Text>
          <Text style={styles.weekRange}>{weekRange}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Timeline' })}
          accessibilityRole="button"
        >
          <Text style={styles.viewAllText}>Timeline</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekStrip}
      >
        {weekMemories.map((memory) => (
          <TouchableOpacity
            key={memory.id || memory._id}
            style={styles.dayTile}
            onPress={() => navigation.navigate('MemoryDetail', { memory })}
            activeOpacity={0.85}
          >
            <Photo uri={memory.imageUrl} style={styles.dayPhoto} />
            <View style={styles.dayLabel}>
              <Text style={styles.dayLabelText}>
                {format(parseISO(memory.memoryDate), 'EEE')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {!hasMemoryToday ? (
          <TouchableOpacity
            style={styles.addTile}
            onPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'AddMemory',
                params: { initialDate: todayStr },
              })
            }
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color={colors.light.textPrimary} />
            <Text style={styles.addTileTitle}>Add</Text>
            <Text style={styles.addTileDay}>Today</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent moments</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Timeline' })}
          accessibilityRole="button"
        >
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {recentMemories.length === 0 ? (
        <EmptyState
          icon="camera-outline"
          title="A page waiting to be filled"
          description="Add the first photo to your circle’s archive."
          actionTitle="Add a memory"
          onAction={() =>
            navigation.navigate('MainTabs', {
              screen: 'AddMemory',
              params: { initialDate: todayStr },
            })
          }
        />
      ) : (
        <View style={styles.feedList}>
          {recentMemories.slice(0, 4).map((memory) => (
            <TouchableOpacity
              key={memory.id || memory._id}
              style={styles.feedCard}
              onPress={() => navigation.navigate('MemoryDetail', { memory })}
              activeOpacity={0.9}
            >
              <View style={styles.feedHeader}>
                <Avatar
                  name={memory.userId?.name || 'Friend'}
                  uri={memory.userId?.profileImage}
                  size={34}
                />
                <View style={styles.feedAuthor}>
                  <Text style={styles.authorName} numberOfLines={1}>
                    {memory.userId?.name || 'Friend'}
                  </Text>
                  <Text style={styles.feedDate}>
                    {memory.location?.readableName || currentGroup?.name}
                  </Text>
                </View>
                <View style={styles.memoryDateTag}>
                  <Text style={styles.memoryDateTagText}>
                    {format(parseISO(memory.memoryDate), 'MMM d, yyyy')}
                  </Text>
                </View>
              </View>
              <Photo uri={memory.imageUrl} style={styles.feedPhoto} />
              {memory.caption || memory.location?.readableName ? (
                <View style={styles.feedFooter}>
                  {memory.caption ? (
                    <Text style={styles.caption} numberOfLines={3}>
                      {memory.caption}
                    </Text>
                  ) : null}
                  {memory.location?.readableName ? (
                    <Text style={styles.location} numberOfLines={1}>
                      <Ionicons name="location-outline" size={12} color={colors.light.textMuted} />{' '}
                      {memory.location.readableName}
                    </Text>
                  ) : null}
                </View>
              ) : null}
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: radius.round,
    backgroundColor: colors.light.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: typography.families.serif,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  emptyJoinButton: {
    marginTop: spacing.md,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  groupMeta: {
    flex: 1,
    marginRight: spacing.md,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  groupName: {
    flexShrink: 1,
    fontFamily: typography.families.serif,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  greeting: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.light.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.light.textPrimary,
  },
  inviteText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  archiveSummary: {
    backgroundColor: colors.light.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginTop: spacing.sm,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryIcon: {
    width: 20,
    height: 20,
    borderRadius: radius.round,
    backgroundColor: colors.light.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  summaryCount: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.light.borderSubtle,
    marginVertical: spacing.sm,
  },
  summaryBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summarySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
  },
  summaryLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
    textDecorationLine: 'underline',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.light.textPrimary,
    backgroundColor: colors.light.background,
  },
  actionText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.light.textPrimary,
  },
  addMemoryButton: {
    backgroundColor: colors.light.textPrimary,
  },
  addMemoryText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  weekTitle: {
    fontFamily: typography.families.serif,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  weekRange: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    marginLeft: spacing.sm,
    marginTop: 2,
  },
  weekHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  weekStrip: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dayTile: {
    width: 76,
    height: 98,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.light.surfaceSubtle,
  },
  dayPhoto: {
    width: '100%',
    height: '100%',
  },
  dayLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  dayLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
  addTile: {
    width: 76,
    height: 98,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.light.surfaceSubtle,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.light.border,
  },
  addTileTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
    marginTop: 1,
  },
  addTileDay: {
    fontSize: 10,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  feedList: {
    gap: spacing.md,
  },
  feedCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.light.border,
    overflow: 'hidden',
  },
  feedHeader: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  feedAuthor: {
    flex: 1,
  },
  authorName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  feedDate: {
    fontSize: 10,
    color: colors.light.textMuted,
    marginTop: 1,
  },
  memoryDateTag: {
    backgroundColor: colors.light.surfaceSubtle,
    borderRadius: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  memoryDateTagText: {
    fontSize: 9,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  feedPhoto: {
    width: '100%',
    aspectRatio: 1.34,
  },
  feedFooter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  caption: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    color: colors.light.textPrimary,
  },
  location: {
    fontSize: 10,
    color: colors.light.textMuted,
  },
});
