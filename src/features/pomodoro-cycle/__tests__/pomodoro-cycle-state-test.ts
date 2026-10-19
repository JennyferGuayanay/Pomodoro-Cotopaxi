import {
  completePomodoroPhase,
  createPomodoroCycleState,
  DEFAULT_TARGET_POMODOROS,
  formatPomodoroProgress,
  getPomodoroPhaseDurationMs,
  getPomodoroPhaseName,
  LONG_BREAK_DURATION_MS,
  SHORT_BREAK_DURATION_MS,
  STUDY_DURATION_MS,
  type PomodoroCycleState,
} from '../pomodoro-cycle-state';

describe('pomodoro cycle state', () => {
  test('starts with study and zero of four completed pomodoros', () => {
    expect(createPomodoroCycleState()).toEqual({
      phase: 'study',
      completedPomodoros: 0,
      targetPomodoros: DEFAULT_TARGET_POMODOROS,
    });
  });

  test.each([
    ['study', STUDY_DURATION_MS],
    ['shortBreak', SHORT_BREAK_DURATION_MS],
    ['longBreak', LONG_BREAK_DURATION_MS],
  ] as const)('uses the provisional duration for %s', (phase, durationMs) => {
    expect(getPomodoroPhaseDurationMs(phase)).toBe(durationMs);
  });

  test.each([
    ['study', 'Estudio'],
    ['shortBreak', 'Descanso corto'],
    ['longBreak', 'Descanso largo'],
  ] as const)('uses the approved name for %s', (phase, name) => {
    expect(getPomodoroPhaseName(phase)).toBe(name);
  });

  test.each([0, 1, 2])(
    'prepares a short break after study with %i previous completions',
    (completedPomodoros) => {
      const state: PomodoroCycleState = {
        phase: 'study',
        completedPomodoros,
        targetPomodoros: 4,
      };

      expect(completePomodoroPhase(state)).toEqual({
        phase: 'shortBreak',
        completedPomodoros: completedPomodoros + 1,
        targetPomodoros: 4,
      });
    },
  );

  test('prepares a long break and keeps four of four visible', () => {
    const state: PomodoroCycleState = {
      phase: 'study',
      completedPomodoros: 3,
      targetPomodoros: 4,
    };

    const next = completePomodoroPhase(state);

    expect(next).toEqual({
      phase: 'longBreak',
      completedPomodoros: 4,
      targetPomodoros: 4,
    });
    expect(formatPomodoroProgress(next)).toBe('Pomodoros completados: 4 de 4');
  });

  test('returns to study after a short break without changing progress', () => {
    const state: PomodoroCycleState = {
      phase: 'shortBreak',
      completedPomodoros: 2,
      targetPomodoros: 4,
    };

    expect(completePomodoroPhase(state)).toEqual({
      phase: 'study',
      completedPomodoros: 2,
      targetPomodoros: 4,
    });
  });

  test('returns to study and resets progress after a long break', () => {
    const state: PomodoroCycleState = {
      phase: 'longBreak',
      completedPomodoros: 4,
      targetPomodoros: 4,
    };

    const next = completePomodoroPhase(state);

    expect(next).toEqual({
      phase: 'study',
      completedPomodoros: 0,
      targetPomodoros: 4,
    });
    expect(formatPomodoroProgress(next)).toBe('Pomodoros completados: 0 de 4');
  });

  test('applies a new target only after the long break ends', () => {
    const longBreak: PomodoroCycleState = {
      phase: 'longBreak',
      completedPomodoros: 4,
      targetPomodoros: 4,
    };

    expect(completePomodoroPhase(longBreak, 6)).toEqual({
      phase: 'study',
      completedPomodoros: 0,
      targetPomodoros: 6,
    });
  });
});
