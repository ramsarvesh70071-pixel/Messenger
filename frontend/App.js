import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';

import MainTabs from "./src/navigation/MainTabs";
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { ChatProvider } from './src/context/ChatContext';
import { colors } from './src/theme/colors';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ChatScreen from './src/screens/ChatScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import CreateStatusScreen from './src/screens/status/CreateStatusScreen';
import StatusViewerScreen from './src/screens/status/StatusViewerScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  dark: true,
  colors: {
    primary: colors?.accentA || '#0b8457',
    background: colors?.bg0 || '#ffffff',
    card: colors?.bg1 || '#ffffff',
    text: colors?.textHi || '#111111',
    border: colors?.glassBorder || '#cccccc',
    notification: colors?.accentB || '#25D366',
  },
};

function RootNavigator() {
  const { user, booting } = useAuth();

  if (booting) {
    return (
      <View style={{ flex: 1, backgroundColor: colors?.bg0 || '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors?.accentC || '#0b8457'} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Contacts" component={ContactsScreen} />
          <Stack.Screen name="CreateStatus" component={CreateStatusScreen} />
          <Stack.Screen name="StatusViewer" component={StatusViewerScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <StatusBar style="light" />
            <NavigationContainer theme={navTheme}>
              <RootNavigator />
            </NavigationContainer>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}