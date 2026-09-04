'use client';

import { useMemo, useState } from 'react';
import { saveWorkflowDraftAction } from './actions';

type Node = { id: string; type: string; title: string; detail: string; agentKey?: string; requiresApproval?: boolean; approvalGate?: string };
type Draft = { name: string; description: string; trigger: string; nodes: Node[] };

const initialText = 'Cuando Frontend termine, pásalo a QA. Si QA falla, devuélvelo a Frontend con los errores. Si aprueba, pásalo a Security. Después prepara un Preview y avísame. Nunca publiques a producción sin mi aprobación.';

function has(text: string, words: string[]) { return words.some(w => text.toLowerCase().includes(w)); }
function node(type: string, title: string, detail: string, extra: Partial<Node> = {}): Node { return { id: `${type}-${title}-${Math.random().toString(36).slice(2,8)}`, type, title, detail, ...extra }; }

function interpret(text: string): Draft {
  const t = text.toLowerCase();
  const nodes: Node[] = [];
  let trigger = 'AGENT_RUN_COMPLETED';
  if (has(t,['falla','falló','failed']) && t.indexOf('falla') < 20) trigger = 'AGENT_RUN_FAILED';
  nodes.push(node('EVENT','Trigger',trigger));

  const ordered: Array<[string,string,string,string]> = [
    ['frontend','AGENT','Frontend','Implementación de interfaz y experiencia','FRONTEND'],
    ['backend','AGENT','Backend','Servicios, APIs y lógica de negocio','BACKEND'],
    ['base de datos','AGENT','Database','Esquema, consultas y migraciones','DATABASE'],
    ['database','AGENT','Database','Esquema, consultas y migraciones','DATABASE'],
    ['qa','AGENT','QA','Pruebas y criterios de aceptación','QA'],
    ['security','AGENT','Security','Revisión de seguridad','SECURITY'],
    ['seguridad','AGENT','Security','Revisión de seguridad','SECURITY'],
    ['nvidia','AGENT','NVIDIA','Arquitectura y runtime IA local','NVIDIA'],
    ['preview','ACTION','Preview','Preparar despliegue de prueba','DEVOPS']
  ];
  const found = ordered.filter(([key]) => t.includes(key)).sort((a,b) => t.indexOf(a[0])-t.indexOf(b[0]));
  const seen = new Set<string>();
  for (const [,type,title,detail,agent] of found) if (!seen.has(title)) { nodes.push(node(type,title,detail,{agentKey:agent})); seen.add(title); }

  if (has(t,['si falla','si qa falla','si falla qa'])) nodes.splice(Math.min(nodes.length,3),0,node('CONDITION','¿Resultado aprobado?','Si falla, vuelve al agente responsable; si aprueba, continúa.'));
  if (has(t,['paralelo','al mismo tiempo','simultáneamente'])) nodes.push(node('PARALLEL','Ejecución paralela','Ejecutar ramas independientes simultáneamente.'));
  if (has(t,['avísame','avisame','notifica','notificar'])) nodes.push(node('ACTION','Notificar','Enviar aviso al Studio cuando corresponda.'));
  if (has(t,['aprobación','aprobacion','sin mi permiso','sin mi aprobación','no publiques','nunca publiques','producción'])) nodes.push(node('APPROVAL','Approval Gate','Requiere aprobación humana antes de una acción sensible.',{requiresApproval:true,approvalGate:'HUMAN_REVIEW'}));
  if (nodes.length === 1) nodes.push(node('ACTION','Tarea','Ejecutar la instrucción descrita en lenguaje natural.'));

  return { name: 'Workflow creado en lenguaje natural', description: text, trigger, nodes };
}

function toDefinition(draft: Draft, reusable: boolean) {
  const actionNodes = draft.nodes.filter(n => n.type !== 'EVENT' && n.type !== 'CONDITION' && n.type !== 'PARALLEL');
  return {
    name: draft.name,
    description: draft.description,
    reusable,
    trigger: { type: 'EVENT', eventType: draft.trigger },
    actions: actionNodes.map((n,i) => ({
      position:i+1,
      type:n.type === 'APPROVAL' ? 'REQUEST_APPROVAL' : n.title === 'Notificar' ? 'NOTIFY' : n.title === 'Preview' ? 'PREPARE_AGENT_RUN' : n.type === 'AGENT' ? (n.title === 'QA' ? 'RUN_QA' : 'PREPARE_AGENT_RUN') : 'RECORD_VAULT_ENTRY',
      agentKey:n.agentKey || null,
      requiresApproval:Boolean(n.requiresApproval),
      approvalGate:n.approvalGate || null,
      config:{ title:n.title, instruction:n.detail }
    }))
  };
}

