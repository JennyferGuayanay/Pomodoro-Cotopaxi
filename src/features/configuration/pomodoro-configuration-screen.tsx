import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  DEFAULT_POMODORO_CONFIGURATION,
  validatePomodoroConfiguration,
  type PomodoroConfiguration,
  type PomodoroConfigurationField,
} from '@/features/configuration/pomodoro-configuration';
import { usePomodoroConfiguration } from '@/features/configuration/pomodoro-configuration-provider';
import type { SavePomodoroConfigurationResult } from '@/features/persistence/pomodoro-configuration-storage';
import { useTheme } from '@/hooks/use-theme';

const FIELD_LABELS: Record<PomodoroConfigurationField, string> = {
  studyDurationMinutes: 'Estudio (minutos)',
  shortBreakDurationMinutes: 'Descanso corto (minutos)',
  longBreakDurationMinutes: 'Descanso largo (minutos)',
  pomodorosPerCycle: 'Pomodoros por ciclo',
};
const CONFIGURATION_FIELDS: PomodoroConfigurationField[] = [
  'studyDurationMinutes',
  'shortBreakDurationMinutes',
  'longBreakDurationMinutes',
  'pomodorosPerCycle',
];

type ConfigurationDraft = Record<PomodoroConfigurationField, string>;
type Feedback = string;

function createDraft(configuration: PomodoroConfiguration): ConfigurationDraft {
  return {
    studyDurationMinutes: String(configuration.studyDurationMinutes),
    shortBreakDurationMinutes: String(configuration.shortBreakDurationMinutes),
    longBreakDurationMinutes: String(configuration.longBreakDurationMinutes),
    pomodorosPerCycle: String(configuration.pomodorosPerCycle),
  };
}

function parseIntegerInput(value: string): number {
  return /^\d+$/.test(value) ? Number(value) : Number.NaN;
}

export function PomodoroConfigurationScreen() {
  const {
    configuration,
    hasLoadError,
    isReady,
    saveConfiguration,
  } = usePomodoroConfiguration();

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <ThemedText type="subtitle" themeColor="primaryDark">
            Configuración
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Ajusta las duraciones y la cantidad de Pomodoros de cada ciclo.
          </ThemedText>

          {!isReady ? (
            <ThemedText>Cargando configuración...</ThemedText>
          ) : (
            <>
              {hasLoadError && (
                <ThemedText
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite">
                  No se pudo leer la configuración guardada. Se usan los
                  valores predeterminados; puedes guardar para conservar tus
                  cambios.
                </ThemedText>
              )}
              <PomodoroConfigurationForm
                initialConfiguration={configuration}
                saveConfiguration={saveConfiguration}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function PomodoroConfigurationForm({
  initialConfiguration,
  saveConfiguration,
}: {
  initialConfiguration: PomodoroConfiguration;
  saveConfiguration: (
    value: unknown,
  ) => Promise<SavePomodoroConfigurationResult>;
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState(() => createDraft(initialConfiguration));
  const [invalidFields, setInvalidFields] = useState<
    PomodoroConfigurationField[]
  >([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: PomodoroConfigurationField, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setInvalidFields((current) => current.filter((item) => item !== field));
    setFeedback(null);
  }

  async function persistConfiguration(
    value: PomodoroConfiguration,
    successMessage: string,
  ) {
    setFeedback(null);
    setIsSaving(true);

    try {
      const result = await saveConfiguration(value);
      if (result.status === 'saved') {
        setDraft(createDraft(result.configuration));
        setInvalidFields([]);
        setFeedback(successMessage);
      } else if (result.status === 'invalid') {
        setInvalidFields(result.invalidFields);
      } else {
        setFeedback(
          'No se pudo guardar la configuración. Se conserva la configuración anterior.',
        );
      }
    } catch (error) {
      console.error('Unable to save Pomodoro configuration from settings.', error);
      setFeedback(
        'No se pudo guardar la configuración. Se conserva la configuración anterior.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function saveDraft() {
    const validation = validatePomodoroConfiguration({
      studyDurationMinutes: parseIntegerInput(draft.studyDurationMinutes),
      shortBreakDurationMinutes: parseIntegerInput(
        draft.shortBreakDurationMinutes,
      ),
      longBreakDurationMinutes: parseIntegerInput(
        draft.longBreakDurationMinutes,
      ),
      pomodorosPerCycle: parseIntegerInput(draft.pomodorosPerCycle),
    });

    if (!validation.isValid) {
      setInvalidFields(validation.invalidFields);
      setFeedback(null);
      return;
    }

    await persistConfiguration(
      validation.configuration,
      'Configuración guardada correctamente.',
    );
  }

  function requestRestoreDefaults() {
    Alert.alert(
      'Restaurar valores predeterminados',
      'Se guardarán 25 minutos de estudio, 5 de descanso corto, 15 de descanso largo y 4 Pomodoros por ciclo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: () => {
            void persistConfiguration(
              { ...DEFAULT_POMODORO_CONFIGURATION },
              'Se restauraron los valores predeterminados.',
            );
          },
        },
      ],
      { cancelable: false },
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.form}>
      {CONFIGURATION_FIELDS.map((field) => {
        const label = FIELD_LABELS[field];
        const error = invalidFields.includes(field)
          ? `Error: ${label.toLowerCase()} debe ser un entero positivo.`
          : undefined;

        return (
          <ThemedView key={field} style={styles.field}>
            <ThemedText type="smallBold">{label}</ThemedText>
            <TextInput
              accessibilityLabel={label}
              accessibilityHint={error}
              accessibilityLiveRegion={error ? 'polite' : 'none'}
              keyboardType="number-pad"
              onChangeText={(value) => updateField(field, value)}
              returnKeyType="done"
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.primary,
                  color: theme.text,
                },
              ]}
              value={draft[field]}
            />
            {error && (
              <ThemedText
                accessibilityRole="alert"
                accessibilityLiveRegion="polite">
                {error}
              </ThemedText>
            )}
          </ThemedView>
        );
      })}

      {feedback && (
        <ThemedText
          accessibilityRole="alert"
          accessibilityLiveRegion="polite">
          {feedback}
        </ThemedText>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Guardar configuración"
        disabled={isSaving}
        onPress={() => void saveDraft()}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: theme.primaryDark },
          pressed && styles.buttonPressed,
          isSaving && styles.buttonDisabled,
        ]}>
        <ThemedText type="smallBold" themeColor="onPrimary">
          Guardar
        </ThemedText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Restaurar valores predeterminados"
        disabled={isSaving}
        onPress={requestRestoreDefaults}
        style={({ pressed }) => [
          styles.actionButton,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.primary,
          },
          styles.secondaryButton,
          pressed && styles.buttonPressed,
          isSaving && styles.buttonDisabled,
        ]}>
        <ThemedText type="smallBold" themeColor="primaryDark">
          Restaurar predeterminados
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  form: {
    gap: Spacing.three,
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
