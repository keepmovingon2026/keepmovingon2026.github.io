/* Keep Moving On — ဆက်လျှောက် · interactions */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── loader ─────────────────────────────────────── */
  const loader = document.getElementById("loader");
  const hideLoader = () => loader.classList.add("done");
  window.addEventListener("load", () => setTimeout(hideLoader, 350));
  setTimeout(hideLoader, 2200); // safety net

  /* ── nav · progress · parallax · back-to-top ────── */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  const toTop = document.getElementById("toTop");
  const heroLogo = document.querySelector(".hero-logo");
  const blobs = document.querySelectorAll(".blob");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 24);
    toTop.classList.toggle("show", y > 700);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    if (!reduceMotion && y < window.innerHeight * 1.2) {
      if (heroLogo) heroLogo.style.translate = "0 " + y * 0.16 + "px";
      blobs.forEach((b, i) => { b.style.translate = "0 " + y * (0.06 + i * 0.04) + "px"; });
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ── mobile menu ────────────────────────────────── */
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobileMenu");
  const setMenu = (open) => {
    burger.classList.toggle("open", open);
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ── count-up stats ─────────────────────────────── */
  function countUp(el) {
    const target = parseInt(el.dataset.n, 10);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const t0 = performance.now();
    const dur = 1100;
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ── reveal on scroll (staggered) ───────────────── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = reduceMotion ? "0ms" : (siblings % 4) * 70 + "ms";
      el.classList.add("in");
      el.addEventListener("transitionend", () => { el.style.transitionDelay = ""; }, { once: true });
      el.querySelectorAll(".count").forEach(countUp);
      io.unobserve(el);
    }),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ── product card tap-to-swap (touch) ───────────── */
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      if (window.matchMedia("(hover: none)").matches) card.classList.toggle("swap");
    });
  });

  /* ── gallery captions + filters with counts ─────── */
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((t) => {
    if (t.dataset.cap && !t.querySelector("figcaption")) {
      const fc = document.createElement("figcaption");
      fc.textContent = t.dataset.cap;
      t.appendChild(fc);
    }
  });

  const filters = document.querySelectorAll(".filter");
  filters.forEach((btn) => {
    const f = btn.dataset.f;
    const n = f === "all" ? tiles.length :
      Array.from(tiles).filter((t) => t.dataset.cat === f).length;
    btn.textContent = btn.textContent + " · " + n;
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      tiles.forEach((t) => {
        t.classList.toggle("hide", f !== "all" && t.dataset.cat !== f);
      });
    });
  });

  /* ── lightbox ───────────────────────────────────── */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");
  const lbCount = document.getElementById("lbCount");
  const items = Array.from(document.querySelectorAll("[data-lb]"));
  let idx = 0;

  const visibleItems = () => items.filter((el) => el.offsetParent !== null);

  function openAt(el) {
    const vis = visibleItems();
    idx = Math.max(0, vis.indexOf(el));
    render(vis);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function render(vis) {
    const el = vis[idx];
    if (!el) return;
    const img = el.querySelector("img");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || "";
    lbCap.textContent = el.dataset.cap || img.alt || "";
    lbCount.textContent = (idx + 1) + " / " + vis.length;
    // preload neighbours for instant stepping
    [idx + 1, idx - 1].forEach((i) => {
      const n = vis[(i + vis.length) % vis.length];
      if (n) { const pre = new Image(); pre.src = n.querySelector("img").src; }
    });
  }
  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function step(dir) {
    const vis = visibleItems();
    idx = (idx + dir + vis.length) % vis.length;
    render(vis);
  }

  items.forEach((el) => el.addEventListener("click", () => openAt(el)));
  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", () => step(-1));
  document.getElementById("lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  /* swipe */
  let x0 = null;
  lb.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
  lb.addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 48) step(dx > 0 ? -1 : 1);
    x0 = null;
  });

  /* ── footer year ────────────────────────────────── */
  document.getElementById("year").textContent = new Date().getFullYear();
})();