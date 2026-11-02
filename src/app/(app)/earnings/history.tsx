import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Art, BackBar, Card, Gradient, Icon, Loading, Notice, Screen, Txt } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { days, longDate, money } from '@/lib/format';
import { useGetMeQuery, useGetPayHistoryQuery } from '@/store/api';

const n2 = (x: number) => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function HistoryScreen() {
  const history = useGetPayHistoryQuery();
  const pto = useGetMeQuery().data?.pto;
  const h = history.data;

  return (
    <Screen onRefresh={history.refetch}>
      <BackBar title="History" />
      <Notice kind="error">{history.error ? errorMessage(history.error) : ''}</Notice>
      {history.isLoading && <Loading />}
      {h && (
        <Gradient colors={['#fff3d6', '#fde6b8']} angle={160} className="min-h-56 overflow-hidden rounded-3xl p-5">
          <Art name="historyArt" className="absolute bottom-0 right-0 h-full w-2/5" contentFit="cover" />
          <Txt weight="semi" className="mb-2">{h.yearToDate.year} so far</Txt>
          <View className="w-3/5 flex-row flex-wrap">
            {[
              [money(h.yearToDate.grossPay), 'gross paid'], [n2(h.yearToDate.totalHours), 'hours paid'],
              ...(pto ? [[days(pto.accruedDays), 'pto earned'], [days(pto.usedDays), 'pto used']] : []),
            ].map(([value, label]) => (
              <View key={label} className="w-1/2 py-2 pr-2">
                <Txt weight="heavy" className="text-xl">{value}</Txt>
                <Txt className="text-xs text-navy-soft">{label}</Txt>
              </View>
            ))}
          </View>
        </Gradient>
      )}
      {pto && (
        <Card className="flex-row items-center gap-3">
          <Icon name="leaf" color="#22844c" size={24} />
          <Txt className="flex-1">PTO available</Txt>
          <Txt weight="heavy" className="text-xl">{days(pto.availableDays)}</Txt>
        </Card>
      )}
      <Txt weight="heavy" className="mt-2 text-2xl">Pay weeks</Txt>
      {h && h.runs.length === 0 && <Txt className="text-muted">No approved pay weeks yet.</Txt>}
      {h?.runs.map((r) => (
        <Link key={r.payPeriodStart} href={`/earnings/pay/${r.payPeriodStart}`} asChild>
          <Pressable>
            <Card className="flex-row items-center gap-3">
              <Icon name="document-text-outline" size={28} />
              <View className="flex-1">
                <Txt weight="heavy">{longDate(r.payDate)}</Txt>
                <Txt className="text-xs text-muted">{r.totalHours.toFixed(2)} hrs · {r.status === 'paid' ? 'Paid' : 'Approved'}</Txt>
              </View>
              <Txt weight="heavy">{money(r.grossPay)}</Txt>
            </Card>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}
