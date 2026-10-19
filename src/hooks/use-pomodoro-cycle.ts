import { useState } from 'react';

import {
  completePomodoroPhase,
  createPomodoroCycleState,
  DEFAULT_TARGET_POMODOROS,
  formatPomodoroProgress,
  getPomodoroPhaseDurationMs,
  getPomodoroPhaseName,
} from '@/features/pomodoro-cycle/pomodoro-cycle-state';

type UsePomodoroCycleOptions = {
  targetPomodoros?: number;
};

export function usePomodoroCycle({
  targetPomodoros = DEFAULT_TARGET_POMODOROS,
}: UsePomodoroCycleOptions = {}) {
  const [state, setState] = useState(() => createPomodoroCycleState(targetPomodoros));

  function completeCurrentPhase() {
    setState((current) => completePomodoroPhase(current, targetPomodoros));
  }

  return {
    state,
    phaseName: getPomodoroPhaseName(state.phase),
    progressLabel: formatPomodoroProgress(state),
    durationMs: getPomodoroPhaseDurationMs(state.phase),
    timerKey: `${state.phase}:${state.completedPomodoros}:${state.targetPomodoros}`,
    completeCurrentPhase,
  };
}
