import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PomodoroCycle } from '@/components/pomodoro-cycle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="smallBold">Pomodoro Cotopaxi</ThemedText>
          <Link href="./settings" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir configuración"
              style={({ pressed }) => [
                styles.settingsButton,
                { backgroundColor: theme.backgroundSelected },
                pressed && styles.buttonPressed,
              ]}>
              <ThemedText type="smallBold">Configuración</ThemedText>
            </Pressable>
          </Link>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.timerCard}>
          <PomodoroCycle />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  settingsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  timerCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
});
