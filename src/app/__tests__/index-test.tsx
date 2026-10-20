import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import HomeScreen from '../index';

jest.mock('expo-router', () => {
  const React = jest.requireActual('react') as typeof import('react');
  const { View: MockView } =
    jest.requireActual('react-native') as typeof import('react-native');

  return {
    Link: ({
      href,
      children,
    }: {
      href: string;
      children: ReactNode;
    }) =>
      React.createElement(
        MockView,
        { testID: `route-link-${href}` },
        children,
      ),
  };
});
jest.mock('@/components/pomodoro-cycle', () => ({
  PomodoroCycle: () => null,
}));

describe('<HomeScreen />', () => {
  test('exposes a direct configuration route from the main screen', async () => {
    await render(<HomeScreen />);

    expect(screen.getByTestId('route-link-./settings')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Abrir configuración' }),
    ).toBeOnTheScreen();
  });
});
