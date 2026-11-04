import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Art, BackBar, Button, Card, Icon, Loading, Notice, Screen, Txt } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { clockTime, dayLabel, TZ } from '@/lib/format';
import { useFixPunchMutation, useGetWeekQuery } from '@/store/api';
import type { Punch, PunchTimes } from '@/types/api';

type Field = keyof PunchTimes;
const FIELDS: readonly (readonly [Field, string])[] = [['clockIn', 'In'], ['mealOut', 'Meal out'], ['mealIn', 'Meal in'], ['clockOut', 'Out']];
const label = (f: Field) => FIELDS.find(([k]) => k === f)![1];

/** What's wrong with these times, or '' if they make sense as one shift. */
function problem(t: Record<Field, string | null>): string {
  if (t.mealIn && !t.mealOut) return 'Add your Meal out time too.';
  if (t.mealOut && !t.mealIn && t.clockOut) return 'Add your Meal in time too.';
  const set = FIELDS.filter(([k]) => t[k]);
  for (let i = 1; i < set.length; i++) {
    if (new Date(t[set[i][0]]!) <= new Date(t[set[i - 1][0]]!)) return `${set[i][1]} must be after ${set[i - 1][1]}.`;
  }
  if (set.some(([k]) => new Date(t[k]!) > new Date())) return "Times can't be in the future.";
  return '';
}

function PunchEditor({ punch }: { punch: Punch }) {
  const [fixPunch, saving] = useFixPunchMutation();
  const [changes, setChanges] = useState<Partial<Record<Field, string>>>({});
  const [iosField, setIosField] = useState<Field | null>(null);
  const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  const times = { clockIn: punch.clockIn, mealOut: punch.mealOut, mealIn: punch.mealIn, clockOut: punch.clockOut, ...changes };

  // A missing punch starts from the time before it, which keeps it on the right day.
  function startValue(field: Field) {
    const i = FIELDS.findIndex(([k]) => k === field);
    const known = FIELDS.slice(0, i + 1).reverse().find(([k]) => times[k]);
    return new Date(times[known![0]]!);
  }
  function apply(field: Field, d: Date) {
    setErr(''); setMsg('');
    d.setSeconds(0, 0);
    setChanges((c) => ({ ...c, [field]: d.toISOString() }));
  }
  function open(field: Field) {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: startValue(field), mode: 'time', display: 'clock', timeZoneName: TZ, title: label(field),
        onChange: (e, d) => { if (e.type === 'set' && d) apply(field, d); },
      });
    } else { setIosField(field); }
  }
  async function save() {
    setErr(''); setMsg(''); setIosField(null);
    const wrong = problem(times);
    if (wrong) return setErr(wrong);
    try {
      await fixPunch({ id: punch.id, ...changes }).unwrap();
      setChanges({});
      setMsg('Your times were saved.');
    } catch (e) { setErr(errorMessage(e, 'Could not save your times. Nothing was changed.')); }
  }

  return (
    <Card>
      {FIELDS.map(([field, name]) => {
        const changed = !!changes[field];
        const current = times[field];
        return (
          <Pressable key={field} onPress={() => open(field)} accessibilityRole="button" accessibilityLabel={`Change ${name} time`} className="min-h-14 flex-row items-center gap-2 border-b border-[#ece7dd] py-2.5">
            <View className="flex-1">
              <Txt weight="semi" className="text-lg">{name}</Txt>
              {changed && <Txt className="text-xs text-muted">Was {punch[field] ? clockTime(punch[field]) : 'empty'}</Txt>}
            </View>
            <Txt weight="heavy" className={`text-lg ${changed ? 'text-brand-dark' : current ? '' : 'text-muted'}`}>{current ? clockTime(current) : 'Add time'}</Txt>
            <Icon name="time-outline" color="#f08a24" size={22} />
          </Pressable>
        );
      })}
      {iosField && Platform.OS === 'ios' && (
        <View className="items-center">
          <DateTimePicker value={times[iosField] ? new Date(times[iosField]!) : startValue(iosField)} mode="time" display="spinner" timeZoneName={TZ} onChange={(e, d) => { if (e.type === 'set' && d) apply(iosField, d); }} />
          <Button title="Done" variant="outline" size="md" onPress={() => setIosField(null)} />
        </View>
      )}
      <View className="mt-3 gap-3">
        <Notice kind="error">{err}</Notice>
        <Notice kind="ok">{msg}</Notice>
        <Button title="Save times" icon="checkmark-circle" loading={saving.isLoading} disabled={Object.keys(changes).length === 0} onPress={save} />
      </View>
    </Card>
  );
}

export default function FixPunchScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data: week, error, isLoading } = useGetWeekQuery(date);
  const punches = week?.punches.filter((p) => p.workDate === date) ?? [];

  return (
    <Screen>
      <BackBar title="Fix a punch" right={<Art name="fixArt" className="h-16 w-16" />} />
      <Txt weight="heavy" className="text-xl">{dayLabel(date)}</Txt>
      <Notice kind="error">{error ? errorMessage(error) : ''}</Notice>
      {isLoading && <Loading />}
      {week?.approved ? (
        <Txt className="text-muted">This pay week is approved, so its times are locked. Ask your manager if one is wrong.</Txt>
      ) : week && punches.length === 0 ? (
        <Txt className="text-muted">No punches on this day. Ask your manager to add a missed day.</Txt>
      ) : week && (
        <>
          <Txt className="text-muted">Tap a punch to pick the right time. Times are Pacific.</Txt>
          {punches.map((p) => <PunchEditor key={p.id} punch={p} />)}
        </>
      )}
    </Screen>
  );
}
