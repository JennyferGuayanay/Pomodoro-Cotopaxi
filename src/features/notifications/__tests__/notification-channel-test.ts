import {
  AndroidImportance,
  setNotificationChannelAsync,
} from 'expo-notifications';
import { Platform } from 'react-native';

import {
  configurePomodoroNotificationChannelAsync,
  POMODORO_NOTIFICATION_CHANNEL_ID,
} from '../notification-channel';

jest.mock('react-native', () => {
  return { Platform: { OS: 'android' } };
});

jest.mock('expo-notifications', () => ({
  AndroidImportance: {
    DEFAULT: 5,
  },
  setNotificationChannelAsync: jest.fn(),
}));

describe('configurePomodoroNotificationChannelAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });
    jest.mocked(setNotificationChannelAsync).mockResolvedValue(null);
  });

  test('creates the Android phase channel with default sound and vibration', async () => {
    await configurePomodoroNotificationChannelAsync();

    expect(setNotificationChannelAsync).toHaveBeenCalledWith(
      POMODORO_NOTIFICATION_CHANNEL_ID,
      {
        name: 'Fin de fase',
        description: 'Avisos al finalizar una fase de Pomodoro.',
        importance: AndroidImportance.DEFAULT,
        sound: 'default',
        enableVibrate: true,
      },
    );
  });

  test('does not configure an Android channel on other platforms', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });

    await expect(
      configurePomodoroNotificationChannelAsync(),
    ).resolves.toBeUndefined();

    expect(setNotificationChannelAsync).not.toHaveBeenCalled();
  });

  test('surfaces channel configuration errors', async () => {
    const error = new Error('Channel setup failed.');
    jest.mocked(setNotificationChannelAsync).mockRejectedValue(error);

    await expect(configurePomodoroNotificationChannelAsync()).rejects.toBe(error);
  });
});
