import { jest } from '@jest/globals';
import { buildPrompt, validateInsights, writeInsights, INSIGHTS_SCHEMA } from '../src/analysis/insights.js';

const post = (index, overrides = {}) => ({
    source: 'youtube',
    id: `yt:comment-${index}`,
    text: `Comment number ${index} about standing desks.`,
    author: 'someone',
    url: `https://example.com/${index}`,
    score: index,
    createdAt: new Date('2026-09-01T00:00:00Z'),
    ...overrides,
});

const posts = [post(1), post(2, { source: 'hackerNews', id: 'hn:2' }), post(3)];

// what the model is expected to answer for the three posts above
const rawInsights = (overrides = {}) => ({
    summary: 'People like standing desks but complain about wobble.',
    painPoints: [{ title: 'Wobble at full height', detail: 'Cheap frames shake.', postIds: ['p1', 'p2'] }],
    wishes: [{ title: 'Built-in cable tray', detail: 'Buyers want tidy cables.', postIds: ['p3'] }],
    competitors: [{ name: 'Uplift', perception: 'Seen as sturdy but pricey.', postIds: ['p2'] }],
    hooks: [{ text: 'A desk that stays still at any height.', basedOn: 'Wobble at full height' }],
    callsToAction: [{ text: 'See the stability test', basedOn: 'Wobble at full height' }],
    ...overrides,
});

const refsFor = (list) => buildPrompt('standing desks', list).refs;

describe('buildPrompt', () => {
    test('lists every post under a short reference and never shows the real ids', () => {
        const { prompt, refs } = buildPrompt('standing desks', posts);

        expect(prompt).toContain('standing desks');
        expect(prompt).toContain('[p1] (YouTube, score 1) Comment number 1 about standing desks.');
        expect(prompt).toContain('[p2] (Hacker News, score 2) Comment number 2 about standing desks.');
        expect(prompt).toContain('[p3]');
        expect(prompt).not.toContain('yt:comment-1');
        expect(prompt).not.toContain('hn:2');
        expect(refs.get('p2')).toBe(posts[1]);
        expect(refs.size).toBe(3);
    });

    test('the schema asks for every section of the report', () => {
        expect(INSIGHTS_SCHEMA.required).toEqual(['summary', 'painPoints', 'wishes', 'competitors', 'hooks', 'callsToAction']);
    });
});

