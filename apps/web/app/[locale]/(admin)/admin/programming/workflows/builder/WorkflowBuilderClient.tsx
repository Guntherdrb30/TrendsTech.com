'use client';

import { useMemo, useState, useTransition } from 'react';
import { interpretWorkflowAction, saveWorkflowDraftAction } from './actions';

type Node = {
  id: string;
  type: string;
  title: string;
  detail: string;
  agentKey?: string | null;
  requiresApproval?: boolean;
  approvalGate?: string | null;
};

type Definition = {
  name: string;
  description: string;
  reusable: boolean;
  trigger: { type: 'EVENT'; eventType: string };
  actions: Array<{
    position: number;
    type: string;
    agentKey?: string | null;
    requiresApproval?: boolean;
    approvalGate?: string | null;
    config?: Record<string, unknown>;
  }>;
};

type InterpretationMeta = {
  engine: string;
  preferredIntelligenceRoute: string;
  paidApiUsed: boolean;
  parallelDetected: boolean;
  retryEscalationDetected: boolean;
};

const initialText = 'Cuando Frontend termine, pásalo a QA. Si QA falla, devuélvelo a Frontend con los errores. Si aprueba, pásalo a Security. Después prepara un Preview y avísame. Nunca publiques a producción sin mi aprobación.';

function actionTitle(action: Definition['actions'][number]) {
  const cfg = action.config || {};
  if (typeof cfg.title === 'string') return cfg.title;
  if (action.type === 'RUN_QA') return 'QA';
  if (action.type === 'REQUEST_APPROVAL') return 'Approval Gate';
  if (action.type === 'NOTIFY') return 'Notificar';
  if (action.agentKey) return action.agentKey;
  return action.type;
}

function actionDetail(action: Definition['actions'][number]) {
  const cfg = action.config || {};
  if (typeof cfg.instruction === 'string') return cfg.instruction;
  return action.type;
}

function definitionToNodes(definition: Definition): Node[] {
  const nodes: Node[] = [{
    id: 'trigger',
    type: 'EVENT',
    title: 'Trigger',
    detail: definition.trigger.eventType
  }];

  for (const action of definition.actions) {
    const title = actionTitle(action);
    const isApproval = action.type === 'REQUEST_APPROVAL';
    nodes.push({
      id: `action-${action.position}-${action.type}-${title}`,
      type: isApproval ? 'APPROVAL' : action.type === 'RUN_QA' || action.type === 'PREPARE_AGENT_RUN' ? 'AGENT' : 'ACTION',
      title,
      detail: actionDetail(action),
      agentKey: action.agentKey,
      requiresApproval: Boolean(action.requiresApproval) || isApproval,
      approvalGate: action.approvalGate || (typeof action.config?.gate === 'string' ? action.config.gate : null)
    });
  }
  return nodes;
}

