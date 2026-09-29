export function normalizeEgyptianPhone(value) {
  let digits = String(value || '').trim().replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('20')) digits = digits.slice(2);
  else if (digits.startsWith('2') && digits.length >= 11) digits = digits.slice(1);
  digits = digits.replace(/^0+/, '');
  return digits ? `+20 ${digits}` : '';
}

export function egyptianWhatsappUrl(value) {
  const normalized = normalizeEgyptianPhone(value);
  const digits = normalized.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}
