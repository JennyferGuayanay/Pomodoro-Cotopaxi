import {
  createTimerState,
  DEFAULT_STUDY_DURATION_MS,
  formatRemainingTime,
  getRemainingMs,
  transitionTimer,
  type TimerState,
} from '../timer-state';

describe('timer state', () => {
  test('creates a stopped timer with the default study duration', () => {
    expect(createTimerState()).toEqual({
      status: 'stopped',
      durationMs: DEFAULT_STUDY_DURATION_MS,
      remainingMs: DEFAULT_STUDY_DURATION_MS,
    });
  });

  test('starts from the configured duration', () => {
    const state = transitionTimer(createTimerState(10_000), { type: 'start' }, 2_000);

    expect(state).toEqual({ status: 'running', durationMs: 10_000, endsAtMs: 12_000 });
    expect(getRemainingMs(state, 3_500)).toBe(8_500);
  });

  test('pauses and keeps the remaining time stable', () => {
    const running = transitionTimer(createTimerState(10_000), { type: 'start' }, 0);
    const paused = transitionTimer(running, { type: 'pause' }, 2_500);

    expect(paused).toEqual({ status: 'paused', durationMs: 10_000, remainingMs: 7_500 });
    expect(getRemainingMs(paused, 50_000)).toBe(7_500);
  });

  test('resumes without restoring the configured duration', () => {
    const paused: TimerState = {
      status: 'paused',
      durationMs: 10_000,
      remainingMs: 7_500,
    };
    const resumed = transitionTimer(paused, { type: 'resume' }, 5_000);

    expect(resumed).toEqual({ status: 'running', durationMs: 10_000, endsAtMs: 12_500 });
  });

  test('suspends a running timer while reset confirmation is open', () => {
    const running = transitionTimer(createTimerState(10_000), { type: 'start' }, 0);
    const confirming = transitionTimer(running, { type: 'requestReset' }, 2_000);

    expect(confirming).toEqual({
      status: 'confirmingReset',
      durationMs: 10_000,
      remainingMs: 8_000,
      previousStatus: 'running',
    });
    expect(getRemainingMs(confirming, 20_000)).toBe(8_000);
  });

  test('keeps a paused timer suspended while reset confirmation is open', () => {
    const paused: TimerState = {
      status: 'paused',
      durationMs: 10_000,
      remainingMs: 6_000,
    };

    expect(transitionTimer(paused, { type: 'requestReset' }, 20_000)).toEqual({
      status: 'confirmingReset',
      durationMs: 10_000,
      remainingMs: 6_000,
      previousStatus: 'paused',
    });
  });

  test('cancels reset by resuming a previously running timer', () => {
    const confirming: TimerState = {
      status: 'confirmingReset',
      durationMs: 10_000,
      remainingMs: 8_000,
      previousStatus: 'running',
    };
    const resumed = transitionTimer(confirming, { type: 'cancelReset' }, 5_000);

    expect(resumed).toEqual({ status: 'running', durationMs: 10_000, endsAtMs: 13_000 });
  });

  test('cancels reset by restoring a previously paused timer', () => {
    const confirming: TimerState = {
      status: 'confirmingReset',
      durationMs: 10_000,
      remainingMs: 6_000,
      previousStatus: 'paused',
    };

    expect(transitionTimer(confirming, { type: 'cancelReset' }, 50_000)).toEqual({
      status: 'paused',
      durationMs: 10_000,
      remainingMs: 6_000,
    });
  });

  test('confirms reset by restoring the duration and stopping', () => {
    const confirming: TimerState = {
      status: 'confirmingReset',
      durationMs: 10_000,
      remainingMs: 6_000,
      previousStatus: 'running',
    };

    expect(transitionTimer(confirming, { type: 'confirmReset' }, 50_000)).toEqual({
      status: 'stopped',
      durationMs: 10_000,
      remainingMs: 10_000,
    });
  });

  test('stops at zero without producing negative time', () => {
    const running = transitionTimer(createTimerState(1_000), { type: 'start' }, 10_000);
    const stopped = transitionTimer(running, { type: 'tick' }, 11_500);

    expect(stopped).toEqual({ status: 'stopped', durationMs: 1_000, remainingMs: 0 });
    expect(getRemainingMs(stopped, 99_000)).toBe(0);
  });
});

describe('formatRemainingTime', () => {
  test.each([
    [0, '00:00'],
    [-1, '00:00'],
    [1, '00:01'],
    [1_000, '00:01'],
    [1_001, '00:02'],
    [25 * 60 * 1000, '25:00'],
    [100 * 60 * 1000, '100:00'],
  ])('formats %i milliseconds as %s', (remainingMs, expected) => {
    expect(formatRemainingTime(remainingMs)).toBe(expected);
  });
});
