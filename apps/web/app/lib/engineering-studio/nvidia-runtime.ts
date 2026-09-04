import 'server-only';

export type NvidiaRuntimeLayer = {
  id: 'NEMO_AGENT_TOOLKIT' | 'DYNAMO' | 'OPENSHELL_NEMOCLAW' | 'TENSORRT_LLM';
  name: string;
  responsibility: string;
  requiredForLocalExecution: boolean;
};

export const NVIDIA_AGENT_RUNTIME: NvidiaRuntimeLayer[] = [
  {
    id: 'NEMO_AGENT_TOOLKIT',
    name: 'NVIDIA NeMo Agent Toolkit',
    responsibility: 'Orquestación, workflows, profiling y optimización de agentes.',
    requiredForLocalExecution: true
  },
  {
    id: 'DYNAMO',
    name: 'NVIDIA Dynamo',
    responsibility: 'Runtime de inferencia distribuida, routing y administración de KV cache/serving.',
    requiredForLocalExecution: true
  },
  {
    id: 'OPENSHELL_NEMOCLAW',
    name: 'NVIDIA OpenShell / NemoClaw',
    responsibility: 'Sandbox seguro para agentes autónomos y ejecución de herramientas/código.',
    requiredForLocalExecution: true
  },
  {
    id: 'TENSORRT_LLM',
    name: 'NVIDIA TensorRT-LLM',
    responsibility: 'Backend optimizado de inferencia para GPUs NVIDIA cuando el modelo y hardware sean compatibles.',
    requiredForLocalExecution: true
  }
];

export type NvidiaExecutionPlan = {
  mode: 'LOCAL_NVIDIA' | 'REMOTE_API' | 'HYBRID';
  layers: NvidiaRuntimeLayer[];
  status: 'DESIGN_READY' | 'RUNTIME_NOT_CONNECTED';
  notes: string[];
};

export function buildNvidiaExecutionPlan(localAiRequired: boolean): NvidiaExecutionPlan {
  if (!localAiRequired) {
    return {
      mode: 'REMOTE_API',
      layers: [],
      status: 'DESIGN_READY',
      notes: ['El proyecto no requiere IA local. El runtime NVIDIA queda disponible pero no se fuerza.']
    };
  }
  return {
    mode: 'HYBRID',
    layers: NVIDIA_AGENT_RUNTIME,
    status: 'RUNTIME_NOT_CONNECTED',
    notes: [
      'Las cuatro capas NVIDIA forman parte del plan de ejecución local.',
      'La ejecución real requiere un worker GPU Linux compatible y endpoints autenticados.',
      'Engineering Studio no debe simular que NVIDIA está ejecutando si el worker no está conectado.'
    ]
  };
}
