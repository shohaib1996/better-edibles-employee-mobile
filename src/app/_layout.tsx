import '../../global.css';
import '@/lib/nativewindInterop';
import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold, useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { tokenStorage } from '@/lib/tokenStorage';
import { employeeApi } from '@/store/api';
import { employeeLoaded, signedOut, tokenRestored } from '@/store/authSlice';
import { store, useAppDispatch, useAppSelector } from '@/store';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Restores the saved token and loads "me" before showing any screen.
function useBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    (async () => {
      const token = await tokenStorage.get().catch(() => null);
      dispatch(tokenRestored(token));
      if (!token) return;
      const res = await dispatch(employeeApi.endpoints.getMe.initiate());
      if (res.data) {
        const e = res.data.employee;
        dispatch(employeeLoaded({ id: e.id, name: e.name, email: e.email, employeeType: e.employeeType, isDriver: e.isDriver }));
      } else {
        // A 401 already signed out; anything else (offline) also lands on login.
        dispatch(signedOut());
      }
    })();
  }, [dispatch]);
}

function RootNavigator() {
  useBootstrap();
  const status = useAppSelector((s) => s.auth.status);
  const [fontsLoaded, fontError] = useFonts({ Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold });
  // If a font fails, carry on with the system font rather than hanging on the splash screen.
  const ready = (fontsLoaded || !!fontError) && status !== 'booting';

  useEffect(() => { if (ready) SplashScreen.hideAsync().catch(() => {}); }, [ready]);
  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff8ec' } }}>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={status !== 'signedIn'}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
