import { act, renderHook } from '@testing-library/react-native';
import {
  addNotificationResponseReceivedListener,
  clearLastNotificationResponse,
  getLastNotificationResponseAsync,
  type NotificationResponse,
} from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { usePomodoroNotificationResponse } from '../pomodoro-notification-response';

jest.mock('expo-notifications', () => ({
  addNotificationResponseReceivedListener: jest.fn(),
  clearLastNotificationResponse: jest.fn(),
  getLastNotificationResponseAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

const pomodoroResponse: NotificationResponse = {
  actionIdentifier: 'tap',
  notification: {
    date: 30_000,
    request: {
      identifier: 'pomodoro-notification',
      content: {
        title: 'Pomodoro',
        subtitle: null,
        body: 'Estudio terminado. Es momento de descansar.',
        data: {
          type: 'pomodoro-phase-end',
          executionId: 'study:30000',
          phase: 'study',
        },
        categoryIdentifier: null,
        sound: 'default',
        threadIdentifier: null,
      },
      trigger: null,
    },
  },
};

describe('usePomodoroNotificationResponse', () => {
  let responseListener: ((response: NotificationResponse) => void) | undefined;
  const removeListener = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });
    responseListener = undefined;
    jest.mocked(getLastNotificationResponseAsync).mockResolvedValue(null);
    jest
      .mocked(addNotificationResponseReceivedListener)
      .mockImplementation((listener) => {
        responseListener = listener;
        return { remove: removeListener };
      });
  });

  test('opens the Pomodoro tab when a phase notification is tapped', async () => {
    await renderHook(() => usePomodoroNotificationResponse());
    if (!responseListener) throw new Error('Expected a response listener.');

    await act(async () => responseListener?.(pomodoroResponse));

    expect(router.replace).toHaveBeenCalledWith('/');
    expect(clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  test('handles a response that launched the application', async () => {
    jest
      .mocked(getLastNotificationResponseAsync)
      .mockResolvedValue(pomodoroResponse);

    await act(async () => {
      await renderHook(() => usePomodoroNotificationResponse());
      await Promise.resolve();
    });

    expect(router.replace).toHaveBeenCalledWith('/');
    expect(clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  test('ignores responses that are not Pomodoro phase notifications', async () => {
    await renderHook(() => usePomodoroNotificationResponse());
    if (!responseListener) throw new Error('Expected a response listener.');
    const unrelatedResponse: NotificationResponse = {
      ...pomodoroResponse,
      notification: {
        ...pomodoroResponse.notification,
        request: {
          ...pomodoroResponse.notification.request,
          content: {
            ...pomodoroResponse.notification.request.content,
            data: { type: 'unrelated-notification' },
          },
        },
      },
    };

    await act(async () => responseListener?.(unrelatedResponse));

    expect(router.replace).not.toHaveBeenCalled();
    expect(clearLastNotificationResponse).not.toHaveBeenCalled();
  });

  test('handles a duplicate tap response only once', async () => {
    await renderHook(() => usePomodoroNotificationResponse());
    if (!responseListener) throw new Error('Expected a response listener.');

    await act(async () => {
      responseListener?.(pomodoroResponse);
      responseListener?.(pomodoroResponse);
    });

    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  test('removes the response listener on unmount', async () => {
    const hook = await renderHook(() => usePomodoroNotificationResponse());

    await act(async () => hook.unmount());

    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
