import { View } from 'react-native';
import { BackBar, Card, ComingSoon, Icon, Loading, Notice, Screen, Txt } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { formatPhone } from '@/lib/format';
import { useGetMeQuery } from '@/store/api';

const or = (v?: string | null) => (v && v.trim()) || '-';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row py-1.5">
      <Txt weight="semi" className="w-[38%] text-muted">{label}</Txt>
      <Txt weight="heavy" className="flex-1">{value}</Txt>
    </View>
  );
}

/** Read-only: HR keeps these details in Accounting, the source of truth. */
export default function ProfileScreen() {
  const { data, error, isLoading } = useGetMeQuery();
  const p = data?.employee;
  const a = p?.address ?? {};
  const ec = p?.emergencyContact ?? {};
  const address = [a.street, [a.city, [a.state, a.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')].filter((x) => x && x.trim()).join('\n');

  return (
    <Screen>
      <BackBar title="My profile" />
      <Notice kind="error">{error ? errorMessage(error) : ''}</Notice>
      {isLoading && <Loading />}
      {p && (
        <>
          <Card>
            <Txt weight="heavy" className="mb-2 text-2xl">About me</Txt>
            <Field label="Name" value={p.name} />
            <Field label="Address" value={address || '-'} />
            <Field label="Phone" value={formatPhone(p.phone)} />
            <Field label="Email" value={or(p.email)} />
            {p.beEmployeeId && <Field label="Employee ID" value={p.beEmployeeId} />}
          </Card>
          <Card>
            <Txt weight="heavy" className="mb-2 text-2xl">Emergency contact</Txt>
            <Field label="Name" value={or(ec.name)} />
            <Field label="Relationship" value={or(ec.relationship)} />
            <Field label="Phone" value={formatPhone(ec.phone)} />
          </Card>
          <ComingSoon title="Edit from the app">Updating your details here is on the way. For now, ask HR to change anything that is wrong.</ComingSoon>
          <View className="flex-row items-center gap-2">
            <Icon name="information-circle-outline" color="#f08a24" />
            <Txt className="flex-1 text-muted">Your Social Security number is never shown in the app.</Txt>
          </View>
        </>
      )}
    </Screen>
  );
}
