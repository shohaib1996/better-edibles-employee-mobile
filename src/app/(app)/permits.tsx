import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, BackBar, Card, ComingSoon, Loading, Notice, Screen, StatusBadge, Txt } from '@/components/ui';
import { Buddy } from '@/features/buddy/Buddy';
import { errorMessage } from '@/lib/errors';
import { permitStatus } from '@/lib/format';
import { useGetMeQuery, useListDocsQuery } from '@/store/api';
import { useAppSelector } from '@/store';

export default function PermitsScreen() {
  const employee = useAppSelector((s) => s.auth.employee);
  const me = useGetMeQuery();
  const docs = useListDocsQuery();
  const production = employee?.employeeType === 'production';
  const olcc = me.data?.olccPermit?.status;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-cream">
      <Screen contentClassName="pb-28">
        <BackBar title="Work permit and cards" />
        <Notice kind="error">{me.error ? errorMessage(me.error) : ''}</Notice>
        {me.isLoading && <Loading />}
        <Card className="flex-row gap-4">
          <Art name="cardPermit" className="aspect-[1.36] w-2/5 rounded-xl" />
          <View className="flex-1 gap-2">
            <Txt weight="heavy" className="text-xl">OLCC worker permit</Txt>
            <StatusBadge status={permitStatus(olcc)} label={olcc ? olcc.charAt(0).toUpperCase() + olcc.slice(1) : undefined} />
            <Txt className="text-xs text-muted">HR keeps your permit status. Tell HR when you renew it.</Txt>
          </View>
        </Card>
        <Card className="flex-row gap-4">
          <View className="w-2/5 flex-row gap-2">
            <View className="flex-1 items-center"><Art name="cardLicenseFront" className="aspect-[1.5] w-full rounded-lg" /><Txt className="text-xs text-muted">Front</Txt></View>
            <View className="flex-1 items-center"><Art name="cardLicenseBack" className="aspect-[1.5] w-full rounded-lg" /><Txt className="text-xs text-muted">Back</Txt></View>
          </View>
          <View className="flex-1 gap-1">
            <Txt weight="heavy" className="text-xl">Driver's license</Txt>
            <Txt className="text-xs text-muted">{employee?.isDriver ? 'Required for drivers.' : 'Only needed if you drive for the company.'}</Txt>
          </View>
        </Card>
        {production && (
          <Card className="flex-row gap-4">
            <Art name="cardFood" className="aspect-[1.57] w-2/5 rounded-xl" />
            <View className="flex-1 gap-1">
              <Txt weight="heavy" className="text-xl">Food handler card</Txt>
              <Txt className="text-xs text-muted">Required for the production team.</Txt>
            </View>
          </Card>
        )}
        <ComingSoon title="Upload photos of your cards">Take a photo of your permit, license or food handler card and send it to HR. For now, give HR a copy in person.</ComingSoon>
      </Screen>
      {me.data && <Buddy me={me.data} docs={docs.data ?? []} production={production} />}
    </SafeAreaView>
  );
}
