/**
 * Preferências do usuário, persistidas em storage.sync.
 * Tudo o que vem do armazenamento é validado antes do uso.
 */

import { CHARSETS, DEFAULT_LENGTH, MAX_LENGTH, MIN_LENGTH } from './password.js';

const STORAGE_KEY = 'preferences';

export const DEFAULT_PREFERENCES = Object.freeze({
  length: DEFAULT_LENGTH,
  charsets: Object.freeze({
    lower: true,
    upper: true,
    digits: true,
    symbols: true,
  }),
});

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Normaliza um valor qualquer para preferências válidas, usando os padrões onde preciso. */
export function sanitizePreferences(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const storedCharsets = isPlainObject(source.charsets) ? source.charsets : {};

  const length = Number.isInteger(source.length)
    ? Math.min(Math.max(source.length, MIN_LENGTH), MAX_LENGTH)
    : DEFAULT_PREFERENCES.length;

  const charsets = {};
  for (const name of Object.keys(CHARSETS)) {
    const value = Object.hasOwn(storedCharsets, name) ? storedCharsets[name] : undefined;
    charsets[name] = typeof value === 'boolean' ? value : DEFAULT_PREFERENCES.charsets[name];
  }

  if (!Object.values(charsets).some(Boolean)) {
    return { length, charsets: { ...DEFAULT_PREFERENCES.charsets } };
  }
  return { length, charsets };
}

/** Lista as chaves dos conjuntos de caracteres ativos. */
export function selectedCharsets(preferences) {
  return Object.keys(preferences.charsets).filter((name) => preferences.charsets[name]);
}

function defaultStorageArea() {
  return (globalThis.browser ?? globalThis.chrome).storage.sync;
}

export async function loadPreferences(area = defaultStorageArea()) {
  const { [STORAGE_KEY]: stored } = await area.get(STORAGE_KEY);
  return sanitizePreferences(stored);
}

export async function savePreferences(preferences, area = defaultStorageArea()) {
  const clean = sanitizePreferences(preferences);
  await area.set({ [STORAGE_KEY]: clean });
  return clean;
}
