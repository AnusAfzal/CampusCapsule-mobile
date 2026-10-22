import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  ActivityIndicator,
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
  const [isLoading, setIsLoading] = useState(Boolean(uri));

  useEffect(() => {
    setHasError(!uri);
    setIsLoading(Boolean(uri));
  }, [uri]);

  return (
    <View style={[styles.container, style]}>
      {uri && !hasError ? (
        <Image
          source={{ uri }}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
          onLoadEnd={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          accessibilityLabel="Shared memory photo"
        />
      ) : null}
      {isLoading && !hasError ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.light.textMuted} />
        </View>
      ) : hasError ? (
        <View style={styles.fallback}>
          <Ionicons name="image-outline" size={24} color={colors.light.textMuted} />
          <Text style={styles.label}>{label}</Text>
        </View>
      ) : null}
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
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.light.textMuted,
    fontSize: typography.sizes.xs,
  },
});
