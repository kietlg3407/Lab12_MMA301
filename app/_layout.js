import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { initializeDatabase } from '../src/database';
import { COLORS } from '../src/theme';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="computer-store.db" onInit={initializeDatabase}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
      </Stack>
    </SQLiteProvider>
  );
}
