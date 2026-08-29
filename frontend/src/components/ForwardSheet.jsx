import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Avatar from './Avatar';

export default function ForwardSheet({ visible, onClose, contacts, groups, onForward }) {
  const [sending, setSending] = useState(false);

  const handlePick = async (target) => {
    setSending(true);
    try {
      await onForward(target);
      onClose();
    } catch (e) {
      Alert.alert('Could not forward', e.message);
    } finally {
      setSending(false);
    }
  };

  const data = [
    ...groups.map((g) => ({ kind: 'group', id: g._id, name: g.name, avatar: g.avatar })),
    ...contacts.map((c) => ({ kind: 'direct', id: c.contact._id, name: c.nickname || c.contact.name, avatar: c.contact.avatar }))
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textHi} />
          </TouchableOpacity>
          <Text style={styles.title}>Forward to</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => `${item.kind}-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} disabled={sending} onPress={() => handlePick(item)}>
              <Avatar src={item.avatar} name={item.name} size={44} isGroup={item.kind === 'group'} />
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Add some contacts or a group first to forward messages.</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg0, paddingTop: 54 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14
  },
  title: { color: colors.textHi, fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 11 },
  name: { color: colors.textHi, fontSize: 14.5, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 30 },
  emptyText: { color: colors.textMid, fontSize: 13.5, textAlign: 'center' }
});
