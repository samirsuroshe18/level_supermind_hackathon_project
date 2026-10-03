import { useEffect, useState } from 'react';
import { getResearch } from '../api/research';
import { errorMessage } from '../api/client';

const POLL_MS = 2000;

export const isActive = (research) => research?.status === 'queued' || research?.status === 'running';

// Loads one research and keeps asking for it while it is still running.
// Asking stops when it finishes, when a request fails, and when the page is left.
const useResearch = (id) => {
  const [research, setResearch] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let timer;

    setResearch(null);
    setError('');

    const load = async () => {
      try {
        const latest = await getResearch(id);
        if (cancelled) return;

        setResearch(latest);
        if (isActive(latest)) {
          timer = setTimeout(load, POLL_MS);
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      }
    };

    load();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  return { research, error };
};

export default useResearch;
