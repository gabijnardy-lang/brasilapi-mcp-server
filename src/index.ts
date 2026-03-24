import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const BRASIL_API_BASE = "https://brasilapi.com.br/api";

async function fetchBrasilAPI(path: string): Promise<any> {
  const response = await fetch(`${BRASIL_API_BASE}${path}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brasil API error (${response.status}): ${errorText}`);
  }
  return response.json();
}

function createMcpServer(): McpServer {
  const server = new McpServer({ name: "brasilapi", version: "1.0.0" });

  server.tool("consultar_cep", "Consulta endereço a partir de um CEP", {
    cep: z.string().describe("CEP para consultar (ex: 01001000)"),
  }, async ({ cep }) => {
    try {
      const data = await fetchBrasilAPI(`/cep/v2/${cep.replace(/\D/g, "")}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) { return { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true }; }
  });

  server.tool("consultar_cnpj", "Consulta dados cadastrais de empresa pelo CNPJ", {
    cnpj: z.string().describe("CNPJ (ex: 00000000000191)"),
  }, async ({ cnpj }) => {
    try {
      const data = await fetchBrasilAPI(`/cnpj/v1/${cnpj.replace(/\D/g, "")}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) { return { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true }; }
  });

  server.tool("consultar_ddd", "Consulta estado e cidades de um DDD", {
    ddd: z.string().describe("DDD (ex: 11)"),
  }, async ({ ddd }) => {
    try {
      const data = await fetchBrasilAPI(`/ddd/v1/${ddd}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) { return { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true }; }
  });

  server.tool("listar_bancos", "Lista todos os bancos do Brasil", {}, async () => {
    try {
      const data = await fetchBrasilAPI(`/banks/v1`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) { return { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true }; }
  });

  server.tool("consultar_banco", "Consulta banco pelo código", {
    codigo: z.string().describe("Código do banco (ex: 001)"),
  }, async ({ codigo }) => {
    try {
      const data = await fetchBrasilAPI(`/banks/v1/${codigo}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) { return { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true }; }
  });

  server.tool("consultar_feriados", "Lista feriados nacionais de um ano", {
    ano: z.string().describe("Ano (ex: 2026)"),
  }, async ({ ano }) => {
    try {
      const data = await fetchBrasilAPI(`/feriados/v1/${ano}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) { return { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true }; }
  });

  server.tool("consultar_isbn", "Consulta livro pelo ISBN", {
    isbn: z.string().describe("ISBN (ex: 9788545702870)"),
  }, async ({ isbn }) => {
    try {
      const data = await fetchBrasilAPI(`/isbn/v1/${isbn.replace(/\D/g, "")}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) { return { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true }; }
  });

  server.tool("consultar_fipe", "Consulta preço de veículo pela tabela FIPE", {
    codigo_fipe: z.string().describe("Código FIPE (ex: 001004-9)"),
  }, async ({ codigo_fipe }) => {
    try {
      const data = await fetchBrasilAPI(`/fipe/preco/v1/${codigo_fipe}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) { return { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true }; }
  });

  server.tool("consultar_dominio", "Consulta registro de domínio .br", {
    dominio: z.string().describe("Domínio (ex: google.com.br)"),
  }, async ({ dominio }) => {
    try {
      const data = await fetchBrasilAPI(`/registrobr/v1/${dominio}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) { return { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true }; }
  });

  server.tool("consultar_taxas", "Consulta taxas de juros (Selic, CDI, IPCA)", {}, async () => {
    try {
      const data = await fetchBrasilAPI(`/taxas/v1`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) { return { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true }; }
  });

  return server;
}

const app = express();
app.use(cors());
app.use(express.json());

// OAuth discovery - 404 signals authless
app.get("/.well-known/oauth-authorization-server", (_req: Request, res: Response) => {
  res.status(404).end();
});
app.get("/.well-known/oauth-protected-resource", (_req: Request, res: Response) => {
  res.status(404).end();
});

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({ name: "brasilapi-mcp-server", version: "1.0.0", status: "running" });
});

// Streamable HTTP MCP endpoint - stateless
app.post("/mcp", async (req: Request, res: Response) => {
  const server = createMcpServer();
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      transport.close();
      server.server.close();
    });
  } catch (error) {
    console.error("[MCP] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Handle GET and DELETE on /mcp for protocol compliance
app.get("/mcp", (_req: Request, res: Response) => {
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed. Use POST." },
    id: null,
  }));
});

app.delete("/mcp", (_req: Request, res: Response) => {
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed. Stateless server." },
    id: null,
  }));
});

const PORT = parseInt(process.env.PORT || "3000");
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Brasil API MCP Server (Streamable HTTP) running on port ${PORT}`);
  console.log(`MCP endpoint: /mcp`);
});
