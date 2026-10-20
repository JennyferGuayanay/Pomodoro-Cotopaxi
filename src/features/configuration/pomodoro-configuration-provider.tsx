import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { Alert } from 'react-native';

import {
  DEFAULT_POMODORO_CONFIGURATION,
  type PomodoroConfiguration,
} from './pomodoro-configuration';
import {
  loadPomodoroConfiguration,
  savePomodoroConfiguration,
  type SavePomodoroConfigurationResult,
} from '@/features/persistence/pomodoro-configuration-storage';

type PomodoroConfigurationContextValue = {
  configuration: PomodoroConfiguration;
  isReady: boolean;
  hasLoadError: boolean;
  saveConfiguration: (
    value: unknown,
  ) => Promise<SavePomodoroConfigurationResult>;
};

const PomodoroConfigurationContext =
  createContext<PomodoroConfigurationContextValue | null>(null);

export function PomodoroConfigurationProvider({
  children,
}: PropsWithChildren) {
  const [configuration, setConfiguration] = useState<PomodoroConfiguration>({
    ...DEFAULT_POMODORO_CONFIGURATION,
  });
  const [isReady, setIsReady] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function restoreConfiguration() {
      try {
        const result = await loadPomodoroConfiguration();
        if (!isMounted) return;

        setConfiguration(result.configuration);
        setHasLoadError(result.status === 'readError');
      } catch (error) {
        console.error('Unable to restore Pomodoro configuration.', error);
        if (!isMounted) return;

        setConfiguration({ ...DEFAULT_POMODORO_CONFIGURATION });
        setHasLoadError(true);
      } finally {
        if (isMounted) setIsReady(true);
      }
    }

    void restoreConfiguration();

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveConfiguration(value: unknown) {
    const result = await savePomodoroConfiguration(value);
    if (result.status === 'saved') {
      setConfiguration(result.configuration);
      setHasLoadError(false);
    } else if (result.status === 'writeError') {
      console.error('Unable to persist Pomodoro configuration.', result.error);
      Alert.alert(
        'Configuración no guardada',
        'No se pudo guardar el cambio. Se conserva la configuración anterior.',
      );
    }
    return result;
  }

  return (
    <PomodoroConfigurationContext.Provider
      value={{
        configuration,
        isReady,
        hasLoadError,
        saveConfiguration,
      }}>
      {children}
    </PomodoroConfigurationContext.Provider>
  );
}

export function usePomodoroConfiguration(): PomodoroConfigurationContextValue {
  const context = useContext(PomodoroConfigurationContext);
  if (context === null) {
    throw new Error(
      'usePomodoroConfiguration must be used within PomodoroConfigurationProvider.',
    );
  }
  return context;
}
