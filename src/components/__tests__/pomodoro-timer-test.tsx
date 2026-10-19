import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import { PomodoroTimer } from '../pomodoro-timer';

describe('<PomodoroTimer />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Alert, 'alert').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function renderTimer() {
    return render(<PomodoroTimer durationMs={10_000} />);
  }

  function getAlertButtons(): AlertButton[] {
    const buttons = jest.mocked(Alert.alert).mock.calls[0]?.[2];
    if (!buttons) throw new Error('Expected reset alert buttons');
    return buttons;
  }

  test('shows the stopped state and only the start control', async () => {
    await renderTimer();

    expect(screen.getByLabelText('Estado: Detenido')).toBeOnTheScreen();
    expect(screen.getByLabelText('Tiempo restante: 00:10')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Pausar' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Reanudar' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Reiniciar' })).not.toBeOnTheScreen();
  });

  test('shows pause and reset while running, then resume and reset while paused', async () => {
    await renderTimer();

    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Iniciar' })));
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reiniciar' })).toBeOnTheScreen();

    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Pausar' })));
    expect(screen.getByLabelText('Estado: Pausado')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reanudar' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reiniciar' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Pausar' })).not.toBeOnTheScreen();
  });

  test('opens the exact non-cancelable reset alert', async () => {
    await renderTimer();
    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Iniciar' })));
    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Reiniciar' })));

    expect(Alert.alert).toHaveBeenCalledWith(
      '',
      '¿Deseas reiniciar el temporizador?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancelar' }),
        expect.objectContaining({ text: 'Reiniciar' }),
      ]),
      { cancelable: false },
    );
  });

  test('cancels reset by restoring the running state', async () => {
    await renderTimer();
    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Iniciar' })));
    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Reiniciar' })));

    const [cancelButton] = getAlertButtons();
    await act(() => cancelButton.onPress?.());

    expect(screen.getByLabelText('Estado: En ejecución')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeOnTheScreen();
  });

  test('cancels reset by restoring the paused state', async () => {
    await renderTimer();
    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Iniciar' })));
    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Pausar' })));
    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Reiniciar' })));

    const [cancelButton] = getAlertButtons();
    await act(() => cancelButton.onPress?.());

    expect(screen.getByLabelText('Estado: Pausado')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reanudar' })).toBeOnTheScreen();
  });

  test('confirms reset by restoring the duration and stopping', async () => {
    await renderTimer();
    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Iniciar' })));
    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Reiniciar' })));

    const [, resetButton] = getAlertButtons();
    await act(() => resetButton.onPress?.());

    expect(screen.getByLabelText('Estado: Detenido')).toBeOnTheScreen();
    expect(screen.getByLabelText('Tiempo restante: 00:10')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeOnTheScreen();
  });

  test('reports a natural completion once', async () => {
    const onComplete = jest.fn();
    await render(<PomodoroTimer durationMs={1_000} onComplete={onComplete} />);

    await act(() => fireEvent.press(screen.getByRole('button', { name: 'Iniciar' })));
    await act(() => jest.advanceTimersByTime(1_000));
    await act(() => jest.advanceTimersByTime(1_000));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
