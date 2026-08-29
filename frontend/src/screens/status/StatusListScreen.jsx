import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function StatusListScreen({ navigation }) {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Updates</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Feather name="camera" size={22} color="#000" style={{ marginRight: 16 }} />
                    <Ionicons name="search-outline" size={22} color="#000" style={{ marginRight: 16 }} />
                    <Feather name="more-vertical" size={22} color="#000" />
                </View>
            </View>

            <Text style={styles.sectionTitle}>Status</Text>

            {/* Horizontal Status Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
                {/* My Status Card */}
                <TouchableOpacity style={styles.statusCard} onPress={() => navigation.navigate('CreateStatus')}>
                    <View style={styles.cardAddIcon}><Ionicons name="add" size={16} color="#fff" /></View>
                    <Text style={styles.cardName}>My status</Text>
                </TouchableOpacity>

                {/* Friend Status Cards */}
                {['Prince Maurya', 'Amarnath', 'Amarnath 2'].map((name, i) => (
                    <TouchableOpacity key={i} style={[styles.statusCard, { backgroundColor: '#333' }]} onPress={() => navigation.navigate('StatusViewer', { name })}>
                        <View style={styles.storyRingBorder} />
                        <Text style={styles.cardName}>{name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Boost Status Button */}
            <TouchableOpacity style={styles.boostBtn}>
                <Ionicons name="megaphone-outline" size={18} color="#0b8457" />
                <Text style={styles.boostText}>Boost status</Text>
            </TouchableOpacity>

            {/* Channels Section */}
            <View style={styles.channelHeader}>
                <Text style={styles.sectionTitle}>Channels</Text>
                <TouchableOpacity style={styles.exploreBtn}><Text style={styles.exploreText}>Explore</Text></TouchableOpacity>
            </View>

            {/* Channel Item */}
            <View style={styles.channelRow}>
                <View style={[styles.channelAvatar, { backgroundColor: '#d9381e' }]}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SR</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.channelName}>Sarkari Result Official</Text>
                    <Text style={styles.channelMsg} numberOfLines={1}>SBI PO Pre Result 2026 - Out 🔥</Text>
                </View>
                <Text style={styles.timeText}>8:52 pm</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, height: 50, alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 16, marginVertical: 12 },
    statusCard: { width: 100, height: 150, borderRadius: 16, backgroundColor: '#ddd', marginRight: 10, padding: 8, justifyContent: 'space-between' },
    cardAddIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    cardName: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    storyRingBorder: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#25D366' },
    boostBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', margin: 16, borderRadius: 20, height: 40 },
    boostText: { color: '#0b8457', fontWeight: 'bold', marginLeft: 8 },
    channelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
    exploreBtn: { backgroundColor: '#f0f2f5', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
    exploreText: { color: '#111', fontWeight: 'bold' },
    channelRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
    channelAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    channelName: { fontSize: 16, fontWeight: 'bold' },
    channelMsg: { color: '#666', fontSize: 13 },
    timeText: { fontSize: 11, color: '#888' }
});