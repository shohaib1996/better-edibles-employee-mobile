import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

/** White rounded card with the soft mockup shadow. */
export function Card({ children, className = '', ...props }: ViewProps & { children: ReactNode; className?: string }) {
  return (
    <View
      className={`rounded-3xl bg-white p-4 ${className}`}
      style={{ shadowColor: '#14325c', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
      {...props}
    >
      {children}
    </View>
  );
}
