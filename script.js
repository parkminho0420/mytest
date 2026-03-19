const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setTheme(nextTheme) {
  if (nextTheme === "light") document.documentElement.dataset.theme = "light";
  else delete document.documentElement.dataset.theme;
  localStorage.setItem("theme", nextTheme);

  const btn = $("#themeBtn");
  if (btn) {
    const isLight = nextTheme === "light";
    btn.setAttribute("aria-pressed", String(!isLight));
    btn.textContent = isLight ? "다크 모드" : "라이트 모드";
  }
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
    return;
  }
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  setTheme(prefersLight ? "light" : "dark");
}

function initNav() {
  const toggle = $(".nav__toggle");
  const list = $("#navList");
  if (!toggle || !list) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    list.dataset.open = String(open);
  };

  setOpen(false);

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    setOpen(open);
  });

  $$(".nav__link", list).forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (e) => {
    if (e.target instanceof Node && !list.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

function initAccordion() {
  $$(".accordion__item").forEach((item) => {
    const btn = $(".accordion__btn", item);
    const panel = $(".accordion__panel", item);
    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      if (expanded) panel.setAttribute("hidden", "");
      else panel.removeAttribute("hidden");
    });
  });
}

function initScrollSpy() {
  const links = $$(".nav__link");
  const sections = $$("[data-section]");
  if (!links.length || !sections.length) return;

  const byId = new Map(links.map((a) => [a.getAttribute("href")?.slice(1), a]));

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
      if (!visible?.target?.id) return;

      links.forEach((a) => a.setAttribute("aria-current", "false"));
      const active = byId.get(visible.target.id);
      if (active) active.setAttribute("aria-current", "true");
    },
    { root: null, threshold: [0.2, 0.35, 0.5] }
  );

  sections.forEach((s) => observer.observe(s));
}

function initProgressBar() {
  const bar = $("#progressBar");
  if (!bar) return;

  const onScroll = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const p = height > 0 ? (scrollTop / height) * 100 : 0;
    bar.style.width = `${Math.max(0, Math.min(100, p)).toFixed(2)}%`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

function initCopy() {
  const btn = $("#copyBtn");
  const hint = $("#copyHint");
  if (!btn || !hint) return;

  btn.addEventListener("click", async () => {
    const value = btn.dataset.copy || "";
    if (!value) return;
    const ok = await copyText(value);
    hint.textContent = ok ? "복사되었습니다." : "복사에 실패했습니다.";
    window.setTimeout(() => (hint.textContent = ""), 1500);
  });
}

function initYear() {
  const el = $("#year");
  if (el) el.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initAccordion();
  initScrollSpy();
  initProgressBar();
  initCopy();
  initYear();

  $("#themeBtn")?.addEventListener("click", () => {
    const isLight = document.documentElement.dataset.theme === "light";
    setTheme(isLight ? "dark" : "light");
  });
});

