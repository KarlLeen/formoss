import { NATIVE, type JsonSafeValue } from "@themoss/core";

export type JsonRecord = { readonly [key: string]: JsonSafeValue };

export function isJsonRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function lower(value: string): string {
  return value.toLowerCase();
}

export function tokenMatches(expected: string, actual: string): boolean {
  if (expected === NATIVE) {
    return actual === NATIVE || actual.toLowerCase() === "native";
  }
  return lower(expected) === lower(actual);
}
