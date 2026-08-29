import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function ChatScreen({ route, navigation }) {
  const { chatId, recipientId, name } = route.params || {};
  const chatName = name || 'User Chat';
  const targetUserId = recipientId || chatId;

  const { socket } = useSocket();
  const { user, token } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef(null);

  // REST API से पुराने मैसेज लोड करना
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`http://192.168.1.100:5000/api/messages/${user._id}/${targetUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok) {
          setMessages(data);
        }
      } catch (err) {
        console.error("Fetch Messages Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && targetUserId) {
      fetchChatHistory();
    }
  }, [user, targetUserId, token]);

  // Socket Events सुनना
  useEffect(() => {
    if (!socket) return;

    // 1. रियल-टाइम मैसेज रिसीव करना
    const handleReceiveMessage = (newMessage) => {
      if (newMessage.sender._id === targetUserId || newMessage.sender === targetUserId) {
        setMessages((prev) => [...prev, newMessage]);

        // Message Read status अपडेट करना
        socket.emit('message_read', {
          messageId: newMessage._id,
          senderId: targetUserId
        });
      }
    };

    // 2. स्वयं द्वारा भेजे गए मैसेज का कन्फर्मेशन प्राप्त करना
    const handleMessageSent = (sentMessage) => {
      setMessages((prev) => [...prev, sentMessage]);
    };

    // 3. Typing Indicators सुनना
    const handleTyping = (data) => {
      if (data.userId === targetUserId) setIsTyping(true);
    };

    const handleStopTyping = (data) => {
      if (data.userId === targetUserId) setIsTyping(false);
    };

    // 4. Status Update (Delivered / Read Status)
    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('message_status_update', handleStatusUpdate);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('message_status_update', handleStatusUpdate);
    };
  }, [socket, targetUserId]);

  // Typing event ट्रिगर करना
  const handleInputChange = (text) => {
    setInputMessage(text);
    if (!socket) return;

    if (text.length > 0) {
      socket.emit('typing', { recipient: targetUserId });
    } else {
      socket.emit('stop_typing', { recipient: targetUserId });
    }
  };

  // Message Send करना
  const sendMessage = () => {
    if (!inputMessage.trim() || !socket) return;

    socket.emit('send_message', {
      recipient: targetUserId,
      text: inputMessage.trim(),
    });

    socket.emit('stop_typing', { recipient: targetUserId });
    setInputMessage('');
  };

  const renderStatusIcon = (status) => {
    if (status === 'read') {
      return <Ionicons name="checkmark-done" size={16} color="#34B7F1" style={{ marginLeft: 4 }} />;
    } else if (status === 'delivered') {
      return <Ionicons name="checkmark-done" size={16} color="#888" style={{ marginLeft: 4 }} />;
    } else {
      return <Ionicons name="checkmark" size={16} color="#888" style={{ marginLeft: 4 }} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>{chatName}</Text>
          {isTyping && <Text style={styles.typingText}>typing...</Text>}
        </View>
        <View style={styles.headerRight}>
          <Feather name="video" size={20} color="#000" style={styles.headerIcon} />
          <Ionicons name="call-outline" size={20} color="#000" style={styles.headerIcon} />
          <Feather name="more-vertical" size={20} color="#000" style={styles.headerIcon} />
        </View>
      </View>

      {/* Chat Body */}
      <ImageBackground
        source={{ uri: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png' }}
        style={styles.chatBackground}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0b8457" style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item._id || index.toString()}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isMyMessage = (item.sender._id || item.sender) === user._id;
              return (
                <View style={[styles.msgBubble, isMyMessage ? styles.myBubble : styles.theirBubble]}>
                  <Text style={[styles.msgText, isMyMessage ? styles.myMsgText : styles.theirMsgText]}>
                    {item.text}
                  </Text>
                  <View style={styles.msgFooter}>
                    <Text style={styles.timeText}>
                      {new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isMyMessage && renderStatusIcon(item.status)}
                  </View>
                </View>
              );
            }}
            contentContainerStyle={{ padding: 12 }}
          />
        )}

        {/* Bottom Composer */}
        <View style={styles.composerContainer}>
          <View style={styles.inputCard}>
            <FontAwesome name="smile-o" size={22} color="#666" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Message"
              value={inputMessage}
              onChangeText={handleInputChange}
              style={styles.input}
            />
            <Feather name="paperclip" size={20} color="#666" style={{ marginRight: 12 }} />
            <Feather name="camera" size={20} color="#666" />
          </View>
          <TouchableOpacity style={styles.micBtn} onPress={sendMessage}>
            <Ionicons name={inputMessage.trim() ? "send" : "mic"} size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 35 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 55, backgroundColor: '#f6f6f6' },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#888', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  typingText: { fontSize: 11, color: '#0b8457', fontWeight: '600' },
  headerRight: { flexDirection: 'row' },
  headerIcon: { marginLeft: 16 },
  chatBackground: { flex: 1 },
  msgBubble: { padding: 10, borderRadius: 12, marginVertical: 4, maxWidth: '80%' },
  myBubble: { backgroundColor: '#e7fceb', alignSelf: 'flex-end' },
  theirBubble: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  msgText: { fontSize: 15 },
  myMsgText: { color: '#111' },
  theirMsgText: { color: '#111' },
  msgFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  timeText: { fontSize: 10, color: '#888' },
  composerContainer: { flexDirection: 'row', padding: 8, alignItems: 'center' },
  inputCard: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 14, height: 48, alignItems: 'center' },
  input: { flex: 1, fontSize: 16 },
  micBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0b8457', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }
});