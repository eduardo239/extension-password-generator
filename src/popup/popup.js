import { generatePassword } from '../lib/password.js';

const statusEl = document.getElementById('status');
const button = document.getElementById('generate');

function setStatus(message, state) {
  statusEl.textContent = message;
  statusEl.dataset.state = state;
}

// A senha nunca é exibida, registrada em log ou armazenada:
// existe apenas durante a chamada de cópia para a área de transferência.
async function copyNewPassword() {
  button.disabled = true;
  try {
    await navigator.clipboard.writeText(generatePassword());
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
