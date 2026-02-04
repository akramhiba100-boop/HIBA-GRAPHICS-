document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var root = document.getElementById("hibaUltra");
  if (!root) return;

  // Current year
  var yearEl = document.getElementById("huYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth scroll
  root.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      try { target.scrollIntoView({ behavior: "smooth", block: "start" }); }
      catch (err) { target.scrollIntoView(true); }
    });
  });

  // Services: event delegation (works even if content changes)
  var grid = document.getElementById("huServicesGrid");
  if (!grid) return;

  function parseImages(card) {
    var raw = (card.getAttribute("data-images") || "").trim();
    if (!raw) return [];
    return raw.split(",").map(function (s) { return (s || "").trim(); }).filter(Boolean);
  }

  function closeAll(except) {
    grid.querySelectorAll(".hu-service.is-open").forEach(function (card) {
      if (card === except) return;
      card.classList.remove("is-open");
      var btn = card.querySelector(".hu-service__btn");
      var panel = card.querySelector(".hu-panel");
      if (btn) btn.setAttribute("aria-expanded", "false");
      if (panel) { panel.hidden = true; panel.style.display = "none"; }
    });
  }

  function renderGalleryOnce(card) {
    if (card.getAttribute("data-rendered") === "1") return;

    var gridEl = card.querySelector(".hu-gallery__grid");
    if (!gridEl) return;

    var images = parseImages(card);
    gridEl.innerHTML = "";

    images.forEach(function (src, idx) {
      var wrap = document.createElement("div");
      wrap.className = "hu-thumb";

      var link = document.createElement("a");
      link.href = src;
      link.target = "_blank";
      link.rel = "noopener";

      var img = document.createElement("img");
      img.src = src;
      img.alt = "صورة خدمة " + (idx + 1);
      img.loading = "lazy";

      img.onerror = function () {
        wrap.style.display = "none";
      };

      link.appendChild(img);
      wrap.appendChild(link);
      gridEl.appendChild(wrap);
    });

    card.setAttribute("data-rendered", "1");
  }

  function openCard(card) {
    closeAll(card);
    card.classList.add("is-open");

    var btn = card.querySelector(".hu-service__btn");
    var panel = card.querySelector(".hu-panel");

    if (btn) btn.setAttribute("aria-expanded", "true");
    if (panel) { panel.hidden = false; panel.style.display = "block"; }

    renderGalleryOnce(card);
  }

  function closeCard(card) {
    card.classList.remove("is-open");

    var btn = card.querySelector(".hu-service__btn");
    var panel = card.querySelector(".hu-panel");

    if (btn) btn.setAttribute("aria-expanded", "false");
    if (panel) { panel.hidden = true; panel.style.display = "none"; }
  }

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".hu-service__btn");
    if (!btn) return;

    var card = btn.closest(".hu-service");
    if (!card) return;

    var isOpen = card.classList.contains("is-open");
    if (isOpen) {
      closeCard(card);
    } else {
      openCard(card);
      try { card.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (err) {}
    }
  });

  // Copy request text
  var copyBtn = document.getElementById("huCopyBtn");
  var copyBox = document.getElementById("huCopyBox");
  var toast = document.getElementById("huToast");

  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    setTimeout(function () { toast.hidden = true; }, 1400);
  }

  function getText() {
    if (!copyBox) return "";
    var html = copyBox.innerHTML || "";
    return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim();
  }

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "readonly");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.left = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); showToast(); } catch (e) {}
    document.body.removeChild(ta);
  }

  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showToast).catch(function () {
        legacyCopy(text);
      });
      return;
    }
    legacyCopy(text);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      copyText(getText());
    });
  }
});