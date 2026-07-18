/* Keep Moving On — ဆက်လျှောက် · interactions */
(function () {
  "use strict";

  /* ── loader ─────────────────────────────────────── */
  const loader = document.getElementById("loader");
  const hideLoader = () => loader.classList.add("done");
  window.addEventListener("load", () => setTimeout(hideLoader, 350));
  setTimeout(hideLoader, 2200); // safety net

  /* ── nav ────────────────────────────────────────── */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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

  /* ── reveal on scroll ───────────────────────────── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
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

  /* ── gallery filters ────────────────────────────── */
  const filters = document.querySelectorAll(".filter");
  const tiles = document.querySelectorAll(".tile");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.f;
      tiles.forEach((t) => {
        t.classList.toggle("hide", f !== "all" && t.dataset.cat !== f);
      });
    });
  });

  /* ── lightbox ───────────────────────────────────── */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");
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