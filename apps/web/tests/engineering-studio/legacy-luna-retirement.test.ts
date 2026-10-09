import { afterEach, describe, expect, it } from "vitest";
import { isLegacyLunaExecutionDisabled, LEGACY_LUNA_RETIRED_RESPONSE } from "../../app/lib/luna-agent/retirement";

const original = process.env.ENABLE_LEGACY_LUNA_CODE_ORCHESTRATOR;

afterEach(() => {
  if (original === undefined) {
    delete process.env.ENABLE_LEGACY_LUNA_CODE_ORCHESTRATOR;
  } else {
    process.env.ENABLE_LEGACY_LUNA_CODE_ORCHESTRATOR = original;
  }
});

describe("legacy Luna Code retirement", () => {
  it("fails closed when the opt-in flag is missing", () => {
    delete process.env.ENABLE_LEGACY_LUNA_CODE_ORCHESTRATOR;
    expect(isLegacyLunaExecutionDisabled()).toBe(true);
  });

  it("does not accept ambiguous opt-in values", () => {
    for (const value of ["1", "TRUE", "false", ""]) {
      process.env.ENABLE_LEGACY_LUNA_CODE_ORCHESTRATOR = value;
      expect(isLegacyLunaExecutionDisabled()).toBe(true);
    }
  });

  it("allows explicit rollback only", () => {
    process.env.ENABLE_LEGACY_LUNA_CODE_ORCHESTRATOR = "true";
    expect(isLegacyLunaExecutionDisabled()).toBe(false);
  });

  it("identifies the replacement system", () => {
    expect(LEGACY_LUNA_RETIRED_RESPONSE.replacement).toBe("Engineering Studio");
  });
});
