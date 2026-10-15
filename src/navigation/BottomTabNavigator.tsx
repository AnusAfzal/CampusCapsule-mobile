import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/main/HomeScreen';
import { TimelineScreen } from '../screens/main/TimelineScreen';
import { AddMemoryScreen } from '../screens/main/AddMemoryScreen';
import { ArchiveScreen } from '../screens/main/ArchiveScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { CalendarScreen } from '../screens/main/CalendarScreen';
import { colors, radius, shadows, spacing, typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.light.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{
          tabBarLabel: 'Timeline',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'images' : 'images-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AddMemory"
        component={AddMemoryScreen}
        options={{
          tabBarLabel: 'Add Daily',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.addMemoryButton, focused && styles.addMemoryButtonActive]}>
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Archive"
        component={ArchiveScreen}
        options={{
          tabBarLabel: 'Archive',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'school' : 'school-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: colors.light.borderSubtle,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    ...shadows.subtle,
    elevation: 2,
  },
  tabBarLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  addMemoryButton: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    borderWidth: 3,
    borderColor: colors.light.surface,
    ...shadows.card,
    elevation: 4,
  },
  addMemoryButtonActive: {
    backgroundColor: colors.primary[600],
    transform: [{ scale: 1.05 }],
  },
});
