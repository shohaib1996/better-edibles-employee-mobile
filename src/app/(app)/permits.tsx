import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, BackBar, Card, Loading, Notice, Screen, StatusBadge, Txt } from '@/components/ui';
import { Buddy } from '@/features/buddy/Buddy';
import { API_BASE_URL } from '@/lib/config';
import type { ArtName } from '@/lib/art';
import { errorMessage } from '@/lib/errors';
import { permitStatus } from '@/lib/format';
import { pickFile, pickFromLibrary, takePhoto, type PickedFile, uploadFile } from '@/lib/upload';
import { employeeApi, useGetMeQuery, useListCardsQuery, useListDocsQuery } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store';

// Placeholder artwork shown until the employee uploads a real photo.
const placeholder: Record<string, ArtName> = {
  'olcc-permit': 'cardPermit',
  'drivers-license-front': 'cardLicenseFront',
  'drivers-license-back': 'cardLicenseBack',
  'food-handler': 'cardFood',
};

export default function PermitsScreen() {
  const dispatch = useAppDispatch();
  const employee = useAppSelector((s) => s.auth.employee);
  const token = useAppSelector((s) => s.auth.token);
  const me = useGetMeQuery();
  const cardsQ = useListCardsQuery();
  const docs = useListDocsQuery();
  const production = employee?.employeeType === 'production';
  const olcc = me.data?.olccPermit?.status;
  const cards = cardsQ.data ?? [];
  const cardOf = (slug: string) => cards.find((c) => c.slug === slug);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [err, setErr] = useState('');

  async function run(slug: string, pick: () => Promise<PickedFile | null>) {
    setErr('');
    try {
      const file = await pick();
      if (!file) return;
      setBusySlug(slug);
      await uploadFile(`${API_BASE_URL}/api/employee-app/me/cards/${slug}`, token, 'file', file);
      dispatch(employeeApi.util.invalidateTags(['Cards']));
    } catch (e) { setErr(errorMessage(e, 'Could not upload your card.')); }
    finally { setBusySlug(null); }
  }
  function choose(slug: string) {
    Alert.alert('Add a photo of your card', undefined, [
      { text: 'Take photo', onPress: () => run(slug, takePhoto) },
      { text: 'Photo library', onPress: () => run(slug, pickFromLibrary) },
      { text: 'Choose file', onPress: () => run(slug, pickFile) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  // One card image: the uploaded photo (fetched with the employee's token) or the placeholder.
  const cardImage = (slug: string, aspect: string) => {
    const card = cardOf(slug);
    if (card?.onFile) {
      return (
        <Image
          source={{ uri: `${API_BASE_URL}/api/employee-app/me/cards/${slug}/download?v=${encodeURIComponent(card.uploadedAt ?? '')}`, headers: token ? { Authorization: `Bearer ${token}` } : undefined }}
          className={`w-full ${aspect} rounded-xl`} contentFit="cover" cachePolicy="none"
        />
      );
    }
    return <Art name={placeholder[slug]} className={`w-full ${aspect} rounded-xl`} />;
  };
  const uploadLink = (slug: string) => (
    <Pressable onPress={() => choose(slug)} disabled={!!busySlug} hitSlop={8}>
      <Txt weight="semi" className="text-xs text-brand-dark">{busySlug === slug ? 'Uploading...' : cardOf(slug)?.onFile ? 'Replace' : 'Add photo'}</Txt>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-cream">
      <Screen contentClassName="pb-28" onRefresh={() => { me.refetch(); cardsQ.refetch(); }} refreshing={cardsQ.isFetching && !cardsQ.isLoading}>
        <BackBar title="Work permit and cards" />
        <Notice kind="error">{me.error ? errorMessage(me.error) : cardsQ.error ? errorMessage(cardsQ.error) : err}</Notice>
        {(me.isLoading || cardsQ.isLoading) && <Loading />}

        <Card className="flex-row gap-4">
          <View className="w-2/5 gap-1">
            {cardImage('olcc-permit', 'aspect-[1.36]')}
            <View className="items-center">{uploadLink('olcc-permit')}</View>
          </View>
          <View className="flex-1 gap-2">
            <Txt weight="heavy" className="text-xl">OLCC worker permit</Txt>
            <StatusBadge status={permitStatus(olcc)} label={olcc ? olcc.charAt(0).toUpperCase() + olcc.slice(1) : undefined} />
            <Txt className="text-xs text-muted">HR keeps your permit status. Upload a photo so they have it on file.</Txt>
          </View>
        </Card>

        <Card className="flex-row gap-4">
          <View className="w-2/5 flex-row gap-2">
            <View className="flex-1 items-center gap-1">{cardImage('drivers-license-front', 'aspect-[1.5]')}<Txt className="text-xs text-muted">Front</Txt>{uploadLink('drivers-license-front')}</View>
            <View className="flex-1 items-center gap-1">{cardImage('drivers-license-back', 'aspect-[1.5]')}<Txt className="text-xs text-muted">Back</Txt>{uploadLink('drivers-license-back')}</View>
          </View>
          <View className="flex-1 gap-1">
            <Txt weight="heavy" className="text-xl">Driver&apos;s license</Txt>
            <Txt className="text-xs text-muted">{employee?.isDriver ? 'Required for drivers.' : 'Only needed if you drive for the company.'}</Txt>
          </View>
        </Card>

        {production && (
          <Card className="flex-row gap-4">
            <View className="w-2/5 gap-1">
              {cardImage('food-handler', 'aspect-[1.57]')}
              <View className="items-center">{uploadLink('food-handler')}</View>
            </View>
            <View className="flex-1 gap-1">
              <Txt weight="heavy" className="text-xl">Food handler card</Txt>
              <Txt className="text-xs text-muted">Required for the production team.</Txt>
            </View>
          </Card>
        )}

        <Txt className="mt-1 text-center text-xs text-muted">Tap “Add photo” on a card to take a photo or pick a file. HR reviews what you upload.</Txt>
      </Screen>
      {me.data && <Buddy me={me.data} docs={docs.data ?? []} production={production} />}
    </SafeAreaView>
  );
}
