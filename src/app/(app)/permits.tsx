import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, BackBar, Button, Card, Icon, Loading, Notice, Screen, StatusBadge, Txt } from '@/components/ui';
import { Buddy } from '@/features/buddy/Buddy';
import { API_BASE_URL } from '@/lib/config';
import type { ArtName } from '@/lib/art';
import { saveToDevice } from '@/lib/download';
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
  const [dlSlug, setDlSlug] = useState<string | null>(null);
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
  async function view(slug: string) {
    const card = cardOf(slug);
    if (!card?.onFile || !token) return;
    setErr(''); setDlSlug(slug);
    try {
      const result = await saveToDevice(`/api/employee-app/me/cards/${slug}/download`, token, card.filename ?? `${slug}.jpg`, card.mimeType);
      if (result === 'saved') Alert.alert('Saved', 'The photo was saved to your Photos.');
    } catch (e) { setErr(errorMessage(e, 'Could not download the file.')); }
    finally { setDlSlug(null); }
  }

  // The uploaded photo (fetched with the employee's token) or the placeholder.
  const cardImage = (slug: string, aspect: string) => {
    const card = cardOf(slug);
    if (card?.onFile) {
      return (
        <Pressable onPress={() => view(slug)}>
          <Image
            source={{ uri: `${API_BASE_URL}/api/employee-app/me/cards/${slug}/download?v=${encodeURIComponent(card.uploadedAt ?? '')}`, headers: token ? { Authorization: `Bearer ${token}` } : undefined }}
            className={`w-full ${aspect} rounded-xl`} contentFit="cover" cachePolicy="none"
          />
        </Pressable>
      );
    }
    return <Art name={placeholder[slug]} className={`w-full ${aspect} rounded-xl`} />;
  };
  const onFileChip = (slug: string) => {
    const on = !!cardOf(slug)?.onFile;
    return (
      <View className={`flex-row items-center gap-1 self-start rounded-full px-3 py-1 ${on ? 'bg-leaf-soft' : 'bg-[#eceef2]'}`}>
        <Icon name={on ? 'checkmark-circle' : 'alert-circle'} size={16} color={on ? '#22844c' : '#9aa4b8'} />
        <Txt weight="heavy" className={`text-xs ${on ? 'text-leaf' : 'text-[#6b7280]'}`}>{on ? 'Photo on file' : 'No photo yet'}</Txt>
      </View>
    );
  };

  // One permit/card: image, status, and Add/Replace + View buttons.
  const permitCard = (slug: string, title: string, note: string, aspect = 'aspect-[1.5]') => {
    const on = !!cardOf(slug)?.onFile;
    return (
      <Card className="gap-3">
        <View className="flex-row gap-3">
          <View className="w-28">{cardImage(slug, aspect)}</View>
          <View className="flex-1 gap-1.5">
            <Txt weight="heavy" className="text-lg">{title}</Txt>
            {slug === 'olcc-permit' && olcc ? <StatusBadge status={permitStatus(olcc)} label={`HR: ${olcc.charAt(0).toUpperCase()}${olcc.slice(1)}`} /> : null}
            {onFileChip(slug)}
            <Txt className="text-xs leading-4 text-muted">{note}</Txt>
          </View>
        </View>
        <View className="flex-row items-stretch gap-2">
          <Button title={busySlug === slug ? 'Uploading...' : on ? 'Replace' : 'Add photo'} icon="camera" variant={on ? 'outline' : 'green'} size="md" disabled={!!busySlug} onPress={() => choose(slug)} className="flex-1" />
          {on && (
            <Pressable onPress={() => view(slug)} disabled={!!dlSlug} accessibilityLabel="Download or view photo"
              className={`w-14 items-center justify-center rounded-full bg-leaf ${dlSlug ? 'opacity-60' : 'active:opacity-80'}`}>
              {dlSlug === slug ? <ActivityIndicator color="#fff" /> : <Icon name="download-outline" color="#fff" size={22} />}
            </Pressable>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-cream">
      <Screen contentClassName="pb-28" onRefresh={() => { me.refetch(); cardsQ.refetch(); }} refreshing={cardsQ.isFetching && !cardsQ.isLoading}>
        <BackBar title="Work permit and cards" />
        <Notice kind="error">{me.error ? errorMessage(me.error) : cardsQ.error ? errorMessage(cardsQ.error) : err}</Notice>
        {(me.isLoading || cardsQ.isLoading) && <Loading />}

        {permitCard('olcc-permit', 'OLCC worker permit', 'Upload a clear photo of your permit so HR has it on file.', 'aspect-[1.36]')}
        {permitCard('drivers-license-front', "Driver's license — Front", employee?.isDriver ? 'Required for drivers.' : 'Only needed if you drive for the company.')}
        {permitCard('drivers-license-back', "Driver's license — Back", 'The back of your license.')}
        {production && permitCard('food-handler', 'Food handler card', 'Required for the production team.', 'aspect-[1.57]')}

        <Txt className="mt-1 text-center text-xs text-muted">Add a photo or file; tap a photo to view it. HR reviews what you upload.</Txt>
      </Screen>
      {me.data && <Buddy me={me.data} docs={docs.data ?? []} production={production} />}
    </SafeAreaView>
  );
}
