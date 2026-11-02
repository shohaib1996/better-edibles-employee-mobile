import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Art, Gradient, Sun, Txt } from '@/components/ui';
import { clockTime } from '@/lib/format';
import type { ClockState } from '@/types/api';
import type { PunchController } from './usePunch';

/** The sunrise time-clock card on Home. */
export function ClockCard({ clock, punch }: { clock?: ClockState; punch: PunchController }) {
  const heading = !clock ? 'Time clock' : clock.status === 'on_meal' ? `On meal since ${clockTime(clock.mealOutAt)}`
    : clock.status === 'clocked_in' ? `Clocked in since ${clockTime(clock.clockInAt)}` : 'Not clocked in';
  return (
    <Gradient colors={['#fbd2a2', '#fde3b5', '#ffeec4']} locations={[0, 0.45, 1]} angle={170} className="overflow-hidden rounded-3xl">
      {/* The glowing sunrise sun, behind the content (web .clock-card .sun). */}
      <Sun size={150} className="absolute bottom-1 right-[12%]" />
      <View className="gap-3 p-5 pb-24">
        <Link href="/clock" asChild><Pressable><Txt weight="heavy" className="text-2xl">{heading}</Txt></Pressable></Link>
        <View className="flex-row gap-2.5">
          <Pressable
            disabled={!!punch.busy || !clock?.canClockIn}
            onPress={() => punch.run('clock-in')}
            className={`flex-[1.3] items-center rounded-full bg-leaf-dark py-3 ${!clock?.canClockIn ? 'opacity-50' : ''}`}
          >
            <Txt weight="heavy" className="text-base text-white">{punch.busy === 'clock-in' ? 'Working...' : 'Clock in'}</Txt>
          </Pressable>
          <Pressable
            disabled={!!punch.busy || !clock?.canClockOut}
            onPress={() => punch.run('clock-out')}
            className={`flex-1 items-center rounded-full border-2 border-navy bg-white/30 py-3 ${!clock?.canClockOut ? 'opacity-50' : ''}`}
          >
            <Txt weight="heavy" className="text-base">{punch.busy === 'clock-out' ? 'Working...' : 'Clock out'}</Txt>
          </Pressable>
        </View>
        <Txt className="text-xs">Location is only checked when you clock in or out.</Txt>
      </View>
      <Art name="homeMountains" className="absolute bottom-0 h-24 w-full" contentFit="cover" />
    </Gradient>
  );
}
