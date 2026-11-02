import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Art, BackBar, Button, Card, Icon, Loading, Notice, Screen, StatusPill, Txt } from '@/components/ui';
import { API_BASE_URL } from '@/lib/config';
import { downloadAndShare } from '@/lib/download';
import { errorMessage } from '@/lib/errors';
import { docStatus, longDate } from '@/lib/format';
import { pickFile, pickFromLibrary, takePhoto, uploadFile, type PickedFile } from '@/lib/upload';
import { employeeApi, useDeleteDocMutation, useListDocsQuery } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store';

export default function DocumentDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const token = useAppSelector((s) => s.auth.token);
  const { data: docs, error, isLoading } = useListDocsQuery();
  const [deleteDoc, { isLoading: deleting }] = useDeleteDocMutation();
  const doc = docs?.find((d) => d.slug === slug);
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false); const [blankBusy, setBlankBusy] = useState(false); const [err, setErr] = useState('');
  const [uploadingNow, setUploadingNow] = useState(false);

  function confirmRemove() {
    if (!doc) return;
    Alert.alert(
      'Remove uploaded document?',
      `Are you sure you want to remove your copy of ${doc.label}? HR will no longer have it on file.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setErr('');
            try {
              await deleteDoc(doc.slug).unwrap();
            } catch (e) {
              setErr(errorMessage(e, 'Could not remove the document.'));
            }
          },
        },
      ],
    );
  }

  // Take/choose a file, then send it to HR for this document slot (via XHR, so
  // the file upload works regardless of Expo's fetch implementation).
  async function upload(pick: () => Promise<PickedFile | null>) {
    if (!doc) return;
    setErr('');
    try {
      const file = await pick();
      if (!file) return; // cancelled
      setUploadingNow(true);
      await uploadFile(`${API_BASE_URL}/api/employee-app/me/documents/${encodeURIComponent(doc.slug)}`, token, 'file', file);
      dispatch(employeeApi.util.invalidateTags(['Docs'])); // refetch so the filed copy shows
    } catch (e) { setErr(errorMessage(e, 'Could not upload your file.')); }
    finally { setUploadingNow(false); }
  }

  async function download() {
    if (!doc || !token) return;
    setErr(''); setBusy(true);
    try { await downloadAndShare(`/api/employee-app/me/documents/${encodeURIComponent(doc.slug)}/download`, token, doc.filename ?? `${doc.slug}.pdf`); }
    catch (e) { setErr(errorMessage(e, 'Could not download.')); } finally { setBusy(false); }
  }

  // The blank form to print, fill in and sign — the same file HR hands out.
  async function downloadBlank() {
    if (!doc || !token) return;
    setErr(''); setBlankBusy(true);
    try { await downloadAndShare(`/api/employee-app/me/documents/${encodeURIComponent(doc.slug)}/template`, token, doc.templateFilename ?? `${doc.slug}.docx`); }
    catch (e) { setErr(errorMessage(e, 'Could not download the blank form.')); } finally { setBlankBusy(false); }
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
      {doc.templateAvailable && (
        <Card className="flex-row items-center gap-3">
          <Art name="docPdf" className="h-20 w-16" />
          <View className="flex-1 gap-1">
            <Txt weight="heavy">Blank form</Txt>
            <Txt className="text-xs text-muted">Print it, fill it in and sign it, then give it to HR.</Txt>
            <Button title="Download blank form" icon="download-outline" variant="outline" size="md" loading={blankBusy} onPress={downloadBlank} className="mt-1 self-start rounded-xl" />
          </View>
        </Card>
      )}
      {doc.onFile ? (
        <Card className="flex-row items-center gap-3">
          <Art name="docPdf" className="h-20 w-16" />
          <View className="flex-1 gap-1">
            <Txt weight="heavy">{doc.filename}</Txt>
            {doc.uploadedAt && <Txt className="text-xs text-muted">Filed {longDate(doc.uploadedAt)}</Txt>}
            <View className="mt-1 flex-row flex-wrap gap-2">
              <Button title="Download my copy" icon="download-outline" variant="green" size="md" loading={busy} onPress={download} className="self-start rounded-xl" />
              <Button title="Remove" icon="trash" variant="danger-outline" size="md" loading={deleting} disabled={busy || uploadingNow} onPress={confirmRemove} className="self-start rounded-xl" />
            </View>
          </View>
        </Card>
      ) : <Txt className="text-muted">HR does not have this document on file for you yet.</Txt>}

      <Card className="gap-2">
        <Txt weight="heavy" className="text-lg">{doc.onFile ? 'Replace your copy' : 'Send your signed copy'}</Txt>
        <Txt className="text-xs text-muted">Take a photo of the signed form, or pick a PDF or Word file. HR reviews what you send.</Txt>
        <View className="mt-1 flex-row flex-wrap gap-2">
          <Button title="Take photo" icon="camera" variant="green" size="md" disabled={uploadingNow} onPress={() => upload(takePhoto)} className="grow rounded-xl" />
          <Button title="Photo library" icon="list" variant="outline" size="md" disabled={uploadingNow} onPress={() => upload(pickFromLibrary)} className="grow rounded-xl" />
          <Button title="Choose file" icon="document-text" variant="outline" size="md" disabled={uploadingNow} onPress={() => upload(pickFile)} className="grow rounded-xl" />
        </View>
        {uploadingNow && <Txt className="text-xs text-muted">Uploading...</Txt>}
      </Card>
      <Notice kind="error">{err}</Notice>
    </Screen>
  );
}