export default function WorkflowBuilderClient({ locale }: { locale: string }) {
  const [text,setText] = useState(initialText);
  const [draft,setDraft] = useState<Draft>(()=>interpret(initialText));
  const [selected,setSelected] = useState<string | null>(null);
  const [reusable,setReusable] = useState(true);
  const selectedNode = draft.nodes.find(n=>n.id===selected);
  const definition = useMemo(()=>toDefinition(draft,reusable),[draft,reusable]);

  function applyInstruction() { setDraft(interpret(text)); setSelected(null); }
  function removeSelected() { if (!selected) return; setDraft(d=>({...d,nodes:d.nodes.filter(n=>n.id!==selected)})); setSelected(null); }

  return <div className="grid gap-5 xl:grid-cols-[0.9fr_1.5fr]">
    <section className="rounded-[24px] border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-950">Habla con el Builder</h2><p className="mt-1 text-sm text-slate-500">Describe o modifica el flujo como se lo explicarías a un miembro del equipo.</p>
      <textarea value={text} onChange={e=>setText(e.target.value)} className="mt-4 min-h-56 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-cyan-400" />
      <button type="button" onClick={applyInstruction} className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Interpretar y actualizar diagrama</button>
      <label className="mt-4 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={reusable} onChange={e=>setReusable(e.target.checked)}/> Guardar como plantilla reutilizable</label>
      <form action={saveWorkflowDraftAction} className="mt-3"><input type="hidden" name="locale" value={locale}/><input type="hidden" name="definition" value={JSON.stringify(definition)}/><button className="w-full rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">Guardar borrador</button></form>
      <p className="mt-3 text-xs leading-5 text-slate-500">El intérprete V1 funciona localmente con reglas. No consume API. Un modelo avanzado podrá reemplazar el intérprete manteniendo el mismo contrato interno.</p>
    </section>

    <section className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-950">Vista visual dinámica</h2><p className="mt-1 text-sm text-slate-500">Selecciona cualquier nodo para inspeccionarlo.</p></div><span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">DRAFT</span></div>
      <div className="mt-6 overflow-x-auto pb-3"><div className="flex min-w-max items-center gap-2">{draft.nodes.map((n,index)=><div key={n.id} className="flex items-center gap-2"><button type="button" onClick={()=>setSelected(n.id)} className={`w-44 rounded-2xl border p-4 text-left transition ${selected===n.id?'border-cyan-400 bg-cyan-50':'border-slate-200 bg-slate-50 hover:border-cyan-300'}`}><span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600">{n.type}</span><p className="mt-2 text-sm font-semibold text-slate-950">{n.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{n.detail}</p></button>{index<draft.nodes.length-1&&<span className="text-xl text-slate-300">→</span>}</div>)}</div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">Nodos</p><p className="mt-1 text-2xl font-semibold">{draft.nodes.length}</p></div><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">Gates</p><p className="mt-1 text-2xl font-semibold">{draft.nodes.filter(n=>n.type==='APPROVAL').length}</p></div><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">Producción</p><p className="mt-1 text-sm font-semibold text-emerald-700">Bloqueada</p></div></div>
      <div className="mt-5 rounded-2xl border border-slate-200 p-4">{selectedNode ? <><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">Inspector · {selectedNode.title}</p><p className="mt-1 text-xs text-slate-500">Tipo {selectedNode.type} · Agente {selectedNode.agentKey||'Sistema'} · Gate {selectedNode.approvalGate||'No'}</p></div><button type="button" onClick={removeSelected} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700">Quitar nodo</button></div><p className="mt-3 text-sm text-slate-600">{selectedNode.detail}</p></> : <><p className="text-sm font-semibold">Inspector del nodo</p><p className="mt-1 text-xs text-slate-500">Selecciona un nodo para revisar su agente, función y Approval Gate.</p></>}</div>
    </section>
  </div>;
}
