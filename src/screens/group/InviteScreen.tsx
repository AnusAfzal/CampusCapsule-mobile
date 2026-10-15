import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { inviteApi } from '../../api/inviteApi';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type InviteRouteProp = RouteProp<RootStackParamList, 'Invite'>;

export const InviteScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<InviteRouteProp>();
  const groupId = route.params.groupId;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [deepLink, setDeepLink] = useState<string>('');

  const generateInvite = async () => {
    try {
      setGenerating(true);
      const res = await inviteApi.createInvite(groupId, { expiresInDays: 7 });
      setInviteCode(res.invite.inviteCode);
      setDeepLink(res.deepLink);
    } catch (err: any) {
      Alert.alert('Notice', err.message || 'Could not generate invite. You must be an admin.');
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    generateInvite();
  }, [groupId]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join our private university memory group on CampusCapsule! Use invite code: ${inviteCode} or link: ${deepLink}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Invite Friends" showBack onBack={() => navigation.goBack()} />
      <ScreenContainer scrollable>
        <Text style={styles.title}>Invite Your University Circle</Text>
        <Text style={styles.subtitle}>
          Share this invite code with friends who should belong to this circle. Only invited friends can view and add memories.
        </Text>

        {loading ? (
          <LoadingSpinner message="Generating secure invite code..." />
        ) : (
          <Card variant="elevated" style={styles.codeCard}>
            <Text style={styles.codeLabel}>YOUR CIRCLE INVITE CODE</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{inviteCode}</Text>
            </View>
            <Text style={styles.expiryNote}>Expires in 7 days · One use per person</Text>

            <View style={styles.deepLinkBox}>
              <Ionicons name="link-outline" size={16} color={colors.light.textMuted} />
              <Text style={styles.deepLinkText} numberOfLines={1}>
                {deepLink}
              </Text>
            </View>

            <Button
              title="Share Invite Code"
              onPress={handleShare}
              size="lg"
              variant="primary"
              icon={<Ionicons name="share-social-outline" size={20} color="#FFFFFF" />}
              style={styles.shareBtn}
            />

            <Button
              title="Generate New Code"
              onPress={generateInvite}
              loading={generating}
              size="md"
              variant="outline"
              style={{ marginTop: spacing.sm }}
            />
          </Card>
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
  title: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.light.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeights.base,
  },
  codeCard: {
    alignItems: 'center',
    padding: spacing.base,
  },
  codeLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary[600],
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  codeBox: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginBottom: spacing.sm,
  },
  codeText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    color: colors.primary[700],
    letterSpacing: 4,
  },
  expiryNote: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    marginBottom: spacing.md,
  },
  deepLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surfaceSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    gap: 6,
    width: '100%',
    marginBottom: spacing.lg,
  },
  deepLinkText: {
    fontSize: typography.sizes.xs,
    color: colors.light.textSecondary,
    flex: 1,
  },
  shareBtn: {
    width: '100%',
  },
});
