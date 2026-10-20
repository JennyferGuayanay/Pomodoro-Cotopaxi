import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_TARGET_POMODOROS,
  type PomodoroCycleState,
  type PomodoroPhase,
} from '@/features/pomodoro-cycle/pomodoro-cycle-state';
import {
  DEFAULT_STUDY_DURATION_MS,
  getRemainingMs,
  type TimerState,
} from '@/features/timer/timer-state';

export const POMODORO_STATE_STORAGE_KEY = '@pomodoro-cotopaxi/timer-state';
export const POMODORO_STATE_SCHEMA_VERSION = 1;

export type PersistedTimerState =
  | {
      status: 'stopped' | 'paused';
      durationMs: number;
      remainingMs: number;
      endsAtMs: null;
    }
  | {
      status: 'running';
      durationMs: number;
      remainingMs: number;
      endsAtMs: number;
    }
  | {
      status: 'confirmingReset';
      durationMs: number;
      remainingMs: number;
      endsAtMs: null;
      previousStatus: 'running' | 'paused';
    };

export type PersistedPomodoroState = {
  schemaVersion: typeof POMODORO_STATE_SCHEMA_VERSION;
  cycle: PomodoroCycleState;
  timer: PersistedTimerState;
};

type RecoveredTimerState = Exclude<
  PersistedTimerState,
  { status: 'confirmingReset' }
>;

export type RecoveredPomodoroState = {
  schemaVersion: typeof POMODORO_STATE_SCHEMA_VERSION;
  cycle: PomodoroCycleState;
  timer: RecoveredTimerState;
};

export function createPersistedPomodoroState(
  cycle: PomodoroCycleState,
  timer: TimerState,
  nowMs = Date.now(),
): PersistedPomodoroState {
  const remainingMs = getRemainingMs(timer, nowMs);

  switch (timer.status) {
    case 'running':
      return {
        schemaVersion: POMODORO_STATE_SCHEMA_VERSION,
        cycle: { ...cycle },
        timer: {
          status: timer.status,
          durationMs: timer.durationMs,
          remainingMs,
          endsAtMs: timer.endsAtMs,
        },
      };
    case 'confirmingReset':
      return {
        schemaVersion: POMODORO_STATE_SCHEMA_VERSION,
        cycle: { ...cycle },
        timer: {
          status: timer.status,
          durationMs: timer.durationMs,
          remainingMs,
          endsAtMs: null,
          previousStatus: timer.previousStatus,
        },
      };
    case 'paused':
    case 'stopped':
      return {
        schemaVersion: POMODORO_STATE_SCHEMA_VERSION,
        cycle: { ...cycle },
        timer: {
          status: timer.status,
          durationMs: timer.durationMs,
          remainingMs,
          endsAtMs: null,
        },
      };
  }
}

export function isPersistedPomodoroState(
  value: unknown,
): value is PersistedPomodoroState {
  if (!isRecord(value) || value.schemaVersion !== POMODORO_STATE_SCHEMA_VERSION) {
    return false;
  }

  const { cycle, timer } = value;
  if (!isValidCycle(cycle) || !isRecord(timer)) return false;

  if (
    !isSafePositiveInteger(timer.durationMs) ||
    !isSafeNonNegativeInteger(timer.remainingMs)
  ) {
    return false;
  }

  switch (timer.status) {
    case 'running':
      return (
        isSafeNonNegativeInteger(timer.endsAtMs) &&
        !('previousStatus' in timer)
      );
    case 'confirmingReset':
      return (
        timer.endsAtMs === null &&
        timer.remainingMs <= timer.durationMs &&
        (timer.previousStatus === 'running' ||
          timer.previousStatus === 'paused')
      );
    case 'paused':
    case 'stopped':
      return (
        timer.endsAtMs === null &&
        timer.remainingMs <= timer.durationMs &&
        !('previousStatus' in timer)
      );
    default:
      return false;
  }
}

export async function savePomodoroState(state: unknown): Promise<void> {
  if (!isPersistedPomodoroState(state)) {
    throw new TypeError('Cannot save an invalid Pomodoro state.');
  }

  await AsyncStorage.setItem(
    POMODORO_STATE_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export async function loadPomodoroState(): Promise<PersistedPomodoroState> {
  const storedValue = await AsyncStorage.getItem(POMODORO_STATE_STORAGE_KEY);
  if (storedValue === null) return createSafeInitialPomodoroState();

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(storedValue);
  } catch (error) {
    if (error instanceof SyntaxError) return createSafeInitialPomodoroState();
    throw error;
  }

  return isPersistedPomodoroState(parsedValue)
    ? parsedValue
    : createSafeInitialPomodoroState();
}

export function recoverPomodoroState(
  value: unknown,
  nowMs: number,
): RecoveredPomodoroState {
  if (!isSafeNonNegativeInteger(nowMs)) {
    throw new RangeError('Recovery time must be a non-negative integer.');
  }

  if (!isPersistedPomodoroState(value)) {
    return createSafeInitialPomodoroState();
  }

  const { cycle, timer, schemaVersion } = value;
  switch (timer.status) {
    case 'running':
      return {
        schemaVersion,
        cycle: { ...cycle },
        timer: {
          status: 'running',
          durationMs: timer.durationMs,
          remainingMs: Math.max(0, timer.endsAtMs - nowMs),
          endsAtMs: timer.endsAtMs,
        },
      };
    case 'confirmingReset':
      return {
        schemaVersion,
        cycle: { ...cycle },
        timer: {
          status: 'paused',
          durationMs: timer.durationMs,
          remainingMs: timer.remainingMs,
          endsAtMs: null,
        },
      };
    case 'paused':
    case 'stopped':
      return {
        schemaVersion,
        cycle: { ...cycle },
        timer: { ...timer },
      };
  }
}

export function createSafeInitialPomodoroState(): RecoveredPomodoroState {
  return {
    schemaVersion: POMODORO_STATE_SCHEMA_VERSION,
    cycle: {
      phase: 'study',
      completedPomodoros: 0,
      targetPomodoros: DEFAULT_TARGET_POMODOROS,
    },
    timer: {
      status: 'stopped',
      durationMs: DEFAULT_STUDY_DURATION_MS,
      remainingMs: DEFAULT_STUDY_DURATION_MS,
      endsAtMs: null,
    },
  };
}

function isValidCycle(value: unknown): value is PomodoroCycleState {
  if (!isRecord(value)) return false;

  const { phase, completedPomodoros, targetPomodoros } = value;
  if (
    !isPomodoroPhase(phase) ||
    !isSafeNonNegativeInteger(completedPomodoros) ||
    !isSafePositiveInteger(targetPomodoros) ||
    completedPomodoros > targetPomodoros
  ) {
    return false;
  }

  switch (phase) {
    case 'study':
      return completedPomodoros < targetPomodoros;
    case 'shortBreak':
      return completedPomodoros > 0 && completedPomodoros < targetPomodoros;
    case 'longBreak':
      return completedPomodoros === targetPomodoros;
  }
}

function isPomodoroPhase(value: unknown): value is PomodoroPhase {
  return value === 'study' || value === 'shortBreak' || value === 'longBreak';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafePositiveInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}

function isSafeNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}
