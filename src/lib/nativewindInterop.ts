import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';

// Third-party components need opting in before Tailwind `className` styles them.
cssInterop(SafeAreaView, { className: 'style' });
