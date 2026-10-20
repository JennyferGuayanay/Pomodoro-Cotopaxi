import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { PomodoroConfigurationProvider } from '@/features/configuration/pomodoro-configuration-provider';
import { configurePomodoroNotificationChannelAsync } from '@/features/notifications/notification-channel';
import { usePomodoroNotificationResponse } from '@/features/notifications/pomodoro-notification-response';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  usePomodoroNotificationResponse();

  useEffect(() => {
    void configurePomodoroNotificationChannelAsync().catch((error: unknown) => {
      console.error('Unable to configure the Pomodoro notification channel.', error);
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PomodoroConfigurationProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </PomodoroConfigurationProvider>
    </ThemeProvider>
  );
}
