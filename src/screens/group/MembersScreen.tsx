import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorView } from '../../components/common/ErrorView';
import { groupApi } from '../../api/groupApi';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';
import { GroupMember } from '../../types/models';
import { colors, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type MembersRouteProp = RouteProp<RootStackParamList, 'Members'>;

export const MembersScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<MembersRouteProp>();
  const groupId = route.params.groupId;

  const currentUser = useAuthStore((state) => state.user);
  const currentGroup = useGroupStore((state) => state.currentGroup);

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isAdmin = currentGroup?.userRole === 'admin';

  const loadMembers = async () => {
    setLoadError(null);
    try {
      setLoading(true);
      const res = await groupApi.getGroupMembers(groupId);
      setMembers(res);
    } catch (err) {
      console.warn('Failed loading members:', err);
      setLoadError(err instanceof Error ? err.message : 'Could not load circle members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const handleRemoveMember = (targetMember: GroupMember) => {
    const isSelf = (targetMember.user as any)._id === currentUser?.id || targetMember.user.id === currentUser?.id;

    Alert.alert(
      isSelf ? 'Leave Group' : 'Remove Member',
      isSelf
        ? 'Are you sure you want to leave this group?'
        : `Are you sure you want to remove ${targetMember.user.name} from the circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isSelf ? 'Leave' : 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const targetUserId = (targetMember.user as any)._id || targetMember.user.id;
              await groupApi.removeMember(groupId, targetUserId);
              if (isSelf) {
                navigation.replace('MainTabs', { screen: 'Home' });
              } else {
                setMembers((prev) => prev.filter((m) => m.membershipId !== targetMember.membershipId));
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Action failed');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Circle Members"
        subtitle={`${members.length} friends`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'person-add-outline',
          onPress: () => navigation.navigate('Invite', { groupId }),
        }}
      />
      {loading ? (
        <LoadingSpinner message="Loading members..." />
      ) : loadError ? (
        <ErrorView message={loadError} onRetry={loadMembers} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.membershipId || String(Math.random())}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelf =
              (item.user as any)._id === currentUser?.id || item.user.id === currentUser?.id;

            return (
              <View style={styles.memberCard}>
                <Avatar
                  name={item.user.name}
                  uri={item.user.profileImage}
                  size={46}
                />
                <View style={styles.memberInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.memberName}>{item.user.name}</Text>
                    {isSelf && <Text style={styles.youTag}>(You)</Text>}
                  </View>
                  <Text style={styles.memberEmail}>{item.user.email}</Text>
                </View>

                <Badge
                  label={item.role === 'admin' ? 'Admin' : 'Member'}
                  variant={item.role === 'admin' ? 'admin' : 'neutral'}
                />

                {(isAdmin || isSelf) && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveMember(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelf ? 'exit-outline' : 'trash-outline'}
                      size={18}
                      color={colors.status.error}
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
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
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    minHeight: 72,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.borderSubtle,
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  youTag: {
    fontSize: typography.sizes.xs,
    color: colors.primary[600],
    fontWeight: typography.weights.semibold,
  },
  memberEmail: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  removeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
