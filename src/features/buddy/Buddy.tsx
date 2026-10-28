import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, Icon, StatusBadge, Txt } from '@/components/ui';
import type { HrDoc, MeResponse } from '@/types/api';
import { buddyAnswer, type BuddyReply } from './answer';

type Msg = { me: boolean } & BuddyReply;
const SUGGESTIONS = ['What am I missing?', 'My permit status', 'How much PTO do I have?'];

/** Floating helper button and chat sheet (mockups 17-18). */
export function Buddy({ me, docs, production }: { me: MeResponse; docs: HrDoc[]; production: boolean }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([{ me: false, text: 'Hi! Ask me about your OLCC permit, your HR documents or your PTO.' }]);
  const scroll = useRef<ScrollView>(null);

  const say = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { me: true, text: q }, { me: false, ...buddyAnswer(q, me, docs, production) }]);
    setText('');
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityLabel="Ask Buddy" className="absolute bottom-4 right-4 h-20 w-20 overflow-hidden rounded-full">
        <Art name="buddyButton" className="h-full w-full" />
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-[#0f2346]/50" onPress={() => setOpen(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="h-[78%] rounded-t-[28px] bg-white">
          <SafeAreaView edges={['bottom']} className="flex-1">
          <View className="flex-1 px-4 pt-2">
            <View className="mb-2 h-1.5 w-14 self-center rounded-full bg-[#d0d5de]" />
            <View className="flex-row items-center gap-3">
              <Art name="buddy" className="h-16 w-16" />
              <View className="flex-1"><Txt weight="heavy" className="text-2xl">Buddy</Txt><Txt className="text-muted">Your helper</Txt></View>
              <Pressable onPress={() => setOpen(false)} hitSlop={12} accessibilityLabel="Close"><Icon name="close" size={28} color="#5d7391" /></Pressable>
            </View>
            <ScrollView ref={scroll} className="flex-1" contentContainerClassName="gap-3 py-3" onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
              {msgs.map((m, i) => (
                <View key={i} className={`flex-row gap-2 ${m.me ? 'justify-end' : ''}`}>
                  {!m.me && <Art name="buddy" className="h-10 w-10" />}
                  <View className="max-w-[80%] gap-2">
                    <View className={`rounded-2xl px-4 py-3 ${m.me ? 'bg-[#1e3a78]' : 'bg-[#f0f2f7]'}`}>
                      <Txt className={`leading-5 ${m.me ? 'text-white' : ''}`}>{m.text}</Txt>
                    </View>
                    {m.badge && <StatusBadge status={m.badge} />}
                  </View>
                </View>
              ))}
              <View className="flex-row flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} onPress={() => say(s)} className="rounded-full border-2 border-brand px-3 py-1.5">
                    <Txt weight="semi" className="text-sm text-brand-dark">{s}</Txt>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <View className="mb-2 flex-row items-center gap-2 rounded-full border-2 border-[#e3e6ee] py-1 pl-4 pr-1">
              <TextInput value={text} onChangeText={setText} placeholder="Ask a question" placeholderTextColor="#9aa4b8"
                onSubmitEditing={() => say(text)} returnKeyType="send" className="flex-1 py-2 font-body text-base text-navy" />
              <Pressable onPress={() => say(text)} accessibilityLabel="Send" className="h-12 w-12 items-center justify-center rounded-full bg-brand">
                <Icon name="send" color="#fff" size={22} />
              </Pressable>
            </View>
          </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
