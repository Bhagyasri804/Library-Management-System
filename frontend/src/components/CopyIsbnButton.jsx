import React, { useEffect, useRef, useState } from 'react';
import { Copy } from 'lucide-react';

export default function CopyIsbnButton({ isbn }) {
  const [status, setStatus] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable');
      }

      await navigator.clipboard.writeText(isbn);
      setStatus('success');
    } catch {
      setStatus('error');
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus(''), 2500);
  };

  return (
    <span className="isbn-copy-control">
      <button
        type="button"
        className="isbn-copy-button"
        aria-label="Copy ISBN"
        title="Copy ISBN"
        onClickCapture={handleCopy}
      >
        <Copy size={14} aria-hidden="true" />
      </button>
      {status && (
        <span
          className={`isbn-copy-toast ${status === 'error' ? 'error' : ''}`}
          role={status === 'error' ? 'alert' : 'status'}
          aria-live={status === 'error' ? 'assertive' : 'polite'}
        >
          {status === 'success' ? 'ISBN copied successfully' : 'Unable to copy ISBN. Please try again.'}
        </span>
      )}
    </span>
  );
}
