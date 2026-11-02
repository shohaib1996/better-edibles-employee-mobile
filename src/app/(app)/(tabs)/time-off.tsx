import { View } from 'react-native';
import { Art, Card, ComingSoon, Loading, Notice, Screen, Txt } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { days, longDate } from '@/lib/format';
import { useGetMeQuery } from '@/store/api';

export default function TimeOffScreen() {
  const { data, error, isLoading, refetch, isFetching } = useGetMeQuery();
  const pto = data?.pto;
  return (
    <Screen onRefresh={refetch} refreshing={isFetching && !isLoading}>
      <View className="flex-row items-center">
        <Txt weight="heavy" className="flex-1 text-4xl">Time Off</Txt>
        <Art name="timeoffArt" className="h-24 w-44" />
      </View>
      <Notice kind="error">{error ? errorMessage(error) : data && !pto ? data.accounting?.message ?? 'Your PTO is not available right now.' : ''}</Notice>
      {isLoading && <Loading />}
      {pto && (
        <>
          <Card className="flex-row">
            <View className="flex-1 items-center"><Txt weight="heavy" className="text-2xl">{days(pto.availableDays)}</Txt><Txt className="text-navy-soft">pto available</Txt></View>
            <View className="flex-1 items-center border-l border-[#e3ddd2]"><Txt weight="heavy" className="text-2xl">{days(pto.usedDays)}</Txt><Txt className="text-navy-soft">used this year</Txt></View>
          </Card>
          <Card className="gap-1">
            <Txt weight="heavy" className="mb-1 text-xl">Your PTO</Txt>
            {([
              ['Earned this year', days(pto.accruedDays)],
              ['Yearly amount for your time here', days(pto.annualDays)],
              ...(pto.hireDate ? [['Started', longDate(pto.hireDate)]] : []),
            ] as const).map(([k, v]) => (
              <View key={k} className="flex-row justify-between border-b border-[#ece7dd] py-2.5"><Txt>{k}</Txt><Txt weight="heavy">{v}</Txt></View>
            ))}
          </Card>
          <Txt className="text-sm leading-5 text-muted">
            PTO starts after 6 months: 5 days a year, plus 1 day every 6 months, up to 10. Unused days reset on Dec 31 and are taken during the winter break.
          </Txt>
        </>
      )}
      <ComingSoon title="Request days off">Pick your days here and send them for approval. Until then, ask your manager.</ComingSoon>
    </Screen>
  );
}
