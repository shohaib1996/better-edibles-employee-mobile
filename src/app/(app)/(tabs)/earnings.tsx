import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, Card, Icon, Loading, Notice, Screen, Txt } from '@/components/ui';
import { byDay } from '@/features/earnings/byDay';
import { errorMessage } from '@/lib/errors';
import { addDays, dayLabel, days, money, shortDate, todayPacific } from '@/lib/format';
import { useGetMeQuery, useGetWeekQuery } from '@/store/api';

export default function EarningsScreen() {
  const [start, setStart] = useState<string | undefined>();
  const week = useGetWeekQuery(start);
  const me = useGetMeQuery();
  const w = week.data;
  const pto = me.data?.pto;
  const current = !!w && w.payPeriodEnd >= todayPacific();
  const pct = w ? Math.min(100, (w.totals.hours / 40) * 100) : 0;
  const rate = w?.hourlyRate;

  return (
    <View className="flex-1 bg-cream">
      <SafeAreaView edges={['top']} className="bg-[#f9a75a]">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Txt weight="heavy" className="text-4xl">Earnings</Txt>
          <Link href="/earnings/history" asChild>
            <Pressable className="rounded-full border-2 border-navy px-4 py-1.5"><Txt weight="heavy">History</Txt></Pressable>
          </Link>
        </View>
      </SafeAreaView>
      <Screen edges={[]} onRefresh={() => { week.refetch(); me.refetch(); }} refreshing={week.isFetching && !week.isLoading} contentClassName="pt-4">
        <Notice kind="error">{week.error ? errorMessage(week.error) : ''}</Notice>
        {week.isLoading && <Loading />}
        {w && (
          <>
            <View className="flex-row items-center justify-between">
              <Pressable onPress={() => setStart(addDays(w.payPeriodStart, -7))} accessibilityLabel="Earlier week" className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Icon name="chevron-back" />
              </Pressable>
              <Txt weight="heavy">{shortDate(w.payPeriodStart)} – {shortDate(w.payPeriodEnd)}{current ? ' · this week' : ''}</Txt>
              <Pressable disabled={current} onPress={() => setStart(addDays(w.payPeriodStart, 7))} accessibilityLabel="Later week"
                className={`h-10 w-10 items-center justify-center rounded-full bg-white ${current ? 'opacity-30' : ''}`}>
                <Icon name="chevron-forward" />
              </Pressable>
            </View>

            <View className="overflow-hidden rounded-3xl bg-[#fde6b8] p-5">
              <Art name="earnArt" className="absolute right-0 top-2 h-28 w-3/5" />
              <Txt weight="semi" className="text-base">{current ? 'This week so far' : 'That week'}</Txt>
              <Txt weight="heavy" className="text-5xl">{w.estimatedGross !== null ? money(w.estimatedGross) : `${w.totals.hours.toFixed(2)} hrs`}</Txt>
              {w.estimatedGross !== null && <Txt weight="semi" className="text-xs text-navy-soft">Estimate before taxes. Paid {shortDate(w.payDate)}{w.approved ? ' · approved' : ''}</Txt>}
              <View className="mb-2 mt-4 h-3.5 overflow-hidden rounded-full bg-[#e9e5dc]">
                <View className="h-full rounded-full bg-[#20a35a]" style={{ width: `${pct}%` }} />
              </View>
              <View className="flex-row justify-between">
                <Txt weight="heavy">{w.totals.hours.toFixed(2)} hrs</Txt>
                <Txt>{w.totals.overtimeHours > 0 ? `${w.totals.overtimeHours.toFixed(2)} hrs overtime` : `${Math.max(0, 40 - w.totals.hours).toFixed(2)} hrs to 40`}</Txt>
              </View>
            </View>

            {pto && (
              <Pressable onPress={() => router.push('/time-off')}>
                <Card className="flex-row items-center gap-4">
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-[#dff1e6]"><Icon name="leaf" color="#22844c" size={28} /></View>
                  <View className="flex-1">
                    <Txt weight="semi">PTO available</Txt>
                    <Txt weight="heavy" className="text-2xl">{days(pto.availableDays)}</Txt>
                    <Txt className="text-xs text-muted">{pto.eligible ? `${days(pto.usedDays)} used of ${days(pto.accruedDays)} this year` : 'You can use PTO after 6 months'}</Txt>
                  </View>
                </Card>
              </Pressable>
            )}

            <Txt weight="heavy" className="mt-2 text-2xl">Days</Txt>
            {w.punches.length === 0 ? <Txt className="text-muted">No punches this week.</Txt> : (
              <Card className="p-0">
                {byDay(w.punches).map((d, i) => (
                  <Link key={d.date} href={`/earnings/day/${d.date}`} asChild>
                    <Pressable className={`flex-row items-center px-4 py-3.5 ${i > 0 ? 'border-t border-[#efe9de]' : ''}`}>
                      <View className="flex-[1.3]">
                        <Txt weight="heavy">{dayLabel(d.date)}</Txt>
                        {d.open && <Txt weight="semi" className="mt-1 self-start rounded-md bg-[#fde3cc] px-2 text-xs text-[#c25a0c]">Clocked in</Txt>}
                      </View>
                      <Txt className="flex-1">{d.hours.toFixed(2)} hrs</Txt>
                      <Txt className="flex-1">{rate ? `${money(rate)}/hr` : ''}</Txt>
                      <Txt weight="semi" className="flex-1 text-right">{rate ? money(d.hours * rate) : ''}</Txt>
                    </Pressable>
                  </Link>
                ))}
              </Card>
            )}
          </>
        )}
      </Screen>
    </View>
  );
}
