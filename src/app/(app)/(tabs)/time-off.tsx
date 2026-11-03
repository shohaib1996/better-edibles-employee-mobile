import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { Art, Button, Card, Icon, Loading, Notice, Screen, Txt } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { days as daysLabel, longDate } from '@/lib/format';
import { useCancelTimeOffMutation, useCreateTimeOffMutation, useGetMeQuery, useListTimeOffQuery } from '@/store/api';

const toIso = (d: Date) => d.toLocaleDateString('en-CA'); // YYYY-MM-DD, local
const spanDays = (s: string, e: string) => Math.max(1, Math.round((new Date(`${e}T00:00:00`).getTime() - new Date(`${s}T00:00:00`).getTime()) / 86400000) + 1);
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-brand-soft', text: 'text-brand-dark', label: 'Pending' },
  approved: { bg: 'bg-leaf-soft', text: 'text-leaf', label: 'Approved' },
  denied: { bg: 'bg-danger-soft', text: 'text-danger', label: 'Denied' },
};

export default function TimeOffScreen() {
  const me = useGetMeQuery();
  const pto = me.data?.pto;
  const list = useListTimeOffQuery();
  const [createTimeOff, creating] = useCreateTimeOffMutation();
  const [cancelTimeOff, cancelling] = useCancelTimeOffMutation();
  const [start, setStart] = useState(startOfToday());
  const [end, setEnd] = useState(startOfToday());
  const [note, setNote] = useState('');
  const [iosPicker, setIosPicker] = useState<null | 'start' | 'end'>(null);
  const [err, setErr] = useState(''); const [msg, setMsg] = useState('');

  function applyDate(which: 'start' | 'end', d: Date) {
    if (which === 'start') { setStart(d); if (end < d) setEnd(d); } else setEnd(d);
  }
  function openPicker(which: 'start' | 'end') {
    const value = which === 'start' ? start : end;
    const minimumDate = which === 'start' ? startOfToday() : start;
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value, mode: 'date', minimumDate, onChange: (e, d) => { if (e.type === 'set' && d) applyDate(which, d); } });
    } else { setIosPicker(which); }
  }
  async function submit() {
    setErr(''); setMsg('');
    const s = toIso(start), e = toIso(end);
    if (e < s) return setErr('The end date is before the start date.');
    try {
      await createTimeOff({ startDate: s, endDate: e, note: note.trim() || undefined }).unwrap();
      setMsg('Your request was sent for approval.'); setNote('');
    } catch (ex) { setErr(errorMessage(ex, 'Could not submit your request.')); }
  }
  async function cancel(id: string) {
    setErr(''); setMsg('');
    try { await cancelTimeOff(id).unwrap(); } catch (ex) { setErr(errorMessage(ex, 'Could not cancel the request.')); }
  }

  const sIso = toIso(start), eIso = toIso(end);
  const dateBox = (label: string, iso: string, which: 'start' | 'end') => (
    <Pressable onPress={() => openPicker(which)} className="flex-1">
      <Txt weight="semi" className="text-xs text-muted">{label}</Txt>
      <View className="mt-1 flex-row items-center justify-between rounded-xl border-2 border-line bg-[#fffdf8] px-3 py-2.5">
        <Txt weight="heavy">{longDate(iso)}</Txt>
        <Icon name="time-outline" size={18} color="#f08a24" />
      </View>
    </Pressable>
  );
  const requests = list.data ?? [];

  return (
    <Screen onRefresh={() => { me.refetch(); list.refetch(); }} refreshing={list.isFetching && !list.isLoading}>
      <View className="flex-row items-center">
        <Txt weight="heavy" className="flex-1 text-4xl">Time Off</Txt>
        <Art name="timeoffArt" className="h-24 w-44" />
      </View>
      <Notice kind="error">{err || (me.error ? errorMessage(me.error) : me.data && !pto ? me.data.accounting?.message ?? 'Your PTO is not available right now.' : '')}</Notice>
      <Notice kind="ok">{msg}</Notice>
      {me.isLoading && <Loading />}

      {pto && (
        <Card className="flex-row">
          <View className="flex-1 items-center"><Txt weight="heavy" className="text-2xl">{daysLabel(pto.availableDays)}</Txt><Txt className="text-navy-soft">pto available</Txt></View>
          <View className="flex-1 items-center border-l border-[#e3ddd2]"><Txt weight="heavy" className="text-2xl">{daysLabel(pto.usedDays)}</Txt><Txt className="text-navy-soft">used this year</Txt></View>
        </Card>
      )}

      {/* Request time off */}
      <Card className="gap-3">
        <Txt weight="heavy" className="text-xl">Request time off</Txt>
        <View className="flex-row gap-3">
          {dateBox('From', sIso, 'start')}
          {dateBox('To', eIso, 'end')}
        </View>
        <View className="flex-row items-center gap-2">
          <Icon name="checkmark-circle" size={18} color="#2e9d5b" />
          <Txt weight="semi" className="text-navy-soft">{daysLabel(spanDays(sIso, eIso))} off</Txt>
        </View>
        <TextInput value={note} onChangeText={setNote} placeholder="Reason (optional) — e.g. family trip" placeholderTextColor="#9aa4b8"
          multiline className="min-h-16 rounded-xl border-2 border-line bg-[#fffdf8] px-3 py-2.5 font-body text-base text-navy" textAlignVertical="top" />
        <Button title="Send request" icon="send" variant="green" loading={creating.isLoading} onPress={submit} />
        <Txt className="text-xs text-muted">Your manager reviews it. You can cancel while it is still pending.</Txt>
      </Card>

      {/* Your requests */}
      <Txt weight="heavy" className="mt-1 text-xl">Your requests</Txt>
      {list.isLoading && <Loading />}
      {!list.isLoading && requests.length === 0 && <Txt className="text-muted">No time-off requests yet.</Txt>}
      {requests.map((r) => {
        const st = statusStyle[r.status] ?? statusStyle.pending;
        return (
          <Card key={r.id} className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Txt weight="heavy">{longDate(r.startDate)}{r.endDate !== r.startDate ? ` – ${longDate(r.endDate)}` : ''}</Txt>
              <View className={`rounded-full px-3 py-1 ${st.bg}`}><Txt weight="heavy" className={`text-xs ${st.text}`}>{st.label}</Txt></View>
            </View>
            <Txt className="text-sm text-muted">{daysLabel(r.days)}{r.note ? ` · ${r.note}` : ''}</Txt>
            {r.status === 'pending' && (
              <Pressable onPress={() => cancel(r.id)} disabled={cancelling.isLoading} hitSlop={8} className="self-start">
                <Txt weight="semi" className="text-xs text-danger">Cancel request</Txt>
              </Pressable>
            )}
          </Card>
        );
      })}

      <Txt className="mt-1 text-sm leading-5 text-muted">
        PTO starts after 6 months: 5 days a year, plus 1 day every 6 months, up to 10. Unused days reset on Dec 31 and are taken during the winter break.
      </Txt>

      {iosPicker && Platform.OS === 'ios' && (
        <DateTimePicker
          value={iosPicker === 'start' ? start : end} mode="date" display="inline"
          minimumDate={iosPicker === 'start' ? startOfToday() : start}
          onChange={(e, d) => { const which = iosPicker; setIosPicker(null); if (e.type === 'set' && d && which) applyDate(which, d); }}
        />
      )}
    </Screen>
  );
}
