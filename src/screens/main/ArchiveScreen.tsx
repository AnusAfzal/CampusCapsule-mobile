import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Photo } from '../../components/common/Photo';
import { ErrorView } from '../../components/common/ErrorView';
import { useGroupStore } from '../../store/groupStore';
import { memoryApi } from '../../api/memoryApi';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface ArchiveMemory {
  id?: string;
  date: string;
  imageUrl: string;
  caption?: string;
}

export const ArchiveScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentGroup = useGroupStore((state) => state.currentGroup);

  const [archiveTree, setArchiveTree] = useState<Record<string, Record<string, ArchiveMemory[]>>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeGroupId = (currentGroup?.id || currentGroup?._id) as string;

  const loadArchive = useCallback(async () => {
    if (!activeGroupId) {
      setLoading(false);
      return;
    }
    setLoadError(null);
    try {
      setLoading(true);
      const data = await memoryApi.getGroupArchive(activeGroupId);
      setArchiveTree(data);
    } catch (err) {
      console.warn('Failed loading archive:', err);
      setLoadError(err instanceof Error ? err.message : 'Could not load the archive.');
    } finally {
      setLoading(false);
    }
  }, [activeGroupId]);

  useFocusEffect(
    useCallback(() => {
      void loadArchive();
    }, [loadArchive])
  );

  const years = Object.keys(archiveTree).sort().reverse();
  const totalMemories = years.reduce(
    (yearTotal, year) =>
      yearTotal +
      Object.values(archiveTree[year]).reduce(
        (monthTotal, items) => monthTotal + items.length,
        0
      ),
    0
  );

  const getMonthName = (monthNum: string): string => {
    const names: Record<string, string> = {
      '01': 'January',
      '02': 'February',
      '03': 'March',
      '04': 'April',
      '05': 'May',
      '06': 'June',
      '07': 'July',
      '08': 'August',
      '09': 'September',
      '10': 'October',
      '11': 'November',
      '12': 'December',
    };
    return names[monthNum] || monthNum;
  };

  const getDayLabel = (date: string): string => {
    const day = Number(date.slice(-2));
    const suffix =
      day % 100 >= 11 && day % 100 <= 13
        ? 'th'
        : day % 10 === 1
          ? 'st'
          : day % 10 === 2
            ? 'nd'
            : day % 10 === 3
              ? 'rd'
              : 'th';

    return `${day}${suffix}`;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Archive"
        subtitle={
          currentGroup
            ? `${currentGroup.name}${loading ? '' : ` · ${totalMemories} ${totalMemories === 1 ? 'memory' : 'memories'}`}`
            : undefined
        }
      />
      <ScreenContainer scrollable>
        {loading ? (
          <LoadingSpinner message="Loading archive..." />
        ) : loadError ? (
          <ErrorView message={loadError} onRetry={loadArchive} />
        ) : years.length === 0 ? (
          <EmptyState
            icon="albums-outline"
            title="Archive Has Just Begun"
            description="As your group uploads daily moments across semesters, they will automatically be filed chronologically into this university vault."
            actionTitle="Add Today's Memory"
            onAction={() => navigation.navigate('MainTabs', { screen: 'AddMemory' })}
          />
        ) : (
          years.map((year) => {
            const months = Object.keys(archiveTree[year]).sort().reverse();

            return (
              <View key={year} style={styles.yearSection}>
                <View style={styles.yearHeaderRow}>
                  <Text style={styles.yearText}>{year}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {months.map((month) => {
                  const items = archiveTree[year][month];
                  return (
                    <View key={month} style={styles.monthCard}>
                      <View style={styles.monthHeader}>
                        <Text style={styles.monthTitle}>{getMonthName(month)}</Text>
                        <Text style={styles.monthCount}>
                          {items.length} {items.length === 1 ? 'memory' : 'memories'}
                        </Text>
                      </View>

                      <View style={styles.photoGrid}>
                        {items.map((item, index) => (
                          <View
                            key={item.id || `${item.date}-${index}`}
                            style={styles.photoTile}
                          >
                            <Photo uri={item.imageUrl} style={styles.archivePhoto} />
                            <View style={styles.photoDate}>
                              <Text style={styles.photoDateText}>
                                {getDayLabel(item.date)}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  yearSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  yearHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  yearText: {
    color: colors.light.textPrimary,
    fontFamily: typography.families.serif,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
    letterSpacing: 0.5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.light.border,
    marginLeft: spacing.md,
  },
  monthCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.borderSubtle,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  monthTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  monthCount: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    fontWeight: typography.weights.medium,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  photoTile: {
    width: '48.5%',
    aspectRatio: 1,
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: colors.light.surfaceSubtle,
  },
  archivePhoto: {
    width: '100%',
    height: '100%',
  },
  photoDate: {
    position: 'absolute',
    right: spacing.xs,
    bottom: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  photoDateText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
});
