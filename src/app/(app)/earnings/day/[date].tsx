import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Art, BackBar, Card, ComingSoon, Icon, Loading, Notice, Screen, Txt } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { clockTime, dayLabel, money } from '@/lib/format';
import { useGetWeekQuery } from '@/store/api';

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data: week, error, isLoading } = useGetWeekQuery(date); // the backend snaps any date to its pay week
  const list = week?.punches.filter((p) => p.workDate === date) ?? [];
  const hrs = +list.reduce((a, p) => a + p.hours, 0).toFixed(2);
  const rows = list.flatMap((p) => ([['In', p.clockIn, 'in'], ['Meal out', p.mealOut, 'out'], ['Meal in', p.mealIn, 'in'], ['Out', p.clockOut, 'out']] as const)
    .filter(([, t]) => t).map(([label, t, kind]) => ({ key: `${p.id}${label}`, label, t, kind })));

  return (
    <Screen>
      <BackBar title={dayLabel(date)} />
      <Notice kind="error">{error ? errorMessage(error) : ''}</Notice>
      {isLoading && <Loading />}
      {week && (
        <>
          <View className="h-48 items-center justify-center overflow-hidden rounded-3xl bg-[#fde3b8]">
            <Art name="homeMountains" className="absolute bottom-0 h-24 w-full" contentFit="cover" />
            <Txt weight="heavy" className="text-5xl">{hrs.toFixed(2)} hrs</Txt>
            <Txt weight="semi" className="text-2xl tracking-wide">{list.some((p) => p.open) ? 'so far' : 'worked'}</Txt>
          </View>
          {week.hourlyRate !== null && (
            <Card className="flex-row">
              <View className="flex-1 items-center"><Txt weight="heavy" className="text-xl">{money(week.hourlyRate)}</Txt><Txt className="text-sm text-navy-soft">rate</Txt></View>
              <View className="flex-1 items-center border-l border-[#e3ddd2]"><Txt weight="heavy" className="text-xl">{money(hrs * week.hourlyRate)}</Txt><Txt className="text-sm text-navy-soft">estimated</Txt></View>
            </Card>
          )}
          <Card>
            <Txt weight="heavy" className="mb-3 text-xl">Punches</Txt>
            {rows.length === 0 ? <Txt className="text-muted">No punches on this day.</Txt> : rows.map((r, i) => (
              <View key={r.key} className="flex-row items-center py-2.5">
                <View className="w-8 items-center">
                  {i > 0 && <View className="absolute -top-4 h-4 w-0.5 bg-[#cfd6e3]" />}
                  <View className={`h-5 w-5 rounded-full ${r.kind === 'in' ? 'bg-[#2a8a57]' : 'bg-brand'}`} />
                </View>
                <Txt weight="semi" className="ml-2 flex-1 text-lg">{r.label}</Txt>
                <Txt weight="heavy" className="text-lg">{clockTime(r.t)}</Txt>
              </View>
            ))}
          </Card>
          <View className="flex-row items-center gap-2">
            <Icon name="lock-closed" size={16} color="#5d7391" />
            <Txt className="text-muted">Times come straight from the company time clock.</Txt>
          </View>
          <ComingSoon title="Fix a punch">Ask your manager to correct a wrong or missing punch. Requests from the app are on the way.</ComingSoon>
        </>
      )}
    </Screen>
  );
}
