(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id && id.startsWith("#") ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeNav();
    document.querySelectorAll("details.eng-details[open], details.stack-cat[open]").forEach((el) => {
      el.open = false;
    });
  });

  document.querySelectorAll('a[href^="#details-"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      const details = id ? document.querySelector(id) : null;
      if (!(details instanceof HTMLDetailsElement)) return;
      event.preventDefault();
      details.open = true;
      details.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  const copyEmailBtn = document.querySelector("[data-copy-email]");
  const copyStatus = document.querySelector("[data-copy-status]");
  let copyResetTimer = 0;

  const showCopied = () => {
    if (!copyStatus) return;
    copyStatus.hidden = false;
    window.clearTimeout(copyResetTimer);
    copyResetTimer = window.setTimeout(() => {
      copyStatus.hidden = true;
    }, 1800);
  };

  const copyEmail = async (value) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_) {
      /* fall through */
    }

    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }
    field.remove();
    return ok;
  };

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", async () => {
      const value = copyEmailBtn.getAttribute("data-copy-email");
      if (!value) return;
      const ok = await copyEmail(value);
      if (ok) showCopied();
    });
  }

  const onScroll = () => {
    if (!header) return;
    const y = window.scrollY;
    header.classList.toggle("is-compact", y > 24);
    header.style.borderBottomColor =
      y > 8 ? "rgba(140, 155, 180, 0.16)" : "rgba(255, 255, 255, 0.055)";

    let activeId = null;
    const offset = header.offsetHeight + 28;
    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top - offset;
      if (top <= 0) activeId = `#${section.id}`;
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === activeId);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");

  const showReveal = (el) => el.classList.add("is-visible");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(showReveal);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          showReveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
  );

  reveals.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      showReveal(el);
    } else {
      observer.observe(el);
    }
  });
})();
