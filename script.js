const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
const gallery = document.querySelector(".gallery");

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

document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => {
    const card = gallery.querySelector(".work-card");
    const distance = card.offsetWidth + 13;
    gallery.scrollBy({ left: distance * Number(button.dataset.dir), behavior: "smooth" });
  });
});
