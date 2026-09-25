// Fast-L Mini App — чистая логика без DOM (тестируется vitest'ом из app/tests/unit/miniapp-logic.test.ts).
// Пачка приходит в URL-фрагменте (#p=<deflate-raw + base64url JSON>), хранится в localStorage, оценки
// копятся там же и уходят боту через Telegram.WebApp.sendData одним JSON.
export const STORE_KEY = 'fastl-pack';
export const RATINGS_KEY = 'fastl-ratings';

export function hashParam(hash, key = 'p') {
  const h = (hash || '').replace(/^#/, '');
  for (const part of h.split('&')) { const [k, v] = part.split('='); if (k === key && v) return v; }
  return null;
}
export function fromB64url(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
export async function decodePack(encoded) {
  try {
    const bytes = fromB64url(encoded);
    const ds = new DecompressionStream('deflate-raw');
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    const text = await new Response(stream).text();
    const p = JSON.parse(text);
    if (!p || p.v !== 1 || !Array.isArray(p.cards)) return null;
    return { v: 1, t: Number(p.t) || 0, cards: p.cards.filter((c) => c && typeof c.id === 'string' && typeof c.f === 'string' && typeof c.b === 'string') };
  } catch { return null; }
}
/** Новая пачка заменяет старую; оценки старой пачки, ещё не отправленные, сохраняются (их отправит следующая сессия). */
export function mergePack(storage, incoming) {
  if (!incoming) return readPack(storage);
  try { storage.setItem(STORE_KEY, JSON.stringify(incoming)); } catch { /* приватный режим */ }
  return incoming;
}
export function readPack(storage) { try { const raw = storage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
export function readRatings(storage) { try { const raw = storage.getItem(RATINGS_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; } }
export function saveRating(storage, id, r) {
  const all = readRatings(storage); all[id] = r;
  try { storage.setItem(RATINGS_KEY, JSON.stringify(all)); } catch { /* */ }
  return all;
}
export function clearRatings(storage) { try { storage.removeItem(RATINGS_KEY); } catch { /* */ } }
/** Первая карточка пачки без оценки; null — всё оценено. */
export function nextCard(pack, ratings) { return (pack?.cards ?? []).find((c) => !(c.id in ratings)) ?? null; }
export function ratingsPayload(ratings) { return JSON.stringify({ v: 1, r: Object.entries(ratings).map(([id, r]) => ({ id, r })) }); }
export const RATING_LABEL = { 1: 'Снова', 2: 'Трудно', 3: 'Хорошо', 4: 'Легко' };
