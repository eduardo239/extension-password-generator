import { MAX_LENGTH, MIN_LENGTH, generatePassword } from '../lib/password.js';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  sanitizePreferences,
  savePreferences,
  selectedCharsets,
} from '../lib/preferences.js';

const statusEl = document.getElementById('status');
const button = document.getElementById('generate');
const form = document.getElementById('preferences');
const lengthInput = document.getElementById('length');
const lengthValue = document.getElementById('length-value');
const charsetInputs = [...form.querySelectorAll('input[name="charset"]')];

let preferences = DEFAULT_PREFERENCES;

function setStatus(message, state) {
  statusEl.textContent = message;
  statusEl.dataset.state = state;
}

const FOCUS_TIMEOUT_MS = 500;

// No Chrome, o popup ainda não tem foco quando o script roda, e
// navigator.clipboard.writeText falha com "Document is not focused".
function waitForFocus() {
  if (document.hasFocus()) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, FOCUS_TIMEOUT_MS);
    window.addEventListener(
      'focus',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

// Alternativa que não depende de foco (permitida pela permissão clipboardWrite).
// O texto vai direto para o evento de cópia, sem passar pelo DOM.
function copyViaCommand(text) {
  const onCopy = (event) => {
    event.clipboardData.setData('text/plain', text);
    event.preventDefault();
  };
  document.addEventListener('copy', onCopy);
  try {
    return document.execCommand('copy');
  } finally {
    document.removeEventListener('copy', onCopy);
  }
}

async function writeToClipboard(text) {
  await waitForFocus();
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    if (!copyViaCommand(text)) throw error;
  }
}

// A senha nunca é exibida, registrada em log ou armazenada:
// existe apenas durante a chamada de cópia para a área de transferência.
async function copyNewPassword() {
  button.disabled = true;
  try {
    const password = generatePassword({
      length: preferences.length,
      charsets: selectedCharsets(preferences),
    });
    await writeToClipboard(password);
    setStatus('Password copied!', 'success');
  } catch {
    setStatus("Couldn't copy. Click the button to try again.", 'error');
  } finally {
    button.disabled = false;
  }
}

// Impede desmarcar o último conjunto de caracteres restante.
function lockLastCharset() {
  const checkedCount = charsetInputs.filter((input) => input.checked).length;
  for (const input of charsetInputs) {
    input.disabled = checkedCount === 1 && input.checked;
  }
}

function renderPreferences() {
  lengthInput.value = String(preferences.length);
  lengthValue.textContent = String(preferences.length);
  for (const input of charsetInputs) {
    input.checked = preferences.charsets[input.value];
  }
  lockLastCharset();
}

function readPreferences() {
  return {
    length: Number(lengthInput.value),
    charsets: Object.fromEntries(charsetInputs.map((input) => [input.value, input.checked])),
  };
}

async function onPreferencesChange() {
  lockLastCharset();
  // Aplica imediatamente na próxima senha, mesmo que a gravação falhe.
  preferences = sanitizePreferences(readPreferences());
  try {
    await savePreferences(preferences);
  } catch {
    setStatus("Couldn't save your preferences.", 'error');
  }
}

async function init() {
  lengthInput.min = String(MIN_LENGTH);
  lengthInput.max = String(MAX_LENGTH);

  try {
    preferences = await loadPreferences();
  } catch {
    // Mantém os padrões se o armazenamento estiver indisponível.
  }
  renderPreferences();

  button.addEventListener('click', copyNewPassword);
  lengthInput.addEventListener('input', () => {
    lengthValue.textContent = lengthInput.value;
  });
  form.addEventListener('change', onPreferencesChange);
  form.addEventListener('submit', (event) => event.preventDefault());

  // Abrir o popup (clique no ícone da extensão) já gera e copia uma senha.
  await copyNewPassword();
}

init();
