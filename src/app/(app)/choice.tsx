import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, Txt } from '@/components/ui';
import { firstName, greeting } from '@/lib/format';
import { useAppSelector } from '@/store';

/** Drivers pick Driving or HR after signing in. */
export default function DriverChoiceScreen() {
  const employee = useAppSelector((s) => s.auth.employee);
  if (!employee?.isDriver) return <Redirect href="/" />;
  return (
    <SafeAreaView className="flex-1 bg-night">
      <ScrollView contentContainerClassName="gap-4 px-4 pb-8 pt-4">
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-brand">
          <Txt weight="heavy" className="text-xl text-white">BE</Txt>
        </View>
        <View>
          <Txt weight="heavy" className="text-3xl text-white">{greeting()}, {firstName(employee.name)}</Txt>
          <Txt weight="semi" className="text-xl text-[#8fa3c4]">Where to?</Txt>
        </View>
        <Pressable onPress={() => router.replace('/route')} accessibilityRole="button" accessibilityLabel="Driving: today's route and stops">
          <Art name="choiceDriving" className="aspect-[1.36] w-full rounded-3xl" contentFit="cover" />
        </Pressable>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="HR Department: your handbook, pay and time off">
          <Art name="choiceHr" className="aspect-[1.45] w-full rounded-3xl" contentFit="cover" />
        </Pressable>
        <Txt weight="semi" className="text-center text-[#8fa3c4]">Switch anytime</Txt>
      </ScrollView>
    </SafeAreaView>
  );
}
