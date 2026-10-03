import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import useResearch, { isActive } from '../hooks/useResearch';
import { formatDateTime, formatNumber } from '../utils/format';
import Button from '../components/Button';
import Notice from '../components/Notice';
import ProgressSteps from '../components/ProgressSteps';
import ReportView from '../components/ReportView';
import SourceBadges from '../components/SourceBadges';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

const BackLink = () => (
  <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
    <FiArrowLeft aria-hidden="true" /> Dashboard
  </Link>
);

const Report = () => {
  const { id } = useParams();
  const { research, error } = useResearch(id);

  if (error) {
    return (
      <div>
        <BackLink />
        <Notice tone="error" className="mt-6">{error}</Notice>
      </div>
    );
  }

  if (!research) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  const used = research.sourcesUsed || [];
  const skipped = research.sourcesSkipped || [];

  return (
    <div>
      <BackLink />

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow">Research report</p>
          <StatusBadge status={research.status} />
        </div>
        <h1 className="mt-1 break-words text-3xl font-semibold sm:text-4xl">{research.topic}</h1>
        <p className="mt-2 text-sm text-muted">
          Started {formatDateTime(research.createdAt)}
          {research.status === 'done' && ` · ${formatNumber(research.postCount)} posts read`}
        </p>

        {used.length > 0 && <SourceBadges sources={used} className="mt-4" />}
        {skipped.length > 0 && (
          <p className="mt-3 text-sm text-muted">
            Not included: {skipped.map((source) => `${source.label} (${source.reason.toLowerCase()})`).join(', ')}
          </p>
        )}
      </header>

      <div className="mt-8">
        {isActive(research) && (
          <div className="max-w-xl">
            <ProgressSteps stage={research.stage} />
            <p className="mt-4 text-sm text-muted">This usually takes under a minute. You can leave this page; the report will be on your dashboard.</p>
          </div>
        )}

        {research.status === 'failed' && (
          <div className="max-w-xl">
            <Notice tone="error">{research.error}</Notice>
            <p className="mt-3 text-sm text-muted">A failed research does not count towards your daily limit.</p>
            <Button to="/dashboard" className="mt-5">Start another</Button>
          </div>
        )}

        {research.status === 'done' && research.report && <ReportView research={research} />}
      </div>
    </div>
  );
};

export default Report;
