export function formatArticleDisplayDate(dateStr?: string, timeStr?: string, tzStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    dateStr = `${YYYY}-${MM}-${DD}`;
  }

  let formattedDate = '';
  // Extract date part if dateStr is ISO formatted like "2026-07-31T10:30:00Z"
  const cleanDateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanDateOnly.split('-');

  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const d = new Date(year, month, day);
      formattedDate = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  if (!formattedDate) {
    formattedDate = cleanDateOnly;
  }

  let formattedTime = '';
  if (timeStr && timeStr.trim()) {
    const timeParts = timeStr.trim().split(':');
    if (timeParts.length >= 2) {
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minsStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
        formattedTime = `${hours}:${minsStr} ${ampm}`;
      } else {
        formattedTime = timeStr.trim();
      }
    } else {
      formattedTime = timeStr.trim();
    }
  }

  const tz = tzStr ? tzStr.trim() : 'EST';

  if (formattedTime) {
    return `${formattedDate} — ${formattedTime} ${tz}`;
  }
  return `${formattedDate} ${tz}`.trim();
}

export function normalizeArticleDates<T extends { 
  publishedAtDate?: string; 
  publishedAtTime?: string; 
  timezone?: string; 
  displayDateTime?: string 
}>(article: T): T {
  const publishedAtDate = article.publishedAtDate || new Date().toISOString().split('T')[0];
  const publishedAtTime = article.publishedAtTime || '10:00';
  const timezone = article.timezone || 'EST';
  const displayDateTime = formatArticleDisplayDate(publishedAtDate, publishedAtTime, timezone);

  return {
    ...article,
    publishedAtDate,
    publishedAtTime,
    timezone,
    displayDateTime
  };
}
