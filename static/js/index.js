function copyBibTeX() {
  const code = document.getElementById("bibtex-code");
  const button = document.getElementById("copy-bibtex");
  if (!code || !button) return;

  const markCopied = () => {
    button.textContent = "Copied";
    button.classList.add("is-copied");
    window.setTimeout(() => {
      button.textContent = "Copy";
      button.classList.remove("is-copied");
    }, 1800);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(code.textContent).then(markCopied);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = code.textContent;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
  markCopied();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupVideoShowcases() {
  const showcases = Array.from(document.querySelectorAll("[data-video-showcase]"));

  showcases.forEach((showcase) => {
    const video = showcase.querySelector("[data-demo-video]");
    const label = showcase.querySelector("[data-video-label]");
    const tabs = Array.from(showcase.querySelectorAll("[data-video]"));
    if (!video || !tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const source = tab.dataset.video;
        const description = tab.dataset.label || tab.textContent.trim();
        if (!source) return;

        document.querySelectorAll("[data-demo-video]").forEach((otherVideo) => {
          if (otherVideo !== video) otherVideo.pause();
        });

        tabs.forEach((candidate) => {
          const isSelected = candidate === tab;
          candidate.classList.toggle("is-active", isSelected);
          candidate.setAttribute("aria-selected", String(isSelected));
        });

        if (video.getAttribute("src") !== source) {
          video.pause();
          video.removeAttribute("poster");
          video.setAttribute("src", source);
          video.load();
        }

        video.setAttribute("aria-label", description);
        if (label) label.textContent = description;
        video.play().catch(() => {});
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const topButton = document.querySelector(".scroll-to-top");
  const navLinks = Array.from(document.querySelectorAll(".outline-link"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const updateNavigation = () => {
    if (topButton) {
      topButton.classList.toggle("is-visible", window.scrollY > 420);
    }

    let activeId = sections[0]?.id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 180) activeId = section.id;
    }
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
    });
  };

  const revealElements = Array.from(document.querySelectorAll(".reveal"));
  const revealVisibleElements = () => {
    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.08 && rect.bottom > -80) {
        element.classList.add("is-visible");
      }
    });
  };

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "80px 0px" }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  revealVisibleElements();
  setupVideoShowcases();
  window.setTimeout(revealVisibleElements, 120);
  window.addEventListener("scroll", updateNavigation, { passive: true });
  window.addEventListener("load", () => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    window.setTimeout(() => {
      target.scrollIntoView();
      revealVisibleElements();
      updateNavigation();
    }, 80);
  });
  updateNavigation();
});
