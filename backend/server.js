// Backend de exemplo: recebe as mensagens do chat e consulta a API da Anthropic.
// A chave da API fica SOMENTE aqui (variável de ambiente), nunca no site.
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(cors({ origin: (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean) }));

// As instruções ficam no servidor: o site não consegue alterá-las.
const SYSTEM_PROMPT = `Você é o assistente virtual da Associação Conexão Social (ACS), ONG de Lagoa de Itaenga (PE) que impulsiona a inclusão social por meio da conexão com projetos inovadores de educação transformadora.
Responda sempre em português do Brasil, com tom acolhedor, simples e curto. Use apenas as informações abaixo. Se não souber, diga com honestidade e indique o contato da equipe. Nunca invente datas, vagas, telefones ou valores.
Fatos: sede no Centro Tecnológico Conexão Social, Rua Projetada A, bairro Salinas, Lagoa de Itaenga, Zona da Mata Norte (PE). Inaugurado em 2023, com salas tecnológicas, auditório, refeitório, área de lazer e piscina. Capacidade para mais de 700 pessoas entre crianças, adolescentes e idosos. Projeto “VamoSimbora?” para pessoas a partir de 60 anos: letramento digital e hidroginástica gratuitos. Inscrições presenciais com RG, CPF e comprovante de residência.`;

// Limite simples: 20 mensagens por minuto por IP (use um serviço dedicado em produção).
const hits = new Map();
setInterval(() => hits.clear(), 60_000);

app.post("/chat", async (req, res) => {
  const ip = req.ip;
  hits.set(ip, (hits.get(ip) || 0) + 1);
  if (hits.get(ip) > 20) return res.status(429).json({ error: "Muitas mensagens. Tente novamente em instantes." });

  const messages = (Array.isArray(req.body.messages) ? req.body.messages : [])
    .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user")
    return res.status(400).json({ error: "Mensagem inválida." });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
    if (!r.ok) throw new Error("API " + r.status);
    const data = await r.json();
    const reply = data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    res.json({ reply });
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: "Falha ao consultar a IA." }); // o site cai no modo offline
  }
});

app.get("/", (_, res) => res.send("Backend do chatbot ACS no ar."));
app.listen(process.env.PORT || 3000, () => console.log("Rodando"));
