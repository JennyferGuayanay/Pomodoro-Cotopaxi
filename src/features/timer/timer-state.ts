export const DEFAULT_STUDY_DURATION_MS = 25 * 60 * 1000;

type StoppedTimerState = {
  status: 'stopped';
  durationMs: number;
  remainingMs: number;
};

type RunningTimerState = {
  status: 'running';
  durationMs: number;
  endsAtMs: number;
};

type PausedTimerState = {
  status: 'paused';
  durationMs: number;
  remainingMs: number;
};

type ConfirmingResetTimerState = {
  status: 'confirmingReset';
  durationMs: number;
  remainingMs: number;
  previousStatus: 'running' | 'paused';
};

export type TimerState =
  | StoppedTimerState
  | RunningTimerState
  | PausedTimerState
  | ConfirmingResetTimerState;

export type TimerEvent =
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'requestReset' }
  | { type: 'cancelReset' }
  | { type: 'confirmReset' }
  | { type: 'tick' };

export function createTimerState(
  durationMs = DEFAULT_STUDY_DURATION_MS,
): TimerState {
  return {
    status: 'stopped',
    durationMs,
    remainingMs: durationMs,
  };
}

export function getRemainingMs(state: TimerState, nowMs: number): number {
  if (state.status === 'running') {
    return Math.max(0, state.endsAtMs - nowMs);
  }

  return Math.max(0, state.remainingMs);
}

export function transitionTimer(
  state: TimerState,
  event: TimerEvent,
  nowMs: number,
): TimerState {
  switch (event.type) {
    case 'start':
      if (state.status !== 'stopped') return state;
      return {
        status: 'running',
        durationMs: state.durationMs,
        endsAtMs: nowMs + state.durationMs,
      };

    case 'pause':
      if (state.status !== 'running') return state;
      return {
        status: 'paused',
        durationMs: state.durationMs,
        remainingMs: getRemainingMs(state, nowMs),
      };

    case 'resume':
      if (state.status !== 'paused') return state;
      return {
        status: 'running',
        durationMs: state.durationMs,
        endsAtMs: nowMs + state.remainingMs,
      };

    case 'requestReset':
      if (state.status !== 'running' && state.status !== 'paused') return state;
      return {
        status: 'confirmingReset',
        durationMs: state.durationMs,
        remainingMs: getRemainingMs(state, nowMs),
        previousStatus: state.status,
      };

    case 'cancelReset':
      if (state.status !== 'confirmingReset') return state;
      if (state.previousStatus === 'running') {
        return {
          status: 'running',
          durationMs: state.durationMs,
          endsAtMs: nowMs + state.remainingMs,
        };
      }
      return {
        status: 'paused',
        durationMs: state.durationMs,
        remainingMs: state.remainingMs,
      };

    case 'confirmReset':
      if (state.status !== 'confirmingReset') return state;
      return createTimerState(state.durationMs);

    case 'tick':
      if (state.status !== 'running' || getRemainingMs(state, nowMs) > 0) return state;
      return {
        status: 'stopped',
        durationMs: state.durationMs,
        remainingMs: 0,
      };
  }
}

export function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
