import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';

interface PhotoProps {
  uri?: string;
  style: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  label?: string;
}

export const Photo: React.FC<PhotoProps> = ({
  uri,
  style,
  imageStyle,
  label = 'Photo unavailable',
}) => {
  const [hasError, setHasError] = useState(!uri);

  useEffect(() => {
    setHasError(!uri);
  }, [uri]);

  return (
    <View style={[styles.container, style]}>
      {uri && !hasError ? (
        <Image
          source={{ uri }}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
          onError={() => setHasError(true)}
          accessibilityLabel="Shared memory photo"
        />
      ) : (
        <View style={styles.fallback}>
          <Ionicons name="image-outline" size={24} color={colors.light.textMuted} />
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.light.surfaceSubtle,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    color: colors.light.textMuted,
    fontSize: typography.sizes.xs,
  },
});
