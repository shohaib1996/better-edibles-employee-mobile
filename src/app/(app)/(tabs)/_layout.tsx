import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { Icon, type IconName } from '@/components/ui';
import { useAppSelector } from '@/store';

const icon = (name: IconName) => function TabIcon({ color, size }: { color: ColorValue; size: number }) { return <Icon name={name} color={typeof color === 'string' ? color : undefined} size={size} />; };

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
      <Tabs.Screen name="route" options={{ title: 'Route', tabBarIcon: icon('route'), href: isDriver ? undefined : null }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: icon('earnings') }} />
      <Tabs.Screen name="time-off" options={{ title: 'Time Off', tabBarIcon: icon('timeoff') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon('account') }} />
    </Tabs>
  );
}
