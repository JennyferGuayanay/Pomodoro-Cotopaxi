import type { PomodoroPhase } from '@/features/pomodoro-cycle/pomodoro-cycle-state';

export function getPomodoroPhaseCompletionMessage(
  phase: PomodoroPhase,
): string {
  return phase === 'study'
    ? 'Estudio terminado. Es momento de descansar.'
    : 'Descanso terminado. Es momento de estudiar.';
}
