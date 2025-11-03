/**
 * Validates if a string is a valid UUID v4
 * @param uuid - String to validate
 * @returns true if valid UUID v4, false otherwise
 */
export function isValidUuid(uuid: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(uuid);
}

/**
 * Validates if a string is a valid UUID (any version)
 * @param uuid - String to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUuidAnyVersion(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
