/**
 * Geração de senhas criptograficamente seguras.
 *
 * - Usa exclusivamente a Web Crypto API (crypto.getRandomValues); Math.random nunca é usado.
 * - Evita viés de módulo por meio de amostragem por rejeição.
 * - Garante ao menos um caractere de cada categoria e embaralha o resultado
 *   com Fisher–Yates para que essas posições não sejam previsíveis.
 */

const CHARSETS = Object.freeze({
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
});

export const DEFAULT_LENGTH = 20;
export const MIN_LENGTH = 12;
export const MAX_LENGTH = 128;

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

/**
 * Gera uma senha aleatória contendo letras minúsculas, maiúsculas, dígitos e símbolos.
 * @param {number} [length=DEFAULT_LENGTH]
 * @returns {string}
 */
export function generatePassword(length = DEFAULT_LENGTH) {
  if (!Number.isInteger(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new RangeError(`O tamanho deve ser um inteiro entre ${MIN_LENGTH} e ${MAX_LENGTH}`);
  }

  const charsets = Object.values(CHARSETS);
  const alphabet = charsets.join('');

  const chars = charsets.map(pick);
  while (chars.length < length) {
    chars.push(pick(alphabet));
  }

  return shuffle(chars).join('');
}

export { CHARSETS };
