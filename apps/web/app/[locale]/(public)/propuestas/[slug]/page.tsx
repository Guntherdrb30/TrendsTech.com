import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DynamicProposal } from '@/components/proposals/dynamic-proposal';
import { getProposalDocument } from '@/lib/proposals/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getProposalDocument(slug, true);
  return {
    title: doc ? `${doc.title} - Trends172Tech` : 'Propuesta no disponible',
    description: doc?.introduction.slice(0, 160),
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  };
}

export default async function ProposalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getProposalDocument(slug, true);
  if (!doc) notFound();
  const publicDocument = { ...doc, lastApprovedBy: undefined };
  return <DynamicProposal document={publicDocument}/>;
}
