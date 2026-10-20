import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';

import {
  DEFAULT_POMODORO_CONFIGURATION,
} from '../pomodoro-configuration';
import {
  PomodoroConfigurationProvider,
  usePomodoroConfiguration,
} from '../pomodoro-configuration-provider';

jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    jest.requireActual(
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
    ),
);

describe('PomodoroConfigurationProvider', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    jest.spyOn(Alert, 'alert').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('keeps the previous active configuration and reports a failed save', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    const hook = await renderHook(() => usePomodoroConfiguration(), {
      wrapper: PomodoroConfigurationProvider,
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(hook.result.current.isReady).toBe(true);

    const error = new Error('Storage unavailable');
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(error);
    let saveResult:
      | Awaited<
          ReturnType<typeof hook.result.current.saveConfiguration>
        >
      | undefined;

    await act(async () => {
      saveResult = await hook.result.current.saveConfiguration({
        studyDurationMinutes: 30,
        shortBreakDurationMinutes: 7,
        longBreakDurationMinutes: 20,
        pomodorosPerCycle: 6,
      });
    });

    expect(saveResult).toEqual({ status: 'writeError', error });
    expect(hook.result.current.configuration).toEqual(
      DEFAULT_POMODORO_CONFIGURATION,
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      'Configuración no guardada',
      'No se pudo guardar el cambio. Se conserva la configuración anterior.',
    );
  });
});
