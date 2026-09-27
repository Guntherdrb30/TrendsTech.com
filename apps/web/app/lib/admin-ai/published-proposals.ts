import contents from '../../components/proposals/proposal-data.json';
import { withPresentationLink } from './proposal-presentation';

export const publishedProposals = [
  { key: 'city-center-maracay', clientName: 'City Center Maracay', aliases: ['City Center', 'City Center Maracay'], industry: 'Centro comercial', title: 'LUNA para City Center Maracay', intro: 'Extensión digital del centro comercial para conectar visitantes, comercios, productos, promociones e inteligencia artificial bajo una administración central.' },
  { key: 'big-home', clientName: 'Big Home', aliases: ['Big Home', 'BigHome'], industry: 'Comercio de hogar', title: 'LUNA para Big Home', intro: 'Adaptación de LUNA para conectar ventas, cajas, inventario, compras, proveedores, sucursales, comercio digital, clientes, marketing e inteligencia artificial.' },
] as const;

export function publishedProposalSummary(key: keyof typeof contents): string {
  const item = publishedProposals.find(item => item.key === key)!;
  const scope = contents[key];
  return withPresentationLink([
    item.intro,
    'CAPACIDADES PROPUESTAS', ...scope.capabilities.map(item => `${item.title}: ${item.text}`),
    'RUTA DE IMPLEMENTACIÓN', ...scope.phases.map((item, i) => `${i + 1}. ${item.title}: ${item.text}`),
    'CONDICIONES: alcance, cronograma, inversión e integraciones por definir tras el diagnóstico. Presentación conceptual publicada; no constituye aceptación ni contratación. Reunión por calendario o WhatsApp desde la presentación.',
  ].join('\n\n'), `https://www.trends172tech.com/es/propuestas/${key}`);
}
