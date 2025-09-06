let cardNumber = 100;
let deck = document.getElementById("cards-deck");
const spreadIds = ["past", "present", "future"];
const suits = ["maj", "cups", "pents", "swords", "wands"];
const position = ["positive", "negative"];
const details = createCardDetails();

// === New interaction state (click-to-place + drag-drop) ===
let selectedSlotId = null;
let draggingCard = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragStartClientX = 0;
let dragStartClientY = 0;

// Undo/Reset history
const historyStack = [];

// Place a card into a specific slot id ("past" | "present" | "future")
function placeCard(card, slotId, pushHistory = true) {
  if (!card || !slotId) return;

  let fromId = null;
  if (card.classList.contains("on-spread")) {
    for (const sid of spreadIds) if (card.classList.contains(sid)) { fromId = sid; break; }
  }

  card.classList.remove("chosen","past","present","future");
  card.classList.add("on-spread", slotId);

  if (pushHistory) historyStack.push({ card, fromId, toId: slotId });

  if (selectedSlotId) {
    selectedSlotId = null;
    const spreads = document.getElementsByClassName("spread");
    for (const s of spreads) s.classList.remove("selected");
  }
  refreshUIHints();
}

function undo() {
  const last = historyStack.pop();
  if (!last) return;
  const { card, fromId } = last;
  card.classList.remove("on-spread","past","present","future");
  if (fromId) card.classList.add("on-spread", fromId);
  refreshUIHints();
}

function resetAll() {
  historyStack.length = 0;
  const cards = document.getElementsByClassName("card");
  for (const c of cards) {
    c.classList.remove("on-spread","past","present","future","reversed","chosen");
    c.style.transform = "";
    c.classList.remove("dragging");
  }
  selectedSlotId = null;
  const spreads = document.getElementsByClassName("spread");
  for (const s of spreads) s.classList.remove("selected","breathe","have-card");
  refreshUIHints();
}

// Deck click: single-tap bottom card => auto place to next empty (or preselected) slot
function onDeckClick(e) {
  const card = e.target.closest(".card");
  if (!card) return;
  if (card.classList.contains("on-spread")) return; // 已放上的忽略
  const targetSlot = selectedSlotId || getFirstEmptySpreadId();
  if (!targetSlot) { blink(); return; }
  placeCard(card, targetSlot);
}

// Clicking a placed card toggles upright/reversed
function onPlacedCardClick(e) {
  const card = e.target.closest(".card.on-spread");
  if (!card) return;
  card.classList.toggle("reversed");
}

// Pointer Events drag-drop
function onPointerDown(e) {
  const card = e.target.closest(".card");
  if (!card) return;
  draggingCard = card;
  card.setPointerCapture?.(e.pointerId);
  card.classList.add("dragging");

  // 用指標起點，之後用 Δx/Δy 做位移；避免一按就跳
  dragStartClientX = e.clientX;
  dragStartClientY = e.clientY;
}
function onPointerMove(e) {
  if (!draggingCard) return;
  const dx = e.clientX - dragStartClientX;
  const dy = e.clientY - dragStartClientY;

  // 保留 translateX(-50%) 基準，再加拖曳位移與微放大
  draggingCard.style.transform = `translateX(-50%) translate(${dx}px, ${dy}px) scale(1.04)`;
}
function onPointerUp(e) {
  if (!draggingCard) return;
  const x = e.clientX, y = e.clientY;
  const slot = hitSlot(x, y);
  draggingCard.style.transform = "";
  draggingCard.classList.remove("dragging");
  if (slot) placeCard(draggingCard, slot.id);
  draggingCard = null;
}

// 命中測試：是否放在某個槽位上
function hitSlot(x, y) {
  for (const id of ["past","present","future"]) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return el;
  }
  return null;
}

// 更新 UI 提示、控制送出按鈕狀態
function refreshUIHints() {
  const nextId = getFirstEmptySpreadId();
  const spreads = document.getElementsByClassName("spread");
  let filledAll = true;

  for (const s of spreads) {
    const hasCard = !!document.querySelector(`.card.on-spread.${s.id}`);
    s.classList.toggle("have-card", hasCard);
    s.classList.toggle("selected", selectedSlotId === s.id);
    const shouldBreathe = !selectedSlotId && nextId === s.id && !hasCard;
    s.classList.toggle("breathe", shouldBreathe);
    if (!hasCard) filledAll = false;
  }

  const submit = document.getElementById("id_submit");
  if (submit) {
    submit.disabled = !filledAll;          // 一直顯示，滿三張才啟用
    submit.classList.remove("hidden","ready");
  }
}

main();

function main() {
  document.getElementById("id_submit").addEventListener("click", clickButton, { once: true });
  handleResize();
  window.addEventListener("resize", handleResize);

  // 基本互動
  document.getElementById("cards-deck").addEventListener("click", onDeckClick);
  document.addEventListener("click", onPlacedCardClick);

  // 拖曳
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerUp);

  // 控制按鈕
  document.getElementById("btnUndo")?.addEventListener("click", undo);
  document.getElementById("btnReset")?.addEventListener("click", resetAll);

  // 快捷鍵：Z 撤銷、Cmd/Ctrl+Backspace 重來（輸入框不觸發）
  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea") return;
    if ((e.key === "z" || e.key === "Z") && !e.ctrlKey && !e.metaKey && !e.altKey) undo();
    if ((e.key === "Backspace") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); resetAll(); }
  });

  // 禁用 <img> 原生拖曳幽靈
  document.querySelectorAll('.front').forEach(img => img.draggable = false);

  refreshUIHints();
}

