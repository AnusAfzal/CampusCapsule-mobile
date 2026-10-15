import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { Header } from '../../components/layout/Header';
import { inviteApi } from '../../api/inviteApi';
import { useGroupStore } from '../../store/groupStore';
import { InviteInfo } from '../../types/models';
import { Photo } from '../../components/common/Photo';
import {
  colors,
  radius,
  spacing,
  typography,
} from '../../constants/theme';

type JoinGroupRouteProp = RouteProp<RootStackParamList, 'JoinGroup'>;

const CODE_LENGTH = 7;

// ─── Segmented code display ───────────────────────────────────────────────────
const CodeDisplay: React.FC<{
  value: string;
  onPress: () => void;
  hasError: boolean;
}> = ({ value, onPress, hasError }) => {
  const slots = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? '');

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.codeRow}
      accessibilityRole="button"
      accessibilityLabel="Invite code input"
    >
      {slots.map((char, idx) => (
        <View
          key={idx}
          style={[
            styles.codeSlot,
            char ? styles.codeSlotFilled : styles.codeSlotEmpty,
            hasError && styles.codeSlotError,
            idx === value.length && styles.codeSlotActive,
          ]}
        >
          <Text style={[styles.codeChar, !char && styles.codeCharPlaceholder]}>
            {char || (idx === value.length ? '|' : '·')}
          </Text>
        </View>
      ))}
    </TouchableOpacity>
  );
};

