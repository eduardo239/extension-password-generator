import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARSETS,
  DEFAULT_LENGTH,
  MAX_LENGTH,
  MIN_LENGTH,
  generatePassword,
  randomInt,
} from '../src/lib/password.js';

const ALPHABET = Object.values(CHARSETS).join('');

test('gera senha com o tamanho padrão', () => {
  assert.equal(generatePassword().length, DEFAULT_LENGTH);
});

test('respeita o tamanho informado', () => {
  assert.equal(generatePassword(MIN_LENGTH).length, MIN_LENGTH);
  assert.equal(generatePassword(MAX_LENGTH).length, MAX_LENGTH);
});

test('rejeita tamanhos inválidos', () => {
  for (const length of [MIN_LENGTH - 1, MAX_LENGTH + 1, 16.5, '20', NaN]) {
    assert.throws(() => generatePassword(length), RangeError);
  }
});

test('contém ao menos um caractere de cada categoria e nada fora do alfabeto', () => {
  for (let i = 0; i < 1000; i++) {
    const password = generatePassword(MIN_LENGTH);
    for (const charset of Object.values(CHARSETS)) {
      assert.ok([...password].some((c) => charset.includes(c)), `faltando categoria em ${password}`);
    }
    assert.ok([...password].every((c) => ALPHABET.includes(c)));
  }
});

test('gera senhas distintas', () => {
  const passwords = new Set(Array.from({ length: 1000 }, () => generatePassword()));
  assert.equal(passwords.size, 1000);
});

test('randomInt fica no intervalo e é aproximadamente uniforme', () => {
  const max = 7;
  const samples = 70_000;
  const counts = new Array(max).fill(0);
  for (let i = 0; i < samples; i++) {
    const n = randomInt(max);
    assert.ok(Number.isInteger(n) && n >= 0 && n < max);
    counts[n]++;
  }
  const expected = samples / max;
  for (const count of counts) {
    assert.ok(Math.abs(count - expected) < expected * 0.05, `distribuição suspeita: ${counts}`);
  }
});

test('randomInt rejeita argumentos inválidos', () => {
  for (const max of [0, -1, 1.5, 2 ** 32 + 1]) {
    assert.throws(() => randomInt(max), RangeError);
  }
});
