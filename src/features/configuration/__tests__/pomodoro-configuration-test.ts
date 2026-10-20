import {
  DEFAULT_POMODORO_CONFIGURATION,
  validatePomodoroConfiguration,
  type PomodoroConfiguration,
  type PomodoroConfigurationField,
} from '../pomodoro-configuration';

describe('Pomodoro configuration', () => {
  test('provides the approved default values', () => {
    expect(DEFAULT_POMODORO_CONFIGURATION).toEqual({
      studyDurationMinutes: 25,
      shortBreakDurationMinutes: 5,
      longBreakDurationMinutes: 15,
      pomodorosPerCycle: 4,
    });
  });

  test('accepts a complete configuration of positive integers', () => {
    const configuration: PomodoroConfiguration = {
      studyDurationMinutes: 30,
      shortBreakDurationMinutes: 7,
      longBreakDurationMinutes: 20,
      pomodorosPerCycle: 6,
    };

    expect(validatePomodoroConfiguration(configuration)).toEqual({
      isValid: true,
      configuration,
    });
  });

  test.each([
    ['zero', 0],
    ['a negative number', -1],
    ['a decimal', 2.5],
    ['an empty value', ''],
    ['a numeric string', '25'],
    ['a non-numeric value', 'many'],
    ['NaN', Number.NaN],
    ['infinity', Number.POSITIVE_INFINITY],
    ['a missing value', undefined],
  ])('rejects %s in every configuration field', (_description, value) => {
    const fields: PomodoroConfigurationField[] = [
      'studyDurationMinutes',
      'shortBreakDurationMinutes',
      'longBreakDurationMinutes',
      'pomodorosPerCycle',
    ];

    for (const invalidField of fields) {
      const configuration: Record<string, unknown> = {
        ...DEFAULT_POMODORO_CONFIGURATION,
        [invalidField]: value,
      };

      expect(validatePomodoroConfiguration(configuration)).toEqual({
        isValid: false,
        invalidFields: [invalidField],
      });
    }
  });

  test('reports all invalid or missing fields without a partial configuration', () => {
    expect(
      validatePomodoroConfiguration({
        studyDurationMinutes: 25,
        shortBreakDurationMinutes: 0,
        pomodorosPerCycle: 2.5,
      }),
    ).toEqual({
      isValid: false,
      invalidFields: [
        'shortBreakDurationMinutes',
        'longBreakDurationMinutes',
        'pomodorosPerCycle',
      ],
    });
  });

  test.each([null, [], 'not an object'])(
    'rejects non-object input %p and identifies every required field',
    (value) => {
      expect(validatePomodoroConfiguration(value)).toEqual({
        isValid: false,
        invalidFields: [
          'studyDurationMinutes',
          'shortBreakDurationMinutes',
          'longBreakDurationMinutes',
          'pomodorosPerCycle',
        ],
      });
    },
  );

  test('does not impose an unapproved maximum', () => {
    const configuration: PomodoroConfiguration = {
      studyDurationMinutes: 100_000,
      shortBreakDurationMinutes: 50_000,
      longBreakDurationMinutes: 150_000,
      pomodorosPerCycle: 10_000,
    };

    expect(validatePomodoroConfiguration(configuration)).toEqual({
      isValid: true,
      configuration,
    });
  });
});
