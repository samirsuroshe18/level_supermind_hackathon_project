import { useEffect, useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

const CONFIRM_MS = 1800;

// Copies a line of text and says so for a moment
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;

    const timer = setTimeout(() => setCopied(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // the clipboard can be unavailable (permissions, insecure page); the text stays selectable
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : `Copy: ${text}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-soft hover:text-ink"
    >
      {copied ? <FiCheck className="text-positive" aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

export default CopyButton;
