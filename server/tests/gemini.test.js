import { jest } from '@jest/globals';

const generateContent = jest.fn();
const GoogleGenAI = jest.fn(() => ({ models: { generateContent } }));
jest.unstable_mockModule('@google/genai', () => ({ GoogleGenAI }));

const { generateJson } = await import('../src/analysis/gemini.js');

const schema = { type: 'object' };

beforeEach(() => {
    generateContent.mockReset();
    process.env.GEMINI_API_KEY = 'test-key';
    delete process.env.GEMINI_MODEL;
});

afterAll(() => {
    delete process.env.GEMINI_API_KEY;
});

test('asks for JSON that follows the schema and returns it parsed', async () => {
    generateContent.mockResolvedValue({ text: '{"summary":"ok"}' });

    const result = await generateJson('the prompt', schema);

    expect(result).toEqual({ summary: 'ok' });
    const request = generateContent.mock.calls[0][0];
    expect(request.model).toBe('gemini-3.5-flash-lite');
    expect(request.contents).toBe('the prompt');
    expect(request.config.responseMimeType).toBe('application/json');
    expect(request.config.responseJsonSchema).toBe(schema);
});

test('gives up on an answer that takes longer than 30 seconds', async () => {
    generateContent.mockResolvedValue({ text: '{}' });

    await generateJson('the prompt', schema);

    expect(generateContent.mock.calls[0][0].config.httpOptions).toEqual({ timeout: 30000 });
});

test('the model can be changed with GEMINI_MODEL', async () => {
    process.env.GEMINI_MODEL = 'another-model';
    generateContent.mockResolvedValue({ text: '{}' });

    await generateJson('the prompt', schema);

    expect(generateContent.mock.calls[0][0].model).toBe('another-model');
});

test('an answer that is not JSON, or is empty, is an error', async () => {
    generateContent.mockResolvedValueOnce({ text: 'Sorry, I cannot help with that.' });
    await expect(generateJson('the prompt', schema)).rejects.toThrow();

    generateContent.mockResolvedValueOnce({ text: undefined });
    await expect(generateJson('the prompt', schema)).rejects.toThrow();
});

test('a missing key is an error before anything is sent', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(generateJson('the prompt', schema)).rejects.toThrow('GEMINI_API_KEY is not set');
    expect(generateContent).not.toHaveBeenCalled();
});
