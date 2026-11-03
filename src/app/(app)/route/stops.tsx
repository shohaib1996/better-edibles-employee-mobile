import { Link, Redirect, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { BackBar, Card, Icon, Loading, Notice, Screen, Txt } from '@/components/ui';
import { stopTime } from '@/features/route/helpers';
import { errorMessage } from '@/lib/errors';
import { useGetRouteQuery } from '@/store/api';
import { useAppSelector } from '@/store';

export default function StopsScreen() {
  const isDriver = useAppSelector((s) => !!s.auth.employee?.isDriver);
  // Keep the order in sync with the admin (Today's Contact) reorders.
  const { data: stops = [], error, isLoading, refetch } = useGetRouteQuery(undefined, { skip: !isDriver, pollingInterval: 30000, refetchOnMountOrArgChange: true });
  useFocusEffect(useCallback(() => { if (isDriver) refetch(); }, [isDriver, refetch]));
  if (!isDriver) return <Redirect href="/" />;
  const done = stops.filter((s) => s.done).length;
  const nextId = stops.find((s) => !s.done)?.id;

  return (
    <Screen onRefresh={refetch}>
      <BackBar title="Today's stops" />
      <View className="flex-row justify-center">
        <Txt weight="heavy" className="flex-1 text-center text-3xl">{done} <Txt weight="semi" className="text-xl text-muted">done</Txt></Txt>
        <Txt weight="heavy" className="flex-1 border-l border-[#e3ddd2] text-center text-3xl">{stops.length - done} <Txt weight="semi" className="text-xl text-muted">left</Txt></Txt>
      </View>
      <View className="h-3.5 overflow-hidden rounded-full bg-[#e9e5dc]">
        <View className="h-full rounded-full bg-[#4bbf5b]" style={{ width: `${stops.length ? (done / stops.length) * 100 : 0}%` }} />
      </View>
      <Notice kind="error">{error ? errorMessage(error) : ''}</Notice>
      {isLoading && <Loading />}
      {!isLoading && stops.length === 0 && <Txt className="text-muted">No stops on your route today.</Txt>}
      {stops.map((s) => {
        const isNext = s.id === nextId;
        return (
          <View key={s.id} className="flex-row items-center gap-3">
            <View className={`h-11 w-11 items-center justify-center rounded-full ${s.done ? 'bg-[#4bbf5b]' : isNext ? 'bg-brand' : 'bg-navy'}`}>
              {s.done ? <Icon name="checkmark" color="#fff" /> : <Txt weight="heavy" className="text-lg text-white">{s.order}</Txt>}
            </View>
            <Link href={isNext ? '/route' : `/route/note/${s.id}`} asChild>
              <Pressable className="flex-1">
                <Card className={`flex-row items-center gap-2 ${isNext ? 'border-2 border-brand' : ''}`}>
                  <View className="flex-1">
                    <Txt weight="heavy">{s.storeName}</Txt>
                    <Txt weight="semi" className="text-xs text-muted">{s.city}{s.state ? `, ${s.state}` : ''}</Txt>
                    {isNext && <View className="mt-1 self-start rounded-full bg-brand px-3 py-0.5"><Txt weight="heavy" className="text-xs text-white">Next</Txt></View>}
                  </View>
                  {s.done ? <View className="rounded-full bg-[#dcf3dc] px-3 py-1"><Txt weight="heavy" className="text-xs text-[#2c8a3c]">Delivered</Txt></View>
                    : stopTime(s) ? <View className="rounded-full bg-[#eef0f5] px-3 py-1"><Txt weight="heavy" className="text-xs text-muted">{stopTime(s)}</Txt></View> : null}
                  {s.hasNote && <Icon name="document-text" color="#c9a400" size={18} />}
                </Card>
              </Pressable>
            </Link>
          </View>
        );
      })}
    </Screen>
  );
}
