import { Tabs } from 'expo-router';
import { Icon, type IconName } from '@/components/ui';
import { useAppSelector } from '@/store';

const icon = (name: IconName) => ({ color, size }: { color: string; size: number }) => <Icon name={name} color={color} size={size} />;

export default function TabsLayout() {
  const isDriver = useAppSelector((s) => !!s.auth.employee?.isDriver);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f08a24',
        tabBarInactiveTintColor: '#44597a',
        tabBarLabelStyle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 12 },
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#ead9bd', borderTopWidth: 2, height: 64, paddingTop: 6 },
        sceneStyle: { backgroundColor: '#fff8ec' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      {/* Route is for drivers only. */}
      <Tabs.Screen name="route" options={{ title: 'Route', tabBarIcon: icon('location'), href: isDriver ? undefined : null }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: icon('cash') }} />
      <Tabs.Screen name="time-off" options={{ title: 'Time Off', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon('person') }} />
    </Tabs>
  );
}
