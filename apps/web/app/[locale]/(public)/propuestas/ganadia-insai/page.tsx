import type { Metadata } from 'next';
import { GanadIAInstitutionalExperience } from '@/components/proposals/ganadia-institutional-experience';

export const metadata: Metadata = {
  title: 'GanadIA | Presentación institucional e interoperabilidad con INSAI',
  description: 'Conozca GanadIA, la plataforma inteligente del ganadero, y la propuesta de acercamiento técnico para explorar una integración autorizada con los permisos de movilización del INSAI.',
  robots: {
    index: false, follow: false, nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function GanadIAInstitutionalProposalPage() {
  return <GanadIAInstitutionalExperience />;
}
