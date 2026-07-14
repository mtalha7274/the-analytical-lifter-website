(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const progress = document.getElementById("scrollProgress");
  const loader = document.getElementById("loader");
  const form = document.getElementById("applicationForm");
  const submitBtn = document.getElementById("submitBtn");
  const targetFrame = document.getElementById("jotformTarget");
  const toast = document.getElementById("toast");
  const range = document.getElementById("consistency");
  const rangeOutput = document.getElementById("consistencyValue");
  const certificateModal = document.getElementById("certificateModal");
  const certificateZoom = document.getElementById("certificateZoom");
  const certificateClose = document.getElementById("certificateClose");

  document.getElementById("year").textContent = new Date().getFullYear();

  /* Opening sequence */
  const completeLoader = () => {
    loader?.classList.add("is-complete");
    body.classList.add("is-loaded");
    window.setTimeout(() => loader?.remove(), 1100);
  };
  if (reducedMotion) completeLoader();
  else window.addEventListener("load", () => window.setTimeout(completeLoader, 700), { once: true });
  window.setTimeout(completeLoader, 3000);

  /* Navigation */
  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    navLinks.classList.toggle("is-open", !open);
    body.style.overflow = open ? "" : "hidden";
  });
  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle?.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("is-open");
      body.style.overflow = "";
    });
  });

  /* Scroll-driven UI */
  let ticking = false;
  const parallaxItems = [...document.querySelectorAll(".parallax-media")];

  const renderScroll = () => {
    const scrollY = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    nav?.classList.toggle("is-scrolled", scrollY > 40);

    if (!reducedMotion) {
      parallaxItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < -150 || rect.top > window.innerHeight + 150) return;
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        item.style.setProperty("--parallax", `${center * -0.045}px`);
      });
    }
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(renderScroll);
      ticking = true;
    }
  }, { passive: true });
  renderScroll();

  /* Reveals stay visible without JS; motion is progressive enhancement */
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  const imageReveals = [...document.querySelectorAll(".image-reveal")];

  if (!reducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    [...revealItems, ...imageReveals].forEach((item) => observer.observe(item));

    window.setTimeout(() => {
      [...revealItems, ...imageReveals].forEach((item) => item.classList.add("is-visible"));
    }, 1800);
  } else {
    [...revealItems, ...imageReveals].forEach((item) => item.classList.add("is-visible"));
  }

  /* Custom cursor */
  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    const dot = document.querySelector(".cursor--dot");
    const ring = document.querySelector(".cursor--ring");
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate3d(${mouseX - 2.5}px, ${mouseY - 2.5}px, 0)`;
      body.classList.add("cursor-ready");
    }, { passive: true });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      ring.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    document.querySelectorAll("a, button, input, select, textarea, .tilt-card").forEach((item) => {
      item.addEventListener("mouseenter", () => body.classList.add("cursor-hover"));
      item.addEventListener("mouseleave", () => body.classList.remove("cursor-hover"));
    });
  }

  /* Magnetic buttons */
  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
      });
      button.addEventListener("mouseleave", () => {
        button.style.transform = "";
      });
    });
  }

  /* 3D proof and editorial cards */
  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg) translateZ(4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* Certificate lightbox */
  certificateZoom?.addEventListener("click", () => certificateModal?.showModal());
  certificateClose?.addEventListener("click", () => certificateModal?.close());
  certificateModal?.addEventListener("click", (event) => {
    if (event.target === certificateModal) certificateModal.close();
  });

  /* Form */
  range?.addEventListener("input", () => {
    rangeOutput.textContent = range.value;
  });

  let toastTimer;
  const showToast = (message, error = false) => {
    toast.textContent = message;
    toast.classList.toggle("is-error", error);
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4500);
  };

  const clearErrors = () => {
    form.querySelectorAll(".field-error").forEach((field) => field.classList.remove("field-error"));
    form.querySelectorAll(".error-message").forEach((error) => error.remove());
  };

  const markError = (field, message) => {
    field.classList.add("field-error");
    const error = document.createElement("span");
    error.className = "error-message";
    error.textContent = message;
    const parent = field.closest(".field") || field.closest(".radio-group");
    parent?.appendChild(error);
  };

  const validateForm = () => {
    clearErrors();
    let valid = true;
    const handledRadios = new Set();

    form.querySelectorAll("[required]").forEach((field) => {
      if (field.type === "radio") {
        if (handledRadios.has(field.name)) return;
        handledRadios.add(field.name);
        const selected = form.querySelector(`[name="${field.name}"]:checked`);
        if (!selected) {
          markError(field.closest(".radio-group"), "Please select one option.");
          valid = false;
        }
        return;
      }

      if (!field.value.trim()) {
        markError(field, "This field is required.");
        valid = false;
      } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        markError(field, "Enter a valid email address.");
        valid = false;
      }
    });
    return valid;
  };

  let submitting = false;
  form?.addEventListener("submit", (event) => {
    if (!validateForm()) {
      event.preventDefault();
      showToast("Please complete the highlighted fields.", true);
      form.querySelector(".field-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    submitting = true;
    submitBtn.disabled = true;
    submitBtn.querySelector(".button__label").textContent = "Submitting…";
  });

  targetFrame?.addEventListener("load", () => {
    if (!submitting) return;
    submitting = false;
    submitBtn.disabled = false;
    submitBtn.querySelector(".button__label").textContent = "Submit application";
    form.reset();
    rangeOutput.textContent = "5";
    showToast("Application submitted.");
  });
})();
