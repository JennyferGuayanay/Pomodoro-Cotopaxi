import { StyleSheet } from 'react-native';

import { PomodoroTimer } from '@/components/pomodoro-timer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePomodoroCycle } from '@/hooks/use-pomodoro-cycle';

export function PomodoroCycle() {
  const cycle = usePomodoroCycle();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.summary}>
        <ThemedText
          type="subtitle"
          accessibilityLabel={`Fase actual: ${cycle.phaseName}`}
          style={styles.phase}>
          {cycle.phaseName}
        </ThemedText>
        <ThemedText accessibilityLabel={cycle.progressLabel} style={styles.progress}>
          {cycle.progressLabel}
        </ThemedText>
      </ThemedView>

      <PomodoroTimer
        key={cycle.timerKey}
        durationMs={cycle.durationMs}
        onComplete={cycle.completeCurrentPhase}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.four,
  },
  summary: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  phase: {
    textAlign: 'center',
  },
  progress: {
    textAlign: 'center',
  },
});
