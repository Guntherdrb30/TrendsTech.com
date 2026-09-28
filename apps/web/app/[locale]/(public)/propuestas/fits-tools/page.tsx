import type { Metadata } from 'next';
import { ProposalExperience } from '@/components/proposals/proposal-experience';

export const metadata: Metadata = {
  title: 'LUNA + FDE para Fits Tools Venezuela — Propuesta corporativa',
  description: 'Propuesta interactiva de Trends172Tech para la operación de Fits Tools en Venezuela.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function FitsToolsProposalPage() {
  return <ProposalExperience proposal="fits-tools" />;
}
