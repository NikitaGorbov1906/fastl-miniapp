import { RATING_LABEL, clearRatings, decodePack, hashParam, mergePack, nextCard, ratingsPayload, readRatings, saveRating } from './logic.js';

const tg = window.Telegram?.WebApp;
const $ = (id) => document.getElementById(id);
const st = { pack: null, ratings: {}, revealed: false };

function render() {
  const total = st.pack?.cards.length ?? 0; const done = Object.keys(st.ratings).filter((id) => st.pack?.cards.some((c) => c.id === id)).length;
  $('meta').textContent = total ? `${Math.min(done + 1, total)} / ${total}` : '';
  const card = nextCard(st.pack, st.ratings);
  if (!st.pack || total === 0) { $('front').textContent = 'Пачки нет — в боте напиши /app, откроется кнопка с карточками.'; $('back').hidden = true; $('reveal').hidden = true; $('rate').hidden = true; $('send').hidden = Object.keys(st.ratings).length === 0; return; }
  if (!card) { $('front').textContent = `Готово: оценено ${done} из ${total}.`; $('back').hidden = true; $('reveal').hidden = true; $('rate').hidden = true; $('send').hidden = false; return; }
  $('front').textContent = card.f; $('back').textContent = card.b; $('back').hidden = !st.revealed;
  $('reveal').hidden = st.revealed; $('rate').hidden = !st.revealed; $('send').hidden = done === 0;
}
function rate(r) { const card = nextCard(st.pack, st.ratings); if (!card) return; st.ratings = saveRating(localStorage, card.id, r); st.revealed = false; tg?.HapticFeedback?.impactOccurred?.('light'); render(); }
function send() {
  const payload = ratingsPayload(st.ratings);
  if (tg && typeof tg.sendData === 'function') { tg.sendData(payload); clearRatings(localStorage); st.ratings = {}; }
  else { $('front').textContent = 'Открой страницу из кнопки бота — тогда оценки уйдут в Fast-L.'; }
}
async function main() {
  tg?.ready?.(); tg?.expand?.();
  const enc = hashParam(location.hash);
  const incoming = enc ? await decodePack(enc) : null;
  st.pack = mergePack(localStorage, incoming);
  st.ratings = readRatings(localStorage);
  if (incoming) history.replaceState(null, '', location.pathname); // не держать пачку в адресе
  $('reveal').onclick = () => { st.revealed = true; render(); };
  for (const b of document.querySelectorAll('[data-r]')) { b.textContent = RATING_LABEL[b.dataset.r]; b.onclick = () => rate(Number(b.dataset.r)); }
  $('send').onclick = send;
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
}
main();
