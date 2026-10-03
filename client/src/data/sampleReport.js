// An illustrative report for the landing page, in the same shape the API returns.
// The posts are written for the example and carry no links.

const post = (id, source, author, score, month, text) => ({
  id,
  source,
  author,
  score,
  text,
  createdAt: `2026-${month}-12T10:00:00Z`,
});

const evidence = [
  post('s1', 'youtube', '@deskbound', 214, '08', 'Mine wobbles so much at standing height that I stopped typing on it. Fine for sitting, useless for the thing I bought it for.'),
  post('s2', 'hackerNews', 'tall_dev', 96, '06', 'At 6\'3" every budget frame I tried shakes at full extension. The crossbar-less designs are the worst offenders.'),
  post('s3', 'youtube', '@homeofficefix', 131, '09', 'Why does a 500 dollar desk ship with zero cable management? I spent another 60 on trays and clips.'),
  post('s4', 'hackerNews', 'quietkeys', 58, '07', 'I would happily pay extra for a desk with a power strip and a tray built in. Routing cables that have to move up and down is a real pain.'),
  post('s5', 'youtube', '@backpainlog', 302, '09', 'Three months in and my lower back pain is basically gone. I alternate every 45 minutes, that is the trick.'),
  post('s6', 'hackerNews', 'frame_nerd', 77, '05', 'Moved from a cheap frame to an Uplift. Night and day for stability, but you pay double.'),
];

const sampleReport = {
  topic: 'standing desks',
  postCount: 233,
  report: {
    insightsAvailable: true,
    sentiment: {
      overall: { positive: 81, neutral: 127, negative: 25 },
      bySource: {
        youtube: { positive: 58, neutral: 71, negative: 13 },
        hackerNews: { positive: 23, neutral: 56, negative: 12 },
      },
    },
    volume: [
      { month: '2025-11', count: 9 }, { month: '2025-12', count: 12 }, { month: '2026-01', count: 21 },
      { month: '2026-02', count: 14 }, { month: '2026-03', count: 11 }, { month: '2026-04', count: 16 },
      { month: '2026-05', count: 13 }, { month: '2026-06', count: 19 }, { month: '2026-07', count: 17 },
      { month: '2026-08', count: 24 }, { month: '2026-09', count: 28 }, { month: '2026-10', count: 8 },
    ],
    topPosts: [],
    evidence,
    insights: {
      summary: 'People who use standing desks mostly like them and credit them with less back pain, but stability is the complaint that comes up again and again, especially from tall users and buyers of budget frames. Cable management is the feature buyers most often say is missing. Premium brands are seen as sturdier and overpriced.',
      painPoints: [
        { title: 'Wobble at standing height', detail: 'Budget frames shake at full extension, which makes typing unpleasant. Tall users are hit hardest.', postIds: ['s1', 's2'] },
        { title: 'No cable management included', detail: 'Buyers end up paying for trays and clips on top of the desk.', postIds: ['s3'] },
      ],
      wishes: [
        { title: 'Built-in power and cable tray', detail: 'People say they would pay more for a desk that handles moving cables out of the box.', postIds: ['s4'] },
      ],
      competitors: [
        { name: 'Uplift', perception: 'Seen as clearly more stable than budget frames, at about twice the price.', postIds: ['s6'] },
      ],
      hooks: [
        { text: 'A standing desk that stays still when you stand.', basedOn: 'Wobble at standing height' },
        { text: 'Cables sorted before you open the box.', basedOn: 'Built-in power and cable tray' },
        { text: 'Rock-solid at 6\'3". We measured.', basedOn: 'Wobble at standing height' },
      ],
      callsToAction: [
        { text: 'Watch the wobble test', basedOn: 'Wobble at standing height' },
        { text: 'See what is in the box', basedOn: 'No cable management included' },
      ],
    },
  },
};

export default sampleReport;
