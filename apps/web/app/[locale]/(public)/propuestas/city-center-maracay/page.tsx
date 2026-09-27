import type { Metadata } from 'next';
import { ProposalExperience } from '@/components/proposals/proposal-experience';

export const metadata: Metadata = {
  title: 'LUNA for City Center Maracay — Propuesta corporativa',
  description: 'Propuesta interactiva de Trends172Tech para City Center Maracay.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function CityCenterProposalPage() {
  return <ProposalExperience proposal="city-center-maracay" />;
}
