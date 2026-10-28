import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Art, BackBar, Button, Card, Icon, Notice, Screen, Txt } from '@/components/ui';
import { PinPrompt } from '@/features/clock/PinPrompt';
import { usePunch } from '@/features/clock/usePunch';
import { clockTime } from '@/lib/format';
import { useGetClockStateQuery, useGetWeekQuery } from '@/store/api';

export default function ClockScreen() {
  const { data: clock, refetch } = useGetClockStateQuery();
  const week = useGetWeekQuery();
  const punch = usePunch();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(t); }, []);

  const pill = !clock ? '...' : clock.status === 'on_meal' ? 'On meal' : clock.status === 'clocked_in' ? `In since ${clockTime(clock.clockInAt)}` : 'Not clocked in';
  const worked = week.data?.totals.hours;
  const btn = (enabled: boolean) => (enabled && !punch.busy ? '' : 'opacity-50');

  return (
    <Screen onRefresh={() => { refetch(); week.refetch(); }}>
      <BackBar right={
        <View className={`rounded-full px-4 py-1.5 ${clock && clock.status !== 'clocked_out' ? 'bg-leaf-soft' : 'bg-[#e7e7f2]'}`}>
          <Txt weight="semi" className="text-sm text-navy-soft">{pill}</Txt>
        </View>
      } />
      <Art name="clockArt" className="aspect-square w-3/4 self-center" />
      <Txt weight="heavy" className="text-center text-6xl">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Txt>
      <Txt weight="semi" className="text-center text-2xl">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Txt>

      <View className="mt-2 flex-row gap-3">
        <Pressable disabled={!clock?.canClockIn || !!punch.busy} onPress={() => punch.run('clock-in')}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-leaf py-5 ${btn(!!clock?.canClockIn)}`}>
          <Icon name="play" color="#fff" size={24} /><Txt weight="heavy" className="text-xl text-white">{punch.busy === 'clock-in' ? 'Working...' : 'Clock in'}</Txt>
        </Pressable>
        <Pressable disabled={!clock?.canClockOut || !!punch.busy} onPress={() => punch.run('clock-out')}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 bg-white py-5 ${clock?.canClockOut ? 'border-danger' : 'border-[#b7bfcf]'} ${btn(!!clock?.canClockOut)}`}>
          <Icon name="stop" color={clock?.canClockOut ? '#d64545' : '#9aa4b8'} size={22} />
          <Txt weight="heavy" className={`text-xl ${clock?.canClockOut ? 'text-danger' : 'text-[#9aa4b8]'}`}>{punch.busy === 'clock-out' ? 'Working...' : 'Clock out'}</Txt>
        </Pressable>
      </View>
      {(clock?.canMealOut || clock?.canMealIn) && (
        <Button variant="outline" loading={punch.busy === 'meal-in' || punch.busy === 'meal-out'}
          title={clock.canMealIn ? `End meal break (started ${clockTime(clock.mealOutAt)})` : 'Start meal break'}
          onPress={() => punch.run(clock.canMealIn ? 'meal-in' : 'meal-out')} />
      )}
      <Notice kind="error">{punch.error}</Notice>
      <PinPrompt punch={punch} />

      <Card className="flex-row items-center gap-3">
        <Icon name="location" color="#f08a24" size={30} />
        <Txt weight="semi" className="flex-1">Your location is only checked when you press Clock in or Clock out, never in the background.</Txt>
      </Card>
      <Card>
        <Txt weight="semi" className="text-muted">This week</Txt>
        <View className="mt-1 flex-row items-baseline">
          <View className="flex-1 flex-row items-baseline gap-1"><Txt weight="heavy" className="text-4xl">{worked == null ? '-' : worked.toFixed(1)}</Txt><Txt weight="semi" className="text-lg text-muted">hrs</Txt></View>
          <View className="flex-1 flex-row items-baseline gap-1 border-l-2 border-[#e8e2d6] pl-5"><Txt weight="heavy" className="text-4xl">{worked == null ? '-' : Math.max(0, 40 - worked).toFixed(1)}</Txt><Txt weight="semi" className="text-lg text-muted">hrs left</Txt></View>
        </View>
      </Card>
    </Screen>
  );
}
