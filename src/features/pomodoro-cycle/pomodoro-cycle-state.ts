import {
  DEFAULT_POMODORO_CONFIGURATION,
  type PomodoroConfiguration,
} from '@/features/configuration/pomodoro-configuration';

export const DEFAULT_TARGET_POMODOROS = 4;
export const STUDY_DURATION_MS =
  DEFAULT_POMODORO_CONFIGURATION.studyDurationMinutes * 60 * 1000;
export const SHORT_BREAK_DURATION_MS =
  DEFAULT_POMODORO_CONFIGURATION.shortBreakDurationMinutes * 60 * 1000;
export const LONG_BREAK_DURATION_MS =
  DEFAULT_POMODORO_CONFIGURATION.longBreakDurationMinutes * 60 * 1000;

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

export function getPomodoroPhaseDurationMs(
  phase: PomodoroPhase,
  configuration: PomodoroConfiguration = DEFAULT_POMODORO_CONFIGURATION,
): number {
  switch (phase) {
    case "study":
      return configuration.studyDurationMinutes * 60 * 1000;
    case "shortBreak":
      return configuration.shortBreakDurationMinutes * 60 * 1000;
    case "longBreak":
      return configuration.longBreakDurationMinutes * 60 * 1000;
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
