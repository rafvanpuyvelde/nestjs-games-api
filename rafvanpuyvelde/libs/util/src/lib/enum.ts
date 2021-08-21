/**
 * Converts a key-value-pair enum to a Map object using the corresponding keys & values.
 * @param enumeration The enum to convert
 * @returns A new Map object that contains the enum keys & values
 */
export function enumToDict(
  enumeration: Record<string, string | number>
): Map<string, string | number> {
  const dict = new Map<string, number | string>();

  try {
    const enumItems = Object.keys(enumeration);
    const enumValues = enumItems.slice(0, enumItems.length / 2);
    const enumKeys = enumItems.slice(enumItems.length / 2);

    enumKeys.forEach((k, i) => dict.set(k, enumValues[i]));
  } catch (_e) {
    throw new Error('Unable to convert enum');
  }

  return dict;
}
