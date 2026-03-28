/**
 * Deterministic JSON.stringify that sorts object keys at every level.
 * Unlike JSON.stringify, this produces the same string for objects
 * with the same values but different key ordering.
 *
 * Use this for comparing config objects where key order may differ
 * between server responses (e.g., Python's set() iteration order).
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(val as Record<string, unknown>).sort()) {
        sorted[k] = (val as Record<string, unknown>)[k];
      }
      return sorted;
    }
    return val;
  });
}
