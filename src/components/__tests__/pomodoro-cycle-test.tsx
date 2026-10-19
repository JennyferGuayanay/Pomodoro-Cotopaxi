import { act, render, screen } from '@testing-library/react-native';

import {
  LONG_BREAK_DURATION_MS,
  SHORT_BREAK_DURATION_MS,
  STUDY_DURATION_MS,
} from '@/features/pomodoro-cycle/pomodoro-cycle-state';
import { createTimerState, formatRemainingTime } from '@/features/timer/timer-state';
import { useTimer } from '@/hooks/use-timer';

import { PomodoroCycle } from '../pomodoro-cycle';

jest.mock('@/hooks/use-timer');

const mockUseTimer = jest.mocked(useTimer);

describe('<PomodoroCycle />', () => {
  let completeCurrentPhase: (() => void) | undefined;
  let currentDurationMs = 0;

  beforeEach(() => {
    mockUseTimer.mockImplementation((options = {}) => {
      currentDurationMs = options.durationMs ?? STUDY_DURATION_MS;
      completeCurrentPhase = options.onComplete;

      return {
        state: createTimerState(currentDurationMs),
        visibleStatus: 'stopped',
        remainingMs: currentDurationMs,
        formattedTime: formatRemainingTime(currentDurationMs),
        start: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        requestReset: jest.fn(),
        cancelReset: jest.fn(),
        confirmReset: jest.fn(),
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  async function completePhase() {
    if (!completeCurrentPhase) throw new Error('Expected a phase completion callback');
    await act(() => completeCurrentPhase?.());
  }

  test('shows the accessible initial study phase and reuses the start control', async () => {
    await render(<PomodoroCycle />);

    expect(screen.getByLabelText('Fase actual: Estudio')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pomodoros completados: 0 de 4')).toBeOnTheScreen();
    expect(screen.getByLabelText('Tiempo restante: 25:00')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeOnTheScreen();
    expect(currentDurationMs).toBe(STUDY_DURATION_MS);
  });

  test('alternates short breaks and reaches the long break with four of four', async () => {
    await render(<PomodoroCycle />);

    await completePhase();
    expect(screen.getByLabelText('Fase actual: Descanso corto')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pomodoros completados: 1 de 4')).toBeOnTheScreen();
    expect(screen.getByLabelText('Tiempo restante: 05:00')).toBeOnTheScreen();
    expect(currentDurationMs).toBe(SHORT_BREAK_DURATION_MS);

    await completePhase();
    expect(screen.getByLabelText('Fase actual: Estudio')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pomodoros completados: 1 de 4')).toBeOnTheScreen();

    for (let completed = 2; completed <= 4; completed += 1) {
      await completePhase();
      if (completed < 4) await completePhase();
    }

    expect(screen.getByLabelText('Fase actual: Descanso largo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pomodoros completados: 4 de 4')).toBeOnTheScreen();
    expect(screen.getByLabelText('Tiempo restante: 15:00')).toBeOnTheScreen();
    expect(currentDurationMs).toBe(LONG_BREAK_DURATION_MS);
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeOnTheScreen();
  });

  test('resets progress only after the long break completes', async () => {
    await render(<PomodoroCycle />);

    for (let completed = 1; completed <= 4; completed += 1) {
      await completePhase();
      if (completed < 4) await completePhase();
    }

    expect(screen.getByLabelText('Pomodoros completados: 4 de 4')).toBeOnTheScreen();

    await completePhase();
    expect(screen.getByLabelText('Fase actual: Estudio')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pomodoros completados: 0 de 4')).toBeOnTheScreen();
    expect(screen.getByLabelText('Tiempo restante: 25:00')).toBeOnTheScreen();
  });

  test('does not expose controls to skip or select phases', async () => {
    await render(<PomodoroCycle />);

    expect(screen.queryByRole('button', { name: /omitir/i })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /descanso/i })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /estudio/i })).not.toBeOnTheScreen();
  });
});
