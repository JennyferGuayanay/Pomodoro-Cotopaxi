import { useEffect } from 'react';
import {
  addNotificationResponseReceivedListener,
  clearLastNotificationResponse,
  getLastNotificationResponseAsync,
  type NotificationResponse,
} from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPomodoroPhaseResponse(response: NotificationResponse): boolean {
  const data: unknown = response.notification.request.content.data;
  if (!isRecord(data)) return false;

  return (
    data.type === 'pomodoro-phase-end' &&
    typeof data.executionId === 'string' &&
    (data.phase === 'study' ||
      data.phase === 'shortBreak' ||
      data.phase === 'longBreak')
  );
}

function logResponseError(error: unknown): void {
  console.error('Unable to handle the Pomodoro notification response.', error);
}

export function usePomodoroNotificationResponse(): void {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let isMounted = true;
    const handledResponseIds = new Set<string>();

    function handleResponse(response: NotificationResponse): void {
      if (!isMounted || !isPomodoroPhaseResponse(response)) return;

      const responseId = `${response.notification.request.identifier}:${response.actionIdentifier}`;
      if (handledResponseIds.has(responseId)) return;
      handledResponseIds.add(responseId);

      router.replace('/');
      clearLastNotificationResponse();
    }

    const subscription = addNotificationResponseReceivedListener(handleResponse);
    void getLastNotificationResponseAsync()
      .then((response) => {
        if (response) handleResponse(response);
      })
      .catch(logResponseError);

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
