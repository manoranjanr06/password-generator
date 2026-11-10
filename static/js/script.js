"use strict";
const $ = (id) => document.getElementById(id);
const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  nums: "0123456789",
  sym: "!@#$%^&*()-_=+[]{};:,.<>?/~",
};
const AMBIGUOUS = /[O0oIl1|]/g;

// Unbiased secure random integer in [0, max)
function randInt(max) {
  const limit = Math.floor(2 ** 32 / max) * max;
  const buf = new Uint32Array(1);
  do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
  return buf[0] % max;
}

function activeSets() {
  const sets = Object.keys(SETS).filter((k) => $(k).checked).map((k) => SETS[k]);
  return $("amb").checked ? sets.map((s) => s.replace(AMBIGUOUS, "")) : sets;
}

function generate(length, sets) {
  const pool = sets.join("");
  const chars = sets.map((s) => s[randInt(s.length)]); // one from each chosen type
  while (chars.length < length) chars.push(pool[randInt(pool.length)]);
  for (let i = chars.length - 1; i > 0; i--) { // Fisher–Yates shuffle
    const j = randInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function rate(length, poolSize) {
  const bits = length * Math.log2(poolSize);
  if (bits < 45) return { label: "Weak", pct: 33, color: "var(--bad)", bits };
  if (bits < 75) return { label: "Medium", pct: 66, color: "var(--mid)", bits };
  return { label: "Strong", pct: 100, color: "var(--good)", bits };
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.id);
  toast.id = setTimeout(() => t.classList.remove("show"), 1600);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  toast("Copied");
}

function validate() {
  const sets = activeSets();
  const err = $("error");
  err.hidden = sets.length > 0;
  err.textContent = sets.length ? "" : "Choose at least one character type.";
  return sets.length ? sets : null;
}

function render() {
  const length = +$("length").value;
  $("lenVal").textContent = length;
  const sets = validate();
  if (!sets) { $("password").textContent = ""; $("strength").textContent = ""; $("bar").style.width = "0"; return; }
  $("password").textContent = generate(length, sets);
  const r = rate(length, sets.join("").length);
  $("bar").style.width = r.pct + "%";
  $("bar").style.background = r.color;
  $("strength").textContent = `${r.label} · about ${Math.round(r.bits)} bits of entropy`;
}

function bulk() {
  const sets = validate();
  if (!sets) return;
  const n = Math.min(50, Math.max(2, +$("count").value || 5));
  const length = +$("length").value;
  const list = $("list");
  list.replaceChildren();
  const all = [];
  for (let i = 0; i < n; i++) {
    const pw = generate(length, sets);
    all.push(pw);
    const li = document.createElement("li");
    const code = document.createElement("code");
    code.textContent = pw;
    const btn = document.createElement("button");
    btn.textContent = "Copy";
    btn.addEventListener("click", () => copy(pw));
    li.append(code, btn);
    list.appendChild(li);
  }
  $("copyAll").hidden = false;
  $("copyAll").onclick = () => copy(all.join("\n"));
}

["length", "upper", "lower", "nums", "sym", "amb"].forEach((id) => $(id).addEventListener("input", render));
$("regen").addEventListener("click", render);
$("copy").addEventListener("click", () => $("password").textContent && copy($("password").textContent));
$("bulk").addEventListener("click", bulk);
render();

// PWA: service worker + install button
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js").catch(() => {});
}
let deferred;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferred = e;
  $("install").hidden = false;
});
$("install").addEventListener("click", async () => {
  if (!deferred) return;
  deferred.prompt();
  await deferred.userChoice;
  deferred = null;
  $("install").hidden = true;
});
