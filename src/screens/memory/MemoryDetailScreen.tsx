import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Photo } from '../../components/common/Photo';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';
import { memoryApi } from '../../api/memoryApi';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

type MemoryDetailRouteProp = RouteProp<RootStackParamList, 'MemoryDetail'>;

export const MemoryDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<MemoryDetailRouteProp>();
  const initialMemory = route.params.memory;

  const currentUser = useAuthStore((state) => state.user);
  const currentGroup = useGroupStore((state) => state.currentGroup);

  const [memory, setMemory] = useState(initialMemory);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(memory.caption || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const memoryId = (memory.id || memory._id) as string;
  const isOwner =
    (memory.userId as any)?._id === currentUser?.id || memory.userId?.id === currentUser?.id;
  const isAdmin = currentGroup?.userRole === 'admin';
  const canModify = isOwner || isAdmin;

  let formattedDate = memory.memoryDate;
  try {
    formattedDate = format(parseISO(memory.memoryDate), 'EEEE, MMMM d, yyyy');
  } catch {
    // fallback
  }

  let formattedUploadDate = '';
  if (memory.createdAt) {
    try {
      formattedUploadDate = format(parseISO(memory.createdAt), 'MMM d, yyyy · h:mm a');
    } catch {
      // fallback
    }
  }

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const updated = await memoryApi.updateMemory(memoryId, { caption });
      setMemory(updated);
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update memory');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to remove this memory from the archive? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await memoryApi.deleteMemory(memoryId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete memory');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Memory Detail"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          canModify
            ? {
                icon: 'ellipsis-horizontal',
                onPress: () => {
                  Alert.alert('Manage Memory', undefined, [
                    { text: 'Edit Caption', onPress: () => setEditing(true) },
                    { text: 'Delete Memory', style: 'destructive', onPress: handleDelete },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                },
              }
            : undefined
        }
      />
      <ScreenContainer scrollable>
        {/* Large Image Container */}
        <Photo uri={memory.imageUrl} style={styles.imageCard} />

        {/* Memory Date Badge */}
        <View style={styles.dateBanner}>
          <View style={styles.calendarIconCircle}>
            <Ionicons name="calendar" size={18} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.memoryDateLabel}>MEMORY FOR</Text>
            <Text style={styles.memoryDateVal}>{formattedDate}</Text>
          </View>
        </View>

        {/* Location Tag */}
        {memory.location?.readableName ? (
          <View style={styles.locationCard}>
            <Ionicons name="location" size={18} color={colors.secondary[600]} />
            <Text style={styles.locationText}>{memory.location.readableName}</Text>
          </View>
        ) : null}

        {/* Caption Section */}
        {editing ? (
          <Card variant="subtle" style={styles.editCard}>
            <Text style={styles.editTitle}>Edit Caption</Text>
            <Input
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
            />
            <View style={styles.editBtnRow}>
              <Button
                title="Cancel"
                onPress={() => setEditing(false)}
                variant="ghost"
                size="sm"
                style={{ flex: 1 }}
              />
              <Button
                title="Save"
                onPress={handleUpdate}
                loading={saving}
                size="sm"
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        ) : memory.caption ? (
          <Card variant="default" style={styles.captionCard}>
            <Text style={styles.captionText}>{memory.caption}</Text>
          </Card>
        ) : (
          <Text style={[styles.captionText, styles.captionFallback]}>
            A day worth keeping.
          </Text>
        )}

        {/* Preserved By Author & Upload Timestamp */}
        <Card variant="elevated" style={styles.authorCard}>
          <Avatar
            name={memory.userId?.name || 'Friend'}
            uri={memory.userId?.profileImage}
            size={44}
          />
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{memory.userId?.name || 'Group Friend'}</Text>
            <Text style={styles.preservedText}>
              Preserved in {currentGroup?.name || 'Group'}
            </Text>
            {formattedUploadDate ? (
              <Text style={styles.uploadDateText}>Uploaded {formattedUploadDate}</Text>
            ) : null}
          </View>
        </Card>
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  imageCard: {
    width: '100%',
    aspectRatio: 0.78,
    maxHeight: 520,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.light.surfaceSubtle,
    marginTop: spacing.sm,
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.light.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  calendarIconCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.round,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryDateLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary[600],
    letterSpacing: 0.6,
  },
  memoryDateVal: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.secondary[800],
    fontWeight: typography.weights.medium,
  },
  captionCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  captionText: {
    fontSize: typography.sizes.base,
    color: colors.light.textPrimary,
    lineHeight: typography.lineHeights.base,
  },
  captionFallback: {
    marginTop: spacing.md,
    color: colors.light.textMuted,
    fontStyle: 'italic',
  },
  editCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  editTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
    marginBottom: spacing.xs,
  },
  editBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  preservedText: {
    fontSize: typography.sizes.xs,
    color: colors.light.textSecondary,
    marginTop: 1,
  },
  uploadDateText: {
    fontSize: 10,
    color: colors.light.textMuted,
    marginTop: 2,
  },
});
