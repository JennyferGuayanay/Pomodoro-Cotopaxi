import { act, renderHook } from '@testing-library/react-native';

import {
  LONG_BREAK_DURATION_MS,
  SHORT_BREAK_DURATION_MS,
  STUDY_DURATION_MS,
} from '@/features/pomodoro-cycle/pomodoro-cycle-state';

import { usePomodoroCycle } from '../use-pomodoro-cycle';

describe('usePomodoroCycle', () => {
  test('exposes the approved initial cycle', async () => {
    const { result } = await renderHook(() => usePomodoroCycle());

    expect(result.current.state).toEqual({
      phase: 'study',
      completedPomodoros: 0,
      targetPomodoros: 4,
    });
    expect(result.current.phaseName).toBe('Estudio');
    expect(result.current.progressLabel).toBe('Pomodoros completados: 0 de 4');
    expect(result.current.durationMs).toBe(STUDY_DURATION_MS);
  });

  test('prepares each next phase with its duration and progress', async () => {
    const { result } = await renderHook(() => usePomodoroCycle());

    await act(() => result.current.completeCurrentPhase());
    expect(result.current.phaseName).toBe('Descanso corto');
    expect(result.current.progressLabel).toBe('Pomodoros completados: 1 de 4');
    expect(result.current.durationMs).toBe(SHORT_BREAK_DURATION_MS);

    await act(() => result.current.completeCurrentPhase());
    expect(result.current.phaseName).toBe('Estudio');
    expect(result.current.progressLabel).toBe('Pomodoros completados: 1 de 4');
    expect(result.current.durationMs).toBe(STUDY_DURATION_MS);

    for (let completed = 2; completed <= 4; completed += 1) {
      await act(() => result.current.completeCurrentPhase());
      if (completed < 4) {
        expect(result.current.phaseName).toBe('Descanso corto');
        await act(() => result.current.completeCurrentPhase());
      }
    }

    expect(result.current.phaseName).toBe('Descanso largo');
    expect(result.current.progressLabel).toBe('Pomodoros completados: 4 de 4');
    expect(result.current.durationMs).toBe(LONG_BREAK_DURATION_MS);

    await act(() => result.current.completeCurrentPhase());
    expect(result.current.phaseName).toBe('Estudio');
    expect(result.current.progressLabel).toBe('Pomodoros completados: 0 de 4');
  });

  test('keeps the current target and applies a changed target to the next cycle', async () => {
    let targetPomodoros = 4;
    const { result, rerender } = await renderHook(() =>
      usePomodoroCycle({ targetPomodoros }),
    );

    targetPomodoros = 6;
    await rerender(undefined);
    expect(result.current.state.targetPomodoros).toBe(4);

    for (let completed = 1; completed <= 4; completed += 1) {
      await act(() => result.current.completeCurrentPhase());
      if (completed < 4) await act(() => result.current.completeCurrentPhase());
    }

    expect(result.current.state).toEqual({
      phase: 'longBreak',
      completedPomodoros: 4,
      targetPomodoros: 4,
    });

    await act(() => result.current.completeCurrentPhase());
    expect(result.current.state).toEqual({
      phase: 'study',
      completedPomodoros: 0,
      targetPomodoros: 6,
    });
  });
});
