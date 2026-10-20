import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications';
import { Platform } from 'react-native';

import { configurePomodoroNotificationChannelAsync } from './notification-channel';

export type NotificationPermissionPromptState =
  | 'notRequired'
  | 'granted'
  | 'requestable'
  | 'unavailable';

function requiresRuntimeNotificationPermission(): boolean {
  return Platform.OS === 'android' && Number(Platform.Version) >= 33;
}

export async function getNotificationPermissionPromptStateAsync(): Promise<NotificationPermissionPromptState> {
  if (!requiresRuntimeNotificationPermission()) return 'notRequired';

  await configurePomodoroNotificationChannelAsync();
  const permission = await getPermissionsAsync();

  if (permission.granted) return 'granted';
  return permission.canAskAgain ? 'requestable' : 'unavailable';
}

export async function requestPomodoroNotificationPermissionAsync(): Promise<boolean> {
  if (!requiresRuntimeNotificationPermission()) return true;

  await configurePomodoroNotificationChannelAsync();
  const currentPermission = await getPermissionsAsync();
  if (currentPermission.granted) return true;
  if (!currentPermission.canAskAgain) return false;

  const requestedPermission = await requestPermissionsAsync();
  return requestedPermission.granted;
}
