import { act, renderHook } from '@testing-library/react-native';

import { useTimer } from '../use-timer';

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('updates from the clock only while running', async () => {
    let nowMs = 0;
    const now = () => nowMs;
    const { result } = await renderHook(() =>
      useTimer({ durationMs: 10_000, now, refreshIntervalMs: 250 }),
    );

    await act(() => result.current.start());
    expect(result.current.formattedTime).toBe('00:10');

    await act(() => {
      nowMs = 1_250;
      jest.advanceTimersByTime(250);
    });

    expect(result.current.remainingMs).toBe(8_750);
    expect(result.current.formattedTime).toBe('00:09');
  });

  test('keeps paused time stable and resumes from it', async () => {
    let nowMs = 0;
    const now = () => nowMs;
    const { result } = await renderHook(() =>
      useTimer({ durationMs: 10_000, now, refreshIntervalMs: 250 }),
    );

    await act(() => result.current.start());
    await act(() => {
      nowMs = 2_000;
      result.current.pause();
    });

    expect(result.current.state.status).toBe('paused');
    expect(result.current.remainingMs).toBe(8_000);

    await act(() => {
      nowMs = 20_000;
      jest.advanceTimersByTime(5_000);
    });
    expect(result.current.remainingMs).toBe(8_000);

    await act(() => result.current.resume());
    await act(() => {
      nowMs = 21_000;
      jest.advanceTimersByTime(250);
    });
    expect(result.current.remainingMs).toBe(7_000);
  });

  test('suspends reset confirmation and resumes after cancellation', async () => {
    let nowMs = 0;
    const now = () => nowMs;
    const { result } = await renderHook(() =>
      useTimer({ durationMs: 10_000, now, refreshIntervalMs: 250 }),
    );

    await act(() => result.current.start());
    await act(() => {
      nowMs = 3_000;
      result.current.requestReset();
    });

    expect(result.current.state.status).toBe('confirmingReset');
    expect(result.current.remainingMs).toBe(7_000);

    await act(() => {
      nowMs = 30_000;
      jest.advanceTimersByTime(5_000);
    });
    expect(result.current.remainingMs).toBe(7_000);

    await act(() => result.current.cancelReset());
    expect(result.current.state.status).toBe('running');
    expect(result.current.remainingMs).toBe(7_000);

    await act(() => {
      nowMs = 31_000;
      jest.advanceTimersByTime(250);
    });
    expect(result.current.remainingMs).toBe(6_000);
  });

  test('restores the duration and stops after reset confirmation', async () => {
    let nowMs = 0;
    const now = () => nowMs;
    const { result } = await renderHook(() => useTimer({ durationMs: 10_000, now }));

    await act(() => result.current.start());
    await act(() => {
      nowMs = 4_000;
      result.current.requestReset();
    });
    await act(() => result.current.confirmReset());

    expect(result.current.state).toEqual({
      status: 'stopped',
      durationMs: 10_000,
      remainingMs: 10_000,
    });
    expect(result.current.formattedTime).toBe('00:10');
  });

  test('stops at zero and clears scheduled updates', async () => {
    let nowMs = 0;
    const now = () => nowMs;
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
    const { result } = await renderHook(() =>
      useTimer({ durationMs: 1_000, now, refreshIntervalMs: 250 }),
    );

    await act(() => result.current.start());
    const intervalHandle = setIntervalSpy.mock.results[setIntervalSpy.mock.results.length - 1].value;

    await act(() => {
      nowMs = 1_000;
      jest.advanceTimersByTime(250);
    });

    expect(result.current.state.status).toBe('stopped');
    expect(result.current.formattedTime).toBe('00:00');
    expect(clearIntervalSpy).toHaveBeenCalledWith(intervalHandle);
  });

  test('reports a natural completion exactly once', async () => {
    let nowMs = 0;
    const now = () => nowMs;
    const onComplete = jest.fn();
    const { result, rerender } = await renderHook(() =>
      useTimer({ durationMs: 1_000, now, onComplete, refreshIntervalMs: 250 }),
    );

    await act(() => result.current.start());
    await act(() => {
      nowMs = 1_000;
      jest.advanceTimersByTime(250);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);

    await rerender(undefined);
    await act(() => jest.advanceTimersByTime(1_000));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('does not report completion for pause or confirmed reset', async () => {
    let nowMs = 0;
    const now = () => nowMs;
    const onComplete = jest.fn();
    const { result } = await renderHook(() =>
      useTimer({ durationMs: 10_000, now, onComplete }),
    );

    await act(() => result.current.start());
    await act(() => {
      nowMs = 2_000;
      result.current.pause();
    });
    await act(() => result.current.resume());
    await act(() => result.current.requestReset());
    await act(() => result.current.confirmReset());

    expect(onComplete).not.toHaveBeenCalled();
  });

  test('clears scheduled updates when unmounted', async () => {
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
    const { result, unmount } = await renderHook(() =>
      useTimer({ durationMs: 10_000, refreshIntervalMs: 250 }),
    );

    await act(() => result.current.start());
    const intervalHandle = setIntervalSpy.mock.results[setIntervalSpy.mock.results.length - 1].value;

    await act(() => unmount());
    expect(clearIntervalSpy).toHaveBeenCalledWith(intervalHandle);
  });
});
