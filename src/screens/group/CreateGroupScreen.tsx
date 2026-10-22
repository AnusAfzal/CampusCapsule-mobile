import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { groupApi } from '../../api/groupApi';
import { useGroupStore } from '../../store/groupStore';
import { colors, spacing, typography } from '../../constants/theme';

export const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const addGroup = useGroupStore((state) => state.addGroup);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please provide a name for your friend circle.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await groupApi.createGroup({
        name: name.trim(),
        description: description.trim(),
      });
      addGroup(res.group);
      Alert.alert(
        'Circle created',
        `"${res.group.name}" has been created. Invite your friends to start adding daily memories!`,
        [
          {
            text: 'Invite Friends Now',
            onPress: () =>
              navigation.replace('Invite', {
                groupId: (res.group.id || res.group._id) as string,
              }),
          },
          {
            text: 'Go to Group',
            onPress: () => navigation.replace('MainTabs', { screen: 'Home' }),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Create Friend Circle" showBack onBack={() => navigation.goBack()} />
      <ScreenContainer scrollable>
        <Text style={styles.title}>Preserve Your Journey</Text>
        <Text style={styles.subtitle}>
          Create a private space for your university friends, department batch, or hostel roommates.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Input
          label="Circle Name"
          placeholder="e.g. Software Eng Batch '26, Hostel Room 302"
          value={name}
          onChangeText={(val) => {
            setName(val);
            setError(null);
          }}
        />

        <Input
          label="Description (Optional)"
          placeholder="What unites this group of friends?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
        />

        <Button
          title="Create Circle"
          onPress={handleCreate}
          loading={loading}
          size="lg"
          style={styles.submitBtn}
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
  title: {
    fontFamily: typography.families.serif,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
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
  errorBox: {
    backgroundColor: colors.status.errorBg,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.status.error,
    borderLeftWidth: 3,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  submitBtn: {
    marginTop: spacing.lg,
  },
});
