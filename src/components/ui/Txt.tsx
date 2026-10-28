import { Text, type TextProps } from 'react-native';

type Weight = 'body' | 'semi' | 'heavy';
const weights: Record<Weight, string> = { body: 'font-body', semi: 'font-semi', heavy: 'font-heavy' };

/** App text: Nunito in navy by default. Pick a weight; size and color via className. */
export function Txt({ weight = 'body', className = '', ...props }: TextProps & { weight?: Weight; className?: string }) {
  return <Text {...props} className={`${weights[weight]} text-navy ${className}`} />;
}
