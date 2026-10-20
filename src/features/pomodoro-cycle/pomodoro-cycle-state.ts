export const DEFAULT_TARGET_POMODOROS = 4;
export const STUDY_DURATION_MS = 25 * 60 * 1000;
export const SHORT_BREAK_DURATION_MS = 5 * 60 * 1000;
export const LONG_BREAK_DURATION_MS = 15 * 60 * 1000;

export type PomodoroPhase = "study" | "shortBreak" | "longBreak";

export type PomodoroCycleState = {
  phase: PomodoroPhase;
  completedPomodoros: number;
  targetPomodoros: number;
};

export function createPomodoroCycleState(
  targetPomodoros = DEFAULT_TARGET_POMODOROS,
): PomodoroCycleState {
  return {
    phase: "study",
    completedPomodoros: 0,
    targetPomodoros,
  };
}

export function completePomodoroPhase(
  state: PomodoroCycleState,
  nextCycleTargetPomodoros = state.targetPomodoros,
): PomodoroCycleState {
  if (state.phase === "shortBreak") {
    return { ...state, phase: "study" };
  }

  if (state.phase === "longBreak") {
    return {
      phase: "study",
      completedPomodoros: 0,
      targetPomodoros: nextCycleTargetPomodoros,
    };
  }

  const completedPomodoros = state.completedPomodoros + 1;

  return {
    ...state,
    phase:
      completedPomodoros === state.targetPomodoros ? "longBreak" : "shortBreak",
    completedPomodoros,
  };
}

export function getPomodoroPhaseDurationMs(phase: PomodoroPhase): number {
  switch (phase) {
    case "study":
      return STUDY_DURATION_MS;
    case "shortBreak":
      return SHORT_BREAK_DURATION_MS;
    case "longBreak":
      return LONG_BREAK_DURATION_MS;
  }
}

export function getPomodoroPhaseName(phase: PomodoroPhase): string {
  switch (phase) {
    case "study":
      return "Estudio";
    case "shortBreak":
      return "Descanso corto";
    case "longBreak":
      return "Descanso largo";
  }
}

export function formatPomodoroProgress(state: PomodoroCycleState): string {
  return `Pomodoros completados: ${state.completedPomodoros} de ${state.targetPomodoros}`;
}
