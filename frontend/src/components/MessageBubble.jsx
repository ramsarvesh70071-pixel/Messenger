import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { formatTime } from '../utils/format';
import StatusTicks from './StatusTicks';

const { width: SCREEN_W } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = SCREEN_W * 0.74;
const TIME_REVEAL_WIDTH = 60; // matches the max swipe distance set in ChatScreen

/**
 * `swipeX` is a Reanimated shared value (see ChatScreen) that is dragged
 * between -TIME_REVEAL_WIDTH and 0 by a single pan gesture covering the
 * whole message list — exactly like WhatsApp's "swipe left to see time".
 * Every bubble slides with it, and a timestamp fades in behind it on the right.
 */
export default function MessageBubble({ message, isMine, isGroup, swipeX }) {
  const deleted = message.isDeletedForEveryone;

  const contentStyle = useAnimatedStyle(() => {
    if (!swipeX) return {};
    return { transform: [{ translateX: swipeX.value }] };
  });

  const timeRevealStyle = useAnimatedStyle(() => {
    if (!swipeX) return { opacity: 0 };
    const opacity = interpolate(swipeX.value, [-TIME_REVEAL_WIDTH, -10, 0], [1, 0.3, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      {/* revealed timestamp sits underneath, fixed to the right edge */}
      <Animated.View pointerEvents="none" style={[styles.timeReveal, timeRevealStyle]}>
        <Text style={styles.timeRevealText}>{formatTime(message.createdAt || message.timestamp)}</Text>
      </Animated.View>

      <Animated.View style={[styles.col, contentStyle]}>
        {isGroup && !isMine && (
          <Text style={[styles.senderName, { color: senderColor(message.sender?.name) }]}>
            {message.sender?.name}
          </Text>
        )}

        {isMine ? (
          <LinearGradient
            colors={gradients.bubbleMine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleMine, deleted && styles.bubbleDeleted]}
          >
            <BubbleInner message={message} isMine deleted={deleted} />
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleTheirs, deleted && styles.bubbleDeleted]}>
            <BubbleInner message={message} isMine={false} deleted={deleted} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function BubbleInner({ message, isMine, deleted }) {
  return (
    <>
      {message.replyTo && !deleted && (
        <View style={styles.replyPreview}>
          <Text style={styles.replyName}>{message.replyTo.sender?.name || 'Reply'}</Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {message.replyTo.isDeletedForEveryone ? 'This message was deleted.' : message.replyTo.text}
          </Text>
        </View>
      )}

      <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine, deleted && styles.bubbleTextDeleted]}>
        {message.text}
      </Text>

      <View style={styles.metaRow}>
        {message.isEdited && !deleted && <Text style={styles.editedTag}>edited</Text>}
        <Text style={[styles.timeTag, isMine && styles.timeTagMine]}>
          {formatTime(message.createdAt || message.timestamp)}
        </Text>
        {isMine && !deleted && <StatusTicks status={message.status} />}
      </View>
    </>
  );
}

function senderColor(name = '') {
  const palette = ['#ff5cae', '#21e6c1', '#ffb020', '#5c8dff', '#c15cff'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  col: { maxWidth: MAX_BUBBLE_WIDTH },
  senderName: { fontSize: 12, fontWeight: '700', marginLeft: 14, marginBottom: 3 },
  bubble: {
    paddingHorizontal: 13,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  bubbleTheirs: {
    backgroundColor: colors.bg3,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bubbleMine: { borderBottomRightRadius: 6 },
  bubbleDeleted: { opacity: 0.65 },
  bubbleText: { fontSize: 15, lineHeight: 20, color: colors.textHi },
  bubbleTextMine: { color: '#fff' },
  bubbleTextDeleted: { fontStyle: 'italic' },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 5, marginTop: 3 },
  editedTag: { fontSize: 10.5, fontStyle: 'italic', color: colors.textLow },
  timeTag: { fontSize: 10.5, color: 'rgba(255,255,255,0.55)' },
  timeTagMine: { color: 'rgba(255,255,255,0.8)' },
  replyPreview: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderLeftWidth: 3,
    borderLeftColor: colors.accentC,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginBottom: 6,
  },
  replyName: { fontWeight: '700', color: colors.accentC, fontSize: 12 },
  replyText: { color: colors.textMid, fontSize: 12.5 },
  timeReveal: {
    position: 'absolute',
    right: -TIME_REVEAL_WIDTH + 4,
    top: 0,
    bottom: 0,
    width: TIME_REVEAL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRevealText: { fontSize: 10.5, color: colors.textLow },
});

export { TIME_REVEAL_WIDTH };
