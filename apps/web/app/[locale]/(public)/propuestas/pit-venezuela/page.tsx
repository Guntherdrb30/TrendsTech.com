import type { Metadata } from 'next';
import { ProposalExperience } from '@/components/proposals/proposal-experience';

export const metadata: Metadata = {
  title: 'LUNA + FDE para P.I.T. Venezuela — Propuesta corporativa',
  description: 'Propuesta interactiva de Trends172Tech para la operación de P.I.T. en Venezuela.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function PitVenezuelaProposalPage() {
  return <ProposalExperience proposal="pit-venezuela" />;
}
