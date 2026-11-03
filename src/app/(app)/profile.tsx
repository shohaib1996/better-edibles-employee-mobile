import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { BackBar, Button, Card, Icon, Loading, Notice, Screen, Txt } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { formatPhone } from '@/lib/format';
import { useGetMeQuery, useUpdateProfileMutation } from '@/store/api';

const or = (v?: string | null) => (v && v.trim()) || '-';
const inputCls = 'mt-1 rounded-xl border-2 border-line bg-[#fffdf8] px-3 py-2.5 font-body text-base text-navy';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row py-1.5">
      <Txt weight="semi" className="w-[38%] text-muted">{label}</Txt>
      <Txt weight="heavy" className="flex-1">{value}</Txt>
    </View>
  );
}

function EditRow({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize }: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder?: string;
  keyboardType?: 'default' | 'phone-pad'; autoCapitalize?: 'none' | 'words' | 'characters';
}) {
  return (
    <View className="py-1">
      <Txt weight="semi" className="text-muted">{label}</Txt>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9aa4b8"
        keyboardType={keyboardType} autoCapitalize={autoCapitalize} className={inputCls} />
    </View>
  );
}

const emptyForm = { phone: '', street: '', city: '', state: '', zip: '', ecName: '', ecRel: '', ecPhone: '' };

/** HR keeps these details in Accounting. Name, email and employee ID stay read-only. */
export default function ProfileScreen() {
  const { data, error, isLoading } = useGetMeQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [err, setErr] = useState('');
  const set = (k: keyof typeof emptyForm) => (t: string) => setForm((f) => ({ ...f, [k]: t }));

  const p = data?.employee;
  const a = p?.address ?? {};
  const ec = p?.emergencyContact ?? {};
  const address = [a.street, [a.city, [a.state, a.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')].filter((x) => x && x.trim()).join('\n');

  function startEdit() {
    if (!p) return;
    setErr('');
    setForm({ phone: p.phone ?? '', street: a.street ?? '', city: a.city ?? '', state: a.state ?? '', zip: a.zip ?? '', ecName: ec.name ?? '', ecRel: ec.relationship ?? '', ecPhone: ec.phone ?? '' });
    setEditing(true);
  }
  async function save() {
    setErr('');
    try {
      await updateProfile({
        phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, zip: form.zip },
        emergencyContact: { name: form.ecName, relationship: form.ecRel, phone: form.ecPhone },
      }).unwrap();
      setEditing(false);
    } catch (e) { setErr(errorMessage(e, 'Could not save your profile.')); }
  }

  return (
    <Screen>
      <BackBar title="My profile" right={!editing && p ? <Pressable onPress={startEdit} hitSlop={8}><Txt weight="heavy" className="text-brand-dark">Edit</Txt></Pressable> : undefined} />
      <Notice kind="error">{err || (error ? errorMessage(error) : '')}</Notice>
      {isLoading && <Loading />}
      {p && (
        <>
          <Card>
            <Txt weight="heavy" className="mb-2 text-2xl">About me</Txt>
            <Field label="Name" value={p.name} />
            {editing ? (
              <>
                <EditRow label="Street" value={form.street} onChangeText={set('street')} placeholder="123 Main St" autoCapitalize="words" />
                <EditRow label="City" value={form.city} onChangeText={set('city')} placeholder="Portland" autoCapitalize="words" />
                <View className="flex-row gap-2">
                  <View className="flex-1"><EditRow label="State" value={form.state} onChangeText={set('state')} placeholder="OR" autoCapitalize="characters" /></View>
                  <View className="flex-1"><EditRow label="ZIP" value={form.zip} onChangeText={set('zip')} placeholder="97201" keyboardType="phone-pad" /></View>
                </View>
                <EditRow label="Phone" value={form.phone} onChangeText={set('phone')} placeholder="(555) 123-4567" keyboardType="phone-pad" />
              </>
            ) : (
              <>
                <Field label="Address" value={address || '-'} />
                <Field label="Phone" value={formatPhone(p.phone)} />
              </>
            )}
            <Field label="Email" value={or(p.email)} />
            {p.beEmployeeId && <Field label="Employee ID" value={p.beEmployeeId} />}
            {editing && <Txt className="mt-1 text-xs text-muted">To change your name or email, ask HR.</Txt>}
          </Card>

          <Card>
            <Txt weight="heavy" className="mb-2 text-2xl">Emergency contact</Txt>
            {editing ? (
              <>
                <EditRow label="Name" value={form.ecName} onChangeText={set('ecName')} placeholder="Full name" autoCapitalize="words" />
                <EditRow label="Relationship" value={form.ecRel} onChangeText={set('ecRel')} placeholder="e.g. Spouse" autoCapitalize="words" />
                <EditRow label="Phone" value={form.ecPhone} onChangeText={set('ecPhone')} placeholder="(555) 123-4567" keyboardType="phone-pad" />
              </>
            ) : (
              <>
                <Field label="Name" value={or(ec.name)} />
                <Field label="Relationship" value={or(ec.relationship)} />
                <Field label="Phone" value={formatPhone(ec.phone)} />
              </>
            )}
          </Card>

          {editing ? (
            <View className="flex-row gap-2">
              <Button title="Cancel" variant="ghost" className="flex-1" disabled={saving} onPress={() => { setEditing(false); setErr(''); }} />
              <Button title="Save" variant="green" icon="save" className="flex-1" loading={saving} onPress={save} />
            </View>
          ) : (
            <Button title="Edit my details" icon="pencil" variant="outline" onPress={startEdit} />
          )}

          <View className="flex-row items-center gap-2">
            <Icon name="information-circle-outline" color="#f08a24" />
            <Txt className="flex-1 text-muted">Your Social Security number is never shown in the app.</Txt>
          </View>
        </>
      )}
    </Screen>
  );
}
