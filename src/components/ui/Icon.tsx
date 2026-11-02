import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];
type IconColor = ComponentProps<typeof Ionicons>['color'];

export function Icon({ name, size = 22, color = '#14325c' }: { name: IconName; size?: number; color?: IconColor }) {
  return <Ionicons name={name} size={size} color={color} />;
}
