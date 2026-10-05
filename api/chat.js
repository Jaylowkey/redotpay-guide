export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Assistente IA não configurada." });
  }

  const body = req.body || {};
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const clean = messages
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1200) }));

  if (!clean.length || clean[clean.length - 1].role !== "user") {
    return res.status(400).json({ error: "Mensagem inválida." });
  }

  const instructions = `
És a assistente virtual do RedotPay Guide, um site independente de orientação para utilizadores em Moçambique.
Responde sempre em português claro, simples e curto.
Podes ajudar com: registo, código de convite jt6mg, códigos PAYGOV20 e PAYGOP20, verificação/KYC, como encontrar o UID/ID RedotPay, cartão virtual/físico e solicitação de recarga/serviço de 850 MT.
Não afirmes que és a RedotPay oficial. Quando não souberes algo, diz claramente que o utilizador deve confirmar nos canais oficiais da RedotPay.
Nunca peças nem aceites palavras-passe, OTP, PIN, seed phrase, chave privada ou códigos de recuperação.
Nunca prometas que o bónus de $5 será recebido: explica que depende da elegibilidade e das condições da campanha.
Não inventes taxas, limites, preços ou regras da RedotPay.
Para pagamentos/recarga, orienta o utilizador a confirmar as instruções com a equipa através do WhatsApp do site.
Se o utilizador pedir suporte humano, recomenda o WhatsApp.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-luna",
        instructions,
        input: clean,
        max_output_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: "A assistente IA não conseguiu responder agora." });
    }

    return res.status(200).json({
      reply: data.output_text || "Não consegui gerar uma resposta agora."
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao ligar à assistente IA." });
  }
}
