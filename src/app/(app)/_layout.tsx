import { Stack } from 'expo-router';

// Signed-in area: the tab bar plus detail screens pushed on top of it.
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff8ec' } }} />;
}
