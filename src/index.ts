import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod";

const BRASIL_API_BASE = "https://brasilapi.com.br/api";

// Helper to fetch from Brasil API
async function fetchBrasilAPI(path: string): Promise<any> {
  const response = await fetch(`${BRASIL_API_BASE}${path}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brasil API error (${response.status}): ${errorText}`);
  }
  return response.json();
}

// Create and configure the MCP server
function createServer(): McpServer {
  const server = new McpServer({
    name: "brasilapi",
    version: "1.0.0",
  });

  // Tool: CEP lookup
  server.tool(
    "consultar_cep",
    "Consulta endereço a partir de um CEP (código postal brasileiro)",
    { cep: z.string().describe("CEP para consultar (ex: 01001000)") },
    async ({ cep }) => {
      try {
        const cleanCep = cep.replace(/\D/g, "");
        const data = await fetchBrasilAPI(`/cep/v2/${cleanCep}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro ao consultar CEP: ${error.message}` }], isError: true };
      }
    }
  );

  // Tool: CNPJ lookup
  server.tool(
    "consultar_cnpj",
    "Consulta dados cadastrais de uma empresa a partir do CNPJ",
    { cnpj: z.string().describe("CNPJ para consultar (ex: 00000000000191)") },
    async ({ cnpj }) => {
      try {
        const cleanCnpj = cnpj.replace(/\D/g, "");
        const data = await fetchBrasilAPI(`/cnpj/v1/${cleanCnpj}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro ao consultar CNPJ: ${error.message}` }], isError: true };
      }
    }
  );

  // Tool: DDD lookup
  server.tool(
    "consultar_ddd",
    "Consulta estado e cidades atendidas por um DDD brasileiro",
    { ddd: z.string().describe("DDD para consultar (ex: 11)") },
    async ({ ddd }) => {
      try {
        const data = await fetchBrasilAPI(`/ddd/v1/${ddd}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro ao consultar DDD: ${error.message}` }], isError: true };
      }
    }
  );

  // Tool: Banks list
  server.tool(
    "listar_bancos",
    "Lista todos os bancos do Brasil com código, nome e ISPB",
    {},
    async () => {
      try {
        const data = await fetchBrasilAPI(`/banks/v1`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro ao listar bancos: ${error.message}` }], isError: true };
      }
    }
  );

  // Tool: Bank by code
  server.tool(
    "consultar_banco",
    "Consulta informações de um banco pelo código",
    { codigo: z.string().describe("Código do banco (ex: 001 para Banco do Brasil)") },
    async ({ codigo }) => {
      try {
        const data = await fetchBrasilAPI(`/banks/v1/${codigo}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro ao consultar banco: ${error.message}` }], isError: true };
      }
    }
  );

  // Tool: Holidays
  server.tool(
    "consultar_feriados",
    "Lista os feriados nacionais de um determinado ano",
    { ano: z.string().describe("Ano para consultar (ex: 2026)") },
    async ({ ano }) => {
      try {
        const data = await fetchBrasilAPI(`/feriados/v1/${ano}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro ao consultar feriados: ${error.message}` }], isError: true };
      }
    }
  );

  // Tool: ISBN lookup
  server.tool(
    "consultar_isbn",
    "Consulta informações de um livro pelo ISBN",
    { isbn: z.string().describe("ISBN do livro (ex: 9788545702870)") },
    async ({ isbn }) => {
      try {
        const cleanIsbn = isbn.replace(/\D/g, "");
        const data = await fetchBrasilAPI(`/isbn/v1/${cleanIsbn}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro ao consultar ISBN: ${error.message}` }], isError: true };
      }
    }
  );

  // Tool: Vehicle FIPE price
  server.tool(
    "consultar_fipe",
    "Consulta preço de veículo pela tabela FIPE usando o código FIPE",
    { codigo_fipe: z.string().describe("Código FIPE do veículo (ex: 001004-9)") },
    async ({ codigo_fipe }) => {
      try {
        const data = await fetchBrasilAPI(`/fipe/preco/v1/${codigo_fipe}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro ao consultar FIPE: ${error.message}` }], isError: true };
      }
    }
  );

  // Tool: Domain registration
  server.tool(
    "consultar_dominio",
    "Consulta informações de registro de um domínio .br",
    { dominio: z.string().describe("Domínio para consultar (ex: google.com.br)") },
    async ({ dominio }) => {
      try {
        const data = await fetchBrasilAPI(`/registrobr/v1/${dominio}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro ao consultar domínio: ${error.message}` }], isError: true };
      }
    }
  );

  // Tool: Tax rates (Selic, CDI, IPCA)
  server.tool(
    "consultar_taxas",
    "Consulta taxas de juros atuais (Selic, CDI, IPCA)",
    {},
    async () => {
      try {
        const data = await fetchBrasilAPI(`/taxas/v1`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: `Erro ao consultar taxas: ${error.message}` }], isError: true };
      }
    }
  );

  return server;
}

// Express app with SSE transport
const app = express();
app.use(cors());
app.use(express.json());

const mcpServer = createServer();
const transports: Record<string, SSEServerTransport> = {};

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "brasilapi-mcp-server",
    version: "1.0.0",
    status: "running",
    tools: [
      "consultar_cep", "consultar_cnpj", "consultar_ddd",
      "listar_bancos", "consultar_banco", "consultar_feriados",
      "consultar_isbn", "consultar_fipe", "consultar_dominio",
      "consultar_taxas"
    ]
  });
});

// SSE endpoint
app.get("/sse", async (req: Request, res: Response) => {
  console.log("[SSE] New client connection");
  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;
  transports[sessionId] = transport;

  res.on("close", () => {
    console.log(`[SSE] Client disconnected: ${sessionId}`);
    delete transports[sessionId];
  });

  await mcpServer.server.connect(transport);
  console.log(`[SSE] Client connected: ${sessionId}`);
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
app.listen(PORT, () => {
  console.log(`Brasil API MCP Server running on port ${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});
