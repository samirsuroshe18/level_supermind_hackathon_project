import { FaHackerNews, FaYoutube } from 'react-icons/fa';
import { FiBarChart2, FiEdit3, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/auth';
import sampleReport from '../data/sampleReport';
import Button from '../components/Button';
import Logo from '../components/Logo';
import ReportView from '../components/ReportView';
import ThemeToggle from '../components/ThemeToggle';

const STEPS = [
  { icon: FiSearch, title: 'Name a topic', text: 'A product, a niche or a question. That is all AdVise needs.' },
  { icon: FiBarChart2, title: 'It reads the conversation', text: 'Hundreds of comments and posts are collected, scored for sentiment and counted over time.' },
  { icon: FiEdit3, title: 'You get a report', text: 'Pain points, wishes, competitors and ad lines, each linked to the posts it came from.' },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-page items-center justify-between px-4 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button to="/dashboard">Dashboard</Button>
          ) : (
            <>
              <Button to="/login" variant="ghost">Log in</Button>
              <Button to="/register" className="hidden sm:inline-flex">Sign up</Button>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-page px-4 pb-14 pt-12 sm:pt-20">
          <p className="eyebrow">Audience research</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl sm:leading-[1.05]">
            Know what your audience is saying before you write the ad.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            AdVise reads what people actually write about a topic and turns it into a report: what frustrates
            them, what they wish for, who they compare you to, and the lines that answer it.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={user ? '/dashboard' : '/register'} className="px-5 py-3 text-base">
              {user ? 'Go to your dashboard' : 'Start researching'}
            </Button>
            <a href="#sample" className="inline-flex items-center rounded-lg border border-line bg-surface px-5 py-3 text-base font-semibold hover:bg-soft">
              See a sample report
            </a>
          </div>

          <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span>Reads public discussion on</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-ink"><FaYoutube aria-hidden="true" /> YouTube</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-ink"><FaHackerNews aria-hidden="true" /> Hacker News</span>
            <span>and more</span>
          </p>
        </section>

        <section className="border-y border-line bg-surface">
          <ol className="mx-auto grid max-w-page gap-8 px-4 py-12 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-accent">
                  <step.icon size={20} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-xl font-semibold">{index + 1}. {step.title}</h2>
                <p className="mt-2 text-sm text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="sample" className="mx-auto max-w-page scroll-mt-6 px-4 py-14">
          <p className="eyebrow">Sample report</p>
          <h2 className="mt-1 break-words text-3xl font-semibold">{sampleReport.topic}</h2>
          <p className="mb-8 mt-2 max-w-2xl text-sm text-muted">
            This is what a finished report looks like. The posts in this sample are written for illustration;
            in your own reports every quote links to the original post.
          </p>
          <ReportView research={sampleReport} />
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-page px-4 py-14 text-center">
            <h2 className="text-3xl font-semibold">Run your first research</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted">Five researches a day, free. A report takes less than a minute.</p>
            <Button to={user ? '/dashboard' : '/register'} className="mt-6 px-5 py-3 text-base">
              {user ? 'Go to your dashboard' : 'Create an account'}
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted">
          <p>Started at the Level SuperMind hackathon, January 2025.</p>
          <a href="https://github.com/samirsuroshe18/level_supermind_hackathon_project" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-accent">
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
