import { generatePassword } from '../lib/password.js';

const statusEl = document.getElementById('status');
const button = document.getElementById('generate');

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
    await writeToClipboard(generatePassword());
    setStatus('Senha copiada!', 'success');
  } catch {
    setStatus('Não foi possível copiar. Clique no botão para tentar novamente.', 'error');
  } finally {
    button.disabled = false;
  }
}

button.addEventListener('click', copyNewPassword);

// Abrir o popup (clique no ícone da extensão) já gera e copia uma senha.
copyNewPassword();
