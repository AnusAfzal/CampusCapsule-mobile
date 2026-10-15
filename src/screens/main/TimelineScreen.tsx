import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Photo } from '../../components/common/Photo';
import { ErrorView } from '../../components/common/ErrorView';
import { useGroupStore } from '../../store/groupStore';
import { memoryApi } from '../../api/memoryApi';
import { Memory } from '../../types/models';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

export const TimelineScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentGroup = useGroupStore((state) => state.currentGroup);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const activeGroupId = (currentGroup?.id || currentGroup?._id) as string;

  const fetchMemories = async (pageNum = 1, isRefresh = false) => {
    if (!activeGroupId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoadError(null);
      if (pageNum === 1 && !isRefresh) setLoading(true);
      const res = await memoryApi.getGroupMemories(activeGroupId, { page: pageNum, limit: 15 });

      if (pageNum === 1) {
        setMemories(res);
      } else {
        setMemories((prev) => [...prev, ...res]);
      }
      setHasMore(res.length === 15);
      setPage(pageNum);
    } catch (err) {
      console.warn('Error fetching timeline:', err);
      setLoadError(err instanceof Error ? err.message : 'Could not load the timeline.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMemories(1);
  }, [activeGroupId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMemories(1, true);
  };

  const onEndReached = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      fetchMemories(page + 1);
    }
  };

  const renderMemoryItem = ({ item }: { item: Memory }) => {
    let formattedDate = item.memoryDate;
    try {
      formattedDate = format(parseISO(item.memoryDate), 'MMMM d, yyyy');
    } catch {
      // fallback
    }

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MemoryDetail', { memory: item })}
      >
        {/* Memory Header with Author */}
        <View style={styles.cardHeader}>
          <View style={styles.authorRow}>
            <Avatar
              name={item.userId?.name || 'Friend'}
              uri={item.userId?.profileImage}
              size={36}
            />
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>{item.userId?.name || 'Group Friend'}</Text>
              <Text style={styles.dateLabel}>{formattedDate}</Text>
            </View>
          </View>
          {item.location?.readableName ? (
            <View style={styles.locationPill}>
              <Ionicons name="location-sharp" size={12} color={colors.secondary[600]} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location.readableName}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Memory Photo */}
        <Photo uri={item.imageUrl} style={styles.imageContainer} />

        {/* Caption & Footer */}
        <View style={styles.cardFooter}>
          <Text style={[styles.captionText, !item.caption && styles.captionFallback]}>
            {item.caption || 'A day worth keeping.'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!activeGroupId) {
    return (
      <View style={styles.container}>
        <Header title="Timeline" />
        <ScreenContainer>
          <EmptyState
            icon="people-outline"
            title="No Active Group"
            description="Select or create a group to view memories."
            actionTitle="Go Home"
            onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          />
        </ScreenContainer>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <Header title="Timeline" subtitle={currentGroup?.name} />
        <ErrorView message={loadError} onRetry={() => fetchMemories(1, true)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Chronological Timeline"
        subtitle={currentGroup?.name}
      />
      {loading ? (
        <LoadingSpinner message="Gathering moments..." />
      ) : memories.length === 0 ? (
        <EmptyState
          icon="camera-outline"
          title="Timeline is Empty"
          description="Preserve your first memory together to begin your group album!"
          actionTitle="Add Today's Memory"
          onAction={() => navigation.navigate('MainTabs', { screen: 'AddMemory' })}
        />
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id || item._id || String(Math.random())}
          renderItem={renderMemoryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary[500]}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={colors.primary[500]}
                style={{ marginVertical: spacing.md }}
              />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: radius.sm,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorMeta: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  authorName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  dateLabel: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    marginTop: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.round,
    maxWidth: 130,
    gap: 3,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  locationText: {
    fontSize: typography.sizes.xs,
    color: colors.secondary[700],
    fontWeight: typography.weights.medium,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.82,
    borderRadius: radius.sm,
    backgroundColor: colors.light.surfaceSubtle,
  },
  cardFooter: {
    paddingTop: spacing.sm,
    paddingHorizontal: 2,
  },
  captionText: {
    fontSize: typography.sizes.base,
    color: colors.light.textPrimary,
    lineHeight: typography.lineHeights.base,
  },
  captionFallback: {
    color: colors.light.textMuted,
    fontStyle: 'italic',
  },
});
