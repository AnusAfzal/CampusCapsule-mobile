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
    Alert.alert('Sign Out', 'Are you sure you want to sign out of CampusCapsule?', [
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
      <Header title="Profile & Circles" />
      <ScreenContainer scrollable>
        {/* User Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <Avatar name={user?.name || 'User'} uri={user?.profileImage} size={64} />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </Card>

        {/* My Friend Circles */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>My Circles ({groups.length})</Text>
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
                  <Text style={styles.groupCountText}>
                    {grp.memberCount || 1} members · {grp.memoryCount || 0} memories
                  </Text>
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

        {/* Circle Creation CTAs */}
        <View style={styles.ctaRow}>
          <Button
            title="+ Create New Circle"
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

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          size="md"
          style={styles.logoutBtn}
        />
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
    padding: spacing.base,
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.lg,
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
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  groupTile: {
    backgroundColor: 'transparent',
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.light.borderSubtle,
  },
  groupTileActive: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  groupTileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  groupIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.round,
    backgroundColor: colors.primary[100],
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
  logoutBtn: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
});
