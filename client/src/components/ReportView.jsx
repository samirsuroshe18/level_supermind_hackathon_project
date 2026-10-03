import { useMemo } from 'react';
import { formatNumber } from '../utils/format';
import CopyButton from './CopyButton';
import InsightCard from './InsightCard';
import Notice from './Notice';
import PostQuote from './PostQuote';
import SentimentChart from './SentimentChart';
import VolumeChart from './VolumeChart';

const Section = ({ eyebrow, title, intro, children }) => (
  <section className="mt-12">
    <p className="eyebrow">{eyebrow}</p>
    <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
    {intro && <p className="mt-2 max-w-2xl text-sm text-muted">{intro}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

// a hook or call to action, with the finding it answers and a copy button
const CopyLine = ({ line }) => (
  <li className="flex items-start justify-between gap-3 py-3">
    <div className="min-w-0">
      <p className="break-words font-medium">{line.text}</p>
      {line.basedOn && <p className="mt-0.5 text-xs text-muted">Answers: {line.basedOn}</p>}
    </div>
    <CopyButton text={line.text} />
  </li>
);

// The body of a finished report. The landing page shows a sample with the same component.
const ReportView = ({ research }) => {
  const { report } = research;
  const insights = report.insightsAvailable ? report.insights : null;

  // findings refer to posts by id; the posts themselves are in report.evidence
  const postsById = useMemo(
    () => new Map((report.evidence || []).map((post) => [post.id, post])),
    [report.evidence]
  );
  const postsFor = (ids) => (ids || []).map((id) => postsById.get(id)).filter(Boolean);
  const topPosts = postsFor(report.topPosts);

  return (
    <div>
      {insights ? (
        <section className="card border-l-4 border-l-accent p-5 sm:p-6">
          <p className="eyebrow">Summary</p>
          <p className="mt-2 text-lg leading-relaxed">{insights.summary}</p>
        </section>
      ) : (
        <Notice>
          The written insights could not be produced this time. The figures below are computed from the
          {' '}{formatNumber(research.postCount)} posts that were found and are complete.
        </Notice>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">How people feel</h2>
          <p className="mb-5 mt-1 text-sm text-muted">Each post is scored by the words it uses.</p>
          <SentimentChart sentiment={report.sentiment} />
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">How much they talk</h2>
          <p className="mb-5 mt-1 text-sm text-muted">Posts found per month, last 12 months.</p>
          <VolumeChart volume={report.volume} />
        </section>
      </div>

      {insights && insights.painPoints.length > 0 && (
        <Section eyebrow="Pain points" title="What frustrates them" intro="Problems people describe in their own words. Every card links to the posts behind it.">
          <div className="grid items-start gap-4 md:grid-cols-2">
            {insights.painPoints.map((item) => <InsightCard key={item.title} title={item.title} detail={item.detail} posts={postsFor(item.postIds)} />)}
          </div>
        </Section>
      )}

      {insights && insights.wishes.length > 0 && (
        <Section eyebrow="Wishes" title="What they want" intro="Things people say they are looking for or would pay for.">
          <div className="grid items-start gap-4 md:grid-cols-2">
            {insights.wishes.map((item) => <InsightCard key={item.title} title={item.title} detail={item.detail} posts={postsFor(item.postIds)} />)}
          </div>
        </Section>
      )}

      {insights && insights.competitors.length > 0 && (
        <Section eyebrow="Competitors" title="Who else they mention" intro="Products and alternatives named in the posts, and how they are spoken about.">
          <div className="grid items-start gap-4 md:grid-cols-2">
            {insights.competitors.map((item) => <InsightCard key={item.name} title={item.name} detail={item.perception} posts={postsFor(item.postIds)} />)}
          </div>
        </Section>
      )}

      {insights && (insights.hooks.length > 0 || insights.callsToAction.length > 0) && (
        <Section eyebrow="Copy" title="Lines to start from" intro="Drafts that answer the findings above. Treat them as a starting point, not finished copy.">
          <div className="grid items-start gap-4 md:grid-cols-2">
            {insights.hooks.length > 0 && (
              <div className="card px-5 py-3">
                <h3 className="pt-2 text-base font-semibold">Hooks</h3>
                <ul className="divide-y divide-line">
                  {insights.hooks.map((line) => <CopyLine key={line.text} line={line} />)}
                </ul>
              </div>
            )}
            {insights.callsToAction.length > 0 && (
              <div className="card px-5 py-3">
                <h3 className="pt-2 text-base font-semibold">Calls to action</h3>
                <ul className="divide-y divide-line">
                  {insights.callsToAction.map((line) => <CopyLine key={line.text} line={line} />)}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {topPosts.length > 0 && (
        <Section eyebrow="Evidence" title="Most-noticed posts" intro="The posts with the highest score from each source.">
          <div className="card space-y-5 p-5 sm:p-6">
            {topPosts.map((post) => <PostQuote key={post.id} post={post} />)}
          </div>
        </Section>
      )}
    </div>
  );
};

export default ReportView;
