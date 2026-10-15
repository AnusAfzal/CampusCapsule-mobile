import { NavigatorScreenParams } from '@react-navigation/native';
import { Memory } from './models';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Timeline: undefined;
  AddMemory: { initialDate?: string } | undefined;
  Calendar: undefined;
  Archive: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  CreateGroup: undefined;
  JoinGroup: { inviteCode?: string } | undefined;
  GroupDetails: { groupId: string };
  Members: { groupId: string };
  Invite: { groupId: string };
  MemoryDetail: { memory: Memory };
};
