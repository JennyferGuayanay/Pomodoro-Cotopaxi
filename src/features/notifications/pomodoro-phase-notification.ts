import {
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  getPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
} from 'expo-notifications';

import type { PomodoroPhase } from '@/features/pomodoro-cycle/pomodoro-cycle-state';

import {
  configurePomodoroNotificationChannelAsync,
  POMODORO_NOTIFICATION_CHANNEL_ID,
} from './notification-channel';
import { getPomodoroPhaseCompletionMessage } from './pomodoro-phase-message';

type PomodoroPhaseNotificationInput = {
  phase: PomodoroPhase;
  endsAtMs: number;
};

const inFlightSchedules = new Map<string, Promise<string | null>>();
let notificationOperationQueue: Promise<void> = Promise.resolve();

function getExecutionId(phase: PomodoroPhase, endsAtMs: number): string {
  return `${phase}:${endsAtMs}`;
}

function getPomodoroExecutionId(data: unknown): string | null {
  return (
    typeof data === 'object' &&
    data !== null &&
    'executionId' in data &&
    'type' in data &&
    data.type === 'pomodoro-phase-end' &&
    typeof data.executionId === 'string'
  )
    ? data.executionId
    : null;
}

function enqueueNotificationOperation<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const queuedOperation = notificationOperationQueue.then(operation, operation);
  notificationOperationQueue = queuedOperation.then(
    () => undefined,
    () => undefined,
  );
  return queuedOperation;
}

async function schedulePhaseNotification(
  { phase, endsAtMs }: PomodoroPhaseNotificationInput,
  executionId: string,
): Promise<string | null> {
  if (endsAtMs <= Date.now()) return null;

  await configurePomodoroNotificationChannelAsync();
  const permission = await getPermissionsAsync();
  if (!permission.granted) return null;

  const scheduledNotifications = await getAllScheduledNotificationsAsync();
  const existingNotification = scheduledNotifications.find(({ content }) =>
    getPomodoroExecutionId(content.data) === executionId,
  );
  if (existingNotification) return existingNotification.identifier;

  return scheduleNotificationAsync({
    content: {
      title: 'Pomodoro',
      body: getPomodoroPhaseCompletionMessage(phase),
      data: { type: 'pomodoro-phase-end', executionId, phase },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: endsAtMs,
      delivery: 'bestEffort',
      channelId: POMODORO_NOTIFICATION_CHANNEL_ID,
    },
  });
}

export function schedulePomodoroPhaseNotificationAsync(
  input: PomodoroPhaseNotificationInput,
): Promise<string | null> {
  const executionId = getExecutionId(input.phase, input.endsAtMs);
  const inFlightSchedule = inFlightSchedules.get(executionId);
  if (inFlightSchedule) return inFlightSchedule;

  const schedule = enqueueNotificationOperation(() =>
    schedulePhaseNotification(input, executionId),
  );
  inFlightSchedules.set(executionId, schedule);

  return schedule.finally(() => {
    if (inFlightSchedules.get(executionId) === schedule) {
      inFlightSchedules.delete(executionId);
    }
  });
}

export function cancelPomodoroPhaseNotificationAsync(
  input: PomodoroPhaseNotificationInput,
): Promise<void> {
  const executionId = getExecutionId(input.phase, input.endsAtMs);

  return enqueueNotificationOperation(async () => {
    const scheduledNotifications = await getAllScheduledNotificationsAsync();
    const matchingNotifications = scheduledNotifications.filter(
      ({ content }) => getPomodoroExecutionId(content.data) === executionId,
    );
    await Promise.all(
      matchingNotifications.map(({ identifier }) =>
        cancelScheduledNotificationAsync(identifier),
      ),
    );
  });
}

export function reconcilePomodoroPhaseNotificationsAsync(
  activeExecution: PomodoroPhaseNotificationInput | null,
): Promise<void> {
  return enqueueNotificationOperation(async () => {
    const scheduledNotifications = await getAllScheduledNotificationsAsync();
    const activeExecutionId =
      activeExecution && activeExecution.endsAtMs > Date.now()
        ? getExecutionId(activeExecution.phase, activeExecution.endsAtMs)
        : null;
    let keptActiveExecution = false;

    for (const notification of scheduledNotifications) {
      const executionId = getPomodoroExecutionId(
        notification.content.data,
      );
      if (executionId === null) continue;

      if (executionId === activeExecutionId && !keptActiveExecution) {
        keptActiveExecution = true;
        continue;
      }

      await cancelScheduledNotificationAsync(notification.identifier);
    }

    if (activeExecutionId !== null && !keptActiveExecution && activeExecution) {
      await schedulePhaseNotification(activeExecution, activeExecutionId);
    }
  });
}
