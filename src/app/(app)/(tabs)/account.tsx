import { router, type Href } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { Art, Button, Card, Icon, Screen, Txt } from '@/components/ui';
import type { ArtName } from '@/lib/art';
import { permitStatus } from '@/lib/format';
import { tokenStorage } from '@/lib/tokenStorage';
import { employeeApi, useGetMeQuery } from '@/store/api';
import { signedOut } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import type { Profile } from '@/types/api';

const roleLabel: Record<string, string> = { rep: 'Sales rep', delivery: 'Driver', production: 'Production', packaging: 'Packaging', designer: 'Designer', manager: 'Manager', superadmin: 'Admin' };
// The 8 contact details HR keeps for everyone.
const profileChecks = (p: Profile) => [p.phone, p.email, p.address?.street, p.address?.city, p.address?.state, p.address?.zip, p.emergencyContact?.name, p.emergencyContact?.phone];

function Row({ art, title, sub, href, onPress, children }: { art: ArtName; title: string; sub?: string; href?: Href; onPress?: () => void; children?: React.ReactNode }) {
  const press = href ? () => router.push(href) : onPress;
  return (
    <Pressable disabled={!press} onPress={press}>
      <Card className="flex-row items-center gap-4 py-5">
        <Art name={art} className="h-12 w-12" />
        <View className="flex-1 gap-1">
          <Txt weight="heavy" className="text-lg">{title}</Txt>
          {sub ? <Txt className="text-xs text-muted">{sub}</Txt> : null}
          {children}
        </View>
        {press && <Icon name="chevron-forward" color="#5d7391" />}
      </Card>
    </Pressable>
  );
}

export default function AccountScreen() {
  const dispatch = useAppDispatch();
  const employee = useAppSelector((s) => s.auth.employee);
  const { data } = useGetMeQuery();
  const p = data?.employee;
  const done = p ? profileChecks(p).filter((v) => String(v ?? '').trim()).length : 0;
  const permit = data?.olccPermit?.status;
  const ps = permitStatus(permit);

  // Passwords are changed by an admin, not from the app.
  function changePassword() {
    Alert.alert('Change password', 'Please ask Steven to change your password.', [{ text: 'OK' }]);
  }
  async function signOut() {
    await tokenStorage.clear();
    dispatch(signedOut());
    dispatch(employeeApi.util.resetApiState());
  }

  return (
    <Screen>
      <View className="mb-2 flex-row items-center gap-4">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-[#fb8a3a]"><Txt weight="heavy" className="text-4xl text-white">{employee?.name[0]}</Txt></View>
        <View className="flex-1">
          <Txt weight="heavy" className="text-3xl">{employee?.name}</Txt>
          <Txt className="text-lg text-muted">{roleLabel[employee?.employeeType ?? ''] ?? 'Employee'}{p?.beEmployeeId ? ` · ${p.beEmployeeId}` : ''}</Txt>
        </View>
      </View>
      <Row art="acctProfile" title="My profile" href="/profile">
        <View className="h-2.5 overflow-hidden rounded-full bg-[#e9e5dc]"><View className="h-full rounded-full bg-leaf" style={{ width: `${(done / 8) * 100}%` }} /></View>
        <Txt className="text-xs text-muted">{done} of 8 done</Txt>
      </Row>
      <Row art="acctPermit" title="Work permit and cards" href="/permits">
        <View className={`self-start rounded-full px-3 py-1 ${ps === 'completed' ? 'bg-leaf' : ps === 'pending' ? 'bg-brand-soft' : 'bg-[#e5e7eb]'}`}>
          <Txt weight="heavy" className={`text-xs ${ps === 'completed' ? 'text-white' : ps === 'pending' ? 'text-brand-dark' : 'text-[#5d6575]'}`}>OLCC permit: {permit ?? 'not on file'}</Txt>
        </View>
      </Row>
      <Row art="acctLock" title="Change password" sub="Ask Steven to change it" onPress={changePassword} />
      <Row art="acctFinger" title="Fingerprint sign-in" sub="Coming soon" />
      <Row art="acctCloud" title="App updates" sub="Version 1.0 · updates come through the app store" />
      <Row art="acctHr" title="HR documents" href="/documents" />
      {employee?.isDriver && <Row art="choiceDriving" title="Switch to Driving" sub="Go back to the Driving or HR screen" onPress={() => router.replace('/choice')} />}
      <Button title="Sign out" icon="log-out-outline" variant="outline" onPress={signOut} className="mx-6 mt-2" />
    </Screen>
  );
}
