import { FiCheck } from 'react-icons/fi';
import Spinner from './Spinner';

const STEPS = [
  { stage: 'collecting', title: 'Collecting posts', detail: 'Searching each source for what people wrote about the topic.' },
  { stage: 'analysing', title: 'Measuring', detail: 'Scoring sentiment and counting posts per month.' },
  { stage: 'writing', title: 'Writing insights', detail: 'Reading a sample of the posts and drafting the findings.' },
];

// Where a running research is. A queued research has not reached the first step yet.
const ProgressSteps = ({ stage }) => {
  const current = STEPS.findIndex((step) => step.stage === stage);

  return (
    <ol className="card divide-y divide-line" aria-label="Progress">
      {STEPS.map((step, index) => {
        const done = current > index;
        const active = current === index;

        return (
          <li key={step.stage} className="flex items-start gap-4 p-5" aria-current={active ? 'step' : undefined}>
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${done ? 'bg-accent text-accent-ink' : 'border border-line text-muted'}`}>
              {done && <FiCheck aria-label="Done" />}
              {active && <Spinner label="In progress" className="h-4 w-4" />}
              {!done && !active && index + 1}
            </span>
            <div>
              <p className={`font-semibold ${done || active ? 'text-ink' : 'text-muted'}`}>{step.title}</p>
              <p className="mt-0.5 text-sm text-muted">{step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default ProgressSteps;
