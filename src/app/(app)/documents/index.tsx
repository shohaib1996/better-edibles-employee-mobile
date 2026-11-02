import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Art, BackBar, Card, Loading, Notice, Screen, StatusPill, Txt } from '@/components/ui';
import type { ArtName } from '@/lib/art';
import { errorMessage } from '@/lib/errors';
import { docStatus } from '@/lib/format';
import { useListDocsQuery } from '@/store/api';

const icons: ArtName[] = ['docIcon1', 'docIcon2', 'docIcon3', 'docIcon4'];

export default function DocumentsScreen() {
  const { data: docs, error, isLoading, refetch, isFetching } = useListDocsQuery();
  const onFile = docs?.filter((d) => d.onFile).length ?? 0;

  return (
    <Screen onRefresh={refetch} refreshing={isFetching && !isLoading}>
      <BackBar />
      <Txt weight="heavy" className="text-4xl">My Documents</Txt>
      <View className="gap-3 rounded-3xl bg-[#fdf0d4] p-5">
        <Art name="docsHero" className="aspect-[2.15] w-full" />
        <Txt weight="heavy" className="text-2xl">Your paperwork, all in one place</Txt>
        <Txt className="leading-5">Download the blank form, fill it in and have it signed, then upload the signed copy.{docs ? ` ${onFile} of ${docs.length} are on file with HR.` : ''}</Txt>
        <View className="flex-row justify-between">
          {['Download the form', 'Sign it', 'Upload it'].map((s, i) => (
            <View key={s} className="flex-1 items-center gap-1">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-brand"><Txt weight="heavy" className="text-white">{i + 1}</Txt></View>
              <Txt weight="heavy" className="text-center text-sm">{s}</Txt>
            </View>
          ))}
        </View>
        <View className="flex-row justify-between border-t border-[#f1dfbd] pt-3">
          {([['completed', 'on file'], ['pending', 'HR is checking'], ['missing', 'not on file yet']] as const).map(([s, label]) => (
            <View key={s} className="items-center gap-1"><StatusPill status={s} /><Txt className="text-xs">{label}</Txt></View>
          ))}
        </View>
      </View>
      <Notice kind="error">{error ? errorMessage(error) : ''}</Notice>
      {isLoading && <Loading />}
      {docs?.map((d, i) => (
        <Link key={d.slug} href={`/documents/${d.slug}`} asChild>
          <Pressable>
            <Card className="flex-row items-center gap-3">
              <Art name={icons[i % 4]} className="h-12 w-12" />
              <Txt weight="heavy" className="flex-1">{d.label}</Txt>
              <StatusPill status={docStatus(d)} />
            </Card>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}
