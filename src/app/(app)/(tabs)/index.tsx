import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Art, ComingSoon, Notice, Screen, Txt } from '@/components/ui';
import { ClockCard } from '@/features/clock/ClockCard';
import { PinPrompt } from '@/features/clock/PinPrompt';
import { usePunch } from '@/features/clock/usePunch';
import type { ArtName } from '@/lib/art';
import { errorMessage } from '@/lib/errors';
import { firstName } from '@/lib/format';
import { useGetClockStateQuery, useListDocsQuery } from '@/store/api';
import { landingConsumed } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store';

function Tile({ href, art, title, sub, bg }: { href: '/documents' | '/earnings' | '/time-off' | '/account'; art: ArtName; title: string; sub: string; bg: string }) {
  return (
    <Link href={href} asChild>
      <Pressable className={`flex-1 items-center rounded-3xl px-2 pb-4 pt-3 ${bg} active:opacity-80`}>
        <Art name={art} className="aspect-[1.5] w-full" />
        <Txt weight="heavy" className="mt-1 text-lg">{title}</Txt>
        <Txt className="text-sm text-navy-soft">{sub}</Txt>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const employee = useAppSelector((s) => s.auth.employee);
  const landing = useAppSelector((s) => s.auth.landing);

  // Fresh sign-in for a driver: send them to the Driving/HR choice once. Done
  // here (not in login) so the navigator is mounted and the redirect can't race.
  useEffect(() => {
    if (landing === 'choice') {
      dispatch(landingConsumed());
      router.replace('/choice');
    }
  }, [landing, dispatch]);
  const clock = useGetClockStateQuery();
  const docs = useListDocsQuery();
  const punch = usePunch();
  const first = firstName(employee?.name);
  const onFile = docs.data?.filter((d) => d.onFile).length ?? 0;

  return (
    <Screen onRefresh={() => { clock.refetch(); docs.refetch(); }} refreshing={clock.isFetching && !clock.isLoading}>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-brand"><Txt weight="heavy" className="text-xl text-white">BE</Txt></View>
        <Txt weight="heavy" className="flex-1 text-3xl">Hi, {first}</Txt>
        <Link href="/account" asChild>
          <Pressable className="h-12 w-12 items-center justify-center rounded-full bg-navy"><Txt weight="heavy" className="text-xl text-white">{first[0]}</Txt></Pressable>
        </Link>
      </View>

      <ClockCard clock={clock.data} punch={punch} />
      <Notice kind="error">{punch.error || (clock.error ? errorMessage(clock.error) : '')}</Notice>
      <PinPrompt punch={punch} />

      <View className="flex-row gap-3">
        <Tile href="/documents" art="homeDocs" title="My Documents" sub={docs.data ? `${onFile} of ${docs.data.length} on file` : 'Forms'} bg="bg-tile-docs" />
        <Tile href="/earnings" art="homeEarnings" title="Earnings" sub="This week and PTO" bg="bg-tile-earn" />
      </View>
      <View className="flex-row gap-3">
        <Tile href="/time-off" art="homeTimeoff" title="Time Off" sub="Your PTO" bg="bg-tile-off" />
        <Tile href="/account" art="homeAccount" title="Account" sub="Profile and settings" bg="bg-tile-acct" />
      </View>

      <Txt weight="heavy" className="mt-2 text-xl">Expenses</Txt>
      <ComingSoon title="Add an expense">Snap a receipt and send it to Accounting. For now, give receipts to your manager.</ComingSoon>
    </Screen>
  );
}
