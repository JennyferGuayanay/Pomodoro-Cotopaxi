import AsyncStorage from '@react-native-async-storage/async-storage';
import { createElement, type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { createPomodoroCycleState } from '@/features/pomodoro-cycle/pomodoro-cycle-state';
import { PomodoroConfigurationProvider } from '@/features/configuration/pomodoro-configuration-provider';
import {
  POMODORO_CONFIGURATION_SCHEMA_VERSION,
  POMODORO_CONFIGURATION_STORAGE_KEY,
} from '@/features/persistence/pomodoro-configuration-storage';
import {
  createPersistedPomodoroState,
  POMODORO_STATE_STORAGE_KEY,
  savePomodoroState,
} from '@/features/persistence/pomodoro-state-storage';
import { reconcilePomodoroPhaseNotificationsAsync } from '@/features/notifications/pomodoro-phase-notification';
import { createTimerState, transitionTimer } from '@/features/timer/timer-state';

import { usePomodoroSession } from '../use-pomodoro-session';

jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    jest.requireActual(
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
    ),
);

jest.mock('@/features/notifications/pomodoro-phase-notification', () => ({
  reconcilePomodoroPhaseNotificationsAsync: jest.fn(),
}));

const mockReconcilePomodoroPhaseNotificationsAsync = jest.mocked(
  reconcilePomodoroPhaseNotificationsAsync,
);

function Wrapper({ children }: PropsWithChildren) {
  return createElement(PomodoroConfigurationProvider, null, children);
}

