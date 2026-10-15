import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Photo } from '../../components/common/Photo';
import { ErrorView } from '../../components/common/ErrorView';
import { groupApi } from '../../api/groupApi';
import { useGroupStore } from '../../store/groupStore';
import { Group } from '../../types/models';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type GroupDetailsRouteProp = RouteProp<RootStackParamList, 'GroupDetails'>;

export const GroupDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<GroupDetailsRouteProp>();
  const groupId = route.params.groupId;

  const { setCurrentGroup } = useGroupStore();

  const [group, setGroup] = useState<Group | null>(null);
  const [role, setRole] = useState<string>('member');
  const [memberCount, setMemberCount] = useState<number>(0);
  const [memoryCount, setMemoryCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isAdmin = role === 'admin';

  const loadDetails = async () => {
    setLoadError(null);
    try {
      setLoading(true);
      const res = await groupApi.getGroupById(groupId);
      setGroup(res.group);
      setRole(res.role);
      setMemberCount(res.memberCount);
      setMemoryCount(res.memoryCount);
      setName(res.group.name);
      setDescription(res.group.description || '');
    } catch (err) {
      console.warn('Failed loading group details:', err);
      setLoadError(err instanceof Error ? err.message : 'Could not load circle details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [groupId]);

  const handleSave = async () => {
    if (!isAdmin) return;
    try {
      setSaving(true);
      const updated = await groupApi.updateGroup(groupId, {
        name: name.trim(),
        description: description.trim(),
      });
      setGroup(updated);
      setCurrentGroup(updated);
      Alert.alert('Success', 'Circle details updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update circle.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Circle Settings" showBack onBack={() => navigation.goBack()} />
      <ScreenContainer scrollable>
        {loading ? (
          <LoadingSpinner message="Loading circle info..." />
        ) : loadError ? (
          <ErrorView message={loadError} onRetry={loadDetails} />
        ) : (
          <>
            {group?.coverImage ? (
              <Photo uri={group.coverImage} style={styles.coverImage} />
            ) : null}

            <View style={styles.statsGrid}>
              <Card variant="subtle" style={styles.statBox}>
                <Ionicons name="people" size={24} color={colors.primary[500]} />
                <Text style={styles.statNum}>{memberCount}</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </Card>

              <Card variant="subtle" style={styles.statBox}>
                <Ionicons name="images" size={24} color={colors.secondary[500]} />
                <Text style={styles.statNum}>{memoryCount}</Text>
                <Text style={styles.statLabel}>Daily Moments</Text>
              </Card>
            </View>

            {/* Quick Actions */}
            <View style={styles.linksCard}>
              <Button
                title="View Members"
                onPress={() => navigation.navigate('Members', { groupId })}
                variant="outline"
                size="md"
                icon={<Ionicons name="people-outline" size={18} color={colors.primary[500]} />}
                style={{ marginBottom: spacing.sm }}
              />
              <Button
                title="Invite New Friends"
                onPress={() => navigation.navigate('Invite', { groupId })}
                variant="outline"
                size="md"
                icon={<Ionicons name="person-add-outline" size={18} color={colors.primary[500]} />}
              />
            </View>

            {/* Circle Information Form */}
            <Card variant="elevated" style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Circle Information</Text>
                <Badge label={isAdmin ? 'Admin Edit' : 'Read Only'} variant={isAdmin ? 'admin' : 'neutral'} />
              </View>

              <Input
                label="Circle Name"
                value={name}
                onChangeText={setName}
                editable={isAdmin}
              />

              <Input
                label="Description"
                value={description}
                onChangeText={setDescription}
                editable={isAdmin}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />

              {isAdmin && (
                <Button
                  title="Save Changes"
                  onPress={handleSave}
                  loading={saving}
                  size="md"
                  style={{ marginTop: spacing.sm }}
                />
              )}
            </Card>
          </>
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
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  statNum: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
  },
  linksCard: {
    marginBottom: spacing.md,
  },
  formCard: {
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  coverImage: {
    width: '100%',
    aspectRatio: 2.1,
    maxHeight: 200,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.light.surfaceSubtle,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
});
