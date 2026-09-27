import type { Metadata } from 'next';
import { ProposalExperience } from '@/components/proposals/proposal-experience';

export const metadata: Metadata = {
  title: 'LUNA for Big Home — Propuesta corporativa',
  description: 'Propuesta interactiva de Trends172Tech para Big Home.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function BigHomeProposalPage() {
  return <ProposalExperience proposal="big-home" />;
}
