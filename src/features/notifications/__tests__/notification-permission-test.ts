import {
  getPermissionsAsync,
  PermissionStatus,
  requestPermissionsAsync,
} from 'expo-notifications';
import { Platform } from 'react-native';

import { configurePomodoroNotificationChannelAsync } from '../notification-channel';
import {
  getNotificationPermissionPromptStateAsync,
  requestPomodoroNotificationPermissionAsync,
} from '../notification-permission';

jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 33 },
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  PermissionStatus: {
    GRANTED: 'granted',
    UNDETERMINED: 'undetermined',
    DENIED: 'denied',
  },
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('../notification-channel', () => ({
  configurePomodoroNotificationChannelAsync: jest.fn(),
}));

describe('Pomodoro notification permission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });
    Object.defineProperty(Platform, 'Version', {
      configurable: true,
      value: 33,
    });
    jest
      .mocked(configurePomodoroNotificationChannelAsync)
      .mockResolvedValue(undefined);
    jest.mocked(getPermissionsAsync).mockResolvedValue({
      status: PermissionStatus.UNDETERMINED,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    });
    jest.mocked(requestPermissionsAsync).mockResolvedValue({
      status: PermissionStatus.DENIED,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    });
  });

  test('prepares the Android channel before checking runtime permission', async () => {
    const callOrder: string[] = [];
    jest
      .mocked(configurePomodoroNotificationChannelAsync)
      .mockImplementation(async () => {
        callOrder.push('channel');
      });
    jest.mocked(getPermissionsAsync).mockImplementation(async () => {
      callOrder.push('permission');
      return {
        status: PermissionStatus.UNDETERMINED,
        granted: false,
        canAskAgain: true,
        expires: 'never',
      };
    });

    await expect(getNotificationPermissionPromptStateAsync()).resolves.toBe(
      'requestable',
    );

    expect(callOrder).toEqual(['channel', 'permission']);
  });

  test('does not request permission when it is already granted', async () => {
    jest.mocked(getPermissionsAsync).mockResolvedValue({
      status: PermissionStatus.GRANTED,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });

    await expect(getNotificationPermissionPromptStateAsync()).resolves.toBe(
      'granted',
    );
    await expect(
      requestPomodoroNotificationPermissionAsync(),
    ).resolves.toBe(true);

    expect(requestPermissionsAsync).not.toHaveBeenCalled();
  });

  test('returns false when the user denies the Android permission request', async () => {
    const callOrder: string[] = [];
    jest
      .mocked(configurePomodoroNotificationChannelAsync)
      .mockImplementation(async () => {
        callOrder.push('channel');
      });
    jest.mocked(getPermissionsAsync).mockImplementation(async () => {
      callOrder.push('permission');
      return {
        status: PermissionStatus.UNDETERMINED,
        granted: false,
        canAskAgain: true,
        expires: 'never',
      };
    });
    jest.mocked(requestPermissionsAsync).mockImplementation(async () => {
      callOrder.push('request');
      return {
        status: PermissionStatus.DENIED,
        granted: false,
        canAskAgain: true,
        expires: 'never',
      };
    });

    await expect(
      requestPomodoroNotificationPermissionAsync(),
    ).resolves.toBe(false);
    expect(callOrder).toEqual(['channel', 'permission', 'request']);
  });

  test('does not request runtime permission below Android 13', async () => {
    Object.defineProperty(Platform, 'Version', {
      configurable: true,
      value: 32,
    });

    await expect(getNotificationPermissionPromptStateAsync()).resolves.toBe(
      'notRequired',
    );
    await expect(
      requestPomodoroNotificationPermissionAsync(),
    ).resolves.toBe(true);

    expect(configurePomodoroNotificationChannelAsync).not.toHaveBeenCalled();
    expect(getPermissionsAsync).not.toHaveBeenCalled();
    expect(requestPermissionsAsync).not.toHaveBeenCalled();
  });

  test('does not request again when Android reports permission is no longer askable', async () => {
    jest.mocked(getPermissionsAsync).mockResolvedValue({
      status: PermissionStatus.DENIED,
      granted: false,
      canAskAgain: false,
      expires: 'never',
    });

    await expect(getNotificationPermissionPromptStateAsync()).resolves.toBe(
      'unavailable',
    );
    await expect(
      requestPomodoroNotificationPermissionAsync(),
    ).resolves.toBe(false);

    expect(requestPermissionsAsync).not.toHaveBeenCalled();
  });
});
