import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod";

const BRASIL_API_BASE = "https://brasilapi.com.br/api";

async function fetchBrasilAPI(path: string): Promise<any> {
  const response = await fetch(`${BRASIL_API_BASE}${path}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brasil API error (${response.status}): ${errorText}`);
  }
  return response.json();
}

function createServer(): McpServer {
  const server = new McpServer({
    name: "brasilapi",
    version: "1.0.0",
  });

  server.tool(
    "consultar_cep",
    "Consulta endereço a partir de um CEP (código postal brasileiro)",
    { cep: z.string().describe("CEP para consultar (ex: 01001000)") },
    async ({ cep }) => {
      try {
        const data = await fetchBrasilAPI(`/cep/v2/${cep.replace(/\D/g, "")}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "consultar_cnpj",
    "Consulta dados cadastrais de uma empresa a partir do CNPJ",
    { cnpj: z.string().describe("CNPJ para consultar (ex: 00000000000191)") },
    async ({ cnpj }) => {
      try {
        const data = await fetchBrasilAPI(`/cnpj/v1/${cnpj.replace(/\D/g, "")}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "consultar_ddd",
    "Consulta estado e cidades atendidas por um DDD brasileiro",
    { ddd: z.string().describe("DDD para consultar (ex: 11)") },
    async ({ ddd }) => {
      try {
        const data = await fetchBrasilAPI(`/ddd/v1/${ddd}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "listar_bancos",
    "Lista todos os bancos do Brasil com código, nome e ISPB",
    {},
    async () => {
      try {
        const data = await fetchBrasilAPI(`/banks/v1`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "consultar_banco",
    "Consulta informações de um banco pelo código",
    { codigo: z.string().describe("Código do banco (ex: 001)") },
    async ({ codigo }) => {
      try {
        const data = await fetchBrasilAPI(`/banks/v1/${codigo}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "consultar_feriados",
    "Lista os feriados nacionais de um determinado ano",
    { ano: z.string().describe("Ano para consultar (ex: 2026)") },
    async ({ ano }) => {
      try {
        const data = await fetchBrasilAPI(`/feriados/v1/${ano}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "consultar_isbn",
    "Consulta informações de um livro pelo ISBN",
    { isbn: z.string().describe("ISBN do livro (ex: 9788545702870)") },
    async ({ isbn }) => {
      try {
        const data = await fetchBrasilAPI(`/isbn/v1/${isbn.replace(/\D/g, "")}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "consultar_fipe",
    "Consulta preço de veículo pela tabela FIPE",
    { codigo_fipe: z.string().describe("Código FIPE (ex: 001004-9)") },
    async ({ codigo_fipe }) => {
      try {
        const data = await fetchBrasilAPI(`/fipe/preco/v1/${codigo_fipe}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "consultar_dominio",
    "Consulta informações de registro de um domínio .br",
    { dominio: z.string().describe("Domínio (ex: google.com.br)") },
    async ({ dominio }) => {
      try {
        const data = await fetchBrasilAPI(`/registrobr/v1/${dominio}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "consultar_taxas",
    "Consulta taxas de juros atuais (Selic, CDI, IPCA)",
    {},
    async () => {
      try {
        const data = await fetchBrasilAPI(`/taxas/v1`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro: ${error.message}` }], isError: true };
      }
    }
  );

  return server;
}

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS", "HEAD"],
  allowedHeaders: "*",
  exposedHeaders: ["Content-Type", "Mcp-Session-Id"],
  credentials: false,
}));

app.options("*", (_req, res) => {
  res.status(204).end();
});

app.use(express.json());

const mcpServer = createServer();
const transports: Record<string, SSEServerTransport> = {};

// OAuth discovery endpoints - return 404 to signal authless server
app.get("/.well-known/oauth-authorization-server", (_req, res) => {
  res.status(404).end();
});

app.get("/.well-known/oauth-protected-resource", (_req, res) => {
  res.status(404).end();
});

// Health check
app.get("/", (_req, res) => {
  res.json({ name: "brasilapi-mcp-server", version: "1.0.0", status: "running" });
});

// SSE endpoint
app.get("/sse", async (req: Request, res: Response) => {
  console.log(`[SSE] New connection from ${req.ip}`);

  // Set SSE headers explicitly
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;
  transports[sessionId] = transport;

  res.on("close", () => {
    console.log(`[SSE] Disconnected: ${sessionId}`);
    delete transports[sessionId];
  });

  await mcpServer.server.connect(transport);
  console.log(`[SSE] Connected: ${sessionId}`);
});

// Messages endpoint
app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];

  if (!transport) {
    res.status(400).json({ error: "Invalid or expired session" });
    return;
  }

  await transport.handlePostMessage(req, res);
});

const PORT = parseInt(process.env.PORT || "3000");
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Brasil API MCP Server running on port ${PORT}`);
  console.log(`SSE endpoint: /sse`);
  console.log(`Messages endpoint: /messages`);
});
