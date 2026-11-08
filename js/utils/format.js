const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat('en-PH', {
  maximumFractionDigits: 2,
});

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const formatCurrency = (value) => peso.format(Number(value) || 0);

export const formatNumber = (value) => decimal.format(Number(value) || 0);

export const formatHectares = (value) => `${formatNumber(value)} ha`;

export const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatShortDate = (isoDate) => {
  if (!isoDate) return '—';
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};

export const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);

export const todayISO = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};
