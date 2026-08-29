import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function StatusTicks({ status }) {
  if (status === 'read') {
    return <Ionicons name="checkmark-done" size={15} color={colors.accentC} />;
  }
  if (status === 'delivered') {
    return <Ionicons name="checkmark-done" size={15} color="rgba(255,255,255,0.6)" />;
  }
  return <Ionicons name="checkmark" size={15} color="rgba(255,255,255,0.6)" />;
}
