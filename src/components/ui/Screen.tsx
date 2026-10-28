import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

/**
 * Standard page: cream background, safe-area aware, scrollable, with
 * optional pull-to-refresh. Tab screens drop the bottom edge (the tab bar owns it).
 */
export function Screen({
  children, onRefresh, refreshing = false, scroll = true, edges = ['top'], className = '', contentClassName = '',
}: {
  children: ReactNode; onRefresh?: () => void; refreshing?: boolean; scroll?: boolean; edges?: Edge[]; className?: string; contentClassName?: string;
}) {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-cream ${className}`}>
      {scroll ? (
        <ScrollView
          contentContainerClassName={`px-4 pb-10 pt-2 gap-3 ${contentClassName}`}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f08a24" colors={['#f08a24']} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 px-4 pt-2 ${contentClassName}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
