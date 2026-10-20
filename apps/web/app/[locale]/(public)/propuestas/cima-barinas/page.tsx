import type { Metadata } from 'next';
import { ProposalExperience } from '@/components/proposals/proposal-experience';

export const metadata: Metadata = {
  title: 'LUNA para Centro Comercial CIMA Barinas — Propuesta corporativa',
  description: 'Propuesta interactiva de Trends172Tech para el Centro Comercial CIMA de Barinas.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function CimaBarinasProposalPage() {
  return <ProposalExperience proposal="cima-barinas" />;
}
