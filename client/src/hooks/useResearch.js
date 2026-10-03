import { useEffect, useState } from 'react';
import { getResearch } from '../api/research';
import { errorMessage } from '../api/client';

const POLL_MS = 2000;
// a request can fail while the research is still running fine; only a run of failures ends the wait
const MAX_FAILURES_IN_A_ROW = 5;

export const isActive = (research) => research?.status === 'queued' || research?.status === 'running';

// "not found" and "not logged in" will not change by asking again
const isFinalAnswer = (error) => error.response?.status >= 400 && error.response?.status < 500;

// Loads one research and keeps asking for it while it is still running.
// Asking stops when it finishes, when requests keep failing, and when the page is left.
const useResearch = (id) => {
  const [research, setResearch] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let timer;
    let failures = 0;

    setResearch(null);
    setError('');

    const load = async () => {
      try {
        const latest = await getResearch(id);
        if (cancelled) return;

        failures = 0;
        setResearch(latest);
        if (isActive(latest)) {
          timer = setTimeout(load, POLL_MS);
        }
      } catch (err) {
        if (cancelled) return;

        failures += 1;
        if (isFinalAnswer(err) || failures >= MAX_FAILURES_IN_A_ROW) {
          setError(errorMessage(err));
        } else {
          timer = setTimeout(load, POLL_MS);
        }
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
