import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Art, BackBar, Button, Card, Icon, Notice, Screen, Txt } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { useGetRouteQuery, useSaveVoiceNoteMutation, useTranscribeMutation } from '@/store/api';
import { useAppSelector } from '@/store';

/**
 * Hold to talk: records on the phone, the server transcribes and summarizes it,
 * the driver can edit the text, then saving it completes the stop.
 */
export default function VoiceNoteScreen() {
  const { stopId } = useLocalSearchParams<{ stopId: string }>();
  const isDriver = useAppSelector((s) => !!s.auth.employee?.isDriver);
  const { data: stops = [] } = useGetRouteQuery(undefined, { skip: !isDriver });
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder);
  const [transcribe, transcribing] = useTranscribeMutation();
  const [saveNote, saving] = useSaveVoiceNoteMutation();
  const [note, setNote] = useState('');
  const [transcript, setTranscript] = useState('');
  const [picking, setPicking] = useState(false);
  const [err, setErr] = useState('');

  if (!isDriver) return <Redirect href="/" />;
  const stop = stops.find((s) => s.id === stopId);

  async function start() {
    setErr('');
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) return setErr('Allow the microphone to record a note, or type it below.');
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function stopRecording() {
    if (!recState.isRecording) return;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    if (!recorder.uri || recState.durationMillis < 800) return setErr('That was too short. Hold the button while you talk.');
    try {
      const t = await transcribe({ uri: recorder.uri, mimeType: 'audio/mp4', name: 'note.m4a' }).unwrap();
      // The server answers "No speech detected." with an empty transcript; don't save that as the note.
      if (!t.transcript.trim()) return setErr('I did not catch any words. Try again or type it.');
      setNote((n) => (n ? `${n}\n` : '') + t.summary);
      setTranscript((x) => (x ? `${x} ` : '') + t.transcript);
    } catch (e) { setErr(errorMessage(e, 'Could not hear that. Try again or type it.')); }
  }

  async function save() {
    setErr('');
    try { await saveNote({ stopId, note: note.trim(), transcript: transcript.trim() || undefined }).unwrap(); router.back(); }
    catch (e) { setErr(errorMessage(e, 'Could not save.')); }
  }

  const live = recState.isRecording;
  return (
    <Screen>
      <BackBar title="Voice note" />
      <Card className="flex-row items-center gap-3">
        <Art name="store" className="h-16 w-16" />
        <View className="flex-1"><Txt className="text-muted">For stop</Txt><Txt weight="heavy" className="text-lg">{stop?.storeName ?? '...'}</Txt></View>
        <Pressable onPress={() => setPicking(!picking)} className="rounded-full bg-brand-soft px-4 py-1.5"><Txt weight="heavy" className="text-brand-dark">Change</Txt></Pressable>
      </Card>
      {picking && (
        <Card className="gap-1">
          {stops.map((s) => (
            <Pressable key={s.id} onPress={() => { setPicking(false); router.replace(`/route/note/${s.id}`); }} className="border-b border-[#ece7dd] py-3">
              <Txt weight="semi">{s.order}. {s.storeName}</Txt>
            </Pressable>
          ))}
        </Card>
      )}

      <View className="my-2 items-center">
        <View className={`h-52 w-52 items-center justify-center rounded-full ${live ? 'bg-danger-soft' : 'bg-[#fde7c4]'}`}>
          <Pressable onPressIn={start} onPressOut={stopRecording} disabled={transcribing.isLoading} accessibilityLabel="Hold to talk"
            className={`h-40 w-40 items-center justify-center rounded-full ${live ? 'bg-danger' : 'bg-brand'} ${transcribing.isLoading ? 'opacity-60' : ''}`}>
            <Icon name="mic" color="#fff" size={64} />
          </Pressable>
        </View>
        <Txt weight="heavy" className="mt-2 text-3xl">{live ? 'Listening...' : transcribing.isLoading ? 'Writing it down...' : 'Hold to talk'}</Txt>
      </View>

      <Card className="gap-2">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-soft"><Icon name="chatbubble-ellipses" color="#f08a24" size={20} /></View>
          <Txt weight="heavy" className="text-2xl">What I heard</Txt>
        </View>
        <TextInput value={note} onChangeText={setNote} multiline placeholder="Your note appears here. You can also type." placeholderTextColor="#9aa4b8"
          className="min-h-28 font-body text-lg leading-7 text-navy" textAlignVertical="top" />
        <Txt className="text-xs text-muted">Tap the text to fix anything</Txt>
      </Card>
      <Notice kind="error">{err}</Notice>
      <View className="flex-row gap-2">
        <Button title="Redo" icon="refresh" variant="outline" className="flex-1" onPress={() => { setNote(''); setTranscript(''); }} />
        <Button title="Save note" icon="save" variant="green" className="flex-1" disabled={!note.trim()} loading={saving.isLoading} onPress={save} />
      </View>
      <Txt className="text-center text-xs text-muted">Saving the note marks this stop delivered. Please only use while parked.</Txt>
    </Screen>
  );
}
