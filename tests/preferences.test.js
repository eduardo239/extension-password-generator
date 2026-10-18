import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHARSETS, MAX_LENGTH, MIN_LENGTH } from '../src/lib/password.js';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  sanitizePreferences,
  savePreferences,
  selectedCharsets,
} from '../src/lib/preferences.js';

function fakeStorageArea(initial = {}) {
  const data = { ...initial };
  return {
    data,
    async get(key) {
      return key in data ? { [key]: structuredClone(data[key]) } : {};
    },
    async set(items) {
      Object.assign(data, structuredClone(items));
    },
  };
}

test('padrões cobrem todos os conjuntos de caracteres', () => {
  assert.deepEqual(Object.keys(DEFAULT_PREFERENCES.charsets).sort(), Object.keys(CHARSETS).sort());
});

test('valores ausentes ou inválidos viram os padrões', () => {
  for (const raw of [undefined, null, 'x', 42, {}, { length: 'abc', charsets: 'nope' }]) {
    assert.deepEqual(sanitizePreferences(raw), DEFAULT_PREFERENCES);
  }
});

test('tamanho é limitado ao intervalo permitido', () => {
  assert.equal(sanitizePreferences({ length: 1 }).length, MIN_LENGTH);
  assert.equal(sanitizePreferences({ length: 10_000 }).length, MAX_LENGTH);
  assert.equal(sanitizePreferences({ length: 30 }).length, 30);
  assert.equal(sanitizePreferences({ length: 30.5 }).length, DEFAULT_PREFERENCES.length);
});

test('ignora chaves desconhecidas e valores não booleanos', () => {
  const result = sanitizePreferences({ charsets: { lower: false, digits: 'yes', evil: true } });
  assert.equal(result.charsets.lower, false);
  assert.equal(result.charsets.digits, DEFAULT_PREFERENCES.charsets.digits);
  assert.ok(!('evil' in result.charsets));
});

test('nenhum conjunto selecionado volta aos conjuntos padrão', () => {
  const none = Object.fromEntries(Object.keys(CHARSETS).map((name) => [name, false]));
  assert.deepEqual(sanitizePreferences({ length: 30, charsets: none }).charsets, DEFAULT_PREFERENCES.charsets);
});

test('selectedCharsets lista apenas os ativos', () => {
  const prefs = sanitizePreferences({
    charsets: { lower: true, upper: false, digits: true, symbols: false },
  });
  assert.deepEqual(selectedCharsets(prefs), ['lower', 'digits']);
});

test('salva e carrega preferências', async () => {
  const area = fakeStorageArea();
  assert.deepEqual(await loadPreferences(area), DEFAULT_PREFERENCES);

  const wanted = { length: 32, charsets: { ...DEFAULT_PREFERENCES.charsets, upper: false, symbols: false } };
  await savePreferences(wanted, area);
  assert.deepEqual(await loadPreferences(area), wanted);
});

test('dados adulterados no armazenamento são saneados ao carregar', async () => {
  const area = fakeStorageArea({ preferences: { length: -5, charsets: { lower: 'true' } } });
  const prefs = await loadPreferences(area);
  assert.equal(prefs.length, MIN_LENGTH);
  assert.equal(prefs.charsets.lower, DEFAULT_PREFERENCES.charsets.lower);
});
