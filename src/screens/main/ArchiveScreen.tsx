import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Photo } from '../../components/common/Photo';
import { ErrorView } from '../../components/common/ErrorView';
import { useGroupStore } from '../../store/groupStore';
import { memoryApi } from '../../api/memoryApi';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const ArchiveScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentGroup = useGroupStore((state) => state.currentGroup);

  const [archiveTree, setArchiveTree] = useState<Record<string, Record<string, any[]>>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeGroupId = (currentGroup?.id || currentGroup?._id) as string;

  const loadArchive = async () => {
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
  };

  useEffect(() => {
    loadArchive();
  }, [activeGroupId]);

  const years = Object.keys(archiveTree).sort().reverse();

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
        title="Graduation Archive"
        subtitle={currentGroup ? `Our University Journey: ${currentGroup.name}` : undefined}
      />
      <ScreenContainer scrollable>
        {/* Milestone Banner */}
        <Card variant="elevated" style={styles.milestoneBanner}>
          <View style={styles.mortarboardCircle}>
            <Ionicons name="school" size={28} color="#B45309" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Our 4-Year Journey</Text>
            <Text style={styles.bannerSubtitle}>
              Every daily photo builds toward your group graduation archive recap.
            </Text>
          </View>
        </Card>

        {loading ? (
          <LoadingSpinner message="Assembling years and semesters..." />
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
                  <View style={styles.yearBadge}>
                    <Text style={styles.yearText}>{year}</Text>
                  </View>
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

                      {/* Photo filmstrip preview */}
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filmstrip}
                      >
                        {items.map((item: any) => (
                          <View key={item.id} style={styles.filmThumbWrapper}>
                            <Photo uri={item.imageUrl} style={styles.filmThumb} />
                            <Text style={styles.filmDate}>{getDayLabel(item.date)}</Text>
                          </View>
                        ))}
                      </ScrollView>
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
  milestoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.light.surfaceSubtle,
    borderColor: colors.light.borderSubtle,
    borderWidth: 1,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  mortarboardCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  bannerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
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
  yearBadge: {
    backgroundColor: colors.secondary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  yearText: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
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
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border,
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
  filmstrip: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filmThumbWrapper: {
    alignItems: 'center',
  },
  filmThumb: {
    width: 80,
    height: 90,
    borderRadius: radius.sm,
    backgroundColor: colors.light.surfaceSubtle,
  },
  filmDate: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.light.textSecondary,
    marginTop: 3,
  },
});
