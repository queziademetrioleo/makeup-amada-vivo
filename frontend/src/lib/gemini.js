/**
 * Gemini API client — sends face photo for analysis and product recommendation.
 * Calls the Gemini 2.0 Flash model with vision capabilities.
 */
import { GEMINI_SYSTEM_PROMPT } from '@/data/catalog';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
/**
 * Analyze a face photo and get product recommendations from Gemini.
 * @param photoBase64 Base64-encoded JPEG image (no data: prefix)
 */
export async function analyzeWithGemini(photoBase64) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey)
        throw new Error('VITE_GEMINI_API_KEY not configured');
    // Strip data:image/...;base64, prefix if present
    const base64Clean = photoBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const body = {
        system_instruction: {
            parts: [{ text: GEMINI_SYSTEM_PROMPT }],
        },
        contents: [
            {
                parts: [
                    {
                        inline_data: {
                            mime_type: 'image/jpeg',
                            data: base64Clean,
                        },
                    },
                    {
                        text: 'Analise esta imagem facial e retorne o JSON com as recomendações de maquiagem baseadas no catálogo fornecido.',
                    },
                ],
            },
        ],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
        },
    };
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${err}`);
    }
    const data = await res.json();
    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text)
        throw new Error('Empty response from Gemini');
    // Parse JSON (Gemini should return pure JSON due to responseMimeType)
    const parsed = JSON.parse(text);
    return parsed;
}
