import type { StoredProposal } from '../../app/lib/proposals/document';
export const example: StoredProposal = {
  version: 1, revision: 1, visibility: 'draft', slug: 'cima-barinas',
  clientName: 'Centro Comercial CIMA Barinas', industry: 'Centro comercial', title: 'LUNA para CIMA Barinas',
  headline: 'Un centro comercial conectado con sus visitantes',
  introduction: 'Propuesta de plataforma digital con integraciones sujetas a diagnostico de procesos y datos.',
  opportunity: 'Conectar comercios, visitantes, ofertas y procesos administrativos para una mejor experiencia.',
  capabilities: [{title:'Comercios digitales',text:'Un espacio digital y catalogos administrados por los comercios.'}, {title:'Inteligencia aplicada',text:'Asistente de compras condicionado a datos comerciales autorizados.'}],
  phases: [{title:'Descubrimiento inicial',text:'Conocer procesos, sistemas y necesidades de operacion.'}, {title:'Primer piloto',text:'Probar en una seleccion de comercios y evaluar resultados.'}],
  scenarios: [{title:'Buscar productos', question:'Como puede descubrir un visitante los productos?', answer:'El visitante puede explorar catalogos autorizados de los comercios participantes.', flow:'Visitante -> Catalogo -> Comercio'}],
  scopeNotes:['Comercios participantes en el piloto', 'Modelo comercial y responsabilidades de integracion'],
};
