import { Image, type ImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';
import { art, type ArtName } from '@/lib/art';

// Let Tailwind className style expo-image.
cssInterop(Image, { className: 'style' });

/** One of the mockup illustrations, by name. */
export function Art({ name, contentFit = 'contain', ...props }: Omit<ImageProps, 'source'> & { name: ArtName; className?: string }) {
  return <Image source={art[name]} contentFit={contentFit} accessibilityIgnoresInvertColors {...props} />;
}
