import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { DEFAULT_STUDY_DURATION_MS } from '@/features/timer/timer-state';
import { useTheme } from '@/hooks/use-theme';
import { useTimer } from '@/hooks/use-timer';

const RESET_MESSAGE = '¿Deseas reiniciar el temporizador?';

type PomodoroTimerProps = {
  durationMs?: number;
  onComplete?: () => void;
};

type TimerButtonProps = {
  label: 'Iniciar' | 'Pausar' | 'Reanudar' | 'Reiniciar';
  onPress: () => void;
};

function TimerButton({ label, onPress }: TimerButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundSelected },
        pressed && styles.buttonPressed,
      ]}>
      <ThemedText style={styles.buttonText}>{label}</ThemedText>
    </Pressable>
  );
}

export function PomodoroTimer({
  durationMs = DEFAULT_STUDY_DURATION_MS,
  onComplete,
}: PomodoroTimerProps) {
  const timer = useTimer({ durationMs, onComplete });

  const statusLabel = {
    stopped: 'Detenido',
    running: 'En ejecución',
    paused: 'Pausado',
  }[timer.visibleStatus];

  function requestReset() {
    timer.requestReset();
    Alert.alert(
      '',
      RESET_MESSAGE,
      [
        { text: 'Cancelar', style: 'cancel', onPress: timer.cancelReset },
        { text: 'Reiniciar', style: 'destructive', onPress: timer.confirmReset },
      ],
      { cancelable: false },
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold" accessibilityLabel={`Estado: ${statusLabel}`}>
        Estado: {statusLabel}
      </ThemedText>

      <ThemedText
        type="title"
        accessibilityLabel={`Tiempo restante: ${timer.formattedTime}`}
        style={styles.time}>
        {timer.formattedTime}
      </ThemedText>

      <View style={styles.controls}>
        {timer.visibleStatus === 'stopped' && (
          <TimerButton label="Iniciar" onPress={timer.start} />
        )}
        {timer.visibleStatus === 'running' && (
          <>
            <TimerButton label="Pausar" onPress={timer.pause} />
            <TimerButton label="Reiniciar" onPress={requestReset} />
          </>
        )}
        {timer.visibleStatus === 'paused' && (
          <>
            <TimerButton label="Reanudar" onPress={timer.resume} />
            <TimerButton label="Reiniciar" onPress={requestReset} />
          </>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.four,
  },
  time: {
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  controls: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontWeight: 700,
    textAlign: 'center',
  },
});
