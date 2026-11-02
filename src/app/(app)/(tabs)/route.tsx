import { Link, Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, BackBar, Button, Card, Gradient, Icon, Loading, Notice, Screen, Txt } from '@/components/ui';
import { PinPrompt } from '@/features/clock/PinPrompt';
import { usePunch } from '@/features/clock/usePunch';
import { openDirections, paymentLabel, stopTime } from '@/features/route/helpers';
import { errorMessage } from '@/lib/errors';
import { money } from '@/lib/format';
import { useGetClockStateQuery, useGetRouteQuery, useMarkArrivedMutation } from '@/store/api';
import { useAppSelector } from '@/store';

export default function RouteScreen() {
  const isDriver = useAppSelector((s) => !!s.auth.employee?.isDriver);
  const route = useGetRouteQuery(undefined, { skip: !isDriver });
  const clock = useGetClockStateQuery(undefined, { skip: !isDriver });
  const [markArrived, arriving] = useMarkArrivedMutation();
  const punch = usePunch();
  const [navigatorOn, setNavigatorOn] = useState(true); // the Navigator voice agent runs on the server
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  if (!isDriver) return <Redirect href="/" />;
  if (route.isLoading || clock.isLoading) return <Screen><Loading /></Screen>;
  const stops = route.data ?? [];
  const left = stops.filter((s) => !s.done);
  const loadError = route.error ? errorMessage(route.error) : clock.error ? errorMessage(clock.error) : '';

  // Not clocked in yet: "Ready to roll?"
  if (clock.data?.status === 'clocked_out') {
    return (
      <Screen onRefresh={() => { route.refetch(); clock.refetch(); }}>
        {/* Blue dawn sky fading to cream, matching the web `.ready` background. */}
        <Gradient colors={['#d9ecfb', '#f3f8fd', '#fff8ec']} locations={[0, 0.3, 0.6]} className="absolute -left-4 -right-4 -top-2 h-[420px]" />
        <BackBar to="/choice" right={<View className="rounded-full bg-[#e7e7f2] px-4 py-1.5"><Txt weight="semi" className="text-sm text-navy-soft">Not clocked in</Txt></View>} />
        <Txt weight="heavy" className="text-5xl leading-tight">Ready to roll?</Txt>
        <Card>
          <Txt weight="heavy" className="mb-3 text-xl">Today&apos;s route</Txt>
          <View className="flex-row gap-2">
            {[[left.length, 'stops left'], [stops.length - left.length, 'done'], [stops.length, 'total']].map(([v, l]) => (
              <View key={l} className="flex-1 items-center rounded-2xl bg-[#eef5fc] py-3"><Txt weight="heavy" className="text-4xl">{v}</Txt><Txt className="text-sm">{l}</Txt></View>
            ))}
          </View>
        </Card>
        <Art name="routeMap" className="-mx-4 aspect-[1.68]" contentFit="cover" />
        <Card className="flex-row items-center gap-3">
          <Art name="navigator" className="h-16 w-16" />
          <View className="flex-1 gap-1">
            <View className="flex-row items-center justify-between">
              <Txt weight="heavy" className="text-xl">Navigator</Txt>
              <Switch value={navigatorOn} onValueChange={setNavigatorOn} trackColor={{ true: '#2e9d5b', false: '#ccd2dc' }} thumbColor="#fff" />
            </View>
            <Txt className="text-sm text-muted">{left.length ? `${left.length} stop${left.length > 1 ? 's' : ''} today. First: ${left[0].storeName}.` : 'No stops on your route today.'}</Txt>
          </View>
          <Pressable onPress={() => setMsg('Navigator voice is coming soon.')} className="h-16 w-16 items-center justify-center rounded-full bg-[#12b5c5]">
            <Icon name="mic" color="#fff" size={26} /><Txt weight="heavy" className="text-xs text-white">Talk</Txt>
          </Pressable>
        </Card>
        <Notice kind="error">{punch.error || loadError}</Notice>
        <Notice kind="ok">{msg}</Notice>
        <PinPrompt punch={punch} />
        <Button title="Clock in & start route" variant="green" loading={punch.busy === 'clock-in'} onPress={() => punch.run('clock-in')} />
        <Pressable onPress={() => router.replace('/choice')} className="items-center py-2"><Txt weight="semi" className="text-muted underline">Not now</Txt></Pressable>
      </Screen>
    );
  }

  // Clocked in: the current stop.
  const next = left[0];
  const after = left[1];
  async function arrived(id: string) {
    setErr('');
    try { await markArrived(id).unwrap(); } catch (e) { setErr(errorMessage(e, 'Could not update the stop.')); }
  }
  // Completing a stop ships its order and can't be undone from the app, so confirm first.
  function confirmArrived(id: string, name: string) {
    Alert.alert('Mark this stop delivered?', `This completes ${name} and tells the office it shipped. You can't undo it here.`, [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Yes, delivered', onPress: () => arrived(id) },
    ]);
  }

  return (
    <View className="flex-1 bg-cream">
      <View>
        <Art name="stopMap" className="aspect-[2.85] w-full" contentFit="cover" />
        <SafeAreaView edges={['top']} className="absolute inset-x-0 top-0">
          <View className="flex-row items-start justify-center px-3">
            {next && <View className="mt-2 rounded-full bg-white px-5 py-2"><Txt weight="heavy">Stop {next.order} of {stops.length}</Txt></View>}
            <Link href="/route/stops" asChild>
              <Pressable accessibilityLabel="All stops" className="absolute right-3 top-1 h-12 w-12 items-center justify-center rounded-full bg-white"><Icon name="list" /></Pressable>
            </Link>
          </View>
        </SafeAreaView>
      </View>
      <Screen edges={[]} onRefresh={route.refetch} contentClassName="-mt-4">
        <Card className="gap-2">
          <View className="flex-row items-center justify-end gap-2">
            <Art name="lion" className="h-14 w-14" />
            <Txt weight="heavy" className="text-sm">Navigator</Txt>
            <Switch value={navigatorOn} onValueChange={setNavigatorOn} trackColor={{ true: '#2e9d5b', false: '#ccd2dc' }} thumbColor="#fff" />
          </View>
          {next ? (
            <>
              <Txt className="text-lg text-muted">next stop</Txt>
              <Txt weight="heavy" className="text-4xl leading-tight">{next.storeName}</Txt>
              <View className="flex-row items-center gap-2"><Icon name="location" /><Txt className="flex-1">{next.address}, {next.city}</Txt></View>
              {stopTime(next) && (
                <View className="flex-row items-center gap-3 border-b border-[#ece7dd] py-3"><Icon name="time-outline" color="#f08a24" size={24} /><Txt>Scheduled for <Txt weight="heavy">{stopTime(next)}</Txt></Txt></View>
              )}
              <View className="flex-row items-center gap-3 border-b border-[#ece7dd] py-3">
                <Icon name="cube-outline" color="#f08a24" size={24} />
                <Txt className="flex-1">
                  {next.orderNumber ? `Order #${next.orderNumber}` : next.disposition.join(', ').replace(/_/g, ' ')}
                  {next.amount > 0 ? ` · ${paymentLabel[next.paymentAction] ?? 'Payment'} ${money(next.amount)}` : ''}
                </Txt>
              </View>
              {next.notes && <View className="flex-row items-center gap-3 py-2"><Icon name="document-text-outline" color="#f08a24" /><Txt className="flex-1">{next.notes}</Txt></View>}
              <View className="mt-2 flex-row gap-2">
                <Button title="Navigate" icon="navigate" className="flex-1" onPress={() => openDirections(next)} />
                <Button title="I've arrived" icon="checkmark-circle" variant="green" className="flex-1" loading={arriving.isLoading} onPress={() => confirmArrived(next.id, next.storeName)} />
              </View>
              <View className="mt-3 flex-row justify-center gap-2.5">
                {stops.map((s) => <View key={s.id} className={`h-3.5 w-3.5 rounded-full ${s.done || s.id === next.id ? 'bg-brand' : 'bg-[#ccd2dc]'}`} />)}
              </View>
              <Txt className="text-center text-sm"><Txt weight="heavy" className="text-sm">Next:</Txt> {after ? `${after.storeName}, ` : ''}{left.length - 1} stop{left.length - 1 === 1 ? '' : 's'} left</Txt>
              <Link href={`/route/note/${next.id}`} asChild>
                <Pressable className="items-center py-2"><Txt weight="heavy" className="text-brand-dark">Add a voice note</Txt></Pressable>
              </Link>
            </>
          ) : <Notice kind="ok">{stops.length ? 'All stops done. Nice work.' : 'No stops on your route today.'}</Notice>}
        </Card>
        <Notice kind="error">{err || loadError}</Notice>
      </Screen>
    </View>
  );
}
