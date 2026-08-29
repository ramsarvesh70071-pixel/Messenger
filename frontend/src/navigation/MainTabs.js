import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import ChatListScreen from '../screens/ChatListScreen';
import CallsScreen from '../screens/CallsScreen';
import StatusListScreen from '../screens/status/StatusListScreen';
import ToolsScreen from '../screens/ToolsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#0b8457',
                tabBarInactiveTintColor: '#54656f',
                tabBarStyle: { height: 65, paddingBottom: 8, paddingTop: 6 },
                tabBarLabelStyle: { fontSize: 12, fontWeight: '600' }
            }}
        >
            <Tab.Screen
                name="Chats"
                component={ChatListScreen}
                options={{
                    tabBarBadge: 2,
                    tabBarBadgeStyle: { backgroundColor: '#25D366', color: '#fff' },
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons name={focused ? "chat" : "chat-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Calls"
                component={CallsScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "call" : "call-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Updates"
                component={StatusListScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons name={focused ? "circle-slice-8" : "circle-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Tools"
                component={ToolsScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons name={focused ? "store" : "store-outline"} size={24} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
}