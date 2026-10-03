import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

let client;

// created on first use, so the key is only needed when a research actually runs
const getClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    client = client || new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return client;
};

// Asks the language model for an answer that follows the given JSON schema and
// returns it parsed. Any failure, including an answer that is not JSON, throws.
const generateJson = async (prompt, schema) => {
    const response = await getClient().models.generateContent({
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseJsonSchema: schema,
            temperature: 0.4,
        },
    });

    return JSON.parse(response.text);
};

export { generateJson }
