import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { deleteResearch, getMeta, listResearch } from '../api/research';
import { useAuth } from '../context/auth';
import { isActive } from '../hooks/useResearch';
import HistoryList from '../components/HistoryList';
import Notice from '../components/Notice';
import ResearchForm from '../components/ResearchForm';
import Spinner from '../components/Spinner';

const REFRESH_MS = 4000;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [researches, setResearches] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [latestMeta, list] = await Promise.all([getMeta(), listResearch()]);
      setMeta(latestMeta);
      setResearches(list);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const busy = (researches || []).some(isActive);

  // while something is running, the list keeps itself up to date
  useEffect(() => {
    if (!busy) return undefined;

    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [busy, load]);

  const handleDelete = async (id) => {
    try {
      await deleteResearch(id);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div>
      <p className="eyebrow">Dashboard</p>
      <h1 className="mt-1 text-3xl font-semibold">Hello, {user.userName.split(' ')[0]}</h1>
      <p className="mt-2 text-muted">Name a topic and get a report on what people say about it.</p>

      {error && <Notice tone="error" className="mt-6">{error}</Notice>}

      <div className="mt-6">
        <ResearchForm meta={meta} busy={busy} onStarted={(id) => navigate(`/research/${id}`)} />
      </div>

      <h2 className="mb-4 mt-10 text-xl font-semibold">Your research</h2>
      {researches === null && !error && <Spinner />}
      {/* the demo account's reports are shared by every visitor, so they stay */}
      {researches !== null && <HistoryList researches={researches} onDelete={user.isDemo ? undefined : handleDelete} />}
    </div>
  );
};

export default Dashboard;
