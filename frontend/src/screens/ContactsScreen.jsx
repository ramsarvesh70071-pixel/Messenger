import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

const CONTACTS = [
  { id: '1', name: 'Ramsarvesh Maurya (You)', status: 'Message yourself' },
  { id: '2', name: 'Abhay', status: '' },
  { id: '3', name: 'Abhishek Maurya', status: '' },
  { id: '4', name: 'Adarsh Yadav (MERN)', status: 'Radhe Radhe 🌸🙏' },
  { id: '5', name: 'Adil', status: 'NEVER LOOSE 👊 PERMANENT SMILE 4 TE...' },
];

export default function ContactsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.headerTitle}>Select contact</Text>
          <Text style={styles.subTitle}>256 contacts</Text>
        </View>
        <Ionicons name="search-outline" size={22} color="#000" style={{ marginRight: 16 }} />
        <Feather name="more-vertical" size={22} color="#000" />
      </View>

      <FlatList
        data={CONTACTS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View>
            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.iconCircle}><MaterialIcons name="group-add" size={22} color="#fff" /></View>
              <Text style={styles.optionText}>New group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.iconCircle}><Ionicons name="person-add" size={20} color="#fff" /></View>
              <Text style={[styles.optionText, { flex: 1 }]}>New contact</Text>
              <Ionicons name="qr-code-outline" size={22} color="#111" />
            </TouchableOpacity>
            <Text style={styles.sectionHeader}>Contacts on WhatsApp</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => navigation.navigate('Chat', { name: item.name })}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              {item.status ? <Text style={styles.status}>{item.status}</Text> : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 55 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  subTitle: { fontSize: 12, color: '#666' },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  optionText: { fontSize: 16, fontWeight: 'bold' },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#666', marginHorizontal: 16, marginVertical: 10 },
  contactRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  name: { fontSize: 16, fontWeight: '500' },
  status: { fontSize: 13, color: '#666', marginTop: 2 }
});