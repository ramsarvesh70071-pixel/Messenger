import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../theme/colors';

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

export default function MessageActionSheet({
  visible,
  message,
  isMine,
  onClose,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onToggleStar,
  onTogglePin,
  onReact,
}) {
  if (!message) return null;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.text || '');
    onClose();
  };

  const isDeleted = message.isDeletedForEveryone;
  const isStarred = (message.starredBy || []).some((id) => String(id));

  const Row = ({ icon, label, onPress, danger }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={19} color={danger ? colors.danger || '#FF6B9D' : colors.textHi} />
      <Text style={[styles.rowLabel, danger && { color: colors.danger || '#FF6B9D' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          {!isDeleted && (
            <View style={styles.emojiRow}>
              {QUICK_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiBtn}
                  onPress={() => {
                    onReact(emoji);
                    onClose();
                  }}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!isDeleted && (
            <Row
              icon="arrow-undo-outline"
              label="Reply"
              onPress={() => {
                onReply();
                onClose();
              }}
            />
          )}
          {!isDeleted && (
            <Row
              icon="arrow-redo-outline"
              label="Forward"
              onPress={() => {
                onForward();
                onClose();
              }}
            />
          )}
          {!isDeleted && <Row icon="copy-outline" label="Copy" onPress={handleCopy} />}
          {!isDeleted && (
            <Row
              icon={isStarred ? 'star' : 'star-outline'}
              label={isStarred ? 'Unstar' : 'Star'}
              onPress={() => {
                onToggleStar();
                onClose();
              }}
            />
          )}
          {!isDeleted && (
            <Row
              icon={message.isPinned ? 'pin' : 'pin-outline'}
              label={message.isPinned ? 'Unpin' : 'Pin'}
              onPress={() => {
                onTogglePin();
                onClose();
              }}
            />
          )}
          {isMine && !isDeleted && (
            <Row
              icon="pencil-outline"
              label="Edit"
              onPress={() => {
                onEdit();
                onClose();
              }}
            />
          )}
          {isMine && (
            <Row
              icon="trash-outline"
              label="Delete for everyone"
              danger
              onPress={() => {
                onDelete('everyone');
                onClose();
              }}
            />
          )}
          <Row
            icon="trash-bin-outline"
            label="Delete for me"
            danger
            onPress={() => {
              onDelete('me');
              onClose();
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 8,
    paddingBottom: 28,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassBorder,
    alignSelf: 'center',
    marginBottom: 8,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    marginBottom: 4,
  },
  emojiBtn: { padding: 6 },
  emojiText: { fontSize: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: 14 },
  rowLabel: { color: colors.textHi, fontSize: 15, fontWeight: '500' },
});
