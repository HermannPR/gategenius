/**
 * Fechas de demo relativas a HOY.
 * Los CSV de ejemplo traen fechas fijas (2025). Para que el dashboard sea
 * coherente cualquier dia, se re-basan al cargar: la logica de la app no cambia.
 */
const pad = (n) => String(n).padStart(2, '0');

export const toLocalISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDays = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

/** Parsea YYYY-MM-DD como fecha LOCAL (new Date('YYYY-MM-DD') seria UTC y desfasa un dia). */
export const parseLocalDate = (s) => {
  const str = String(s || '');
  return new Date(str.includes('T') ? str : `${str}T00:00:00`);
};

/**
 * Offset determinista (en dias desde hoy) para el lote i:
 * ~5% vencen hoy, ~15% esta semana, ~80% en el futuro (8 a 120 dias).
 */
export const demoExpiryOffset = (i) => {
  const h = (i * 37 + 11) % 100;
  if (h < 5) return 0;
  if (h < 20) return 1 + ((i * 3) % 7);
  return 8 + ((i * 13) % 113);
};

export const rebaseExpiryRows = (rows) =>
  rows.map((r, i) => ({ ...r, Expiry_Date: toLocalISO(addDays(demoExpiryOffset(i))) }));

/** Mueve el rango de fechas del dataset para que la ultima fecha sea ayer. */
export const rebaseDateRows = (rows, field = 'Date') => {
  let max = 0;
  rows.forEach((r) => {
    const t = parseLocalDate(r[field]).getTime();
    if (Number.isFinite(t) && t > max) max = t;
  });
  if (!max) return rows;
  const shift = Math.round((addDays(-1).getTime() - max) / 86400000);
  return rows.map((r) => {
    const t = parseLocalDate(r[field]);
    if (!Number.isFinite(t.getTime())) return r;
    t.setDate(t.getDate() + shift);
    return { ...r, [field]: toLocalISO(t) };
  });
};
