import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  completePomodoroPhase,
  formatPomodoroProgress,
  getPomodoroPhaseDurationMs,
  getPomodoroPhaseName,
  type PomodoroCycleState,
  type PomodoroPhase,
} from '@/features/pomodoro-cycle/pomodoro-cycle-state';
import {
  createPersistedPomodoroState,
  createSafeInitialPomodoroState,
  loadPomodoroState,
  recoverPomodoroState,
  savePomodoroState,
  type RecoveredPomodoroState,
} from '@/features/persistence/pomodoro-state-storage';
import { reconcilePomodoroPhaseNotificationsAsync } from '@/features/notifications/pomodoro-phase-notification';
import {
  createTimerState,
  formatRemainingTime,
  getRemainingMs,
  transitionTimer,
  type TimerEvent,
  type TimerState,
} from '@/features/timer/timer-state';

type PomodoroSessionState = {
  cycle: PomodoroCycleState;
  timer: TimerState;
  completedPhase: PomodoroPhase | null;
};

function createSessionState(recovered: RecoveredPomodoroState): PomodoroSessionState {
  const { timer } = recovered;

  return {
    cycle: recovered.cycle,
    completedPhase: null,
    timer:
      timer.status === 'running'
        ? {
            status: 'running',
            durationMs: timer.durationMs,
            endsAtMs: timer.endsAtMs,
          }
        : {
            status: timer.status,
            durationMs: timer.durationMs,
            remainingMs: timer.remainingMs,
          },
  };
}

function createInitialSessionState(): PomodoroSessionState {
  const initial = createSafeInitialPomodoroState();

  return {
    cycle: initial.cycle,
    timer: createTimerState(initial.timer.durationMs),
    completedPhase: null,
  };
}

function logPersistenceError(error: unknown): void {
  console.error('Unable to persist or restore the Pomodoro session.', error);
}

function logNotificationError(error: unknown): void {
  console.error('Unable to reconcile Pomodoro phase-end notifications.', error);
}

export function usePomodoroSession() {
  const [session, setSession] = useState(createInitialSessionState);
  const [isReady, setIsReady] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now);
  const isReadyRef = useRef(false);
  const sessionRef = useRef(session);
  const writeQueue = useRef(Promise.resolve());

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const persisted = await loadPomodoroState();
        const restored = recoverPomodoroState(persisted, Date.now());
        if (!isMounted) return;

        setSession(createSessionState(restored));
        setNowMs(Date.now());
        isReadyRef.current = true;
        setIsReady(true);
      } catch (error) {
        logPersistenceError(error);
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const persisted = createPersistedPomodoroState(
      session.cycle,
      session.timer,
      Date.now(),
    );
    writeQueue.current = writeQueue.current
      .then(() => savePomodoroState(persisted))
      .catch(logPersistenceError);
  }, [isReady, session]);

  const notificationEndAtMs =
    session.timer.status === 'running' ? session.timer.endsAtMs : null;

  useEffect(() => {
    if (!isReady) return;

    const activeExecution =
      notificationEndAtMs === null
        ? null
        : {
            phase: session.cycle.phase,
            endsAtMs: notificationEndAtMs,
          };

    void reconcilePomodoroPhaseNotificationsAsync(activeExecution).catch(
      logNotificationError,
    );
  }, [isReady, notificationEndAtMs, session.cycle.phase]);

  useEffect(() => {
    let previousAppState: string = AppState.currentState ?? 'active';
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const returnedToForeground =
        nextAppState === 'active' && previousAppState !== 'active';
      previousAppState = nextAppState;
      if (!returnedToForeground || !isReadyRef.current) return;

      const resumedAtMs = Date.now();
      setNowMs(resumedAtMs);
      const current = sessionRef.current;
      const persisted = createPersistedPomodoroState(
        current.cycle,
        current.timer,
        resumedAtMs,
      );
      const recovered = recoverPomodoroState(persisted, resumedAtMs);
      const activeExecution =
        recovered.timer.status === 'running'
          ? {
              phase: recovered.cycle.phase,
              endsAtMs: recovered.timer.endsAtMs,
            }
          : null;
      void reconcilePomodoroPhaseNotificationsAsync(activeExecution).catch(
        logNotificationError,
      );
      setSession(createSessionState(recovered));
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isReady || session.timer.status !== 'running') return;

    const interval = setInterval(() => {
      const tickAtMs = Date.now();
      setNowMs(tickAtMs);
      setSession((current) => {
        const nextTimer = transitionTimer(
          current.timer,
          { type: 'tick' },
          tickAtMs,
        );
        if (nextTimer === current.timer) return current;

        if (nextTimer.status === 'stopped' && nextTimer.remainingMs === 0) {
          const nextCycle = completePomodoroPhase(current.cycle);
          return {
            cycle: nextCycle,
            timer: createTimerState(getPomodoroPhaseDurationMs(nextCycle.phase)),
            completedPhase: current.cycle.phase,
          };
        }

        return { ...current, timer: nextTimer };
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isReady, session.timer.status]);

  function sendTimerEvent(event: TimerEvent) {
    const eventAtMs = Date.now();
    setNowMs(eventAtMs);
    setSession((current) => {
      const nextTimer = transitionTimer(current.timer, event, eventAtMs);
      return {
        ...current,
        timer: nextTimer,
        completedPhase: event.type === 'start' ? null : current.completedPhase,
      };
    });
  }

  const remainingMs = getRemainingMs(session.timer, nowMs);
  const visibleStatus =
    session.timer.status === 'confirmingReset'
      ? session.timer.previousStatus
      : session.timer.status;

  return {
    isReady,
    cycle: session.cycle,
    phaseName: getPomodoroPhaseName(session.cycle.phase),
    progressLabel: formatPomodoroProgress(session.cycle),
    completedPhase: session.completedPhase,
    timer: {
      visibleStatus,
      formattedTime: formatRemainingTime(remainingMs),
      start: () => sendTimerEvent({ type: 'start' }),
      pause: () => sendTimerEvent({ type: 'pause' }),
      resume: () => sendTimerEvent({ type: 'resume' }),
      requestReset: () => sendTimerEvent({ type: 'requestReset' }),
      cancelReset: () => sendTimerEvent({ type: 'cancelReset' }),
      confirmReset: () => sendTimerEvent({ type: 'confirmReset' }),
    },
  };
}