describe('usePomodoroSession', () => {
  let appStateListener: ((state: AppStateStatus) => void) | undefined;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
    jest.clearAllMocks();
    mockReconcilePomodoroPhaseNotificationsAsync.mockResolvedValue(undefined);
    await AsyncStorage.clear();
    appStateListener = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (eventType, listener) => {
        if (eventType === 'change') appStateListener = listener;
        return { remove: jest.fn() };
      },
    );
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function renderReadySession(
    storedValue: string | null = null,
    configurationValue: string | null = null,
  ) {
    jest.spyOn(AsyncStorage, 'getItem').mockImplementation(async (key) => {
      if (key === POMODORO_CONFIGURATION_STORAGE_KEY) {
        return configurationValue;
      }
      return key === POMODORO_STATE_STORAGE_KEY ? storedValue : null;
    });
    const hook = await renderHook(() => usePomodoroSession(), { wrapper: Wrapper });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });
    for (let attempt = 0; attempt < 10 && !hook.result.current.isReady; attempt += 1) {
      await act(async () => Promise.resolve());
    }
    expect(hook.result.current.isReady).toBe(true);
    return hook;
  }

  test('restores phase, progress, and paused time before becoming ready', async () => {
    const stored = createPersistedPomodoroState(
      {
        phase: 'shortBreak',
        completedPomodoros: 2,
        targetPomodoros: 4,
      },
      {
        status: 'paused',
        durationMs: 5 * 60 * 1000,
        remainingMs: 42_000,
      },
      0,
    );
    let resolveStoredValue: ((value: string | null) => void) | undefined;
    jest.spyOn(AsyncStorage, 'getItem').mockImplementation((key) => {
      if (key === POMODORO_CONFIGURATION_STORAGE_KEY) {
        return Promise.resolve(null);
      }
      if (key !== POMODORO_STATE_STORAGE_KEY) return Promise.resolve(null);
      return new Promise((resolve) => {
        resolveStoredValue = resolve;
      });
    });

    const hook = await renderHook(() => usePomodoroSession(), { wrapper: Wrapper });

    expect(hook.result.current.isReady).toBe(false);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();

    const resolveStored = resolveStoredValue;
    if (!resolveStored) throw new Error('Expected a pending storage read.');
    await act(async () => {
      resolveStored(JSON.stringify(stored));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hook.result.current.isReady).toBe(true);
    expect(hook.result.current.phaseName).toBe('Descanso corto');
    expect(hook.result.current.progressLabel).toBe('Pomodoros completados: 2 de 4');
    expect(hook.result.current.timer.visibleStatus).toBe('paused');
    expect(hook.result.current.timer.formattedTime).toBe('00:42');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"remainingMs":42000'),
    );
  });

  test('keeps a prepared phase unchanged and uses saved durations for the next phase', async () => {
    const persisted = createPersistedPomodoroState(
      createPomodoroCycleState(),
      createTimerState(10_000),
      0,
    );
    const hook = await renderReadySession(JSON.stringify(persisted));
    const configuration = {
      studyDurationMinutes: 2,
      shortBreakDurationMinutes: 3,
      longBreakDurationMinutes: 1,
      pomodorosPerCycle: 4,
    };

    await act(async () => {
      await hook.result.current.saveConfiguration(configuration);
    });

    expect(hook.result.current.timer.formattedTime).toBe('00:10');
    expect(hook.result.current.timer.visibleStatus).toBe('stopped');

    await act(async () => hook.result.current.timer.start());
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10_000);
    });

    expect(hook.result.current.phaseName).toBe('Descanso corto');
    expect(hook.result.current.timer.visibleStatus).toBe('stopped');
    expect(hook.result.current.timer.formattedTime).toBe('03:00');
  });

  test('uses the locally restored duration when preparing a later phase', async () => {
    const persisted = createPersistedPomodoroState(
      {
        phase: 'shortBreak',
        completedPomodoros: 1,
        targetPomodoros: 4,
      },
      createTimerState(10),
      0,
    );
    const configuration = {
      studyDurationMinutes: 20,
      shortBreakDurationMinutes: 6,
      longBreakDurationMinutes: 13,
      pomodorosPerCycle: 5,
    };
    const hook = await renderReadySession(
      JSON.stringify(persisted),
      JSON.stringify({
        schemaVersion: POMODORO_CONFIGURATION_SCHEMA_VERSION,
        configuration,
      }),
    );

    await act(async () => hook.result.current.timer.start());
    await act(async () => {
      await jest.advanceTimersByTimeAsync(250);
    });

    expect(hook.result.current.phaseName).toBe('Estudio');
    expect(hook.result.current.progressLabel).toBe('Pomodoros completados: 1 de 4');
    expect(hook.result.current.timer.visibleStatus).toBe('stopped');
    expect(hook.result.current.timer.formattedTime).toBe('20:00');
  });

  test('keeps a paused phase duration and remaining time after a configuration save', async () => {
    const persisted = createPersistedPomodoroState(
      createPomodoroCycleState(),
      {
        status: 'paused',
        durationMs: 10_000,
        remainingMs: 4_000,
      },
      0,
    );
    const hook = await renderReadySession(JSON.stringify(persisted));

    await act(async () => {
      await hook.result.current.saveConfiguration({
        studyDurationMinutes: 30,
        shortBreakDurationMinutes: 7,
        longBreakDurationMinutes: 20,
        pomodorosPerCycle: 6,
      });
    });

    expect(hook.result.current.timer.visibleStatus).toBe('paused');
    expect(hook.result.current.timer.formattedTime).toBe('00:04');
  });

  test('keeps a running phase remaining time after a configuration save', async () => {
    const persisted = createPersistedPomodoroState(
      createPomodoroCycleState(),
      {
        status: 'running',
        durationMs: 10_000,
        endsAtMs: 10_000,
      },
      0,
    );
    const hook = await renderReadySession(JSON.stringify(persisted));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(3_000);
    });
    expect(hook.result.current.timer.formattedTime).toBe('00:07');

    await act(async () => {
      await hook.result.current.saveConfiguration({
        studyDurationMinutes: 30,
        shortBreakDurationMinutes: 7,
        longBreakDurationMinutes: 20,
        pomodorosPerCycle: 6,
      });
    });

    expect(hook.result.current.timer.visibleStatus).toBe('running');
    expect(hook.result.current.timer.formattedTime).toBe('00:07');
  });

  test('keeps the current cycle size until the long break ends', async () => {
    const persisted = createPersistedPomodoroState(
      {
        phase: 'study',
        completedPomodoros: 3,
        targetPomodoros: 4,
      },
      createTimerState(10),
      0,
    );
    const hook = await renderReadySession(JSON.stringify(persisted));

    await act(async () => {
      await hook.result.current.saveConfiguration({
        studyDurationMinutes: 2,
        shortBreakDurationMinutes: 3,
        longBreakDurationMinutes: 1,
        pomodorosPerCycle: 2,
      });
    });
    expect(hook.result.current.progressLabel).toBe('Pomodoros completados: 3 de 4');

    await act(async () => hook.result.current.timer.start());
    await act(async () => {
      await jest.advanceTimersByTimeAsync(250);
    });
    expect(hook.result.current.phaseName).toBe('Descanso largo');
    expect(hook.result.current.progressLabel).toBe('Pomodoros completados: 4 de 4');
    expect(hook.result.current.timer.formattedTime).toBe('01:00');

    await act(async () => hook.result.current.timer.start());
    await act(async () => {
      await jest.advanceTimersByTimeAsync(60_000);
    });
    expect(hook.result.current.phaseName).toBe('Estudio');
    expect(hook.result.current.progressLabel).toBe('Pomodoros completados: 0 de 2');
    expect(hook.result.current.timer.visibleStatus).toBe('stopped');
    expect(hook.result.current.timer.formattedTime).toBe('02:00');
  });

  test('reconciles a running timer against its completion mark on foreground return', async () => {
    const runningTimer = transitionTimer(
      createTimerState(10_000),
      { type: 'start' },
      0,
    );
    await savePomodoroState(
      createPersistedPomodoroState(createPomodoroCycleState(), runningTimer, 0),
    );
    const hook = await renderReadySession(
      JSON.stringify(
        createPersistedPomodoroState(createPomodoroCycleState(), runningTimer, 0),
      ),
    );

    expect(hook.result.current.timer.formattedTime).toBe('00:10');
    if (!appStateListener) throw new Error('Expected an AppState listener.');

    await act(async () => appStateListener?.('background'));
    jest.setSystemTime(4_000);
    await act(async () => appStateListener?.('active'));

    expect(hook.result.current.timer.visibleStatus).toBe('running');
    expect(hook.result.current.timer.formattedTime).toBe('00:06');
  });

  test('persists manual timer transitions without discounting a pause', async () => {
    const hook = await renderReadySession();

    await act(async () => hook.result.current.timer.start());
    expect(hook.result.current.timer.visibleStatus).toBe('running');

    jest.setSystemTime(2_000);
    await act(async () => hook.result.current.timer.pause());
    expect(hook.result.current.timer.visibleStatus).toBe('paused');

    jest.setSystemTime(30_000);
    await act(async () => appStateListener?.('background'));
    await act(async () => appStateListener?.('active'));

    expect(hook.result.current.timer.visibleStatus).toBe('paused');
    expect(hook.result.current.timer.formattedTime).toBe('24:58');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  test('schedules a local notification when a phase starts', async () => {
    const hook = await renderReadySession();

    await act(async () => hook.result.current.timer.start());
    await act(async () => Promise.resolve());

    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenCalledWith({
      phase: 'study',
      endsAtMs: 25 * 60 * 1000,
    });
  });

  test('reconciles a recovered running phase again on foreground return', async () => {
    const runningTimer = transitionTimer(
      createTimerState(10_000),
      { type: 'start' },
      0,
    );
    const persisted = createPersistedPomodoroState(
      createPomodoroCycleState(),
      runningTimer,
      0,
    );
    const hook = await renderReadySession(JSON.stringify(persisted));

    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenCalledWith({
      phase: 'study',
      endsAtMs: 10_000,
    });
    if (!appStateListener) throw new Error('Expected an AppState listener.');

    await act(async () => appStateListener?.('background'));
    jest.setSystemTime(4_000);
    await act(async () => appStateListener?.('active'));

    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenCalledTimes(2);
    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenLastCalledWith({
      phase: 'study',
      endsAtMs: 10_000,
    });
    expect(hook.result.current.timer.visibleStatus).toBe('running');
  });

  test('cancels on pause and reprograms the restored execution on resume', async () => {
    const hook = await renderReadySession();

    await act(async () => hook.result.current.timer.start());
    jest.setSystemTime(2_000);
    await act(async () => hook.result.current.timer.pause());

    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenLastCalledWith(
      null,
    );

    jest.setSystemTime(5_000);
    await act(async () => hook.result.current.timer.resume());

    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenLastCalledWith(
      {
        phase: 'study',
        endsAtMs: 1_503_000,
      },
    );
  });

  test('cancels for a reset request and restores only an active cancelled reset', async () => {
    const hook = await renderReadySession();

    await act(async () => hook.result.current.timer.start());
    jest.setSystemTime(2_000);
    await act(async () => hook.result.current.timer.requestReset());
    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenLastCalledWith(
      null,
    );

    jest.setSystemTime(5_000);
    await act(async () => hook.result.current.timer.cancelReset());
    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenLastCalledWith(
      {
        phase: 'study',
        endsAtMs: 1_503_000,
      },
    );

    await act(async () => hook.result.current.timer.requestReset());
    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenLastCalledWith(
      null,
    );
    await act(async () => hook.result.current.timer.confirmReset());
    expect(hook.result.current.timer.visibleStatus).toBe('stopped');
    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenLastCalledWith(
      null,
    );
  });

  test('reconciles a recovered paused state without an active notification', async () => {
    const pausedState = createPersistedPomodoroState(
      createPomodoroCycleState(),
      {
        status: 'paused',
        durationMs: 10_000,
        remainingMs: 5_000,
      },
      0,
    );
    await renderReadySession(JSON.stringify(pausedState));

    expect(mockReconcilePomodoroPhaseNotificationsAsync).toHaveBeenCalledWith(
      null,
    );
  });

  test('persists the cycle progress and prepared phase after a timer completion', async () => {
    const initial = createPersistedPomodoroState(
      createPomodoroCycleState(),
      createTimerState(1_000),
      0,
    );
    const hook = await renderReadySession(JSON.stringify(initial));

    await act(async () => hook.result.current.timer.start());
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1_000);
    });

    expect(hook.result.current.phaseName).toBe('Descanso corto');
    expect(hook.result.current.progressLabel).toBe('Pomodoros completados: 1 de 4');
    expect(hook.result.current.timer.visibleStatus).toBe('stopped');
    expect(hook.result.current.timer.formattedTime).toBe('05:00');

    await act(async () => Promise.resolve());
    const savedSnapshots = jest
      .mocked(AsyncStorage.setItem)
      .mock.calls.map(([, value]) => value);
    expect(
      savedSnapshots.some(
        (value) =>
          value.includes('"phase":"shortBreak"') &&
          value.includes('"completedPomodoros":1'),
      ),
    ).toBe(true);
  });
});
