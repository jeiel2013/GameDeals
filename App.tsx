import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { colors } from './src/theme';

import DealsScreen from './src/screens/DealsScreen';
import GamesScreen from './src/screens/GamesScreen';
import DealDetailScreen from './src/screens/DealDetailScreen';
import SavedScreen from './src/screens/SavedScreen';
import { TrendingUpIcon, SearchIcon, BookmarkIcon } from './src/components/Icons';

export type RootStackParamList = {
  Tabs: undefined;
  DealDetail: { dealID: string; title: string };
  Saved: undefined;
  Games: undefined;
  Deals: undefined;
};

export type TabParamList = {
  Deals: undefined;
  Games: undefined;
  Saved: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg0,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Deals"
        component={DealsScreen}
        options={{
          tabBarLabel: 'Deals',
          tabBarIcon: ({ color, size }) => <TrendingUpIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Games"
        component={GamesScreen}
        options={{
          tabBarLabel: 'Buscar Jogos',
          tabBarIcon: ({ color, size }) => <SearchIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarLabel: 'Salvos',
          tabBarIcon: ({ color, size }) => <BookmarkIcon size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={colors.bg0} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="DealDetail" component={DealDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
