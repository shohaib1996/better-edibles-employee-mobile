import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { DocStatus } from '@/types/api';
import { Icon } from './Icon';
import { Txt } from './Txt';

export function Notice({ kind, children }: { kind: 'error' | 'ok'; children: ReactNode }) {
  if (!children) return null;
  return (
    <View accessibilityRole="alert" className={`rounded-2xl px-4 py-3 ${kind === 'error' ? 'bg-danger-soft' : 'bg-leaf-soft'}`}>
      <Txt weight="semi" className={kind === 'error' ? 'text-danger' : 'text-leaf'}>{children}</Txt>
    </View>
  );
}

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <View className="items-center gap-2 py-10">
      <ActivityIndicator color="#f08a24" />
      <Txt className="text-muted">{label}</Txt>
    </View>
  );
}

/** A feature the database cannot back yet. */
export function ComingSoon({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <View className="gap-1 rounded-3xl border-2 border-dashed border-line bg-[#f4f1ea] px-4 py-4">
      <View className="self-start rounded-full bg-[#e3e7ef] px-3 py-0.5">
        <Txt weight="heavy" className="text-xs uppercase tracking-wide text-navy-soft">Coming soon</Txt>
      </View>
      <Txt weight="heavy" className="text-lg">{title}</Txt>
      {children ? <Txt className="text-sm leading-5 text-navy-soft">{children}</Txt> : null}
    </View>
  );
}

const pill: Record<DocStatus, { box: string; label: string }> = {
  completed: { box: 'bg-[#25a55b]', label: 'Completed' },
  pending: { box: 'bg-brand', label: 'Pending' },
  missing: { box: 'bg-[#f45a5a]', label: 'Need To Start' },
};
export function StatusPill({ status, label }: { status: DocStatus; label?: string }) {
  return (
    <View className={`rounded-full px-3 py-1 ${pill[status].box}`}>
      <Txt weight="heavy" className="text-xs text-white">{label ?? pill[status].label}</Txt>
    </View>
  );
}

const badge: Record<DocStatus, { box: string; text: string; icon: 'checkmark-circle' | 'time' | 'alert-circle' }> = {
  completed: { box: 'bg-leaf', text: 'Approved', icon: 'checkmark-circle' },
  pending: { box: 'bg-brand', text: 'Pending review', icon: 'time' },
  missing: { box: 'bg-[#7b8494]', text: 'Not on file', icon: 'alert-circle' },
};
export function StatusBadge({ status, label }: { status: DocStatus; label?: string }) {
  return (
    <View className={`flex-row items-center gap-1.5 self-start rounded-full py-1 pl-1.5 pr-3 ${badge[status].box}`}>
      <Icon name={badge[status].icon} size={18} color="#fff" />
      <Txt weight="heavy" className="text-sm text-white">{label ?? badge[status].text}</Txt>
    </View>
  );
}
