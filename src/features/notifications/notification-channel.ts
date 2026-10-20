import {
  AndroidImportance,
  setNotificationChannelAsync,
} from 'expo-notifications';
import { Platform } from 'react-native';

export const POMODORO_NOTIFICATION_CHANNEL_ID = 'pomodoro-phase-end';

export async function configurePomodoroNotificationChannelAsync(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await setNotificationChannelAsync(
    POMODORO_NOTIFICATION_CHANNEL_ID,
    {
      name: 'Fin de fase',
      description: 'Avisos al finalizar una fase de Pomodoro.',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
      enableVibrate: true,
    },
  );
}
