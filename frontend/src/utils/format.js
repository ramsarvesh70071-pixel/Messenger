export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDayLabel(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatLastSeen(date, isOnline) {
  if (isOnline) return 'Online';
  if (!date) return 'Offline';
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString([], { day: '2-digit', month: 'short' });
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

const PALETTE = ['#7c5cff', '#ff5cae', '#21e6c1', '#ffb020', '#5c8dff', '#ff7a5c', '#c15cff', '#5cffb0'];
export function colorFor(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function groupMessagesByDay(messages) {
  const rows = [];
  let lastDay = null;
  for (const msg of messages) {
    const day = formatDayLabel(msg.createdAt || msg.timestamp);
    if (day !== lastDay) {
      rows.push({ type: 'day', day, key: `day-${day}-${msg._id}` });
      lastDay = day;
    }
    rows.push({ type: 'message', message: msg, key: msg._id });
  }
  return rows;
}
