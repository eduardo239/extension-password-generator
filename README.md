# Gerador de Senhas — extensão para Chrome e Firefox

Clique no ícone da extensão e uma senha aleatória e forte é copiada para a área de transferência. Depois é só colar com `Ctrl + V`. A senha não aparece na tela.

## Como funciona

- Ao abrir o popup (clique no ícone), uma senha é gerada e copiada com as suas preferências.
- O botão **"Copiar nova senha"** gera e copia outra.
- No próprio popup você escolhe os tipos de caracteres e o tamanho da senha (de 12 a 64; padrão 20).

| Opção                                  | Padrão |
| -------------------------------------- | ------ |
| Minúsculas (a–z)                       | ligado |
| Maiúsculas (A–Z)                       | ligado |
| Números (0–9)                          | ligado |
| Caracteres especiais (`!@#$%^&*` etc.) | ligado |

As preferências são salvas em `storage.sync`, que sincroniza entre navegadores logados na mesma conta, e passam a valer para as próximas senhas. Pelo menos um tipo de caractere fica sempre marcado. Cada tipo escolhido aparece no mínimo uma vez na senha.

## Segurança

- **Aleatoriedade criptográfica:** usa apenas `crypto.getRandomValues` (Web Crypto API), nunca `Math.random`.
- **Sem viés de módulo:** a amostragem por rejeição garante que todos os caracteres tenham a mesma chance de sair.
- **Embaralhamento Fisher–Yates:** os caracteres obrigatórios não ficam em posições previsíveis.
- **Nada é guardado:** a senha não é mostrada, registrada em log, salva nem enviada pela rede. Só as preferências são salvas.
- **Preferências validadas:** o que vem do armazenamento passa por validação antes do uso, e valores inválidos voltam para o padrão.
- **Permissões mínimas:** só `clipboardWrite` e `storage`. A extensão não acessa abas, páginas nem histórico.
- **CSP restritiva:** `default-src 'none'`, só scripts locais, nenhum código remoto nem `eval`.
- **Sem dependências de produção.**

## Estrutura

```
manifest.json            Manifest V3 (Chrome e Firefox)
icons/                   Ícones 16/32/48/128 px
src/lib/password.js      Gerador de senhas (lógica pura, testável)
src/lib/preferences.js   Validação e armazenamento das preferências
src/popup/               Interface do popup (HTML, CSS, JS)
tests/                   Testes unitários (node:test)
```

## Instalação para desenvolvimento

**Chrome / Edge / Brave**
1. Abra `chrome://extensions`.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e escolha a pasta do projeto.

**Firefox (140+)**
1. Abra `about:debugging#/runtime/this-firefox`.
2. Clique em **Carregar extensão temporária…** e escolha o `manifest.json`.

Dica: fixe o ícone na barra de ferramentas para ter acesso com um clique.

## Testes

Requer Node.js 20 ou mais recente.

```sh
npm test
```

## Empacotamento

Compacte apenas os arquivos da extensão:

```sh
zip -r password-generator.zip manifest.json icons src
```
