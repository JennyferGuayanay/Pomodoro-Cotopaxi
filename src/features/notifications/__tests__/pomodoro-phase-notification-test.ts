import {
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  getPermissionsAsync,
  PermissionStatus,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  type NotificationRequest,
} from 'expo-notifications';

import { configurePomodoroNotificationChannelAsync } from '../notification-channel';
import {
  cancelPomodoroPhaseNotificationAsync,
  reconcilePomodoroPhaseNotificationsAsync,
  schedulePomodoroPhaseNotificationAsync,
} from '../pomodoro-phase-notification';

jest.mock('expo-notifications', () => ({
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('../notification-channel', () => ({
  configurePomodoroNotificationChannelAsync: jest.fn(),
  POMODORO_NOTIFICATION_CHANNEL_ID: 'pomodoro-phase-end',
}));

const existingNotification = {
  identifier: 'existing-notification',
  content: {
    title: null,
    subtitle: null,
    body: null,
    data: { type: 'pomodoro-phase-end', executionId: 'study:30000' },
    categoryIdentifier: null,
    sound: null,
    threadIdentifier: null,
  },
  trigger: null,
} satisfies NotificationRequest;

describe('schedulePomodoroPhaseNotificationAsync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(10_000);
    jest.clearAllMocks();
    jest.mocked(configurePomodoroNotificationChannelAsync).mockResolvedValue(
      undefined,
    );
    jest.mocked(getPermissionsAsync).mockResolvedValue({
      status: PermissionStatus.GRANTED,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
    jest.mocked(getAllScheduledNotificationsAsync).mockResolvedValue([]);
    jest.mocked(cancelScheduledNotificationAsync).mockResolvedValue(undefined);
    jest.mocked(scheduleNotificationAsync).mockResolvedValue(
      'new-notification',
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('schedules a study notification at its phase end using best-effort delivery', async () => {
    await expect(
      schedulePomodoroPhaseNotificationAsync({
        phase: 'study',
        endsAtMs: 30_000,
      }),
    ).resolves.toBe('new-notification');

    expect(configurePomodoroNotificationChannelAsync).toHaveBeenCalledTimes(1);
    expect(scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: 'Pomodoro',
        body: 'Estudio terminado. Es momento de descansar.',
        data: {
          type: 'pomodoro-phase-end',
          executionId: 'study:30000',
          phase: 'study',
        },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: 30_000,
        delivery: 'bestEffort',
        channelId: 'pomodoro-phase-end',
      },
    });
  });

  test.each(['shortBreak', 'longBreak'] as const)(
    'uses the rest-completion message for %s',
    async (phase) => {
      await schedulePomodoroPhaseNotificationAsync({ phase, endsAtMs: 30_000 });

      expect(scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            body: 'Descanso terminado. Es momento de estudiar.',
            data: {
              type: 'pomodoro-phase-end',
              executionId: `${phase}:30000`,
              phase,
            },
          }),
        }),
      );
    },
  );

  test('does not schedule when notification permission is denied', async () => {
    jest.mocked(getPermissionsAsync).mockResolvedValue({
      status: PermissionStatus.DENIED,
      granted: false,
      canAskAgain: false,
      expires: 'never',
    });

    await expect(
      schedulePomodoroPhaseNotificationAsync({
        phase: 'study',
        endsAtMs: 30_000,
      }),
    ).resolves.toBeNull();

    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test('does not schedule an already expired phase', async () => {
    await expect(
      schedulePomodoroPhaseNotificationAsync({
        phase: 'study',
        endsAtMs: 10_000,
      }),
    ).resolves.toBeNull();

    expect(configurePomodoroNotificationChannelAsync).not.toHaveBeenCalled();
    expect(getPermissionsAsync).not.toHaveBeenCalled();
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test('reuses an existing notification for a recovered phase execution', async () => {
    jest
      .mocked(getAllScheduledNotificationsAsync)
      .mockResolvedValue([existingNotification]);

    await expect(
      schedulePomodoroPhaseNotificationAsync({
        phase: 'study',
        endsAtMs: 30_000,
      }),
    ).resolves.toBe('existing-notification');

    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test('deduplicates concurrent scheduling attempts for the same execution', async () => {
    const input = { phase: 'study' as const, endsAtMs: 30_000 };

    await expect(
      Promise.all([
        schedulePomodoroPhaseNotificationAsync(input),
        schedulePomodoroPhaseNotificationAsync(input),
      ]),
    ).resolves.toEqual(['new-notification', 'new-notification']);

    expect(getAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  test('cancels every scheduled notification for an execution', async () => {
    jest
      .mocked(getAllScheduledNotificationsAsync)
      .mockResolvedValue([existingNotification, existingNotification]);

    await cancelPomodoroPhaseNotificationAsync({
      phase: 'study',
      endsAtMs: 30_000,
    });

    expect(cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(cancelScheduledNotificationAsync).toHaveBeenNthCalledWith(
      1,
      'existing-notification',
    );
  });

  test('reconciles a paused session by cancelling only Pomodoro notifications', async () => {
    const unrelatedNotification = {
      ...existingNotification,
      identifier: 'unrelated-notification',
      content: {
        ...existingNotification.content,
        data: { type: 'unrelated', executionId: 'study:30000' },
      },
    } satisfies NotificationRequest;
    jest
      .mocked(getAllScheduledNotificationsAsync)
      .mockResolvedValue([existingNotification, unrelatedNotification]);

    await reconcilePomodoroPhaseNotificationsAsync(null);

    expect(cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'existing-notification',
    );
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test('keeps one current execution and cancels stale and duplicate executions', async () => {
    const staleNotification = {
      ...existingNotification,
      identifier: 'stale-notification',
      content: {
        ...existingNotification.content,
        data: { type: 'pomodoro-phase-end', executionId: 'study:20000' },
      },
    } satisfies NotificationRequest;
    const duplicateNotification = {
      ...existingNotification,
      identifier: 'duplicate-notification',
    } satisfies NotificationRequest;
    jest
      .mocked(getAllScheduledNotificationsAsync)
      .mockResolvedValue([
        staleNotification,
        existingNotification,
        duplicateNotification,
      ]);

    await reconcilePomodoroPhaseNotificationsAsync({
      phase: 'study',
      endsAtMs: 30_000,
    });

    expect(cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(cancelScheduledNotificationAsync).toHaveBeenNthCalledWith(
      1,
      'stale-notification',
    );
    expect(cancelScheduledNotificationAsync).toHaveBeenNthCalledWith(
      2,
      'duplicate-notification',
    );
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test('serializes cancellation after a pending schedule for the same execution', async () => {
    const operationOrder: string[] = [];
    jest
      .mocked(getAllScheduledNotificationsAsync)
      .mockImplementationOnce(async () => {
        operationOrder.push('schedule-check');
        return [];
      })
      .mockImplementationOnce(async () => {
        operationOrder.push('cancel-check');
        return [existingNotification];
      });
    jest
      .mocked(scheduleNotificationAsync)
      .mockImplementationOnce(async () => {
        operationOrder.push('schedule');
        return 'new-notification';
      });
    jest
      .mocked(cancelScheduledNotificationAsync)
      .mockImplementationOnce(async () => {
        operationOrder.push('cancel');
      });
    const input = { phase: 'study' as const, endsAtMs: 30_000 };

    await Promise.all([
      schedulePomodoroPhaseNotificationAsync(input),
      cancelPomodoroPhaseNotificationAsync(input),
    ]);

    expect(operationOrder).toEqual([
      'schedule-check',
      'schedule',
      'cancel-check',
      'cancel',
    ]);
  });

  test('reconciles repeated active-session updates without creating duplicates', async () => {
    jest
      .mocked(getAllScheduledNotificationsAsync)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValue([existingNotification]);
    const activeExecution = { phase: 'study' as const, endsAtMs: 30_000 };

    await Promise.all([
      reconcilePomodoroPhaseNotificationsAsync(activeExecution),
      reconcilePomodoroPhaseNotificationsAsync(activeExecution),
    ]);

    expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(cancelScheduledNotificationAsync).not.toHaveBeenCalled();
  });

  test('does not cancel an execution again after a repeated paused reconciliation', async () => {
    jest
      .mocked(getAllScheduledNotificationsAsync)
      .mockResolvedValueOnce([existingNotification])
      .mockResolvedValueOnce([]);

    await Promise.all([
      reconcilePomodoroPhaseNotificationsAsync(null),
      reconcilePomodoroPhaseNotificationsAsync(null),
    ]);

    expect(cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
