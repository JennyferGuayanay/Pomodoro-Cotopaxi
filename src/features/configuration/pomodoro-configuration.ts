export type PomodoroConfiguration = {
  studyDurationMinutes: number;
  shortBreakDurationMinutes: number;
  longBreakDurationMinutes: number;
  pomodorosPerCycle: number;
};

export type PomodoroConfigurationField = keyof PomodoroConfiguration;

export const DEFAULT_POMODORO_CONFIGURATION: Readonly<PomodoroConfiguration> = {
  studyDurationMinutes: 25,
  shortBreakDurationMinutes: 5,
  longBreakDurationMinutes: 15,
  pomodorosPerCycle: 4,
};

export type PomodoroConfigurationValidation =
  | {
      isValid: true;
      configuration: PomodoroConfiguration;
    }
  | {
      isValid: false;
      invalidFields: PomodoroConfigurationField[];
    };

const CONFIGURATION_FIELDS: PomodoroConfigurationField[] = [
  'studyDurationMinutes',
  'shortBreakDurationMinutes',
  'longBreakDurationMinutes',
  'pomodorosPerCycle',
];

export function validatePomodoroConfiguration(
  value: unknown,
): PomodoroConfigurationValidation {
  if (!isRecord(value)) {
    return { isValid: false, invalidFields: [...CONFIGURATION_FIELDS] };
  }

  if (
    !isPositiveInteger(value.studyDurationMinutes) ||
    !isPositiveInteger(value.shortBreakDurationMinutes) ||
    !isPositiveInteger(value.longBreakDurationMinutes) ||
    !isPositiveInteger(value.pomodorosPerCycle)
  ) {
    const invalidFields = CONFIGURATION_FIELDS.filter(
      (field) => !isPositiveInteger(value[field]),
    );
    return { isValid: false, invalidFields };
  }

  return {
    isValid: true,
    configuration: {
      studyDurationMinutes: value.studyDurationMinutes,
      shortBreakDurationMinutes: value.shortBreakDurationMinutes,
      longBreakDurationMinutes: value.longBreakDurationMinutes,
      pomodorosPerCycle: value.pomodorosPerCycle,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}
