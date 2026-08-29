import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export default function ToolsScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tools</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Feather name="camera" size={22} color="#000" style={{ marginRight: 16 }} />
                    <Feather name="more-vertical" size={22} color="#000" />
                </View>
            </View>

            <Text style={styles.subTitle}>Last 7 days performance</Text>

            {/* Performance Cards */}
            <View style={styles.cardsRow}>
                <View style={styles.perfCard}>
                    <MaterialCommunityIcons name="message-text-outline" size={24} color="#111" />
                    <Text style={styles.cardNumber}>6</Text>
                    <Text style={styles.cardLabel}>Conversations started</Text>
                </View>
                <View style={styles.perfCard}>
                    <Ionicons name="grid-outline" size={24} color="#111" />
                    <Text style={styles.cardNumber}>--</Text>
                    <Text style={styles.cardLabel}>Catalogue views</Text>
                </View>
                <View style={styles.perfCard}>
                    <MaterialCommunityIcons name="circle-slice-8" size={24} color="#111" />
                    <Text style={styles.cardNumber}>--</Text>
                    <Text style={styles.cardLabel}>Status views</Text>
                </View>
            </View>

            <Text style={styles.sectionHeader}>Grow your business</Text>

            {[
                { icon: 'shield-checkmark-outline', title: 'Meta Verified', sub: 'Get a verified badge and other benefits' },
                { icon: 'sparkles-outline', title: 'AI agent', sub: 'Use Meta Business Agent to respond 24/7' },
                { icon: 'grid-outline', title: 'Catalogue', sub: 'Show products and services' },
                { icon: 'megaphone-outline', title: 'Advertise', sub: 'Create ads that lead to WhatsApp' },
                { icon: 'card-outline', title: 'Payments', sub: 'View history and manage info' },
            ].map((item, index) => (
                <TouchableOpacity key={index} style={styles.toolRow}>
                    <Ionicons name={item.icon} size={24} color="#54656f" style={{ marginRight: 16 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.toolTitle}>{item.title}</Text>
                        <Text style={styles.toolSub}>{item.sub}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, height: 50, alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    subTitle: { fontSize: 14, color: '#666', marginHorizontal: 16, marginTop: 8 },
    cardsRow: { flexDirection: 'row', paddingHorizontal: 16, marginVertical: 12, justifyContent: 'space-between' },
    perfCard: { width: '30%', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12 },
    cardNumber: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
    cardLabel: { fontSize: 11, color: '#666' },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
    toolRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center' },
    toolTitle: { fontSize: 16, fontWeight: '500' },
    toolSub: { fontSize: 13, color: '#666', marginTop: 2 }
});