import type { ReactNode } from 'react';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

// The exact hand-drawn icon set from the Better Edibles web app (src/ui.tsx and
// the tab bar in src/App.tsx), redrawn with react-native-svg so the mobile app
// matches it pixel for pixel. Stroke icons by default; a few are filled.
type Glyph = { d: string; fill?: boolean } | { render: (color: string) => ReactNode };

const glyphs = {
  // line icons (ui.tsx `paths`)
  'chevron-back': { d: 'M15 5 8 12l7 7' },
  'chevron-forward': { d: 'M9 5l7 7-7 7' },
  check: { d: 'M5 12.5 10 17 19 7' },
  checkmark: { d: 'M5 12.5 10 17 19 7' },
  'checkmark-circle': { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l2.6 2.6L16 9' },
  camera: { d: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  download: { d: 'M12 4v11M7 10l5 5 5-5M5 20h14' },
  'download-outline': { d: 'M12 4v11M7 10l5 5 5-5M5 20h14' },
  upload: { d: 'M12 16V5M7 10l5-5 5 5M5 20h14' },
  mic: { d: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6' },
  location: { d: 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  clock: { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2' },
  'time-outline': { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2' },
  time: { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2' },
  'lock-closed': { d: 'M6 10h12v11H6zM8.5 10V7a3.5 3.5 0 0 1 7 0v3' },
  info: { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5' },
  'information-circle-outline': { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5' },
  'alert-circle': { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5v6M12 16.5v.5' },
  navigate: { d: 'M3 11 21 3l-8 18-2-8z', fill: true },
  save: { d: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6' },
  refresh: { d: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5' },
  send: { d: 'M21 3 3 10.5l7 2.5 2.5 7z' },
  close: { d: 'M6 6l12 12M18 6 6 18' },
  'cube-outline': { d: 'M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9' },
  eye: { d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  'eye-off': { d: 'M2 12s3.5-7 10-7c1.7 0 3.2.4 4.5 1M22 12s-3.5 7-10 7c-1.7 0-3.2-.4-4.5-1M9.9 9.9a3 3 0 0 0 4.2 4.2M4 4l16 16' },
  play: { d: 'M7 4v16l13-8z', fill: true },
  stop: { d: 'M6 6h12v12H6z', fill: true },
  logout: { d: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10' },
  'log-out-outline': { d: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10' },
  list: { d: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01' },
  leaf: { d: 'M5 19C5 10 10 5 20 4c-1 10-6 15-15 15zM5 19l8-8' },
  file: { d: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6' },
  'document-text-outline': { d: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6' },
  'document-text': { d: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6' },
  'chatbubble-ellipses': { d: 'M4 5h16v11H9l-4 4v-4H4zM8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01' },

  // bottom-tab icons (App.tsx `navIcons`), all filled
  home: { d: 'M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z', fill: true },
  route: { d: 'M12 2a6 6 0 0 0-6 6c0 4.5 6 11 6 11s6-6.5 6-11a6 6 0 0 0-6-6zm0 8.2A2.2 2.2 0 1 1 12 5.8a2.2 2.2 0 0 1 0 4.4zM4 21h16v1.5H4z', fill: true },
  timeoff: { d: 'M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2zM5 9v10h14V9zm2 2h3v2H7zm5 0h3v2h-3zm-5 4h3v2H7zm5 0h3v2h-3z', fill: true },
  earnings: {
    render: (color: string) => (
      <>
        <Circle cx={12} cy={12} r={10} fill={color} />
        <SvgText x={12} y={16.5} textAnchor="middle" fontSize={14} fontWeight="800" fill="#fff">$</SvgText>
      </>
    ),
  },
  account: {
    render: (color: string) => (
      <>
        <Circle cx={12} cy={7.5} r={4.5} fill={color} />
        <Path d="M3 21c0-4.4 4-7 9-7s9 2.6 9 7z" fill={color} />
      </>
    ),
  },
} satisfies Record<string, Glyph>;

export type IconName = keyof typeof glyphs;

export function Icon({ name, size = 20, color = '#14325c' }: { name: IconName; size?: number; color?: string }) {
  const g = glyphs[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {'render' in g ? (
        g.render(color)
      ) : 'fill' in g && g.fill ? (
        <Path d={g.d} fill={color} />
      ) : (
        <Path d={g.d} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </Svg>
  );
}
