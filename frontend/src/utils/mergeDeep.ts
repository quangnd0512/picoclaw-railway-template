/**
 * Deep merge source object into target object
 * Recursively merges nested objects; arrays are replaced entirely
 */
export function mergeDeep(target: unknown, source: unknown): Record<string, unknown> {
  if (!target || typeof target !== 'object') return {};
  const output = Object.assign({}, target) as Record<string, unknown>;
  if (!source || typeof source !== 'object') return output;
  
  for (const key of Object.keys(source)) {
    const sourceValue = (source as Record<string, unknown>)[key];
    const targetValue = (target as Record<string, unknown>)[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      output[key] = mergeDeep(targetValue, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  }
  return output;
}
