import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen
            name="destination-selection"
            options={{ headerShown: true, title: 'Destination', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="ride-matching"
            options={{ headerShown: true, title: 'Find a ride', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="ride-coordination"
            options={{ headerShown: true, title: 'Your group', headerBackTitle: 'Back' }}
          />
          <Stack.Screen name="kyc-verification" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="change-password" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
