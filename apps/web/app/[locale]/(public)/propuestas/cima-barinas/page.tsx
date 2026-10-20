import { notFound } from 'next/navigation';
import { DynamicProposal } from '@/components/proposals/dynamic-proposal';
import { getProposalDocument } from '@/lib/proposals/store';
import type { Metadata } from 'next';
import { ProposalExperience } from '@/components/proposals/proposal-experience';

export const metadata: Metadata = {
  title: 'LUNA para Centro Comercial CIMA Barinas — Propuesta corporativa',
  description: 'Propuesta interactiva de Trends172Tech para el Centro Comercial CIMA de Barinas.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export const dynamic = 'force-dynamic';

export default async function CimaBarinasProposalPage() {
  // A CRM document created before this static route must retain ownership of its URL.
  const existing = await getProposalDocument('cima-barinas');
  if (existing) {
    if (existing.visibility !== 'published') notFound();
    return <DynamicProposal document={{ ...existing, lastApprovedBy: undefined }} />;
  }
  return <ProposalExperience proposal="cima-barinas" />;
}
