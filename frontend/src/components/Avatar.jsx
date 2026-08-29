import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { initials, colorFor } from '../utils/format';

export default function Avatar({ src, name = '?', size = 44, online = false }) {
  const bg = colorFor(name || 'x');
  return (
    <View style={{ width: size, height: size }}>
      {src ? (
        <Image source={{ uri: src }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
          ]}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>
            {initials(name) || '?'}
          </Text>
        </View>
      )}
      {online && (
        <View
          style={[
            styles.dot,
            {
              width: Math.max(10, size * 0.26),
              height: Math.max(10, size * 0.26),
              borderRadius: Math.max(10, size * 0.26) / 2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: colors.accentC,
    borderWidth: 2.5,
    borderColor: colors.bg1,
  },
});
