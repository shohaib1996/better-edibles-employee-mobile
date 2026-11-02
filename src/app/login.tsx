import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, Button, Icon, Notice, Txt } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { tokenStorage } from '@/lib/tokenStorage';
import { useLoginMutation, useRequestPasswordResetMutation } from '@/store/api';
import { signedIn } from '@/store/authSlice';
import { useAppDispatch } from '@/store';

const input = 'rounded-full border-2 border-[#e3e1dc] bg-[#f5f3ef] px-5 py-4 font-body text-base text-navy';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [requestReset] = useRequestPasswordResetMutation();
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  async function submit() {
    setError(''); setNote('');
    if (!loginName.trim() || !password) return setError('Enter your email or login name and your password.');
    try {
      const r = await login({ loginName: loginName.trim(), password }).unwrap();
      await tokenStorage.set(r.token);
      // The signed-in guard mounts the app on its own; drivers are sent to the
      // Driving/HR choice from Home (via the one-shot `landing` flag). Navigating
      // here would race the guard and drop drivers on Home.
      dispatch(signedIn(r));
    } catch (e) { setError(errorMessage(e, 'Could not sign in.')); }
  }

  // The reset link goes to the email on the employee's account.
  async function forgot() {
    setError(''); setNote('');
    if (!/^\S+@\S+\.\S+$/.test(loginName.trim())) return setError('Type your work email above, then tap Forgot password.');
    try { setNote(await requestReset(loginName.trim()).unwrap()); } catch (e) { setError(errorMessage(e, 'Could not send the reset email.')); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-[#fbf8f2]">
      <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
        <Art name="loginHero" className="aspect-[1.4] w-full" contentFit="cover" accessibilityLabel="Better Edibles Employee App" />
        {/* Padding goes on the inner View: SafeAreaView manages its own padding for the notch/home bar. */}
        <SafeAreaView edges={['bottom']} className="-mt-10 rounded-t-[40px] bg-[#fbf8f2]">
        <View className="gap-3 px-6 pb-8 pt-7">
          <Txt weight="heavy" className="text-base">Email or login name</Txt>
          <TextInput value={loginName} onChangeText={setLoginName} autoCapitalize="none" autoCorrect={false} autoComplete="username"
            textContentType="username" placeholder="e.g. sarah" placeholderTextColor="#9aa4b8" className={input} returnKeyType="next" />
          <Txt weight="heavy" className="mt-2 text-base">Password</Txt>
          <View className="justify-center">
            <TextInput value={password} onChangeText={setPassword} secureTextEntry={!show} autoComplete="current-password"
              textContentType="password" placeholder="Your password" placeholderTextColor="#9aa4b8" className={`${input} pr-14`}
              returnKeyType="go" onSubmitEditing={submit} />
            <Pressable onPress={() => setShow(!show)} hitSlop={10} className="absolute right-5" accessibilityLabel={show ? 'Hide password' : 'Show password'}>
              <Icon name={show ? 'eye-off' : 'eye'} color="#7a86a0" size={24} />
            </Pressable>
          </View>
          <Notice kind="error">{error}</Notice>
          <Notice kind="ok">{note}</Notice>
          <Button title="Sign in" onPress={submit} loading={isLoading} className="mt-3" />
          <Pressable onPress={() => setNote('Fingerprint sign-in is coming soon.')} className="mt-3 items-center gap-2">
            <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-brand">
              <Art name="acctFinger" className="h-9 w-9" />
            </View>
            <Txt>Use fingerprint</Txt>
          </Pressable>
          <Pressable onPress={forgot} className="items-center py-2">
            <Txt weight="semi" className="text-muted">Forgot password?</Txt>
          </Pressable>
        </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
