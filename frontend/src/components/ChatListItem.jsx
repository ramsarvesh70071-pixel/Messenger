import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { colors } from '../theme/colors';
import { formatTime } from '../utils/format';

export default function ChatListItem({ chat, onPress, isOnline }) {
  const preview = chat.lastMessage?.text || 'Say hi 👋';
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Avatar src={chat.avatar} name={chat.name} size={52} online={isOnline} />
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 5 }}>
            {chat.isPinned && <Ionicons name="pin" size={12} color={colors.accentC} />}
            <Text style={styles.name} numberOfLines={1}>
              {chat.name}
            </Text>
          </View>
          {chat.updatedAt ? <Text style={styles.time}>{formatTime(chat.updatedAt)}</Text> : null}
        </View>
        <View style={styles.bottom}>
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
          {chat.isMuted && <Ionicons name="volume-mute-outline" size={15} color={colors.textLow} />}
          {chat.unreadCount > 0 && (
            <View style={[styles.badge, chat.isMuted && { backgroundColor: colors.textLow }]}>
              <Text style={styles.badgeText}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 11 },
  body: { flex: 1, minWidth: 0 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { fontWeight: '700', fontSize: 15.5, color: colors.textHi, flexShrink: 1 },
  time: { fontSize: 11, color: colors.textLow, marginLeft: 6 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3, gap: 6 },
  preview: { fontSize: 13, color: colors.textMid, flex: 1 },
  badge: {
    backgroundColor: colors.accentB,
    borderRadius: 20,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
