import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/guards';
import { DynamicProposal } from '@/components/proposals/dynamic-proposal';
import { getProposalDocument } from '@/lib/proposals/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function PrivateProposalPreview({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole('ROOT');
  const { slug } = await params;
  const doc = await getProposalDocument(slug);
  if (!doc) notFound();
  return <DynamicProposal document={doc} preview/>;
}
