import React, { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';

const formatDate = (date) => new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(date);

export default function CurrentDate({ className = '' }) {
  const [date, setDate] = useState(() => new Date());

  useEffect(() => {
    let timeoutId;

    const updateDate = () => {
      const now = new Date();
      setDate(now);
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timeoutId = setTimeout(updateDate, nextDay.getTime() - now.getTime());
    };

    updateDate();
    return () => clearTimeout(timeoutId);
  }, []);

  const dateTime = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  return (
    <div className={`current-date ${className}`.trim()}>
      <CalendarDays size={16} aria-hidden="true" />
      <time dateTime={dateTime}>{formatDate(date)}</time>
    </div>
  );
}
