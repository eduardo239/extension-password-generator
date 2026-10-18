import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARSETS,
  DEFAULT_CHARSETS,
  DEFAULT_LENGTH,
  MAX_LENGTH,
  MIN_LENGTH,
  generatePassword,
  randomInt,
} from '../src/lib/password.js';

const alphabetOf = (names) => names.map((name) => CHARSETS[name]).join('');

test('gera senha com o tamanho padrão', () => {
  assert.equal(generatePassword().length, DEFAULT_LENGTH);
});

test('respeita o tamanho informado', () => {
  assert.equal(generatePassword({ length: MIN_LENGTH }).length, MIN_LENGTH);
  assert.equal(generatePassword({ length: MAX_LENGTH }).length, MAX_LENGTH);
});

test('rejeita tamanhos inválidos', () => {
  for (const length of [MIN_LENGTH - 1, MAX_LENGTH + 1, 16.5, '20', NaN]) {
    assert.throws(() => generatePassword({ length }), RangeError);
  }
});

test('rejeita conjuntos de caracteres inválidos', () => {
  for (const charsets of [[], ['lower', 'lower'], ['emoji'], ['toString'], 'lower']) {
    assert.throws(() => generatePassword({ charsets }), TypeError);
  }
});

test('conjuntos não têm caracteres repetidos', () => {
  const all = Object.values(CHARSETS).join('');
  assert.equal(new Set(all).size, all.length);
});

test('padrão contém ao menos um caractere de cada categoria e nada fora do alfabeto', () => {
  const alphabet = alphabetOf(DEFAULT_CHARSETS);
  for (let i = 0; i < 1000; i++) {
    const password = generatePassword({ length: MIN_LENGTH });
    for (const name of DEFAULT_CHARSETS) {
      assert.ok([...password].some((c) => CHARSETS[name].includes(c)), `faltando ${name} em ${password}`);
    }
    assert.ok([...password].every((c) => alphabet.includes(c)));
  }
});

test('usa somente os conjuntos selecionados', () => {
  const cases = [['digits'], ['lower', 'digits'], ['upper', 'symbols'], Object.keys(CHARSETS)];
  for (const charsets of cases) {
    const alphabet = alphabetOf(charsets);
    for (let i = 0; i < 200; i++) {
      const password = generatePassword({ length: MIN_LENGTH, charsets });
      assert.ok([...password].every((c) => alphabet.includes(c)), `${password} fora de ${charsets}`);
      for (const name of charsets) {
        assert.ok([...password].some((c) => CHARSETS[name].includes(c)), `faltando ${name} em ${password}`);
      }
    }
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
