import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_POMODORO_CONFIGURATION,
  type PomodoroConfiguration,
} from '@/features/configuration/pomodoro-configuration';
import {
  loadPomodoroConfiguration,
  POMODORO_CONFIGURATION_SCHEMA_VERSION,
  POMODORO_CONFIGURATION_STORAGE_KEY,
  savePomodoroConfiguration,
} from '../pomodoro-configuration-storage';

jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    jest.requireActual(
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
    ),
);

const savedConfiguration: PomodoroConfiguration = {
  studyDurationMinutes: 30,
  shortBreakDurationMinutes: 8,
  longBreakDurationMinutes: 18,
  pomodorosPerCycle: 5,
};

describe('Pomodoro configuration storage', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('uses defaults when no configuration has been stored', async () => {
    await expect(loadPomodoroConfiguration()).resolves.toEqual({
      status: 'loaded',
      configuration: DEFAULT_POMODORO_CONFIGURATION,
    });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('persists and restores the complete configuration as one record', async () => {
    await expect(
      savePomodoroConfiguration(savedConfiguration),
    ).resolves.toEqual({
      status: 'saved',
      configuration: savedConfiguration,
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      POMODORO_CONFIGURATION_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: POMODORO_CONFIGURATION_SCHEMA_VERSION,
        configuration: savedConfiguration,
      }),
    );
    await expect(loadPomodoroConfiguration()).resolves.toEqual({
      status: 'loaded',
      configuration: savedConfiguration,
    });
  });

  test.each([
    ['malformed JSON', '{invalid'],
    [
      'incomplete configuration',
      JSON.stringify({
        schemaVersion: POMODORO_CONFIGURATION_SCHEMA_VERSION,
        configuration: { studyDurationMinutes: 40 },
      }),
    ],
    [
      'configuration with invalid values',
      JSON.stringify({
        schemaVersion: POMODORO_CONFIGURATION_SCHEMA_VERSION,
        configuration: {
          ...savedConfiguration,
          pomodorosPerCycle: 0,
        },
      }),
    ],
    [
      'an incompatible schema',
      JSON.stringify({
        schemaVersion: POMODORO_CONFIGURATION_SCHEMA_VERSION + 1,
        configuration: savedConfiguration,
      }),
    ],
    ['a record with the wrong shape', JSON.stringify(savedConfiguration)],
  ])('uses defaults for %s without rewriting it', async (_description, value) => {
    await AsyncStorage.setItem(POMODORO_CONFIGURATION_STORAGE_KEY, value);
    jest.clearAllMocks();

    await expect(loadPomodoroConfiguration()).resolves.toEqual({
      status: 'loaded',
      configuration: DEFAULT_POMODORO_CONFIGURATION,
    });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    await expect(
      AsyncStorage.getItem(POMODORO_CONFIGURATION_STORAGE_KEY),
    ).resolves.toBe(value);
  });

  test('reports a read error with defaults and does not overwrite stored data', async () => {
    const error = new Error('Storage unavailable');
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(error);

    await expect(loadPomodoroConfiguration()).resolves.toEqual({
      status: 'readError',
      configuration: DEFAULT_POMODORO_CONFIGURATION,
      error,
    });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('rejects an invalid set without writing any fields', async () => {
    const result = await savePomodoroConfiguration({
      ...savedConfiguration,
      shortBreakDurationMinutes: 0,
    });

    expect(result).toEqual({
      status: 'invalid',
      invalidFields: ['shortBreakDurationMinutes'],
    });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('reports a write error and leaves the previous stored set intact', async () => {
    await savePomodoroConfiguration(savedConfiguration);
    const previousValue = await AsyncStorage.getItem(
      POMODORO_CONFIGURATION_STORAGE_KEY,
    );
    const error = new Error('Storage unavailable');
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(error);

    await expect(
      savePomodoroConfiguration({
        ...savedConfiguration,
        studyDurationMinutes: 45,
      }),
    ).resolves.toEqual({ status: 'writeError', error });

    await expect(
      AsyncStorage.getItem(POMODORO_CONFIGURATION_STORAGE_KEY),
    ).resolves.toBe(previousValue);
  });
});
