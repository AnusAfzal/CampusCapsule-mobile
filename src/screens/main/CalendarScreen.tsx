import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Photo } from '../../components/common/Photo';
import { ErrorView } from '../../components/common/ErrorView';
import { useGroupStore } from '../../store/groupStore';
import { memoryApi, CalendarDayEntry } from '../../api/memoryApi';
import { Memory } from '../../types/models';
import { colors, radius, spacing, typography } from '../../constants/theme';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentGroup = useGroupStore((state) => state.currentGroup);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [calendarEntries, setCalendarEntries] = useState<CalendarDayEntry[]>([]);
  const [dateMemories, setDateMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDateMemories, setLoadingDateMemories] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const activeGroupId = (currentGroup?.id || currentGroup?._id) as string;

  const monthParam = format(currentMonth, 'yyyy-MM');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const loadCalendarData = useCallback(async () => {
    if (!activeGroupId) {
      setLoading(false);
      return;
    }
    setCalendarError(null);
    try {
      setLoading(true);
      const data = await memoryApi.getGroupCalendar(activeGroupId, monthParam);
      setCalendarEntries(data);
    } catch (err) {
      console.warn('Failed loading calendar:', err);
      setCalendarError(err instanceof Error ? err.message : 'Could not load calendar memories.');
    } finally {
      setLoading(false);
    }
  }, [activeGroupId, monthParam]);

  const loadMemoriesForDate = useCallback(async (dateStr: string) => {
    if (!activeGroupId) return;
    setDateError(null);
    try {
      setLoadingDateMemories(true);
      const res = await memoryApi.getGroupMemories(activeGroupId, { memoryDate: dateStr });
      setDateMemories(res);
    } catch (err) {
      console.warn('Failed loading memories for date:', err);
      setDateError(err instanceof Error ? err.message : 'Could not load memories for this date.');
    } finally {
      setLoadingDateMemories(false);
    }
  }, [activeGroupId]);

  useFocusEffect(
    useCallback(() => {
      void loadCalendarData();
      void loadMemoriesForDate(selectedDateStr);
    }, [loadCalendarData, loadMemoriesForDate, selectedDateStr])
  );

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const leadingBlankDays = startOfMonth(currentMonth).getDay();
  const calendarCells: Array<Date | null> = [
    ...Array.from({ length: leadingBlankDays }, () => null),
    ...daysInMonth,
  ];

  const calendarMap = new Map<string, number>();
  calendarEntries.forEach((e) => {
    calendarMap.set(e.date, e.count);
  });

  return (
    <View style={styles.container}>
      <Header title="Calendar" subtitle={currentGroup?.name} />
      <ScreenContainer scrollable>
        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            style={styles.navArrow}
          >
            <Ionicons name="chevron-back" size={22} color={colors.light.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
          <TouchableOpacity
            onPress={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            style={styles.navArrow}
          >
            <Ionicons name="chevron-forward" size={22} color={colors.light.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Days of week header */}
        <View style={styles.weekRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <Text key={idx} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Days Grid */}
        <View style={styles.daysGrid}>
          {calendarCells.map((day, index) => {
            if (!day) {
              return <View key={`blank-${index}`} style={styles.dayCell} />;
            }

            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = selectedDateStr === dateStr;
            const isFuture = dateStr > todayStr;
            const memoryCount = calendarMap.get(dateStr) || 0;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isFuture && styles.dayCellDisabled,
                ]}
                onPress={() => !isFuture && setSelectedDateStr(dateStr)}
                disabled={isFuture}
                accessibilityRole="button"
                accessibilityState={{ disabled: isFuture, selected: isSelected }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected && styles.dayNumberSelected,
                    isFuture && styles.dayNumberDisabled,
                  ]}
                >
                  {format(day, 'd')}
                </Text>
                {memoryCount > 0 ? (
                  <View style={styles.memoryIndicatorRow}>
                    <View
                      style={[
                        styles.memoryDot,
                        isSelected && { backgroundColor: '#FFFFFF' },
                      ]}
                    />
                    {memoryCount > 1 ? (
                      <Text
                        style={[
                          styles.countText,
                          isSelected && { color: '#FFFFFF' },
                        ]}
                      >
                        {memoryCount}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <View style={{ height: 6 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {calendarError ? (
          <ErrorView message={calendarError} onRetry={loadCalendarData} />
        ) : null}

        {/* Selected Date Memories Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsHeaderRow}>
            <Text style={styles.selectedDateLabel}>
              {format(parseISO(selectedDateStr), 'EEEE, MMMM d, yyyy')}
            </Text>
            <Text style={styles.memoryCountLabel}>
              {dateMemories.length} {dateMemories.length === 1 ? 'memory' : 'memories'}
            </Text>
          </View>

          {dateError ? (
            <ErrorView message={dateError} onRetry={() => loadMemoriesForDate(selectedDateStr)} />
          ) : loadingDateMemories ? (
            <LoadingSpinner message="Checking date memories..." size="small" />
          ) : dateMemories.length === 0 ? (
            <Card variant="subtle" style={styles.emptyDateCard}>
              <Text style={styles.emptyDateText}>
                No moments preserved on this day.
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('MainTabs', {
                    screen: 'AddMemory',
                    params: { initialDate: selectedDateStr },
                  })
                }
                style={styles.addMissedBtn}
              >
                <Text style={styles.addMissedBtnText}>Add Missed Memory For This Day</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            dateMemories.map((mem) => (
              <TouchableOpacity
                key={mem.id || mem._id}
                style={styles.memItemCard}
                onPress={() => navigation.navigate('MemoryDetail', { memory: mem })}
                activeOpacity={0.85}
              >
                <Photo uri={mem.imageUrl} style={styles.memItemThumb} />
                <View style={styles.memItemInfo}>
                  <View style={styles.authorRow}>
                    <Avatar
                      name={mem.userId?.name || 'Friend'}
                      uri={mem.userId?.profileImage}
                      size={24}
                    />
                    <Text style={styles.authorName}>{mem.userId?.name || 'Friend'}</Text>
                  </View>
                  {mem.caption ? (
                    <Text style={styles.memItemCaption} numberOfLines={2}>
                      {mem.caption}
                    </Text>
                  ) : null}
                  {mem.location?.readableName ? (
                    <Text style={styles.memItemLocation} numberOfLines={1}>
                      📍 {mem.location.readableName}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  navArrow: {
    padding: spacing.xs,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  weekDayText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.light.textMuted,
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.light.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    padding: 2,
  },
  dayCellSelected: {
    backgroundColor: colors.primary[600],
  },
  dayCellDisabled: {
    opacity: 0.45,
  },
  dayNumber: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.light.textPrimary,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
  },
  dayNumberDisabled: {
    color: colors.light.textMuted,
  },
  memoryIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  memoryDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
  },
  countText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.primary[700],
  },
  detailsSection: {
    marginTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectedDateLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  memoryCountLabel: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    fontWeight: typography.weights.semibold,
  },
  emptyDateCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyDateText: {
    fontSize: typography.sizes.sm,
    color: colors.light.textSecondary,
    marginBottom: spacing.sm,
  },
  addMissedBtn: {
    paddingVertical: spacing.xs,
  },
  addMissedBtnText: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    fontWeight: typography.weights.bold,
  },
  memItemCard: {
    flexDirection: 'row',
    backgroundColor: colors.light.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  memItemThumb: {
    width: 90,
    height: 90,
    backgroundColor: colors.light.surfaceSubtle,
  },
  memItemInfo: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  authorName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  memItemCaption: {
    fontSize: typography.sizes.xs,
    color: colors.light.textSecondary,
    lineHeight: 16,
  },
  memItemLocation: {
    fontSize: 10,
    color: colors.light.textMuted,
    marginTop: 2,
  },
});
