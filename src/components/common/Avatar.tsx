import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../constants/theme';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ name, uri, size = 42 }) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [uri]);

  const getInitials = (n: string): string => {
    if (!n) return '?';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const getColorFromName = (str: string): string => {
    const palette = [
      colors.primary[500],
      colors.secondary[600],
      '#6B6964',
      '#333333',
      '#88837B',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  };

  if (uri && !imageFailed) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        onError={() => setImageFailed(true)}
        accessibilityLabel={`${name || 'Friend'}'s profile photo`}
      />
    );
  }

  const backgroundColor = getColorFromName(name || 'CC');
  const fontSize = Math.max(10, Math.floor(size * 0.38));

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.light.surfaceSubtle,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
  },
});