describe('validateInsights', () => {
    test('maps references back to the real post ids', () => {
        const insights = validateInsights(rawInsights(), refsFor(posts));

        expect(insights.summary).toBe('People like standing desks but complain about wobble.');
        expect(insights.painPoints).toEqual([
            { title: 'Wobble at full height', detail: 'Cheap frames shake.', postIds: ['yt:comment-1', 'hn:2'] },
        ]);
        expect(insights.wishes[0].postIds).toEqual(['yt:comment-3']);
        expect(insights.competitors).toEqual([{ name: 'Uplift', perception: 'Seen as sturdy but pricey.', postIds: ['hn:2'] }]);
        expect(insights.hooks).toEqual([{ text: 'A desk that stays still at any height.', basedOn: 'Wobble at full height' }]);
        expect(insights.callsToAction).toEqual([{ text: 'See the stability test', basedOn: 'Wobble at full height' }]);
    });

    test('removes references the model was never given, and repeats', () => {
        const raw = rawInsights({
            painPoints: [{ title: 'Wobble', detail: 'Shakes.', postIds: ['p1', 'p99', 'yt:comment-2', 'p1', 7] }],
        });

        expect(validateInsights(raw, refsFor(posts)).painPoints[0].postIds).toEqual(['yt:comment-1']);
    });

    test('drops an insight that no post supports', () => {
        const raw = rawInsights({
            painPoints: [
                { title: 'Invented', detail: 'Nothing backs this.', postIds: ['p50'] },
                { title: 'No list', detail: 'Missing ids.' },
                { title: 'Real', detail: 'Backed.', postIds: ['p1'] },
            ],
            competitors: [{ name: 'Ghost', perception: 'Never mentioned.', postIds: [] }],
        });

        const insights = validateInsights(raw, refsFor(posts));

        expect(insights.painPoints.map((item) => item.title)).toEqual(['Real']);
        expect(insights.competitors).toEqual([]);
    });

    test('trims text and drops entries without a title, name or text', () => {
        const raw = rawInsights({
            summary: '  Spaced summary.  ',
            wishes: [{ title: '   ', detail: 'x', postIds: ['p1'] }, { title: ' Tray ', detail: ' Tidy. ', postIds: ['p3'] }],
            hooks: [{ text: '' }, { text: 42 }, { text: ' Stay still. ', basedOn: ' Wobble ' }, 'not an object'],
            callsToAction: [{ text: 'Shop now' }],
        });

        const insights = validateInsights(raw, refsFor(posts));

        expect(insights.summary).toBe('Spaced summary.');
        expect(insights.wishes).toEqual([{ title: 'Tray', detail: 'Tidy.', postIds: ['yt:comment-3'] }]);
        expect(insights.hooks).toEqual([{ text: 'Stay still.', basedOn: 'Wobble' }]);
        expect(insights.callsToAction).toEqual([{ text: 'Shop now', basedOn: '' }]);
    });

    test('caps every section', () => {
        const supported = (count, key) => Array.from({ length: count }, (_, index) => ({ [key]: `Item ${index}`, detail: 'd', perception: 'p', postIds: ['p1'] }));
        const texts = (count) => Array.from({ length: count }, (_, index) => ({ text: `Line ${index}`, basedOn: 'Item 0' }));
        const raw = rawInsights({
            painPoints: supported(9, 'title'),
            wishes: supported(9, 'title'),
            competitors: supported(9, 'name'),
            hooks: texts(9),
            callsToAction: texts(9),
        });

        const insights = validateInsights(raw, refsFor(posts));

        expect(insights.painPoints).toHaveLength(6);
        expect(insights.wishes).toHaveLength(6);
        expect(insights.competitors).toHaveLength(6);
        expect(insights.hooks).toHaveLength(5);
        expect(insights.callsToAction).toHaveLength(3);
    });

    test('sections that are missing or not lists become empty lists', () => {
        const raw = rawInsights({ competitors: undefined, hooks: 'none', callsToAction: null });

        const insights = validateInsights(raw, refsFor(posts));

        expect(insights.competitors).toEqual([]);
        expect(insights.hooks).toEqual([]);
        expect(insights.callsToAction).toEqual([]);
    });

    test('refuses an answer without a summary, without an object, or with nothing supported', () => {
        const refs = refsFor(posts);

        expect(() => validateInsights(rawInsights({ summary: '  ' }), refs)).toThrow('Insights are incomplete');
        expect(() => validateInsights(null, refs)).toThrow('Insights are incomplete');
        expect(() => validateInsights('text', refs)).toThrow('Insights are incomplete');
        expect(() => validateInsights(rawInsights({ painPoints: [], wishes: [] }), refs)).toThrow('Insights are incomplete');
        expect(() => validateInsights(rawInsights({
            painPoints: [{ title: 'Invented', detail: 'x', postIds: ['p77'] }],
            wishes: [],
        }), refs)).toThrow('Insights are incomplete');
    });
});

describe('writeInsights', () => {
    const silence = () => jest.spyOn(console, 'log').mockImplementation(() => {});

    test('returns validated insights from the first answer', async () => {
        const generate = jest.fn(async () => rawInsights());

        const insights = await writeInsights('standing desks', posts, { generate });

        expect(generate).toHaveBeenCalledTimes(1);
        expect(generate.mock.calls[0][0]).toContain('[p1]');
        expect(generate.mock.calls[0][1]).toBe(INSIGHTS_SCHEMA);
        expect(insights.painPoints[0].postIds).toEqual(['yt:comment-1', 'hn:2']);
    });

    test('tries once more after a failure', async () => {
        const silenced = silence();
        const generate = jest.fn()
            .mockRejectedValueOnce(new Error('model overloaded'))
            .mockResolvedValueOnce(rawInsights());

        const insights = await writeInsights('standing desks', posts, { generate });

        silenced.mockRestore();
        expect(generate).toHaveBeenCalledTimes(2);
        expect(insights.summary).toBe('People like standing desks but complain about wobble.');
    });

    test('tries once more after an answer that is incomplete', async () => {
        const silenced = silence();
        const generate = jest.fn()
            .mockResolvedValueOnce({ summary: '' })
            .mockResolvedValueOnce(rawInsights());

        const insights = await writeInsights('standing desks', posts, { generate });

        silenced.mockRestore();
        expect(generate).toHaveBeenCalledTimes(2);
        expect(insights).not.toBeNull();
    });

    test('gives up after the second failure and returns null', async () => {
        const silenced = silence();
        const generate = jest.fn(async () => { throw new Error('model overloaded'); });

        const insights = await writeInsights('standing desks', posts, { generate });

        silenced.mockRestore();
        expect(generate).toHaveBeenCalledTimes(2);
        expect(insights).toBeNull();
    });

    test('shows the model at most 120 posts', async () => {
        const generate = jest.fn(async () => rawInsights());
        const lots = Array.from({ length: 300 }, (_, index) => post(index));

        await writeInsights('standing desks', lots, { generate });

        const prompt = generate.mock.calls[0][0];
        expect(prompt).toContain('[p120]');
        expect(prompt).not.toContain('[p121]');
    });
});
