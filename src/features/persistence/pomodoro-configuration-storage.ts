import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_POMODORO_CONFIGURATION,
  validatePomodoroConfiguration,
  type PomodoroConfiguration,
  type PomodoroConfigurationField,
} from '@/features/configuration/pomodoro-configuration';

export const POMODORO_CONFIGURATION_STORAGE_KEY =
  '@pomodoro-cotopaxi/configuration';
export const POMODORO_CONFIGURATION_SCHEMA_VERSION = 1;

type StoredPomodoroConfiguration = {
  schemaVersion: typeof POMODORO_CONFIGURATION_SCHEMA_VERSION;
  configuration: unknown;
};

export type LoadPomodoroConfigurationResult =
  | {
      status: 'loaded';
      configuration: PomodoroConfiguration;
    }
  | {
      status: 'readError';
      configuration: PomodoroConfiguration;
      error: unknown;
    };

export type SavePomodoroConfigurationResult =
  | { status: 'saved'; configuration: PomodoroConfiguration }
  | {
      status: 'invalid';
      invalidFields: PomodoroConfigurationField[];
    }
  | { status: 'writeError'; error: unknown };

export async function loadPomodoroConfiguration(): Promise<LoadPomodoroConfigurationResult> {
  let storedValue: string | null;
  try {
    storedValue = await AsyncStorage.getItem(
      POMODORO_CONFIGURATION_STORAGE_KEY,
    );
  } catch (error) {
    return {
      status: 'readError',
      configuration: { ...DEFAULT_POMODORO_CONFIGURATION },
      error,
    };
  }

  if (storedValue === null) {
    return {
      status: 'loaded',
      configuration: { ...DEFAULT_POMODORO_CONFIGURATION },
    };
  }

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(storedValue);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        status: 'loaded',
        configuration: { ...DEFAULT_POMODORO_CONFIGURATION },
      };
    }
    throw error;
  }

  if (!isStoredPomodoroConfiguration(parsedValue)) {
    return {
      status: 'loaded',
      configuration: { ...DEFAULT_POMODORO_CONFIGURATION },
    };
  }

  const validation = validatePomodoroConfiguration(parsedValue.configuration);
  if (!validation.isValid) {
    return {
      status: 'loaded',
      configuration: { ...DEFAULT_POMODORO_CONFIGURATION },
    };
  }

  return { status: 'loaded', configuration: validation.configuration };
}

export async function savePomodoroConfiguration(
  value: unknown,
): Promise<SavePomodoroConfigurationResult> {
  const validation = validatePomodoroConfiguration(value);
  if (!validation.isValid) {
    return {
      status: 'invalid',
      invalidFields: validation.invalidFields,
    };
  }

  const storedConfiguration: StoredPomodoroConfiguration = {
    schemaVersion: POMODORO_CONFIGURATION_SCHEMA_VERSION,
    configuration: validation.configuration,
  };

  try {
    await AsyncStorage.setItem(
      POMODORO_CONFIGURATION_STORAGE_KEY,
      JSON.stringify(storedConfiguration),
    );
  } catch (error) {
    return { status: 'writeError', error };
  }

  return { status: 'saved', configuration: validation.configuration };
}

function isStoredPomodoroConfiguration(
  value: unknown,
): value is StoredPomodoroConfiguration {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  if (!('schemaVersion' in value) || !('configuration' in value)) {
    return false;
  }

  return (
    value.schemaVersion === POMODORO_CONFIGURATION_SCHEMA_VERSION
  );
}
