import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Art, BackBar, Card, ComingSoon, Gradient, Loading, Notice, Screen, Txt } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { longDate, money, shortDate } from '@/lib/format';
import { useGetPayRunQuery } from '@/store/api';

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between border-b border-[#ece7dd] py-2.5">
      <Txt>{label}</Txt><Txt>{value}</Txt>
    </View>
  );
}

/** One approved pay week. Gross only: withholdings come from the payroll provider. */
export default function PayWeekScreen() {
  const { payPeriodStart } = useLocalSearchParams<{ payPeriodStart: string }>();
  const { data: r, error, isLoading } = useGetPayRunQuery(payPeriodStart);

  return (
    <Screen>
      <BackBar title="Pay week" />
      <Notice kind="error">{error ? errorMessage(error) : ''}</Notice>
      {isLoading && <Loading />}
      {r && (
        <>
          <Gradient colors={['#fde3b8', '#fbeed0']} className="min-h-44 overflow-hidden rounded-3xl p-5">
            <Art name="stubSky" className="absolute inset-0 h-full w-full opacity-90" contentFit="cover" />
            <Txt weight="semi">Gross pay</Txt>
            <Txt weight="heavy" className="text-5xl">{money(r.grossPay)}</Txt>
            <Txt weight="semi">{r.status === 'paid' ? 'Paid' : 'Pays'} {longDate(r.payDate)} · {shortDate(r.payPeriodStart)} – {shortDate(r.payPeriodEnd)}</Txt>
          </Gradient>
          <Card>
            <Txt weight="heavy" className="mb-1 text-xl">Earnings</Txt>
            {r.payType === 'hourly' ? (
              <>
                <Line label="Regular hours" value={`${r.regularHours.toFixed(2)} hrs`} />
                {r.overtimeHours > 0 && <Line label="Overtime hours (1.5×)" value={`${r.overtimeHours.toFixed(2)} hrs`} />}
                <Line label="Rate" value={`${money(r.hourlyRate)}/hr`} />
                <Line label="Hourly pay" value={money(r.hourlyPay)} />
              </>
            ) : <Line label="Salary" value={money(r.salaryPay)} />}
            {r.commission > 0 && <Line label="Commission" value={money(r.commission)} />}
            <View className="mt-2 flex-row justify-between rounded-xl bg-leaf-soft px-3 py-3">
              <Txt weight="heavy" className="text-xl text-leaf">Gross pay</Txt>
              <Txt weight="heavy" className="text-xl text-leaf">{money(r.grossPay)}</Txt>
            </View>
          </Card>
          <ComingSoon title="Taxes, net pay and stub download">Your full pay stub with taxes taken out comes from the payroll provider.</ComingSoon>
        </>
      )}
    </Screen>
  );
}
