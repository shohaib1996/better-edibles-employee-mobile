import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Art, BackBar, Button, Card, ComingSoon, Icon, Loading, Notice, Screen, StatusPill, Txt } from '@/components/ui';
import { downloadAndShare } from '@/lib/download';
import { errorMessage } from '@/lib/errors';
import { docStatus, longDate } from '@/lib/format';
import { useListDocsQuery } from '@/store/api';
import { useAppSelector } from '@/store';

export default function DocumentDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const token = useAppSelector((s) => s.auth.token);
  const { data: docs, error, isLoading } = useListDocsQuery();
  const doc = docs?.find((d) => d.slug === slug);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');

  async function download() {
    if (!doc || !token) return;
    setErr(''); setBusy(true);
    try { await downloadAndShare(`/api/employee-app/me/documents/${encodeURIComponent(doc.slug)}/download`, token, doc.filename ?? `${doc.slug}.pdf`); }
    catch (e) { setErr(errorMessage(e, 'Could not download.')); } finally { setBusy(false); }
  }

  if (isLoading) return <Screen><BackBar /><Loading /></Screen>;
  if (!doc) return <Screen><BackBar /><Notice kind="error">{error ? errorMessage(error) : 'Document not found.'}</Notice></Screen>;
  const status = docStatus(doc);
  const steps = [['Get the form', status !== 'missing'], ['Sign it', status !== 'missing'], ['On file with HR', status === 'completed']] as const;

  return (
    <Screen>
      <BackBar right={<StatusPill status={status} />} />
      <View className="flex-row items-start">
        <Txt weight="heavy" className="flex-1 text-4xl leading-tight">{doc.label}</Txt>
        <Art name="docPencil" className="h-28 w-24" />
      </View>
      <View className="gap-3 pl-8">
        {steps.map(([label, ok], i) => (
          <View key={label} className="flex-row items-center gap-3">
            <View className={`h-12 w-12 items-center justify-center rounded-full ${ok ? 'bg-leaf' : 'bg-brand'}`}><Txt weight="heavy" className="text-xl text-white">{i + 1}</Txt></View>
            <Txt weight="heavy" className="text-xl">{label}</Txt>
            {ok && <Icon name="checkmark-circle" color="#2e9d5b" size={26} />}
          </View>
        ))}
      </View>
      {doc.onFile ? (
        <Card className="flex-row items-center gap-3">
          <Art name="docPdf" className="h-20 w-16" />
          <View className="flex-1 gap-1">
            <Txt weight="heavy">{doc.filename}</Txt>
            {doc.uploadedAt && <Txt className="text-xs text-muted">Filed {longDate(doc.uploadedAt)}</Txt>}
            <Button title="Download my copy" icon="download-outline" variant="green" size="md" loading={busy} onPress={download} className="mt-1 self-start rounded-xl" />
          </View>
        </Card>
      ) : <Txt className="text-muted">HR does not have this document on file for you yet.</Txt>}
      <Notice kind="error">{err}</Notice>
      <ComingSoon title="Blank form, upload and scan">Download the blank form and send back a signed copy or a scan from your phone. For now, HR gives you the form and files it.</ComingSoon>
    </Screen>
  );
}
