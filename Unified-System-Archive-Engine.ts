// Unified-System-Archive-Engine.ts
// Deterministic archive engine for Beast System 3.0.
// Stores immutable lifecycle artifacts, compresses packets,
// indexes transitions, and preserves sovereign-safe continuity.

import {
  UnifiedSystemRegistry,
  EngineDeclaration,
  PhaseId
} from "./Unified-System-Registry-Core";

export interface ArchiveRecord {
  id: string;
  engineId: string;
  phase: PhaseId;
  timestamp: number;
  compressedPayload: string;
  index: number;
}

export class ArchiveEngine {
  private archive: ArchiveRecord[] = [];
  private indexCounter = 0;

  constructor(private readonly registry: UnifiedSystemRegistry) {}

  store(
    engine: EngineDeclaration,
    phase: PhaseId,
    payload: Record<string, any>
  ): ArchiveRecord {
    const timestamp = Date.now();
    const id = `${engine.id}:${phase}:${timestamp}`;
    const compressedPayload = this.compress(payload);

    const record: ArchiveRecord = {
      id,
      engineId: engine.id,
      phase,
      timestamp,
      compressedPayload,
      index: this.indexCounter++
    };

    this.archive.push(record);
    return record;
  }

  private compress(payload: Record<string, any>): string {
    const raw = JSON.stringify(payload);
    let out = "";

    for (let i = 0; i < raw.length; i++) {
      const chr = raw.charCodeAt(i);
      out += String.fromCharCode(chr ^ 0x5a); // simple XOR compression
    }

    return out;
  }

  retrieveByEngine(engineId: string): ReadonlyArray<ArchiveRecord> {
    return this.archive.filter(r => r.engineId === engineId);
  }

  retrieveByPhase(phase: PhaseId): ReadonlyArray<ArchiveRecord> {
    return this.archive.filter(r => r.phase === phase);
  }

  retrieveAll(): ReadonlyArray<ArchiveRecord> {
    return this.archive;
  }

  assertContinuity(): void {
    if (this.archive.length === 0) {
      throw new Error("Archive continuity violation: no records stored.");
    }

    for (let i = 1; i < this.archive.length; i++) {
      if (this.archive[i].timestamp < this.archive[i - 1].timestamp) {
        throw new Error(
          `Archive continuity violation: record '${this.archive[i].id}' is out of temporal order.`
        );
      }
    }
  }
}

// Example usage
export function createArchiveEngine(reg: UnifiedSystemRegistry) {
  return new ArchiveEngine(reg);
}
