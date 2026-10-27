/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Inicializa o cliente Gemini com headers de identificação
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// =============================================================================
// ENDPOINT: CATEGORIZAÇÃO INTELIGENTE DE GASTOS VIA GEMINI API
// =============================================================================
app.post('/api/categorize-expense', async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, availableCategories } = req.body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ error: 'A descrição do gasto é obrigatória.' });
      return;
    }

    const categoriesList = Array.isArray(availableCategories) && availableCategories.length > 0
      ? availableCategories.join(', ')
      : 'Alimentação, Transporte, Moradia, Lazer & Cultura, Saúde, Compras, Salário & Renda, Cafeteria & Lanches, Outros';

    // 1. Prompt de Sistema Especialista em Finanças Pessoais
    const systemInstruction = `Você é um assistente especialista em organização de finanças pessoais e contabilidade doméstica.
Sua função é analisar a descrição de uma transação financeira inserida pelo usuário em linguagem natural (ex: "Uber para o trabalho", "Almoço no shopping", "Mensalidade da academia", "Salário da empresa") e classificá-la de forma precisa.

Diretrizes:
1. Identifique a categoria mais adequada dentre as disponíveis: [${categoriesList}].
2. Gere uma tag curta e direta (máximo 2 a 3 palavras) que resuma o item (ex: "Corrida Aplicativo", "Almoço Fora", "Assinatura Streaming", "Depósito Salarial").
3. Identifique se a movimentação é 'despesa' ou 'receita'.
4. Forneça uma breve justificativa de 1 frase.
5. Seja estritamente consistente com o schema JSON requisitado.`;

    // 2. Chamada à API com Modelo 'gemini-3.8-flash' e Structured Outputs
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analise a seguinte transação: "${description.trim()}"`,
      config: {
        systemInstruction,
        temperature: 0.1, // Baixa temperatura para categorização determinística
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'A categoria mais adequada para a despesa ou receita.',
            },
            tag: {
              type: Type.STRING,
              description: 'Uma tag curta de 1 a 3 palavras para etiquetar a transação.',
            },
            type: {
              type: Type.STRING,
              description: "Tipo de transação: 'despesa' ou 'receita'.",
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Nível de confiança da classificação entre 0.0 e 1.0.',
            },
            reasoning: {
              type: Type.STRING,
              description: 'Breve explicação do motivo da classificação.',
            },
          },
          required: ['category', 'tag', 'type'],
        },
      },
    });

    const rawJson = response.text?.trim() || '{}';
    const parsedData = JSON.parse(rawJson);

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Erro ao categorizar despesa com Gemini:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao processar categorização inteligente.',
      details: error?.message || 'Erro desconhecido',
    });
  }
});

// =============================================================================
// CONFIGURAÇÃO DO SERVIDOR (DEV COM VITE MIDDLEWARES / PROD STATIC)
// =============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
