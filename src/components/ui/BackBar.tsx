import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from './Icon';
import { Txt } from './Txt';

/** "‹ Back" header with an optional centered title and right-side slot. */
export function BackBar({ title, right, to }: { title?: string; right?: ReactNode; to?: Href }) {
  const back = () => (to ? router.replace(to) : router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View className="min-h-11 flex-row items-center gap-2">
      <Pressable onPress={back} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back" className="flex-row items-center">
        <Icon name="chevron-back" size={22} color="#f08a24" />
        <Txt weight="heavy" className="text-lg text-brand">Back</Txt>
      </Pressable>
      <Txt weight="heavy" numberOfLines={2} className="flex-1 text-center text-2xl">{title ?? ''}</Txt>
      <View className="min-w-16 items-end">{right}</View>
    </View>
  );
}
