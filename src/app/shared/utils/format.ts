const NUM_FMT = new Intl.NumberFormat('en-US');

export function fmtNum(n: number | null | undefined): string {
  if (n == null) return '—';
  return NUM_FMT.format(n);
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  return d.toUTCString().replace('GMT', 'UTC');
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
