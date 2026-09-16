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

function setupGammaChart() {
  const svg = document.querySelector("[data-gamma-chart]");
  if (!svg) return;
  const ns = "http://www.w3.org/2000/svg";
  const W=900,H=210,L=54,R=16,T=14,B=38,maxK=20;
  const x=k=>L+k/maxK*(W-L-R), y=v=>T+(1-v)*(H-T-B);
  const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;svg.appendChild(e);return e;};
  [0,.25,.5,.75,1].forEach(v=>{add("line",{x1:L,y1:y(v),x2:W-R,y2:y(v),stroke:"#52697a","stroke-width":".7"});add("text",{x:L-9,y:y(v)+4,fill:"#8fa5bf","font-size":"11","text-anchor":"end"},v.toFixed(2));});
  [0,4,8,12,16,20].forEach(k=>{add("line",{x1:x(k),y1:T,x2:x(k),y2:H-B,stroke:"#344956","stroke-width":".7"});add("text",{x:x(k),y:H-22,fill:"#8fa5bf","font-size":"11","text-anchor":"middle"},k===0?"sₜ":`sₜ₊${k}`);});
  add("text",{x:15,y:95,fill:"#9eb0c6","font-size":"12",transform:"rotate(-90 15 95)","text-anchor":"middle"},"weight γᵏ");
  [[.8,"#7895aa",""],[.98,"#d0d7dd","6 4"]].forEach(([g,c,d])=>{const pts=Array.from({length:maxK+1},(_,k)=>[x(k),y(Math.pow(g,k))]);add("polyline",{points:pts.map(p=>p.join(",")).join(" "),fill:"none",stroke:c,"stroke-width":"2.5","stroke-dasharray":d});pts.forEach(p=>add("circle",{cx:p[0],cy:p[1],r:"2.5",fill:"#0d161e",stroke:c,"stroke-width":"1.5"}));});
}

function setupMathFormula() {
  document.querySelectorAll("[data-katex]").forEach((element) => {
    if (!window.katex) return;
    window.katex.render(element.dataset.katex, element, {
      displayMode: true,
      throwOnError: false,
      strict: "ignore",
    });
  });
}

function loadDeferredVideo(video) {
  const source = video.dataset.src;
  if (video.getAttribute("src") || !source) return;
  video.setAttribute("src", source);
  video.load();
}

function setupHeroVideoMatrix() {
  const matrix = document.querySelector(".hero-video-matrix");
  const rows = Array.from(document.querySelectorAll(".hero-task-row"));
  if (!matrix || !rows.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeRow = 0;
  let rotationTimer = null;
  let isRunning = false;

  const activateRow = (rowIndex) => {
    rows.forEach((row, index) => {
      const isActive = index === rowIndex;
      row.classList.toggle("is-active", isActive);
      row.querySelectorAll("[data-hero-video]").forEach((video) => {
        if (isActive) {
          loadDeferredVideo(video);
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    });
  };

  const startRotation = () => {
    if (isRunning || reducedMotion) return;
    isRunning = true;
    activateRow(activeRow);
    rotationTimer = window.setInterval(() => {
      activeRow = (activeRow + 1) % rows.length;
      activateRow(activeRow);
    }, 7000);
  };

  const stopRotation = () => {
    isRunning = false;
    window.clearInterval(rotationTimer);
    rotationTimer = null;
    rows.forEach((row) => {
      row.classList.remove("is-active");
      row.querySelectorAll("[data-hero-video]").forEach((video) => video.pause());
    });
  };

  if ("IntersectionObserver" in window) {
    const matrixObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startRotation();
        else stopRotation();
      },
      { threshold: 0.08 }
    );
    matrixObserver.observe(matrix);
  } else {
    startRotation();
  }
}

function setupVideoReels() {
  const videos = Array.from(document.querySelectorAll("[data-reel-video]"));
  if (!videos.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateState = (video) => {
    const tile = video.closest(".video-tile");
    const state = tile?.querySelector(".video-tile-state");
    const isPlaying = !video.paused && !video.ended;
    tile?.classList.toggle("is-playing", isPlaying);
    if (state) state.textContent = isPlaying ? "Playing" : "Paused";
  };

  const toggleVideo = (video) => {
    if (video.paused) {
      video.dataset.userPaused = "false";
      loadDeferredVideo(video);
      video.play().catch(() => {});
    } else {
      video.dataset.userPaused = "true";
      video.pause();
    }
  };

  videos.forEach((video) => {
    video.addEventListener("play", () => updateState(video));
    video.addEventListener("pause", () => updateState(video));
    video.addEventListener("click", () => toggleVideo(video));
    video.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleVideo(video);
    });
  });

  if (reducedMotion) return;

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && video.dataset.userPaused !== "true") {
            loadDeferredVideo(video);
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.4, rootMargin: "0px 0px 40px" }
    );
    videos.forEach((video) => videoObserver.observe(video));
  } else {
    videos.slice(0, 3).forEach((video) => {
      loadDeferredVideo(video);
      video.play().catch(() => {});
    });
  }
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
  setupHeroVideoMatrix();
  setupVideoReels();
  setupMathFormula();
  setupGammaChart();
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
