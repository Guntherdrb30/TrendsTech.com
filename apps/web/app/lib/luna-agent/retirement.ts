/** Legacy Luna Code Orchestrator is retired in favor of Engineering Studio.
 * Explicitly opt back in only for a controlled rollback of the legacy product.
 * Read-only historical endpoints remain available during migration.
 */
export function isLegacyLunaExecutionDisabled(): boolean {
  return process.env.ENABLE_LEGACY_LUNA_CODE_ORCHESTRATOR !== 'true';
}

export const LEGACY_LUNA_RETIRED_RESPONSE = {
  error: 'LUNA_CODE_ORCHESTRATOR_RETIRED',
  message: 'Luna Code Orchestrator no acepta nuevas ejecuciones. Utiliza Engineering Studio.',
  replacement: 'Engineering Studio'
} as const;
