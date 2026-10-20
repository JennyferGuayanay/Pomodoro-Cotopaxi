import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createPersistedPomodoroState,
  createSafeInitialPomodoroState,
  isPersistedPomodoroState,
  loadPomodoroState,
  POMODORO_STATE_SCHEMA_VERSION,
  POMODORO_STATE_STORAGE_KEY,
  recoverPomodoroState,
  savePomodoroState,
} from '../pomodoro-state-storage';
import { createPomodoroCycleState } from '../../pomodoro-cycle/pomodoro-cycle-state';
import {
  createTimerState,
  formatRemainingTime,
  transitionTimer,
} from '../../timer/timer-state';

jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    jest.requireActual(
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
    ),
);

describe('Pomodoro state storage', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('persists a stopped timer and the cycle with its schema version', async () => {
    const state = createPersistedPomodoroState(
      createPomodoroCycleState(),
      createTimerState(),
    );

    await savePomodoroState(state);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      POMODORO_STATE_STORAGE_KEY,
      JSON.stringify({
        ...state,
        schemaVersion: POMODORO_STATE_SCHEMA_VERSION,
      }),
    );
    await expect(loadPomodoroState()).resolves.toEqual(state);
  });

  test('saves and loads a non-initial phase and cycle progress', async () => {
    const state = createPersistedPomodoroState(
      {
        phase: 'shortBreak',
        completedPomodoros: 3,
        targetPomodoros: 4,
      },
      createTimerState(5 * 60 * 1000),
    );

    await savePomodoroState(state);

    await expect(loadPomodoroState()).resolves.toEqual(state);
  });

  test('persists remaining time and completion mark for a running timer', () => {
    const runningTimer = transitionTimer(
      createTimerState(10_000),
      { type: 'start' },
      2_000,
    );

    expect(
      createPersistedPomodoroState(
        createPomodoroCycleState(),
        runningTimer,
        5_000,
      ),
    ).toEqual({
      schemaVersion: POMODORO_STATE_SCHEMA_VERSION,
      cycle: createPomodoroCycleState(),
      timer: {
        status: 'running',
        durationMs: 10_000,
        remainingMs: 7_000,
        endsAtMs: 12_000,
      },
    });
  });

  describe('Pomodoro state recovery', () => {
    const cycle = {
      phase: 'shortBreak' as const,
      completedPomodoros: 2,
      targetPomodoros: 4,
    };

    test('recalculates running time from the completion mark', () => {
      const state = createPersistedPomodoroState(
        cycle,
        transitionTimer(
          createTimerState(10_000),
          { type: 'start' },
          1_000,
        ),
      );

      expect(recoverPomodoroState(state, 4_000)).toEqual({
        ...state,
        timer: {
          status: 'running',
          durationMs: 10_000,
          remainingMs: 7_000,
          endsAtMs: 11_000,
        },
      });
    });

    test.each([
      [11_000, 0],
      [12_500, 0],
    ])(
      'clamps a running timer at zero when now is %i ms',
      (nowMs, expectedRemainingMs) => {
        const state = createPersistedPomodoroState(
          cycle,
          {
            status: 'running',
            durationMs: 10_000,
            endsAtMs: 11_000,
          },
        );

        const recovered = recoverPomodoroState(state, nowMs);

        expect(recovered.timer.status).toBe('running');
        expect(recovered.timer.remainingMs).toBe(expectedRemainingMs);
        expect(recovered.timer.remainingMs).toBeGreaterThanOrEqual(0);
      },
    );

    test.each([
      [9_000, 52_000, '00:52'],
      [10_000, 51_000, '00:51'],
      [11_000, 50_000, '00:50'],
    ])(
      'keeps visible time within one second when recovery time is %i ms',
      (nowMs, expectedRemainingMs, expectedDisplay) => {
        const state = createPersistedPomodoroState(cycle, {
          status: 'running',
          durationMs: 60_000,
          endsAtMs: 61_000,
        });
        const recovered = recoverPomodoroState(state, nowMs);

        expect(recovered.timer.status).toBe('running');
        if (recovered.timer.status !== 'running') {
          throw new Error('Expected a running timer.');
        }
        expect(
          Math.abs(recovered.timer.remainingMs - 51_000),
        ).toBeLessThanOrEqual(1_000);
        expect(recovered.timer.remainingMs).toBe(expectedRemainingMs);
        expect(formatRemainingTime(recovered.timer.remainingMs)).toBe(
          expectedDisplay,
        );
      },
    );

    test('preserves paused time independent of the absence duration', () => {
      const state = createPersistedPomodoroState(cycle, {
        status: 'paused',
        durationMs: 10_000,
        remainingMs: 4_321,
      });

      expect(recoverPomodoroState(state, 50_000).timer).toEqual({
        status: 'paused',
        durationMs: 10_000,
        remainingMs: 4_321,
        endsAtMs: null,
      });
    });

    test('keeps a stopped timer stopped with its original remaining time', () => {
      const state = createPersistedPomodoroState(cycle, {
        status: 'stopped',
        durationMs: 10_000,
        remainingMs: 4_321,
      });

      expect(recoverPomodoroState(state, 50_000).timer).toEqual({
        status: 'stopped',
        durationMs: 10_000,
        remainingMs: 4_321,
        endsAtMs: null,
      });
    });

    test('recovers reset confirmation as paused without reopening the confirmation', () => {
      const state = createPersistedPomodoroState(cycle, {
        status: 'confirmingReset',
        durationMs: 10_000,
        remainingMs: 4_321,
        previousStatus: 'running',
      });

      expect(recoverPomodoroState(state, 50_000).timer).toEqual({
        status: 'paused',
        durationMs: 10_000,
        remainingMs: 4_321,
        endsAtMs: null,
      });
    });

    test('uses the safe initial state for invalid recovery input', () => {
      const recovered = recoverPomodoroState(
        {
          schemaVersion: POMODORO_STATE_SCHEMA_VERSION,
          cycle,
          timer: {
            status: 'paused',
            durationMs: 10_000,
            remainingMs: -1,
            endsAtMs: null,
          },
        },
        50_000,
      );

      expect(recovered).toEqual(createSafeInitialPomodoroState());
      expect(recovered.timer.remainingMs).toBeGreaterThanOrEqual(0);
    });
  });

  test('persists a paused timer without a completion mark', () => {
    const runningTimer = transitionTimer(
      createTimerState(10_000),
      { type: 'start' },
      2_000,
    );
    const pausedTimer = transitionTimer(
      runningTimer,
      { type: 'pause' },
      5_000,
    );

    expect(
      createPersistedPomodoroState(
        createPomodoroCycleState(),
        pausedTimer,
        50_000,
      ).timer,
    ).toEqual({
      status: 'paused',
      durationMs: 10_000,
      remainingMs: 7_000,
      endsAtMs: null,
    });
  });

  test('persists reset confirmation as a suspended timer state', () => {
    const runningTimer = transitionTimer(
      createTimerState(10_000),
      { type: 'start' },
      2_000,
    );
    const confirmingTimer = transitionTimer(
      runningTimer,
      { type: 'requestReset' },
      5_000,
    );

    expect(
      createPersistedPomodoroState(
        createPomodoroCycleState(),
        confirmingTimer,
      ).timer,
    ).toEqual({
      status: 'confirmingReset',
      durationMs: 10_000,
      remainingMs: 7_000,
      endsAtMs: null,
      previousStatus: 'running',
    });
  });

  test('loads the safe initial state when no data is stored', async () => {
    await expect(loadPomodoroState()).resolves.toEqual(
      createSafeInitialPomodoroState(),
    );
  });

  test.each([
    ['malformed JSON', '{'],
    ['unsupported schema version', '{"schemaVersion":99}'],
    ['incomplete state', '{"schemaVersion":1,"cycle":{},"timer":{}}'],
    [
      'invalid phase and progress combination',
      JSON.stringify({
        ...createSafeInitialPomodoroState(),
        cycle: {
          phase: 'longBreak',
          completedPomodoros: 0,
          targetPomodoros: 4,
        },
      }),
    ],
    [
      'negative remaining time',
      JSON.stringify({
        ...createSafeInitialPomodoroState(),
        timer: {
          ...createSafeInitialPomodoroState().timer,
          remainingMs: -1,
        },
      }),
    ],
    [
      'running timer without a completion mark',
      JSON.stringify({
        ...createSafeInitialPomodoroState(),
        timer: {
          ...createSafeInitialPomodoroState().timer,
          status: 'running',
        },
      }),
    ],
  ])('loads the safe initial state for %s', async (_description, rawValue) => {
    await AsyncStorage.setItem(POMODORO_STATE_STORAGE_KEY, rawValue);

    await expect(loadPomodoroState()).resolves.toEqual(
      createSafeInitialPomodoroState(),
    );
  });

  test('does not write an invalid state', async () => {
    const invalidState = {
      ...createSafeInitialPomodoroState(),
      timer: {
        ...createSafeInitialPomodoroState().timer,
        remainingMs: -1,
      },
    };

    await expect(savePomodoroState(invalidState)).rejects.toThrow(
      'Cannot save an invalid Pomodoro state.',
    );
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('rejects cycle progress that cannot occur for its phase', () => {
    const safeState = createSafeInitialPomodoroState();

    expect(
      isPersistedPomodoroState({
        ...safeState,
        cycle: {
          phase: 'shortBreak',
          completedPomodoros: 0,
          targetPomodoros: 4,
        },
      }),
    ).toBe(false);
  });

  test('propagates storage read errors instead of disguising them as missing data', async () => {
    jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('Storage unavailable'));

    await expect(loadPomodoroState()).rejects.toThrow('Storage unavailable');
  });
});
