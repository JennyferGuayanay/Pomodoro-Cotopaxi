import {
  act,
  render,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import {
  DEFAULT_POMODORO_CONFIGURATION,
  validatePomodoroConfiguration,
  type PomodoroConfiguration,
} from '@/features/configuration/pomodoro-configuration';
import { PomodoroConfigurationScreen } from '@/features/configuration/pomodoro-configuration-screen';
import { usePomodoroConfiguration } from '@/features/configuration/pomodoro-configuration-provider';
import type { SavePomodoroConfigurationResult } from '@/features/persistence/pomodoro-configuration-storage';

jest.mock('@/features/configuration/pomodoro-configuration-provider', () => ({
  usePomodoroConfiguration: jest.fn(),
}));

const mockUsePomodoroConfiguration = jest.mocked(usePomodoroConfiguration);

const savedConfiguration: PomodoroConfiguration = {
  studyDurationMinutes: 30,
  shortBreakDurationMinutes: 8,
  longBreakDurationMinutes: 18,
  pomodorosPerCycle: 5,
};

describe('<PomodoroConfigurationScreen />', () => {
  const saveConfiguration: jest.MockedFunction<
    (value: unknown) => Promise<SavePomodoroConfigurationResult>
  > = jest.fn(async (value: unknown) => {
    const result = validatePomodoroConfiguration(value);
    return result.isValid
      ? { status: 'saved' as const, configuration: result.configuration }
      : { status: 'invalid' as const, invalidFields: result.invalidFields };
  });

  beforeEach(() => {
    mockUsePomodoroConfiguration.mockReset();
    saveConfiguration.mockReset();
    saveConfiguration.mockImplementation(async (value: unknown) => {
      const result = validatePomodoroConfiguration(value);
      return result.isValid
        ? { status: 'saved', configuration: result.configuration }
        : { status: 'invalid', invalidFields: result.invalidFields };
    });
    jest.spyOn(Alert, 'alert').mockImplementation();
    mockUsePomodoroConfiguration.mockReturnValue({
      configuration: { ...savedConfiguration },
      isReady: true,
      hasLoadError: false,
      saveConfiguration,
    });
  });

  afterEach(() => {
    jest.mocked(Alert.alert).mockRestore();
  });

  test('shows all saved values and persists a complete valid edit', async () => {
    const user = userEvent.setup();
    await render(<PomodoroConfigurationScreen />);

    expect(screen.getByDisplayValue('30')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('8')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('18')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('5')).toBeOnTheScreen();

    const studyInput = screen.getByLabelText('Estudio (minutos)');
    await user.clear(studyInput);
    await user.type(studyInput, '35');
    await user.press(
      screen.getByRole('button', { name: 'Guardar configuración' }),
    );

    expect(saveConfiguration).toHaveBeenCalledWith({
      ...savedConfiguration,
      studyDurationMinutes: 35,
    });
    expect(
      await screen.findByText('Configuración guardada correctamente.'),
    ).toBeOnTheScreen();
  });

  test('reports invalid fields accessibly without attempting to save', async () => {
    const user = userEvent.setup();
    await render(<PomodoroConfigurationScreen />);
    const studyInput = screen.getByLabelText('Estudio (minutos)');
    await user.clear(studyInput);
    await user.type(studyInput, '0');
    const shortBreakInput = screen.getByLabelText('Descanso corto (minutos)');
    await user.clear(shortBreakInput);
    await user.type(shortBreakInput, '2.5');
    const longBreakInput = screen.getByLabelText('Descanso largo (minutos)');
    await user.clear(longBreakInput);
    await user.type(longBreakInput, '2.0');
    await user.clear(screen.getByLabelText('Pomodoros por ciclo'));

    await user.press(
      screen.getByRole('button', { name: 'Guardar configuración' }),
    );

    expect(screen.getByText('Error: estudio (minutos) debe ser un entero positivo.')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Error: descanso corto (minutos) debe ser un entero positivo.',
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Error: descanso largo (minutos) debe ser un entero positivo.',
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByText('Error: pomodoros por ciclo debe ser un entero positivo.'),
    ).toBeOnTheScreen();
    expect(saveConfiguration).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Estudio (minutos)')).toHaveProp(
      'accessibilityHint',
      'Error: estudio (minutos) debe ser un entero positivo.',
    );
  });

  test('asks before restoring and does nothing when restoration is canceled', async () => {
    const user = userEvent.setup();
    await render(<PomodoroConfigurationScreen />);
    await user.press(
      screen.getByRole('button', {
        name: 'Restaurar valores predeterminados',
      }),
    );

    const buttons = jest.mocked(Alert.alert).mock.calls[0]?.[2] ?? [];
    expect(Alert.alert).toHaveBeenCalledWith(
      'Restaurar valores predeterminados',
      expect.stringContaining('25 minutos de estudio'),
      expect.any(Array),
      { cancelable: false },
    );
    expect(buttons.find((button: AlertButton) => button.text === 'Cancelar')).toBeDefined();
    expect(saveConfiguration).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('30')).toBeOnTheScreen();
  });

  test('persists the defaults only after restoration is confirmed', async () => {
    const user = userEvent.setup();
    await render(<PomodoroConfigurationScreen />);
    await user.press(
      screen.getByRole('button', {
        name: 'Restaurar valores predeterminados',
      }),
    );

    const buttons = jest.mocked(Alert.alert).mock.calls[0]?.[2] ?? [];
    const restoreButton = buttons.find(
      (button: AlertButton) => button.text === 'Restaurar',
    );

    await act(async () => {
      restoreButton?.onPress?.();
      await Promise.resolve();
    });

    expect(saveConfiguration).toHaveBeenCalledWith(
      DEFAULT_POMODORO_CONFIGURATION,
    );
    expect(
      await screen.findByText('Se restauraron los valores predeterminados.'),
    ).toBeOnTheScreen();
  });

  test('shows the read fallback notice and does not block the controls', async () => {
    mockUsePomodoroConfiguration.mockReturnValue({
      configuration: { ...DEFAULT_POMODORO_CONFIGURATION },
      isReady: true,
      hasLoadError: true,
      saveConfiguration,
    });

    await render(<PomodoroConfigurationScreen />);

    expect(
      screen.getByText(/No se pudo leer la configuración guardada/),
    ).toBeOnTheScreen();
    expect(screen.getByDisplayValue('25')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Guardar configuración' })).toBeOnTheScreen();
  });

  test('reports a failed write and leaves the previous values visible', async () => {
    const user = userEvent.setup();
    const error = new Error('Storage unavailable');
    saveConfiguration.mockResolvedValueOnce({ status: 'writeError', error });
    jest.spyOn(console, 'error').mockImplementation();

    await render(<PomodoroConfigurationScreen />);
    const studyInput = screen.getByLabelText('Estudio (minutos)');
    await user.clear(studyInput);
    await user.type(studyInput, '35');
    await user.press(
      screen.getByRole('button', { name: 'Guardar configuración' }),
    );

    expect(
      await screen.findByText(
        'No se pudo guardar la configuración. Se conserva la configuración anterior.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByDisplayValue('35')).toBeOnTheScreen();
    await waitFor(() => expect(saveConfiguration).toHaveBeenCalledTimes(1));
  });
});
