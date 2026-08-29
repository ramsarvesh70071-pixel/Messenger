import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatusViewerScreen({ route, navigation }) {
    const name = route.params?.name || 'Status View';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>{name}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.statusText}>This is {name}'s status updates.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', paddingTop: 40 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50 },
    title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 16 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    statusText: { color: '#fff', fontSize: 20 }
});