const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
const gallery = document.querySelector(".gallery");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    menuButton.setAttribute("aria-label", open ? "Menu openen" : "Menu sluiten");
    nav.classList.toggle("open", !open);
  });

  nav.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  });
}

document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!gallery) return;
    const card = gallery.querySelector(".work-card");
    const distance = card.offsetWidth + 13;
    gallery.scrollBy({ left: distance * Number(button.dataset.dir), behavior: "smooth" });
  });
});

// Scroll progress for a subtle sense of movement through the story.
const progress = document.querySelector(".scroll-progress span");
if (progress) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

// Cross-fading hero with buttons, autoplay and touch swipe.
const hero = document.querySelector(".hero-art");
const heroSlides = [...document.querySelectorAll(".hero-slide")];
const heroDots = [...document.querySelectorAll(".hero-dots button")];
const heroIndex = document.querySelector(".hero-index");
let currentHero = 0;
let heroTimer;
let touchStartX = 0;

const showHero = (next) => {
  if (!heroSlides.length) return;
  currentHero = (next + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, index) => slide.classList.toggle("is-active", index === currentHero));
  heroDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === currentHero);
    dot.setAttribute("aria-current", index === currentHero ? "true" : "false");
  });
  if (heroIndex) heroIndex.textContent = `0${currentHero + 1} — 0${heroSlides.length}`;
};

const startHero = () => {
  window.clearInterval(heroTimer);
  if (!reduceMotion.matches && heroSlides.length > 1) {
    heroTimer = window.setInterval(() => showHero(currentHero + 1), 4800);
  }
};

heroDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showHero(Number(dot.dataset.slide));
    startHero();
  });
});

if (hero) {
  hero.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  hero.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) showHero(currentHero + (distance < 0 ? 1 : -1));
    startHero();
  }, { passive: true });
  hero.addEventListener("mouseenter", () => window.clearInterval(heroTimer));
  hero.addEventListener("mouseleave", startHero);
  startHero();
}

reduceMotion.addEventListener("change", startHero);

// Native horizontal gallery with autoplay that pauses as soon as the user interacts.
if (gallery) {
  const cards = [...gallery.querySelectorAll(".work-card")];
  const markers = [...document.querySelectorAll(".gallery-status span")];
  let galleryTimer;
  let galleryPaused = false;

  const galleryPosition = () => {
    const cardWidth = cards[0]?.offsetWidth || 1;
    return Math.min(cards.length - 1, Math.max(0, Math.round(gallery.scrollLeft / (cardWidth + 13))));
  };

  const updateGalleryStatus = () => {
    const active = galleryPosition();
    markers.forEach((marker, index) => marker.classList.toggle("is-active", index === active));
  };

  const advanceGallery = () => {
    if (galleryPaused || reduceMotion.matches || cards.length < 2) return;
    const next = (galleryPosition() + 1) % cards.length;
    gallery.scrollTo({ left: next * (cards[0].offsetWidth + 13), behavior: "smooth" });
  };

  const pauseGallery = () => {
    galleryPaused = true;
    window.clearInterval(galleryTimer);
  };

  gallery.addEventListener("scroll", updateGalleryStatus, { passive: true });
  ["pointerdown", "touchstart", "focusin"].forEach((event) => gallery.addEventListener(event, pauseGallery, { passive: true }));
  galleryTimer = window.setInterval(advanceGallery, 5200);
}

// Reveal content once, while keeping the page fully readable without JavaScript.
const revealItems = [...document.querySelectorAll("section:not(.hero), .hero-copy > *")];
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  document.body.classList.add("is-ready");
  revealItems.forEach((item) => item.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
  revealItems.forEach((item) => observer.observe(item));
}
