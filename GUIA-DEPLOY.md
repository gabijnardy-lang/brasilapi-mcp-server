# Como colocar o servidor MCP da Brasil API no ar e conectar ao Claude.ai

Este guia vai te levar do zero até ter o conector funcionando no Claude.ai (Chat).

---

## O que é esse projeto

É um servidor que traduz as chamadas do Claude (protocolo MCP) para a Brasil API (protocolo REST). Ele precisa ficar hospedado na internet 24h para funcionar como conector no Claude.ai.

Ferramentas disponíveis após a conexão:
- **consultar_cep** — Endereço a partir de CEP
- **consultar_cnpj** — Dados cadastrais de empresa
- **consultar_ddd** — Estado e cidades de um DDD
- **listar_bancos** — Todos os bancos do Brasil
- **consultar_banco** — Banco pelo código
- **consultar_feriados** — Feriados nacionais por ano
- **consultar_isbn** — Livro pelo ISBN
- **consultar_fipe** — Preço de veículo pela tabela FIPE
- **consultar_dominio** — Registro de domínio .br
- **consultar_taxas** — Taxas de juros (Selic, CDI, IPCA)

---

## Passo 1 — Criar conta no GitHub (se ainda não tiver)

Acesse https://github.com e crie uma conta gratuita.

---

## Passo 2 — Criar um repositório no GitHub

1. No GitHub, clique no botão **"+"** no canto superior direito e depois em **"New repository"**.
2. Preencha:
   - **Repository name:** `brasilapi-mcp-server`
   - **Description:** `Servidor MCP remoto para Brasil API`
   - Marque **"Public"**
   - Marque **"Add a README file"**
3. Clique em **"Create repository"**.

---

## Passo 3 — Fazer upload dos arquivos

Na página do repositório que acabou de criar:

1. Clique em **"Add file"** > **"Upload files"**.
2. Arraste TODOS os arquivos da pasta do projeto para a área de upload:
   - `package.json`
   - `tsconfig.json`
   - `render.yaml`
   - `.gitignore`
   - A pasta `src/` (com o arquivo `index.ts` dentro)
3. Clique em **"Commit changes"**.

**Importante:** NÃO faça upload das pastas `node_modules/` nem `dist/`. Apenas os arquivos-fonte.

---

## Passo 4 — Criar conta no Render

1. Acesse https://render.com
2. Clique em **"Get Started for Free"**.
3. Faça login com sua conta do GitHub (opção mais prática).

---

## Passo 5 — Criar o serviço no Render

1. No dashboard do Render, clique em **"New"** > **"Web Service"**.
2. Selecione **"Build and deploy from a Git repository"** e clique **"Next"**.
3. Conecte seu repositório `brasilapi-mcp-server` do GitHub.
4. Preencha as configurações:
   - **Name:** `brasilapi-mcp-server`
   - **Region:** escolha a mais próxima (ex: Oregon)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** selecione **"Free"**
5. Em **Environment Variables**, adicione:
   - **Key:** `PORT` | **Value:** `10000`
6. Clique em **"Create Web Service"**.

O Render vai começar a construir e publicar o servidor. Aguarde até o status mudar para **"Live"** (pode levar 2-3 minutos).

---

## Passo 6 — Copiar a URL do servidor

Quando o deploy terminar, o Render vai mostrar a URL do seu servidor, algo como:

```
https://brasilapi-mcp-server-xxxx.onrender.com
```

Copie essa URL.

---

## Passo 7 — Adicionar como conector no Claude.ai

1. Abra o Claude.ai no navegador (ou o app desktop).
2. Vá em **Configurações** > **Conectores**.
3. Clique em **"Adicionar conector personalizado"**.
4. No campo de URL, cole a URL do Render seguida de `/sse`:

```
https://brasilapi-mcp-server-xxxx.onrender.com/sse
```

5. Clique em **"Adicionar"**.

Se tudo estiver correto, o conector vai aparecer como "Conectado" na lista.

---

## Passo 8 — Testar

Abra uma nova conversa no Claude.ai e peça:

```
Consulte o CEP 01001-000 usando o conector Brasil API
```

O Claude deve usar a ferramenta `consultar_cep` e retornar os dados do endereço.

---

## Observações importantes

**Plano gratuito do Render:** O servidor "dorme" após 15 minutos sem uso. A primeira consulta após o servidor dormir pode levar 30-60 segundos para responder (o tempo de ele "acordar"). Após isso, as respostas são rápidas.

**Se quiser manter o servidor sempre ativo:** Você pode fazer upgrade para o plano pago do Render (a partir de US$ 7/mês), ou hospedar em outro serviço como Railway, Fly.io ou um VPS.

**Para remover:** Delete o serviço no painel do Render e remova o conector nas configurações do Claude.ai.
