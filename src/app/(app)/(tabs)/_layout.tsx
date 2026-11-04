import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@/components/ui';
import { useAppSelector } from '@/store';

const icon = (name: IconName) => function TabIcon({ color, size }: { color: ColorValue; size: number }) { return <Icon name={name} color={typeof color === 'string' ? color : undefined} size={size} />; };

export default function TabsLayout() {
  // Driving shows the route and nothing else, so it has no tab bar. HR never shows the route.
  const driving = useAppSelector((s) => s.auth.mode === 'driving');
  // Android (edge-to-edge) draws the system nav bar over the tabs; add its inset
  // as bottom padding so the labels sit above it.
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  return (
    <Tabs
      backBehavior={driving ? 'none' : 'firstRoute'}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f08a24',
        tabBarInactiveTintColor: '#44597a',
        tabBarLabelStyle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 12 },
        tabBarStyle: driving ? { display: 'none' } : { backgroundColor: '#fff', borderTopColor: '#ead9bd', borderTopWidth: 2, height: 60 + bottom, paddingTop: 6, paddingBottom: bottom },
        sceneStyle: { backgroundColor: '#fff8ec' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      {/* href: null also redirects away from the tab if it's focused, so only hide it in HR.
          In Driving the tab bar is hidden anyway, and Home redirects here, so null would loop. */}
      <Tabs.Screen name="route" options={{ title: 'Route', tabBarIcon: icon('route'), href: driving ? undefined : null }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: icon('earnings') }} />
      <Tabs.Screen name="time-off" options={{ title: 'Time Off', tabBarIcon: icon('timeoff') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon('account') }} />
    </Tabs>
  );
}
