/**
 * Geração de senhas criptograficamente seguras.
 *
 * - Usa exclusivamente a Web Crypto API (crypto.getRandomValues); Math.random nunca é usado.
 * - Evita viés de módulo por meio de amostragem por rejeição.
 * - Garante ao menos um caractere de cada categoria selecionada e embaralha o resultado
 *   com Fisher–Yates para que essas posições não sejam previsíveis.
 */

export const CHARSETS = Object.freeze({
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
});

export const DEFAULT_CHARSETS = Object.freeze(['lower', 'upper', 'digits', 'symbols']);
export const DEFAULT_LENGTH = 20;
export const MIN_LENGTH = 12;
export const MAX_LENGTH = 64;

const UINT32_RANGE = 2 ** 32;

/**
 * Retorna um inteiro uniformemente distribuído em [0, max).
 * Valores acima do maior múltiplo de `max` são descartados para eliminar o viés de módulo.
 */
export function randomInt(max) {
  if (!Number.isInteger(max) || max <= 0 || max > UINT32_RANGE) {
    throw new RangeError(`max deve ser um inteiro entre 1 e ${UINT32_RANGE}`);
  }

  const limit = UINT32_RANGE - (UINT32_RANGE % max);
  const buffer = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);

  return value % max;
}

function pick(charset) {
  return charset[randomInt(charset.length)];
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function validateCharsets(charsets) {
  if (!Array.isArray(charsets) || charsets.length === 0) {
    throw new TypeError('Selecione ao menos um conjunto de caracteres');
  }
  if (new Set(charsets).size !== charsets.length) {
    throw new TypeError('Conjuntos de caracteres repetidos');
  }
  for (const name of charsets) {
    if (!Object.hasOwn(CHARSETS, name)) {
      throw new TypeError(`Conjunto de caracteres desconhecido: ${name}`);
    }
  }
}

/**
 * Gera uma senha aleatória com os conjuntos de caracteres escolhidos.
 * @param {object} [options]
 * @param {number} [options.length=DEFAULT_LENGTH]
 * @param {string[]} [options.charsets=DEFAULT_CHARSETS] chaves de CHARSETS
 * @returns {string}
 */
export function generatePassword({ length = DEFAULT_LENGTH, charsets = DEFAULT_CHARSETS } = {}) {
  if (!Number.isInteger(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new RangeError(`O tamanho deve ser um inteiro entre ${MIN_LENGTH} e ${MAX_LENGTH}`);
  }
  validateCharsets(charsets);

  const sets = charsets.map((name) => CHARSETS[name]);
  const alphabet = sets.join('');

  const chars = sets.map(pick);
  while (chars.length < length) {
    chars.push(pick(alphabet));
  }

  return shuffle(chars).join('');
}
