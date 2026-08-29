import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const CHATS = [
  { id: '1', name: 'Areeba Didi', message: 'okay ab nhi karunga', time: '9:26 pm', doubleTick: true, read: false },
  { id: '2', name: 'Himanchal Maurya', message: 'Voice message (0:04)', time: '9:11 pm', isVoice: true, doubleTick: true, read: true },
  { id: '3', name: 'Vishnu Maurya', message: 'Voice message (0:04)', time: '8:35 pm', isVoice: true },
  { id: '4', name: 'Ramsarvesh Maurya (You)', message: 'https://youtube.com/shorts/...', time: '6:41 pm', doubleTick: true, read: true },
  { id: '5', name: 'Reserve Bank of India', message: 'डिजिटल भुगतान कर रहे हैं?...', time: '6:17 pm', unread: 1 },
];

export default function ChatListScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WhatsApp</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}><Feather name="camera" size={22} color="#000" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
            <Feather name="more-vertical" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput placeholder="Search..." placeholderTextColor="#666" style={styles.searchInput} />
      </View>

      {/* Filter Chips */}
      <View style={styles.chipsContainer}>
        {['All', 'Unread 2', 'Favourites', 'Groups 1'].map((chip) => (
          <TouchableOpacity
            key={chip}
            style={[styles.chip, activeTab === chip && styles.activeChip]}
            onPress={() => setActiveTab(chip)}
          >
            <Text style={[styles.chipText, activeTab === chip && styles.activeChipText]}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat List */}
      <FlatList
        data={CHATS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatRow} onPress={() => navigation.navigate('Chat', { chatId: item.id, name: item.name })}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View style={styles.chatSubRow}>
                {item.doubleTick && (
                  <Ionicons name="checkmark-done" size={16} color={item.read ? "#34B7F1" : "#888"} style={{ marginRight: 4 }} />
                )}
                {item.isVoice && <Ionicons name="mic" size={16} color="#34B7F1" style={{ marginRight: 4 }} />}
                <Text style={styles.messageText} numberOfLines={1}>{item.message}</Text>
                {item.unread && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Contacts')}>
        <MaterialCommunityIcons name="comment-plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* 3-Dot Popup Menu */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuPopup}>
            {['Advertise', 'New group', 'Business broadcasts', 'Communities', 'Lists', 'Linked devices', 'Starred', 'Settings'].map((item) => (
              <TouchableOpacity key={item} style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <Text style={styles.menuText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 50 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0b8457' },
  headerIcons: { flexDirection: 'row' },
  iconBtn: { marginLeft: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', marginHorizontal: 16, borderRadius: 20, paddingHorizontal: 12, height: 40, marginVertical: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  chipsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10 },
  chip: { backgroundColor: '#f0f2f5', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 },
  activeChip: { backgroundColor: '#e7fceb' },
  chipText: { color: '#54656f', fontSize: 13, fontWeight: '500' },
  activeChipText: { color: '#0b8457', fontWeight: 'bold' },
  chatRow: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  chatContent: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nameText: { fontSize: 16, fontWeight: 'bold', color: '#111b21' },
  timeText: { fontSize: 12, color: '#667781' },
  chatSubRow: { flexDirection: 'row', alignItems: 'center' },
  messageText: { flex: 1, fontSize: 14, color: '#667781' },
  unreadBadge: { backgroundColor: '#25D366', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#0b8457', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  menuPopup: { position: 'absolute', top: 50, right: 16, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, width: 200, elevation: 5 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16 },
  menuText: { fontSize: 15, color: '#111b21' }
});