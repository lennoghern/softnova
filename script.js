document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");

  // Sticky nav background
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Highlight the nav link of the section in view
  const navLinks = [...links.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  // Reveal on scroll
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach((el) => {
    // Stagger siblings inside the same grid
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 70}ms`;
    revealer.observe(el);
  });

  // Service tabs (WAI-ARIA tabs pattern)
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const next = tabs[(keys[e.key] + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  // Contact form: client-side validation only (no backend connected yet)
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const messages = {
    name: "Escribe tu nombre.",
    email: "Escribe un correo válido.",
    message: "Cuéntanos brevemente tu idea.",
  };
  const validate = (input) => {
    const field = input.closest(".field");
    const valid = input.value.trim() !== "" && input.checkValidity();
    field.classList.toggle("has-error", !valid);
    field.querySelector(".error").textContent = valid ? "" : messages[input.name];
    return valid;
  };
  const required = [...form.querySelectorAll("[required]")];
  required.forEach((input) => input.addEventListener("blur", () => input.value && validate(input)));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = required.map(validate);
    if (results.includes(false)) {
      required[results.indexOf(false)].focus();
      status.textContent = "";
      return;
    }
    const name = form.elements.name.value.trim().split(" ")[0];
    status.textContent = `¡Gracias, ${name}! Te responderemos muy pronto.`;
    form.reset();
  });

  document.getElementById("year").textContent = new Date().getFullYear();
});
