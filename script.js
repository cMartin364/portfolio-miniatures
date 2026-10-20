/* ==========================================================
   CONFIGURATION : modifie uniquement cette partie
   ========================================================== */
const CONFIG = {
  pseudo: "TonPseudo"   // ton pseudo / nom de marque
};

/*
  AJOUTER TES MINIATURES (automatique)
  1. Mets tes images dans un dossier "images" à côté de index.html.
  2. Nomme-les : miniature-1.jpg, miniature-2.jpg, miniature-3.png ...
     - numéros qui se suivent sans trou (1, 2, 3...)
     - tout en minuscules, sans espace ni accent
     - formats acceptés : jpg, jpeg, png, webp
  Le site les affiche tout seul et retire les exemples temporaires.
  (Les anciens noms minecraft-1, roblox-1, horreur-1, autres-1 fonctionnent aussi.)
*/
const AUTO = {
  folder: "images/",
  prefixes: ["miniature", "minecraft", "roblox", "horreur", "autres"],
  maxPerPrefix: 60,
  extensions: ["webp", "jpg", "jpeg", "png"]
};

/* Exemples temporaires affichés tant qu'aucune de tes images n'est trouvée */
const PROJECTS = [
  { title: "Exemple 1", image: "", hue: 140 },
  { title: "Exemple 2", image: "", hue: 200 },
  { title: "Exemple 3", image: "", hue: 20  },
  { title: "Exemple 4", image: "", hue: 340 },
  { title: "Exemple 5", image: "", hue: 280 },
  { title: "Exemple 6", image: "", hue: 50  }
];

