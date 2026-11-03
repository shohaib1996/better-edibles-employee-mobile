/** @type {import('tailwindcss').Config} */
module.exports = {
  // Class-based dark mode avoids NativeWind's web "color scheme is type 'media'"
  // error. The app is light-only, so nothing toggles it.
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Better Edibles palette, taken from the mockups.
      colors: {
        cream: '#fff8ec',
        navy: { DEFAULT: '#14325c', soft: '#44597a' },
        muted: '#5d7391',
        brand: { DEFAULT: '#f08a24', dark: '#d86f0c', soft: '#fde6d2' },
        leaf: { DEFAULT: '#2e9d5b', dark: '#23893f', soft: '#e8f5ec' },
        danger: { DEFAULT: '#d64545', soft: '#fdeaea' },
        line: '#ead9bd',
        tile: { docs: '#fef2d1', earn: '#e3f2f8', off: '#e2f1e4', acct: '#ebe9f9' },
        night: '#0f2346',
      },
      // React Native needs one font family per weight.
      fontFamily: {
        body: ['Nunito_400Regular'],
        semi: ['Nunito_700Bold'],
        heavy: ['Nunito_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
