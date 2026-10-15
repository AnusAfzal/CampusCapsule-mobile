import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { BottomTabNavigator } from './BottomTabNavigator';
import { CreateGroupScreen } from '../screens/group/CreateGroupScreen';
import { JoinGroupScreen } from '../screens/group/JoinGroupScreen';
import { GroupDetailsScreen } from '../screens/group/GroupDetailsScreen';
import { MembersScreen } from '../screens/group/MembersScreen';
import { InviteScreen } from '../screens/group/InviteScreen';
import { MemoryDetailScreen } from '../screens/memory/MemoryDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <Stack.Screen name="Members" component={MembersScreen} />
      <Stack.Screen name="Invite" component={InviteScreen} />
      <Stack.Screen name="MemoryDetail" component={MemoryDetailScreen} />
    </Stack.Navigator>
  );
};