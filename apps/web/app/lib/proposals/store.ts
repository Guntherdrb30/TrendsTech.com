import 'server-only';
import { prisma } from '@trends172tech/db';
import { createProposalStore } from './store-core';

export const { listProposalDocuments, getProposalDocument, createProposalDocument, updateProposalDraft, publishProposalDocument } = createProposalStore(prisma);