// ─── Group preview card ───────────────────────────────────────────────────────
const GroupCard: React.FC<{
  info: InviteInfo;
  joining: boolean;
  onJoin: () => void;
}> = ({ info, joining, onJoin }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.groupCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Group icon */}
      {info.group.coverImage ? (
        <Photo uri={info.group.coverImage} style={styles.groupCover} />
      ) : (
        <View style={styles.groupIconWrap}>
          <Ionicons name="people-outline" size={25} color={colors.primary[600]} />
        </View>
      )}

      {/* Group name + description */}
      <Text style={styles.groupName} numberOfLines={2}>
        {info.group.name}
      </Text>
      {info.group.description ? (
        <Text style={styles.groupDesc} numberOfLines={2}>
          {info.group.description}
        </Text>
      ) : null}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Ionicons
            name="people-outline"
            size={13}
            color={colors.light.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.statText}>
            {info.group.memberCount}{' '}
            {info.group.memberCount === 1 ? 'member' : 'members'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statChip}>
          <Ionicons
            name="time-outline"
            size={13}
            color={colors.light.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.statText}>
            Expires {new Date(info.invite.expiresAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      {/* CTA */}
      {info.alreadyMember ? (
        <View style={styles.alreadyRow}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={colors.status.success}
          />
          <Text style={styles.alreadyText}>
            You're already a member of this circle
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.joinBtn, joining && { opacity: 0.65 }]}
          onPress={onJoin}
          disabled={joining}
        >
          {joining ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.joinBtnText}>
                Join "{info.group.name}"
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#fff"
                style={{ marginLeft: 6 }}
              />
            </>
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export const JoinGroupScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<JoinGroupRouteProp>();
  const addGroup = useGroupStore((state) => state.addGroup);

  const [code, setCode] = useState(route.params?.inviteCode ?? '');
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [invitePreview, setInvitePreview] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hiddenInputRef = useRef<TextInput>(null);

  // Auto-lookup when arriving via deep link
  useEffect(() => {
    if (route.params?.inviteCode) {
      handleLookup(route.params.inviteCode);
    }
  }, [route.params?.inviteCode]);

  const handleCodeChange = (text: string) => {
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(cleaned);
    setError(null);
    if (invitePreview) setInvitePreview(null);
  };

  const handleLookup = async (codeToLookup?: string) => {
    const query = (codeToLookup ?? code).trim().toUpperCase();
    if (query.length < CODE_LENGTH) {
      setError(`Please enter all ${CODE_LENGTH} characters of your invite code.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const info = await inviteApi.getInviteInfo(query);
      setInvitePreview(info);
    } catch (err: any) {
      setError(err.message ?? 'Invalid or expired invite code.');
      setInvitePreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!invitePreview) return;

    try {
      setJoining(true);
      setError(null);
      const res = await inviteApi.joinGroupByInvite(invitePreview.invite.code);
      addGroup(res.group);
      Alert.alert(
        'You’re in',
        `You've joined "${res.group.name}". Start browsing and sharing memories with your friends.`,
        [
          {
            text: 'Go to Circle',
            onPress: () => navigation.replace('MainTabs', { screen: 'Home' }),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message ?? 'Failed to join group. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header title="Join Circle" showBack onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero banner ── */}
          <View style={styles.heroBanner}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="ticket-outline" size={36} color={colors.primary[400]} />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroHeading}>Join a Friend Circle</Text>
              <Text style={styles.heroSub}>
                Enter the 7-character code your group admin shared
              </Text>
            </View>
          </View>

          {/* ── Code section ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>INVITE CODE</Text>

            {/* Hidden real input — captures keyboard */}
            <TextInput
              ref={hiddenInputRef}
              value={code}
              onChangeText={handleCodeChange}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={CODE_LENGTH}
              style={styles.hiddenInput}
              onSubmitEditing={() => handleLookup()}
              returnKeyType="search"
              keyboardType="default"
            />

            {/* Visual segmented display */}
            <CodeDisplay
              value={code}
              hasError={!!error}
              onPress={() => hiddenInputRef.current?.focus()}
            />

            {/* Error message */}
            {error ? (
              <View style={styles.errorRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={15}
                  color={colors.status.error}
                  style={{ marginRight: 5, marginTop: 1 }}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <Text style={styles.hintText}>
                Codes look like{' '}
                <Text style={styles.hintCode}>SE26X7K</Text>
                {' '}— tap any slot to type
              </Text>
            )}

            {/* Find button */}
            <TouchableOpacity
              activeOpacity={0.82}
              style={[
                styles.findBtn,
                (loading || code.length < CODE_LENGTH) && styles.findBtnDisabled,
              ]}
              onPress={() => handleLookup()}
              disabled={loading || code.length < CODE_LENGTH}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 7 }}
                  />
                  <Text style={styles.findBtnText}>Find Circle</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Group preview ── */}
          {invitePreview ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CIRCLE FOUND</Text>
              <GroupCard
                info={invitePreview}
                joining={joining}
                onJoin={handleJoin}
              />
            </View>
          ) : null}

          {/* Bottom breathing room */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.light.background,
  },

  scroll: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    flexGrow: 1,
  },

  // ── Hero ──
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary[100],
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.round,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroHeading: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary[700],
    marginBottom: spacing.xxs,
  },
  heroSub: {
    fontSize: typography.sizes.sm,
    color: colors.primary[600],
    lineHeight: typography.lineHeights.sm,
  },

  // ── Section label ──
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.light.textMuted,
    letterSpacing: 1.1,
    marginBottom: spacing.md,
  },

  // ── Hidden input ──
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },

  // ── Segmented code ──
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  codeSlot: {
    width: 38,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  codeSlotEmpty: {
    backgroundColor: colors.light.surface,
    borderColor: colors.light.border,
  },
  codeSlotFilled: {
    backgroundColor: colors.light.surface,
    borderColor: colors.primary[400],
  },
  codeSlotActive: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  codeSlotError: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.errorBg,
  },
  codeChar: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
  },
  codeCharPlaceholder: {
    color: colors.light.border,
    fontWeight: typography.weights.regular,
  },

  // ── Hint / error ──
  hintText: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeights.xs,
  },
  hintCode: {
    fontWeight: typography.weights.semibold,
    color: colors.light.textSecondary,
    letterSpacing: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.status.errorBg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.sm,
  },

  // ── Find button ──
  findBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary[500],
    borderRadius: radius.md,
    height: 52,
  },
  findBtnDisabled: {
    opacity: 0.48,
  },
  findBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },

  // ── Group card ──
  groupCard: {
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.light.borderSubtle,
    padding: spacing.base,
    alignItems: 'center',
  },
  groupCover: {
    width: '100%',
    aspectRatio: 2.1,
    maxHeight: 180,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  groupIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  groupName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  groupDesc: {
    fontSize: typography.sizes.sm,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.sm,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: typography.sizes.xs,
    color: colors.light.textMuted,
    fontWeight: typography.weights.medium,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.light.border,
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.light.borderSubtle,
    marginBottom: spacing.base,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    borderRadius: radius.md,
    height: 52,
    width: '100%',
  },
  joinBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  alreadyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.status.successBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  alreadyText: {
    fontSize: typography.sizes.sm,
    color: colors.status.success,
    fontWeight: typography.weights.semibold,
  },
});
