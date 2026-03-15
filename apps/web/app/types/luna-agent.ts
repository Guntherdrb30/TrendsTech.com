import type {
  DevAIProvider,
  DevExecutionMode,
  DevExecutionQueue,
  DevProject,
  DevTask,
  DevTaskFile,
  DevTaskLog,
  RemoteSession
} from "@trends172tech/db";

export type LunaProject = DevProject;
export type LunaTask = DevTask;
export type LunaTaskLog = DevTaskLog;
export type LunaTaskFile = DevTaskFile;
export type LunaAiProvider = DevAIProvider;
export type LunaRemoteSession = RemoteSession;
export type LunaQueueItem = DevExecutionQueue;
export type LunaExecutionMode = DevExecutionMode;

export type LunaPlanSnapshot = {
  planKey: string;
  taskLimitLabel: string;
  projectLimitLabel: string;
};
