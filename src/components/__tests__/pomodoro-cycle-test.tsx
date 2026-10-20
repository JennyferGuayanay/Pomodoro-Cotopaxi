import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import { usePomodoroSession } from '@/hooks/use-pomodoro-session';
import { DEFAULT_POMODORO_CONFIGURATION } from '@/features/configuration/pomodoro-configuration';
import {
  getNotificationPermissionPromptStateAsync,
  requestPomodoroNotificationPermissionAsync,
} from '@/features/notifications/notification-permission';

import { PomodoroCycle } from '../pomodoro-cycle';

jest.mock('@/features/notifications/notification-permission', () => ({
  getNotificationPermissionPromptStateAsync: jest.fn(),
  requestPomodoroNotificationPermissionAsync: jest.fn(),
}));

jest.mock('@/hooks/use-pomodoro-session', () => ({
  usePomodoroSession: jest.fn(),
}));

const mockUsePomodoroSession = jest.mocked(usePomodoroSession);
const mockGetNotificationPermissionPromptStateAsync = jest.mocked(
  getNotificationPermissionPromptStateAsync,
);
const mockRequestPomodoroNotificationPermissionAsync = jest.mocked(
  requestPomodoroNotificationPermissionAsync,
);

const readySession = {
  isReady: true,
  configuration: { ...DEFAULT_POMODORO_CONFIGURATION },
  configurationLoadError: false,
  saveConfiguration: jest.fn(async () => ({
    status: 'saved' as const,
    configuration: { ...DEFAULT_POMODORO_CONFIGURATION },
  })),
  cycle: {
    phase: 'study' as const,
    completedPomodoros: 0,
    targetPomodoros: 4,
  },
  phaseName: 'Estudio',
  progressLabel: 'Pomodoros completados: 0 de 4',
  completedPhase: null,
  timer: {
    visibleStatus: 'stopped' as const,
    formattedTime: '25:00',
    start: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    requestReset: jest.fn(),
    cancelReset: jest.fn(),
    confirmReset: jest.fn(),
  },
};

describe('<PomodoroCycle />', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation();
    mockUsePomodoroSession.mockReturnValue(readySession);
    mockGetNotificationPermissionPromptStateAsync.mockResolvedValue(
      'notRequired',
    );
    mockRequestPomodoroNotificationPermissionAsync.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('shows the accessible recovered phase and timer controls', async () => {
    await render(<PomodoroCycle />);

    expect(screen.getByLabelText('Fase actual: Estudio')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pomodoros completados: 0 de 4')).toBeOnTheScreen();
    expect(screen.getByLabelText('Tiempo restante: 25:00')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeOnTheScreen();
  });

  test('does not render a provisional timer before recovery finishes', async () => {
    mockUsePomodoroSession.mockReturnValue({
      ...readySession,
      isReady: false,
    });

    await render(<PomodoroCycle />);

    expect(screen.queryByRole('button', { name: 'Iniciar' })).not.toBeOnTheScreen();
    expect(screen.queryByLabelText(/Tiempo restante/)).not.toBeOnTheScreen();
  });

  test('reports a configuration read error without blocking the timer', async () => {
    mockUsePomodoroSession.mockReturnValue({
      ...readySession,
      configurationLoadError: true,
    });

    await render(<PomodoroCycle />);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Configuración no disponible',
      'No se pudo leer la configuración guardada. Se usarán los valores predeterminados.',
    );
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeOnTheScreen();
  });

  test('does not expose controls to skip or select phases', async () => {
    await render(<PomodoroCycle />);

    expect(screen.queryByRole('button', { name: /omitir/i })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /descanso/i })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /estudio/i })).not.toBeOnTheScreen();
  });

  test('shows an accessible completion message and the next prepared phase', async () => {
    mockUsePomodoroSession.mockReturnValue({
      ...readySession,
      cycle: {
        phase: 'shortBreak',
        completedPomodoros: 1,
        targetPomodoros: 4,
      },
      phaseName: 'Descanso corto',
      progressLabel: 'Pomodoros completados: 1 de 4',
      completedPhase: 'study',
    });
    await render(<PomodoroCycle />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Estudio terminado. Es momento de descansar.',
    );
    expect(screen.getByLabelText('Fase actual: Descanso corto')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeOnTheScreen();
    expect(readySession.timer.start).not.toHaveBeenCalled();
  });

  test('explains the notification purpose before requesting permission', async () => {
    mockGetNotificationPermissionPromptStateAsync.mockResolvedValue(
      'requestable',
    );
    await render(<PomodoroCycle />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Iniciar' }));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Permitir notificaciones',
      expect.stringContaining('puedes seguir usando el temporizador'),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Ahora no' }),
        expect.objectContaining({ text: 'Continuar' }),
      ]),
      { cancelable: false },
    );
    expect(readySession.timer.start).not.toHaveBeenCalled();
    expect(mockRequestPomodoroNotificationPermissionAsync).not.toHaveBeenCalled();

    const buttons = jest.mocked(Alert.alert).mock.calls[0]?.[2];
    if (!buttons) throw new Error('Expected permission explanation buttons.');
    const continueButton = buttons.find(({ text }) => text === 'Continuar');
    if (!continueButton) throw new Error('Expected a permission request button.');
    mockRequestPomodoroNotificationPermissionAsync.mockResolvedValue(false);

    await act(async () => {
      continueButton.onPress?.();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockRequestPomodoroNotificationPermissionAsync).toHaveBeenCalledTimes(1);
    expect(readySession.timer.start).toHaveBeenCalledTimes(1);
  });

  test('starts the Pomodoro without requesting permission when the user declines the rationale', async () => {
    mockGetNotificationPermissionPromptStateAsync.mockResolvedValue(
      'requestable',
    );
    await render(<PomodoroCycle />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Iniciar' }));
    });

    const buttons: AlertButton[] = jest.mocked(Alert.alert).mock.calls[0]?.[2] ?? [];
    const declineButton = buttons.find(({ text }) => text === 'Ahora no');
    if (!declineButton) throw new Error('Expected a decline button.');

    await act(async () => declineButton.onPress?.());

    expect(mockRequestPomodoroNotificationPermissionAsync).not.toHaveBeenCalled();
    expect(readySession.timer.start).toHaveBeenCalledTimes(1);
  });

  test('starts normally when runtime notification permission is not required', async () => {
    await render(<PomodoroCycle />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Iniciar' }));
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockRequestPomodoroNotificationPermissionAsync).not.toHaveBeenCalled();
    expect(readySession.timer.start).toHaveBeenCalledTimes(1);
  });
});
