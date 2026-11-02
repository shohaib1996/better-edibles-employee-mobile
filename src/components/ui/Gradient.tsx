import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

// Let Tailwind className style the gradient container (padding, radius, overflow).
cssInterop(LinearGradient, { className: 'style' });

// Converts a CSS gradient angle (deg, clockwise from "to top") into the
// start/end points expo-linear-gradient expects, so the web app's
// `linear-gradient(170deg, …)` reproduces exactly.
function endpoints(angle: number) {
  const r = (angle * Math.PI) / 180;
  const sx = 0.5 - Math.sin(r) / 2, sy = 0.5 + Math.cos(r) / 2;
  const ex = 0.5 + Math.sin(r) / 2, ey = 0.5 - Math.cos(r) / 2;
  return { start: { x: sx, y: sy }, end: { x: ex, y: ey } };
}

export function Gradient({
  colors, locations, angle = 180, className = '', style, children,
}: {
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  angle?: number;
  className?: string;
  style?: ViewStyle;
  children?: ReactNode;
}) {
  const { start, end } = endpoints(angle);
  return (
    <LinearGradient colors={colors} locations={locations} start={start} end={end} className={className} style={style}>
      {children}
    </LinearGradient>
  );
}

/**
 * The soft glowing sun on the home time-clock card (web `.clock-card .sun`).
 * A radial gradient fakes the CSS box-shadow glow so it looks the same on
 * iOS and Android. `size` is the full glow box; the bright core is ~half of it.
 */
export function Sun({ size = 150, className = '' }: { size?: number; className?: string }) {
  return (
    <View className={className} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="sun" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fff4cf" stopOpacity={1} />
            <Stop offset="38%" stopColor="#fff0be" stopOpacity={0.85} />
            <Stop offset="100%" stopColor="#fff0be" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill="url(#sun)" />
      </Svg>
    </View>
  );
}
