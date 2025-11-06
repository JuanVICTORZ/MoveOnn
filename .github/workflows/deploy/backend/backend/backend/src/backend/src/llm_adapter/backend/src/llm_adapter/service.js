const axios = require('axios');

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const SIMULATED = !OPENAI_KEY;

async function callOpenAI(prompt) {
  // Basic wrapper (if you want real integration, adapt endpoint & payload)
  const url = 'https://api.openai.com/v1/chat/completions';
  const data = {
    model: "gpt-4o-mini", // adjust to your available model
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500
  };
  const resp = await axios.post(url, data, {
    headers: { Authorization: `Bearer ${OPENAI_KEY}` }
  });
  return resp.data.choices?.[0]?.message?.content || '';
}

module.exports = {
  chat: async ({ message, userId }) => {
    if (SIMULATED) {
      // Mode simulated: provide deterministic, helpful responses
      return { reply: `Simulado: Recebi sua mensagem "${message}". Sugestão: tente usar rota mais curta para economizar CO2.` };
    }
    const prompt = `Usuário ${userId} diz: ${message}\nResponda de forma curta, educada e com sugestão de rota sustentável.`;
    const text = await callOpenAI(prompt);
    return { reply: text };
  },

  generateReport: async ({ userId, period }) => {
    if (SIMULATED) {
      // Fetch data from DB in a real case, here we return a sample report
      return {
        report: `Relatório simulado para usuário ${userId || 'Geral'} no período ${period || 'última semana'}:
- Viagens: 12
- Emissão de CO2 evitada: 9.8 kg
Sugestão: aumentar uso de bicicleta em horários de pico.`
      };
    }
    const prompt = `Gere um relatório em linguagem natural sobre os deslocamentos do usuário ${userId} no período ${period}.`;
    const text = await callOpenAI(prompt);
    return { report: text };
  },

  suggest: async ({ context }) => {
    if (SIMULATED) {
      return { suggestions: [`Evitar horários entre 7:30-9:00`, `Priorizar bicicleta para trajetos <5km`] };
    }
    const prompt = `Com base no seguinte contexto, gere 3 sugestões de otimização: ${context}`;
    const text = await callOpenAI(prompt);
    return { suggestions: text.split('\n').filter(Boolean) };
  }
};
