import { useEffect, useRef, useState } from 'react';

import {
  createTimerState,
  DEFAULT_STUDY_DURATION_MS,
  formatRemainingTime,
  getRemainingMs,
  transitionTimer,
  type TimerEvent,
} from '@/features/timer/timer-state';

type UseTimerOptions = {
  durationMs?: number;
  now?: () => number;
  onComplete?: () => void;
  refreshIntervalMs?: number;
};

export function useTimer({
  durationMs = DEFAULT_STUDY_DURATION_MS,
  now = Date.now,
  onComplete,
  refreshIntervalMs = 250,
}: UseTimerOptions = {}) {
  const [state, setState] = useState(() => createTimerState(durationMs));
  const [, refresh] = useState(0);
  const completionReported = useRef(false);

  function send(event: TimerEvent) {
    setState((current) => transitionTimer(current, event, now()));
  }

  useEffect(() => {
    if (state.status !== 'running') return;

    const interval = setInterval(() => {
      const currentTime = now();
      setState((current) => transitionTimer(current, { type: 'tick' }, currentTime));
      refresh((value) => value + 1);
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [now, refreshIntervalMs, state.status]);

  useEffect(() => {
    if (state.status === 'running') {
      completionReported.current = false;
      return;
    }

    if (
      state.status === 'stopped' &&
      state.remainingMs === 0 &&
      !completionReported.current
    ) {
      completionReported.current = true;
      onComplete?.();
    }
  }, [onComplete, state]);

  const visibleStatus =
    state.status === 'confirmingReset' ? state.previousStatus : state.status;
  const remainingMs = getRemainingMs(state, now());

  return {
    state,
    visibleStatus,
    remainingMs,
    formattedTime: formatRemainingTime(remainingMs),
    start: () => send({ type: 'start' }),
    pause: () => send({ type: 'pause' }),
    resume: () => send({ type: 'resume' }),
    requestReset: () => send({ type: 'requestReset' }),
    cancelReset: () => send({ type: 'cancelReset' }),
    confirmReset: () => send({ type: 'confirmReset' }),
  };
}
