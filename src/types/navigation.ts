import { NavigatorScreenParams } from '@react-navigation/native';

// Navigation tip tanımları
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Timer: { taskId?: string };
  TaskDetail: { taskId: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Statistics: undefined;
  Settings: undefined;
};

// Navigation prop tipleri
export type RootStackNavigationProp = import('@react-navigation/stack').StackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = import('@react-navigation/bottom-tabs').BottomTabNavigationProp<MainTabParamList>;

// Screen props
export interface ScreenProps<T extends keyof RootStackParamList> {
  navigation: RootStackNavigationProp;
  route: import('@react-navigation/native').RouteProp<RootStackParamList, T>;
}
