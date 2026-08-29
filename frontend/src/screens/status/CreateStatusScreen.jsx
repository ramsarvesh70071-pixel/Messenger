import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CreateStatusScreen({ navigation }) {
    const [text, setText] = useState('');

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            <TextInput
                placeholder="Type a status..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                multiline
                value={text}
                onChangeText={setText}
                style={styles.input}
            />

            <TouchableOpacity style={styles.sendFab} onPress={() => navigation.goBack()}>
                <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b8457', justifyContent: 'center', alignItems: 'center', padding: 20 },
    closeBtn: { position: 'absolute', top: 50, left: 20 },
    input: { fontSize: 24, color: '#fff', textAlign: 'center', width: '100%' },
    sendFab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#128C7E', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' }
});