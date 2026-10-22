import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuthStore();
  const { currentGroup, groups, setCurrentGroup } = useGroupStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Moment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Auth', { screen: 'Welcome' });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Profile"
        rightAction={{ icon: 'log-out-outline', onPress: handleLogout }}
      />
      <ScreenContainer scrollable>
        <Card variant="elevated" style={styles.profileCard}>
          <Avatar name={user?.name || 'User'} uri={user?.profileImage} size={48} />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </Card>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>My Circles</Text>
          <Text style={styles.groupTotal}>
            {groups.length} {groups.length === 1 ? 'circle' : 'circles'}
          </Text>
        </View>

        {groups.map((grp) => {
          const isActive =
            (grp.id || grp._id) === (currentGroup?.id || currentGroup?._id);

          return (
            <TouchableOpacity
              key={grp.id || grp._id}
              style={[styles.groupTile, isActive && styles.groupTileActive]}
              onPress={() => setCurrentGroup(grp)}
              activeOpacity={0.8}
            >
              <View style={styles.groupTileContent}>
                <View style={styles.groupIconCircle}>
                  <Ionicons name="people" size={22} color={colors.primary[500]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupNameText} numberOfLines={1}>
                    {grp.name}
                  </Text>
                  {typeof grp.memberCount === 'number' || typeof grp.memoryCount === 'number' ? (
                    <Text style={styles.groupCountText}>
                      {[
                        typeof grp.memberCount === 'number'
                          ? `${grp.memberCount} ${grp.memberCount === 1 ? 'member' : 'members'}`
                          : null,
                        typeof grp.memoryCount === 'number'
                          ? `${grp.memoryCount} ${grp.memoryCount === 1 ? 'memory' : 'memories'}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  ) : null}
                </View>
                {isActive && (
                  <Badge label="Active" variant="primary" style={{ marginRight: spacing.xs }} />
                )}
                {grp.userRole === 'admin' && (
                  <Badge label="Admin" variant="admin" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.ctaRow}>
          <Button
            title="Create New Circle"
            onPress={() => navigation.navigate('CreateGroup')}
            variant="outline"
            size="md"
            style={{ flex: 1 }}
          />
          <Button
            title="Join Circle"
            onPress={() => navigation.navigate('JoinGroup')}
            variant="outline"
            size="md"
            style={{ flex: 1 }}
          />
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.md,
    borderRadius: radius.sm,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: typography.families.sans,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.families.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
  },
  groupTotal: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
  },
  groupTile: {
    backgroundColor: colors.light.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  groupTileActive: {
    borderColor: colors.light.textPrimary,
    backgroundColor: colors.light.surface,
  },
  groupTileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  groupIconCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.round,
    backgroundColor: colors.light.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupNameText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  groupCountText: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
