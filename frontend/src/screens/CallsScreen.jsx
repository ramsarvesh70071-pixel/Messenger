import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

const CALLS = [
    { id: '1', name: 'Sunita Mausi (2)', time: 'Today, 6:00 pm', incoming: true, missed: false, type: 'audio' },
    { id: '2', name: 'Areeba Didi (2)', time: 'Today, 5:07 pm', incoming: false, missed: false, type: 'video' },
    { id: '3', name: 'Vishnu Maurya', time: 'Today, 9:03 am', incoming: false, missed: true, type: 'audio' },
];

export default function CallsScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Calls</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Feather name="camera" size={22} color="#000" style={{ marginRight: 16 }} />
                    <Ionicons name="search-outline" size={22} color="#000" style={{ marginRight: 16 }} />
                    <Feather name="more-vertical" size={22} color="#000" />
                </View>
            </View>

            {/* Top Action Buttons */}
            <View style={styles.topActions}>
                {[
                    { icon: 'call-outline', label: 'Call' },
                    { icon: 'calendar-outline', label: 'Schedule' },
                    { icon: 'keypad-outline', label: 'Keypad' },
                    { icon: 'heart-outline', label: 'Favorites' }
                ].map((action, i) => (
                    <TouchableOpacity key={i} style={styles.actionBtn}>
                        <View style={styles.actionCircle}>
                            <Ionicons name={action.icon} size={22} color="#111" />
                        </View>
                        <Text style={styles.actionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.recentTitle}>Recent</Text>

            <FlatList
                data={CALLS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.callRow}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={24} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.name, item.missed && { color: '#d9381e' }]}>{item.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialIcons
                                    name={item.incoming ? "call-received" : "call-made"}
                                    size={16}
                                    color={item.missed ? "#d9381e" : "#25D366"}
                                />
                                <Text style={styles.time}>{item.time}</Text>
                            </View>
                        </View>
                        <Ionicons name={item.type === 'video' ? "videocam-outline" : "call-outline"} size={22} color="#111" />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, height: 50, alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    topActions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
    actionBtn: { alignItems: 'center' },
    actionCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    actionLabel: { fontSize: 13, color: '#54656f' },
    recentTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16, marginVertical: 8 },
    callRow: { flexDirection: 'row', padding: 16, alignItems: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#aaa', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    name: { fontSize: 16, fontWeight: '600' },
    time: { fontSize: 13, color: '#666', marginLeft: 4 }
});