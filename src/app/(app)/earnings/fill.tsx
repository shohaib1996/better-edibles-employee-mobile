import { Art, BackBar, ComingSoon, Screen } from '@/components/ui';

export default function FillWeekScreen() {
  return (
    <Screen>
      <BackBar title="Fill my week" right={<Art name="fillArt" className="h-16 w-16" />} />
      <ComingSoon title="Use PTO to reach 40 hours">Company PTO is kept in days and taken during the winter break, so topping up a week from the app is not available yet.</ComingSoon>
    </Screen>
  );
}
