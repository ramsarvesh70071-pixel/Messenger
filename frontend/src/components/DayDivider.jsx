import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function DayDivider({ day }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{day}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 12 },
  text: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: colors.textMid,
    fontSize: 11.5,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
