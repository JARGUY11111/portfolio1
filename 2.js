// Portfolio interactions: custom cursor, magnetic buttons, 3D tilt,
// scroll reveal, and ambient particle animation.

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;

  // Custom cursor and soft glow
  if (isFinePointer) {
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    Object.assign(cursor.style, {
      position: "fixed", left: "0", top: "0", width: "14px", height: "14px",
      borderRadius: "50%", background: "rgba(255,255,255,.9)",
      pointerEvents: "none", zIndex: "99999", transform: "translate(-50%, -50%)",
      mixBlendMode: "difference", transition: "width .18s ease, height .18s ease, opacity .18s ease",
      opacity: "0"
    });
    document.body.appendChild(cursor);

    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    Object.assign(glow.style, {
      position: "fixed", left: "0", top: "0", width: "260px", height: "260px",
      borderRadius: "50%", pointerEvents: "none", zIndex: "0",
      background: "radial-gradient(circle, rgba(180,160,255,.09), transparent 68%)",
      transform: "translate(-50%, -50%)", opacity: "0", transition: "opacity .25s ease"
    });
    document.body.appendChild(glow);

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let glowX = pointerX;
    let glowY = pointerY;

    window.addEventListener("mousemove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      cursor.style.left = `${pointerX}px`;
      cursor.style.top = `${pointerY}px`;
      cursor.style.opacity = "1";
      glow.style.opacity = "1";
    }, { passive: true });

    const updateGlow = () => {
      glowX += (pointerX - glowX) * 0.12;
      glowY += (pointerY - glowY) * 0.12;
      glow.style.left = `${glowX}px`;
      glow.style.top = `${glowY}px`;
      requestAnimationFrame(updateGlow);
    };
    updateGlow();

    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
      glow.style.opacity = "0";
    });
    document.addEventListener("mouseover", (event) => {
      if (event.target.closest("a, button, [role='button']")) {
        cursor.style.width = "34px";
        cursor.style.height = "34px";
      } else {
        cursor.style.width = "14px";
        cursor.style.height = "14px";
      }
    });
  }

  // Magnetic movement for buttons and links, only when motion is allowed
  if (!prefersReducedMotion && isFinePointer) {
    document.querySelectorAll(".magnetic, .btn, .button, .cta, a.button, a.btn").forEach((element) => {
      element.addEventListener("mousemove", (event) => {
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        element.style.transform = `translate(${dx * 0.12}px, ${dy * 0.16}px)`;
      });
      element.addEventListener("mouseleave", () => {
        element.style.transform = "";
      });
    });
  }

  // Subtle 3D tilt for cards
  if (!prefersReducedMotion && isFinePointer) {
    const tiltTargets = document.querySelectorAll(".tilt, .project-card, .card, .skill-card, .about-card");
    tiltTargets.forEach((element) => {
      element.style.transformStyle = "preserve-3d";
      element.addEventListener("mousemove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 7;
        const rotateX = (0.5 - y) * 7;
        element.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });
      element.addEventListener("mouseleave", () => {
        element.style.transform = "";
      });
    });
  }

  // Scroll reveal: support common reveal class names and data attributes
  const revealItems = document.querySelectorAll(
    ".reveal, .reveal-up, .fade-in, .scroll-reveal, [data-reveal]"
  );

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
  } else {
    revealItems.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(24px)";
      element.style.transition = "opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)";
      element.style.willChange = "opacity, transform";
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "none";
          entry.target.style.willChange = "auto";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealItems.forEach((element) => revealObserver.observe(element));
  }

  // Ambient particle canvas. Uses an existing canvas if the HTML provides one;
  // otherwise creates a background canvas without blocking page interactions.
  let canvas = document.querySelector("#particles, #particle-canvas, canvas[data-particles]");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "particle-canvas";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed", inset: "0", width: "100%", height: "100%",
      pointerEvents: "none", zIndex: "0", opacity: ".45"
    });
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext("2d");
  if (ctx) {
    let width = 0;
    let height = 0;
    let particles = [];
    const particleCount = Math.min(65, Math.max(25, Math.floor(window.innerWidth / 22)));

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.4,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        alpha: Math.random() * 0.38 + 0.12
      }));
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(205, 195, 255, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 105) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(180, 170, 230, ${(1 - distance / 105) * 0.08})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      if (!prefersReducedMotion) requestAnimationFrame(drawParticles);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    if (!prefersReducedMotion) {
      requestAnimationFrame(drawParticles);
    } else {
      drawParticles();
    }
  }
})();
