// ============================================================
//  script.js — LENSfolio Image Gallery
// ============================================================

(function () {
  "use strict";

  // ── DOM references ──────────────────────────────────────────
  const grid        = document.getElementById("galleryGrid");
  const allItems    = Array.from(grid.querySelectorAll(".gallery-item"));
  const filterBtns  = document.querySelectorAll(".filter-btn");
  const noResults   = document.getElementById("noResults");

  const lightbox    = document.getElementById("lightbox");
  const backdrop    = document.getElementById("lightboxBackdrop");
  const lbImage     = document.getElementById("lbImage");
  const lbTitle     = document.getElementById("lbTitle");
  const lbCat       = document.getElementById("lbCat");
  const lbCounter   = document.getElementById("lbCounter");
  const lbClose     = document.getElementById("lbClose");
  const lbPrev      = document.getElementById("lbPrev");
  const lbNext      = document.getElementById("lbNext");

  // ── State ───────────────────────────────────────────────────
  let visibleItems  = [...allItems];   // items currently shown after filtering
  let currentIndex  = 0;               // index within visibleItems
  let isOpen        = false;

  // ── Helper: get image data from a gallery item ──────────────
  function getItemData(item) {
    const img   = item.querySelector("img");
    const title = item.querySelector("h3")  ? item.querySelector("h3").textContent  : "";
    const cat   = item.querySelector(".overlay-cat") ? item.querySelector(".overlay-cat").textContent : "";
    return { src: img.src, alt: img.alt, title, cat };
  }

  // ── Filter ──────────────────────────────────────────────────
  function applyFilter(filter) {
    visibleItems = [];

    allItems.forEach((item, i) => {
      const cat = item.dataset.category;
      const show = filter === "all" || cat === filter;

      if (show) {
        item.classList.remove("hidden");
        // Stagger the fade-in animation
        item.classList.remove("fade-in");
        void item.offsetWidth; // force reflow
        item.style.animationDelay = `${visibleItems.length * 60}ms`;
        item.classList.add("fade-in");
        visibleItems.push(item);
      } else {
        item.classList.add("hidden");
        item.classList.remove("fade-in");
        item.style.animationDelay = "0ms";
      }
    });

    // Show / hide "no results" message
    if (visibleItems.length === 0) {
      noResults.classList.add("visible");
    } else {
      noResults.classList.remove("visible");
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      applyFilter(btn.dataset.filter);
    });
  });

  // ── Lightbox: open ─────────────────────────────────────────
  function openLightbox(indexInVisible) {
    if (indexInVisible < 0 || indexInVisible >= visibleItems.length) return;

    currentIndex = indexInVisible;
    const data   = getItemData(visibleItems[currentIndex]);

    // Fade the image in
    lbImage.style.opacity = "0";
    lbImage.src           = data.src;
    lbImage.alt           = data.alt;
    lbTitle.textContent   = data.title;
    lbCat.textContent     = data.cat;
    lbCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;

    lbImage.onload = function () {
      lbImage.style.opacity = "1";
    };

    // Edge-case: image already cached (onload won't fire again)
    if (lbImage.complete) lbImage.style.opacity = "1";

    updateNavButtons();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    isOpen = true;

    // Move focus inside lightbox for accessibility
    lbClose.focus();
  }

  // ── Lightbox: close ────────────────────────────────────────
  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    isOpen = false;
    lbImage.src = "";
  }

  // ── Lightbox: navigate ─────────────────────────────────────
  function navigate(direction) {
    var next = currentIndex + direction;
    if (next < 0 || next >= visibleItems.length) return;
    openLightbox(next);
  }

  function updateNavButtons() {
    lbPrev.disabled = currentIndex === 0;
    lbNext.disabled = currentIndex === visibleItems.length - 1;
  }

  // ── Event: click on gallery item ──────────────────────────
  allItems.forEach(function (item) {
    // Both the card and the explicit zoom-button open the lightbox
    item.addEventListener("click", function (e) {
      const idx = visibleItems.indexOf(item);
      if (idx !== -1) openLightbox(idx);
    });

    // Prevent zoom-button click from bubbling twice
    const btn = item.querySelector(".zoom-btn");
    if (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const idx = visibleItems.indexOf(item);
        if (idx !== -1) openLightbox(idx);
      });
    }
  });

  // ── Event: lightbox controls ──────────────────────────────
  lbClose.addEventListener("click", closeLightbox);
  backdrop.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { navigate(-1); });
  lbNext.addEventListener("click", function () { navigate(1); });

  // ── Event: keyboard ───────────────────────────────────────
  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape")      closeLightbox();
    if (e.key === "ArrowLeft")   navigate(-1);
    if (e.key === "ArrowRight")  navigate(1);
  });

  // ── Touch / swipe support ──────────────────────────────────
  var touchStartX = 0;
  var touchEndX   = 0;

  lightbox.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener("touchend", function (e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff  = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {           // min swipe distance
      if (diff > 0) navigate(1);         // swipe left  → next
      else          navigate(-1);        // swipe right → prev
    }
  }, { passive: true });

  // ── Init ──────────────────────────────────────────────────
  // Trigger staggered entrance for all items on load
  applyFilter("all");

})();