/* ===== utilities / legacy touch helpers ===== */
function createCards() { /* 若用不到可忽略 */ }
function createPosition(card, i) { /* 若用不到可忽略 */ }
function createBack(card) {
  let back = document.createElement("div");
  back.classList.add("back");
  card.appendChild(back);
}
function createFront(card, i) {
  let front = document.createElement("img");
  const detail = details[i];
  front.src = detail.src;
  front.classList.add("front");
  front.classList.add(detail.position);
  card.appendChild(front);
}
function handleResize() {
  let [y, rad, r] = getYRad();
  rad = rad * 0.9;
  const cards = document.getElementsByClassName("card");
  const n = cards.length;
  const shiftRad = rad / (n + 1);
  for (let i = 0; i < n; i++) {
    const thisRad = shiftRad * (i + 1) - rad / 2;
    const shiftX = r * Math.sin(thisRad);
    const shiftY = r * Math.cos(thisRad);
    const realY = r - shiftY;
    const realX = Math.round(deck.offsetWidth / 2 + shiftX);
    cards[i].style.left = `${Math.round(realX)}px`;
    cards[i].style.top  = `${Math.round(realY)}px`;
  }
}
function getYRad() {
  const w = deck.offsetWidth, h = deck.offsetHeight;
  let r = (h / 2) + (w ** 2 / 8 / h);
  let y = Math.round(r * 0.9);
  let rad = Math.asin(w / 2 / r) * 2;
  return [y, rad, r];
}
function clickCard(e) { /* 舊流程保留相容 */ }
function handleTouchMove(e) { /* 舊流程保留相容 */ }
function isTouchOnCard(rect, e) { /* 舊流程保留相容 */ }
function handleTouchEnd(e) { /* 舊流程保留相容 */ }

// script.js
function clickButton(event) {
  // 防連點：已經在 loading 就不再啟動
  if (window.__loadingActive) return;
  window.__loadingActive = true;

  const overlay = document.getElementById("loadingOverlay");
  overlay.style.display = "flex";
  event.preventDefault();

  const el = document.getElementById("loadingText");
  const msgs = [
    "集中你的念頭…",
    "與牌面對齊能量…",
    "解讀過去的線索…",
    "解析當下的脈絡…",
    "推演未來的走向…"
  ];

  // —— 精準 1 秒輪播（用 setTimeout 校正誤差）——
  const period = 2000;
  let i = 0;
  el.textContent = msgs[i];

  if (window.loadingMsgTimer) clearTimeout(window.loadingMsgTimer);
  let t0 = performance.now();
  let k = 1;

  function tick() {
    i = (i + 1) % msgs.length;
    el.textContent = msgs[i];

    const target = t0 + k * period;
    k += 1;
    const delay = Math.max(0, target - performance.now());
    window.loadingMsgTimer = setTimeout(tick, delay);
  }
  window.loadingMsgTimer = setTimeout(tick, period);

  // —— 原本組問題並送出表單 ——
  let questionPrefix = "我抽到";
  let past = document.querySelector(".past > img");
  questionPrefix += `過去${past.alt}`;
  let present = document.querySelector(".present > img");
  questionPrefix += `現在${present.alt}`;
  let future = document.querySelector(".future > img");
  questionPrefix += `未來${future.alt}。我想問`;
  let question = document.getElementById("id_question");
  question.value = `${questionPrefix}${question.value}`;
  document.getElementById("id_form").submit();
}

function isTouchOnSpread(event) {
  let touchY = event.changedTouches[0].clientY;
  let spreadDeck = document.getElementById("spread-deck");
  return touchY < spreadDeck.offsetHeight;
}
function getFirstEmptySpreadId() {
  for (let id of spreadIds) { if (!getFirstElementByClass(id)) return id; }
}
function getFirstElementByClass(name) { return document.querySelector(`.${name}`); }
function clickSpread(spread) {
  const chosen = document.querySelector(".card.chosen:not(.on-spread)");
  if (chosen) { chosen.classList.remove("chosen"); placeCard(chosen, spread.id); return; }
  selectedSlotId = spread.id;
  const spreads = document.getElementsByClassName("spread");
  for (const s of spreads) s.classList.toggle("selected", s.id === selectedSlotId);
  refreshUIHints();
}
function cleanClass(elements, name) { for (let e of elements) e.classList.remove(name); }
function blink() {
  let spreads = document.getElementsByClassName("spread");
  for (let s of spreads) {
    if (s.classList.contains("have-card")) continue;
    s.classList.add("blink");
    setTimeout(() => s.classList.remove("blink"), 1000);
  }
}

class Detail { src; position; }
function createCardDetails() {
  let srcs = [], results = [];
  for (let suit of suits) {
    let start = 0, end = 22;
    if (suit !== "maj") { start = 1; end = 14; }
    srcs = srcs.concat(getASuitSrcs(suit, start, end));
  }
  for (let src of srcs) results.push({ src, position: getRandomElement(position) });
  return results;
}
function getASuitSrcs(suit, start, end) {
  let results = [], srcPrefix = "/static/tarot/cards/";
  for (let i = start; i <= end; i++) {
    let number = i.toString().padStart(2, '0');
    results.push(`${srcPrefix}${suit}${number}.jpg`);
  }
  return results;
}
function getRandomElement(array) { return array[Math.floor(Math.random() * array.length)]; }