/* ==========================================================
   CODE DU SITE
   ========================================================== */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Pseudo, année ---------- */
  $$("[data-pseudo]").forEach(el => { el.textContent = CONFIG.pseudo; });
  document.title = CONFIG.pseudo + " — Miniatures YouTube";
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Exemples temporaires (SVG généré, sans fichier externe) ---------- */
  function placeholderSVG(item) {
    const h = item.hue || 260;
    const h2 = (h + 50) % 360;
    const title = String(item.title).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">' +
        '<defs>' +
          '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="hsl(' + h + ',70%,22%)"/>' +
            '<stop offset="1" stop-color="hsl(' + h2 + ',75%,12%)"/>' +
          '</linearGradient>' +
          '<radialGradient id="r" cx="0.75" cy="0.3" r="0.6">' +
            '<stop offset="0" stop-color="hsl(' + h + ',90%,60%)" stop-opacity="0.55"/>' +
            '<stop offset="1" stop-color="hsl(' + h + ',90%,60%)" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<rect width="1280" height="720" fill="url(#g)"/>' +
        '<rect width="1280" height="720" fill="url(#r)"/>' +
        '<g opacity="0.12" fill="#fff"><circle cx="1050" cy="190" r="240"/><circle cx="170" cy="640" r="190"/></g>' +
        '<g transform="translate(640 330)"><circle r="78" fill="rgba(255,255,255,0.16)"/>' +
          '<path d="M-24 -42 L46 0 L-24 42 Z" fill="#fff"/></g>' +
        '<text x="640" y="520" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="62" fill="#fff">' + title + '</text>' +
        '<text x="640" y="585" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="30" letter-spacing="8" fill="rgba(255,255,255,0.7)">EXEMPLE TEMPORAIRE</text>' +
      '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function getSrc(item) {
    return item.image && item.image.trim() ? item.image : placeholderSVG(item);
  }
  const isPlaceholder = item => !(item.image && item.image.trim());

  /* ---------- Galerie ---------- */
  const gallery = $("#gallery");
  const emptyMsg = $("#emptyMsg");
  const notice = $("#notice");

  function renderGallery() {
    gallery.innerHTML = "";

    PROJECTS.forEach((item, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.style.setProperty("--i", index);
      card.setAttribute("aria-label", "Agrandir la miniature " + (index + 1));

      const media = document.createElement("span");
      media.className = "card-media";

      const img = document.createElement("img");
      img.src = getSrc(item);
      img.alt = "Miniature YouTube " + (index + 1);
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 1280;
      img.height = 720;
      media.appendChild(img);

      if (isPlaceholder(item)) {
        const tag = document.createElement("span");
        tag.className = "card-tag";
        tag.textContent = "Exemple";
        media.appendChild(tag);
      }

      const zoom = document.createElement("span");
      zoom.className = "card-zoom";
      zoom.textContent = "Agrandir";
      media.appendChild(zoom);

      card.appendChild(media);
      card.addEventListener("click", () => openLightbox(index, card));
      gallery.appendChild(card);
    });

    emptyMsg.hidden = PROJECTS.length > 0;
    // Le message "exemples temporaires" disparaît dès que tes vraies images sont là
    notice.hidden = !PROJECTS.some(isPlaceholder);
  }

  /* ---------- Aperçu agrandi (lightbox) ---------- */
  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbClose = $("#lbClose");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");
  let lbIndex = 0;
  let lastFocused = null;

  function showLightboxItem(index) {
    const count = PROJECTS.length;
    lbIndex = (index + count) % count;
    const item = PROJECTS[lbIndex];
    lbImg.src = getSrc(item);
    lbImg.alt = "Miniature YouTube " + (lbIndex + 1) + (isPlaceholder(item) ? " (exemple temporaire)" : "");
    const single = count < 2;
    lbPrev.hidden = single;
    lbNext.hidden = single;
  }

  function openLightbox(index, trigger) {
    lastFocused = trigger || document.activeElement;
    showLightboxItem(index);
    lightbox.hidden = false;
    document.body.classList.add("no-scroll");
    lbClose.focus();
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("no-scroll");
    lbImg.src = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => {
    if (e.target.hasAttribute("data-close")) closeLightbox();
  });
  lbPrev.addEventListener("click", () => showLightboxItem(lbIndex - 1));
  lbNext.addEventListener("click", () => showLightboxItem(lbIndex + 1));

  // Balayage tactile gauche / droite
  let touchStartX = null;
  lightbox.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", e => {
    if (touchStartX === null || PROJECTS.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) showLightboxItem(lbIndex + (dx < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });

  document.addEventListener("keydown", e => {
    if (!lightbox.hidden) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft" && PROJECTS.length > 1) showLightboxItem(lbIndex - 1);
      else if (e.key === "ArrowRight" && PROJECTS.length > 1) showLightboxItem(lbIndex + 1);
      else if (e.key === "Tab") {
        // Garde le focus dans la fenêtre d'aperçu
        const focusables = [lbClose, lbPrev, lbNext].filter(b => !b.hidden);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    } else if (e.key === "Escape") {
      closeMenu();
    }
  });

  /* ---------- Menu mobile ---------- */
  const header = $("#header");
  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }
  function closeMenu() { setMenu(false); }

  menuToggle.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  $$("a", navLinks).forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("click", e => {
    if (!header.contains(e.target)) closeMenu();
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 760) closeMenu(); });

  /* ---------- Header au scroll ---------- */
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Lien actif dans la navigation ---------- */
  const navAnchors = $$(".nav-link");
  const portfolioSection = document.getElementById("portfolio");

  function updateActiveLink() {
    const y = window.scrollY + window.innerHeight * 0.35;
    const current = portfolioSection && portfolioSection.offsetTop <= y ? "portfolio" : "accueil";
    navAnchors.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  }
  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("resize", updateActiveLink);
  updateActiveLink();

  /* ---------- Apparition au scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i % 5, 4) * 60 + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add("visible"));
  }

  /* ---------- Détection automatique des images du dossier ---------- */
  function imageExists(src) {
    return new Promise(resolve => {
      const test = new Image();
      test.onload = () => resolve(true);
      test.onerror = () => resolve(false);
      test.src = src;
    });
  }

  async function findImage(baseName) {
    for (const ext of AUTO.extensions) {
      const src = AUTO.folder + baseName + "." + ext;
      if (await imageExists(src)) return src;
    }
    return null;
  }

  async function autoLoadImages() {
    const found = [];
    for (const prefix of AUTO.prefixes) {
      for (let n = 1; n <= AUTO.maxPerPrefix; n++) {
        const src = await findImage(prefix + "-" + n);
        if (!src) break;
        found.push({ title: "Miniature " + (found.length + 1), image: src });
      }
    }
    return found;
  }

  /* ---------- Démarrage ---------- */
  autoLoadImages()
    .then(found => {
      // Si tes vraies images existent, elles remplacent les exemples
      if (found.length > 0) {
        PROJECTS.length = 0;
        found.forEach(item => PROJECTS.push(item));
      }
    })
    .catch(() => { /* en cas de souci, on garde les exemples */ })
    .then(renderGallery);
})();