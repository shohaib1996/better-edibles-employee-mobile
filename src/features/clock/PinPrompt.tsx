import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Button, Card, Txt } from '@/components/ui';
import type { PunchController } from './usePunch';

/** Shown only when the time clock needs the employee to type their PIN. */
export function PinPrompt({ punch }: { punch: PunchController }) {
  const [pin, setPin] = useState('');
  if (!punch.needPin) return null;
  const submit = () => { punch.run(punch.needPin!.action, pin); setPin(''); };
  return (
    <Card className="gap-3">
      <Txt weight="heavy">{punch.needPin.message}</Txt>
      <TextInput
        value={pin}
        onChangeText={(t) => setPin(t.replace(/\D/g, ''))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={8}
        placeholder="Time clock PIN"
        onSubmitEditing={submit}
        className="rounded-2xl border-2 border-line bg-[#fffdf8] px-4 py-3 text-center font-heavy text-2xl tracking-[6px] text-navy"
      />
      <View className="flex-row gap-2">
        <Button title="Cancel" variant="ghost" size="md" className="flex-1" onPress={punch.cancelPin} />
        <Button title="Continue" variant="green" size="md" className="flex-1" disabled={pin.length < 4} loading={!!punch.busy} onPress={submit} />
      </View>
    </Card>
  );
}
