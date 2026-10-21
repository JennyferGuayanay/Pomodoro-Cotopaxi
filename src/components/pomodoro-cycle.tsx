import { useEffect, useRef } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { PomodoroTimerView } from '@/components/pomodoro-timer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  getNotificationPermissionPromptStateAsync,
  requestPomodoroNotificationPermissionAsync,
} from '@/features/notifications/notification-permission';
import { getPomodoroPhaseCompletionMessage } from '@/features/notifications/pomodoro-phase-message';
import { usePomodoroSession } from '@/hooks/use-pomodoro-session';

export function PomodoroCycle() {
  const session = usePomodoroSession();
  const isStarting = useRef(false);
  const hasShownConfigurationError = useRef(false);

  useEffect(() => {
    if (
      !session.configurationLoadError ||
      hasShownConfigurationError.current
    ) {
      return;
    }

    hasShownConfigurationError.current = true;
    Alert.alert(
      'Configuración no disponible',
      'No se pudo leer la configuración guardada. Se usarán los valores predeterminados.',
    );
  }, [session.configurationLoadError]);

  if (!session.isReady) return null;

  function startTimer() {
    isStarting.current = false;
    session.timer.start();
  }

  async function requestPermissionAndStart() {
    try {
      await requestPomodoroNotificationPermissionAsync();
    } catch (error) {
      console.error('Unable to request Pomodoro notification permission.', error);
      Alert.alert(
        'Avisos no disponibles',
        'No se pudo solicitar el permiso. El Pomodoro iniciará normalmente.',
      );
    } finally {
      startTimer();
    }
  }

  async function startPomodoro() {
    if (isStarting.current) return;
    isStarting.current = true;

    try {
      const permissionState = await getNotificationPermissionPromptStateAsync();

      if (permissionState !== 'requestable') {
        startTimer();
        return;
      }

      Alert.alert(
        'Permitir notificaciones',
        'Las notificaciones pueden avisarte cuando terminen las fases de estudio y descanso. Si no las permites, puedes seguir usando el temporizador y el ciclo normalmente.',
        [
          { text: 'Ahora no', style: 'cancel', onPress: startTimer },
          {
            text: 'Continuar',
            onPress: () => {
              void requestPermissionAndStart();
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      console.error('Unable to check Pomodoro notification permission.', error);
      Alert.alert(
        'Avisos no disponibles',
        'No se pudo comprobar el permiso. El Pomodoro iniciará normalmente.',
        [{ text: 'Iniciar', onPress: startTimer }],
        { cancelable: false },
      );
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.summary}>
        {session.completedPhase && (
          <ThemedText
            accessibilityRole="alert"
            accessibilityLiveRegion="polite">
            {getPomodoroPhaseCompletionMessage(session.completedPhase)}
          </ThemedText>
        )}
        <ThemedText
          type="subtitle"
          accessibilityLabel={`Fase actual: ${session.phaseName}`}
          themeColor="primaryDark"
          style={styles.phase}>
          {session.phaseName}
        </ThemedText>
        <ThemedText
          accessibilityLabel={session.progressLabel}
          themeColor="textSecondary"
          style={styles.progress}>
          {session.progressLabel}
        </ThemedText>
      </ThemedView>

      <PomodoroTimerView timer={session.timer} onStart={startPomodoro} />
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
