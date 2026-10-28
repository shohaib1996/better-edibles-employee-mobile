import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

type Variant = 'primary' | 'green' | 'navy' | 'outline' | 'ghost' | 'danger';
const styles: Record<Variant, { box: string; text: string; icon: string }> = {
  primary: { box: 'bg-brand', text: 'text-white', icon: '#fff' },
  green: { box: 'bg-leaf', text: 'text-white', icon: '#fff' },
  navy: { box: 'bg-navy', text: 'text-white', icon: '#fff' },
  outline: { box: 'border-2 border-brand bg-white', text: 'text-brand', icon: '#f08a24' },
  ghost: { box: 'border-2 border-line bg-transparent', text: 'text-navy', icon: '#14325c' },
  danger: { box: 'bg-danger', text: 'text-white', icon: '#fff' },
};

export function Button({
  title, variant = 'primary', icon, loading, disabled, className = '', size = 'lg', ...props
}: PressableProps & { title: string; variant?: Variant; icon?: IconName; loading?: boolean; className?: string; size?: 'lg' | 'md' }) {
  const s = styles[variant];
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      className={`flex-row items-center justify-center gap-2 rounded-full ${size === 'lg' ? 'px-5 py-4' : 'px-4 py-3'} ${s.box} ${off ? 'opacity-50' : 'active:opacity-80'} ${className}`}
      {...props}
    >
      {loading ? <ActivityIndicator color={s.icon} /> : icon ? <Icon name={icon} size={size === 'lg' ? 22 : 18} color={s.icon} /> : null}
      <Txt weight="heavy" className={`${size === 'lg' ? 'text-lg' : 'text-base'} ${s.text}`}>{title}</Txt>
    </Pressable>
  );
}