export default function WorkflowBuilderClient({ locale }: { locale: string }) {
  const [text, setText] = useState(initialText);
  const [reusable, setReusable] = useState(true);
  const [definition, setDefinition] = useState<Definition | null>(null);
  const [meta, setMeta] = useState<InterpretationMeta | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nodes = useMemo(() => definition ? definitionToNodes(definition) : [], [definition]);
  const selectedNode = nodes.find(node => node.id === selected) || null;

  function applyInstruction() {
    setErrors([]);
    startTransition(async () => {
      const result = await interpretWorkflowAction({ text, reusable });
      if (!result.ok) {
        setDefinition(null);
        setMeta(null);
        setErrors(result.errors);
        setSelected(null);
        return;
      }
      setDefinition(result.definition as Definition);
      setMeta(result.interpretation as InterpretationMeta);
      setSelected(null);
    });
  }

  function removeSelected() {
    if (!selected || !definition) return;
    const selectedIndex = nodes.findIndex(node => node.id === selected);
    if (selectedIndex <= 0) return;
    const actionIndex = selectedIndex - 1;
    const nextActions = definition.actions
      .filter((_, index) => index !== actionIndex)
      .map((action, index) => ({ ...action, position: index + 1 }));
    setDefinition({ ...definition, actions: nextActions });
    setSelected(null);
  }

  return <div className="grid gap-5 xl:grid-cols-[0.9fr_1.5fr]">
    <section className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="font-semibold text-slate-950">Habla con el Builder</h2><p className="mt-1 text-sm text-slate-500">Describe o modifica el flujo como se lo explicarías a un miembro del equipo.</p></div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">Server validated</span>
      </div>

      <textarea value={text} onChange={event => setText(event.target.value)} className="mt-4 min-h-56 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-cyan-400" />
      <button type="button" disabled={isPending} onClick={applyInstruction} className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{isPending ? 'Interpretando…' : 'Interpretar y actualizar diagrama'}</button>

      {errors.length > 0 && <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{errors.map(error => <p key={error}>• {error}</p>)}</div>}

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={reusable} onChange={event => setReusable(event.target.checked)} /> Guardar como plantilla reutilizable</label>

      <form action={saveWorkflowDraftAction} className="mt-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="definition" value={definition ? JSON.stringify({ ...definition, reusable }) : ''} />
        <button disabled={!definition || isPending} className="w-full rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 disabled:cursor-not-allowed disabled:opacity-50">Guardar borrador validado</button>
      </form>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <p><span className="font-semibold">Ruta preferida:</span> {meta?.preferredIntelligenceRoute || 'CHATGPT_MCP'}</p>
        <p><span className="font-semibold">Motor actual:</span> {meta?.engine || 'STUDIO_RULES_V2'}</p>
        <p><span className="font-semibold">API paga:</span> {meta?.paidApiUsed ? 'Sí' : 'No'}</p>
        {meta?.parallelDetected && <p><span className="font-semibold">Paralelismo:</span> detectado</p>}
        {meta?.retryEscalationDetected && <p><span className="font-semibold">Escalamiento:</span> regla de reintentos detectada</p>}
      </div>
    </section>

    <section className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-950">Vista visual dinámica</h2><p className="mt-1 text-sm text-slate-500">El diagrama refleja la definición validada por servidor.</p></div><span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">DRAFT</span></div>

      {!definition ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Escribe una instrucción y pulsa “Interpretar” para generar el workflow.</div> : <>
        <div className="mt-6 overflow-x-auto pb-3"><div className="flex min-w-max items-center gap-2">{nodes.map((node,index) => <div key={node.id} className="flex items-center gap-2"><button type="button" onClick={() => setSelected(node.id)} className={`w-44 rounded-2xl border p-4 text-left transition ${selected === node.id ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 bg-slate-50 hover:border-cyan-300'}`}><span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600">{node.type}</span><p className="mt-2 text-sm font-semibold text-slate-950">{node.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{node.detail}</p></button>{index < nodes.length - 1 && <span className="text-xl text-slate-300">→</span>}</div>)}</div></div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">Nodos</p><p className="mt-1 text-2xl font-semibold">{nodes.length}</p></div><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">Gates</p><p className="mt-1 text-2xl font-semibold">{nodes.filter(node => node.type === 'APPROVAL').length}</p></div><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">Producción</p><p className="mt-1 text-sm font-semibold text-emerald-700">Bloqueada</p></div></div>
      </>}

      <div className="mt-5 rounded-2xl border border-slate-200 p-4">{selectedNode ? <><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">Inspector · {selectedNode.title}</p><p className="mt-1 text-xs text-slate-500">Tipo {selectedNode.type} · Agente {selectedNode.agentKey || 'Sistema'} · Gate {selectedNode.approvalGate || 'No'}</p></div>{selectedNode.type !== 'EVENT' && <button type="button" onClick={removeSelected} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700">Quitar nodo</button>}</div><p className="mt-3 text-sm text-slate-600">{selectedNode.detail}</p></> : <><p className="text-sm font-semibold">Inspector del nodo</p><p className="mt-1 text-xs text-slate-500">Selecciona un nodo para revisar su agente, función y Approval Gate.</p></>}</div>
    </section>
  </div>;
}
