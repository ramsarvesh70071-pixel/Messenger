import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function Composer({ replyTo, onCancelReply, onSend, onTyping, onStopTyping }) {
  const [text, setText] = useState('');
  const typingTimeout = useRef(null);

  const handleChange = (t) => {
    setText(t);
    onTyping?.();
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onStopTyping?.(), 1500);
  };

  const submit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
    clearTimeout(typingTimeout.current);
    onStopTyping?.();
  };

  return (
    <View style={styles.wrap}>
      {replyTo && (
        <View style={styles.replyBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.replyBarName}>Replying to {replyTo.sender?.name || 'message'}</Text>
            <Text style={styles.replyBarText} numberOfLines={1}>
              {replyTo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={{ padding: 4 }}>
            <Ionicons name="close" size={16} color={colors.textMid} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChange}
          placeholder="Type a message"
          placeholderTextColor={colors.textLow}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} onPress={submit} disabled={!text.trim()}>
          <Ionicons name="send" size={17} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderLeftWidth: 3,
    borderLeftColor: colors.accentC,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  replyBarName: { fontSize: 12, fontWeight: '700', color: colors.accentC },
  replyBarText: { fontSize: 13, color: colors.textMid, marginTop: 2 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  input: { flex: 1, color: colors.textHi, fontSize: 15, maxHeight: 100, paddingVertical: 6 },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
