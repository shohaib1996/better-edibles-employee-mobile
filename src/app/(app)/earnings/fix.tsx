import { Art, BackBar, ComingSoon, Screen } from '@/components/ui';

export default function FixPunchScreen() {
  return (
    <Screen>
      <BackBar title="Fix a punch" right={<Art name="fixArt" className="h-16 w-16" />} />
      <ComingSoon title="Punch fix requests">Send a corrected time to your manager for approval. For now, tell your manager which punch is wrong.</ComingSoon>
    </Screen>
  );
}
