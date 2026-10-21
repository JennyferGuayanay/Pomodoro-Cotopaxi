import { renderHook } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'dark',
}));

describe('useTheme', () => {
  test('keeps the approved provisional palette when Android uses dark mode', async () => {
    const { result } = await renderHook(() => useTheme());

    expect(result.current).toEqual(Colors.light);
  });
});
