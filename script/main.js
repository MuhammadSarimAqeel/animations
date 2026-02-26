// script/main.js (UPDATED: fixes replay candle + IG sent message text)

// ===========================
// Boot (NO music popup)
// ===========================
window.addEventListener("load", () => {
  const startTimeline = () => {
    try {
      const song = document.querySelector(".song");
      if (song) song.play().catch(() => {});
      animationTimeline();
    } catch (e) {
      console.error("Timeline error:", e);
      const c = document.querySelector(".container");
      if (c) c.style.visibility = "visible";
    }
  };

  startTimeline();
});

// ===========================
// Hearts
// ===========================
function startHearts() {
  const holder = document.querySelector(".hearts");
  if (!holder || holder.dataset.started) return;
  holder.dataset.started = "1";

  const count = 18;
  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.className = "heart";
    holder.appendChild(h);

    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + Math.random() * 300;
    const drift = Math.random() * 240 - 120;
    const dur = 4 + Math.random() * 4;
    const delay = Math.random() * 2.2;
    const scale = 0.7 + Math.random() * 1.4;

    gsap.set(h, { x: startX, y: startY, scale, opacity: 0 });

    gsap.to(h, { opacity: 0.95, duration: 0.6, delay });

    gsap.to(h, {
      y: -200,
      x: startX + drift,
      rotation: 20 + Math.random() * 120,
      duration: dur,
      delay,
      ease: "sine.out",
      repeat: -1,
      repeatDelay: 0.25 + Math.random() * 0.5,
      onRepeat: () => {
        const newX = Math.random() * window.innerWidth;
        gsap.set(h, {
          x: newX,
          y: window.innerHeight + 120 + Math.random() * 220,
          scale: 0.7 + Math.random() * 1.4,
          opacity: 0.2 + Math.random() * 0.7
        });
      }
    });
  }
}

// ===========================
// No gift button movement
// ===========================
function setupNoGiftButton() {
  const btn = document.getElementById("noGift");
  const wrap = document.querySelector(".gift-actions");
  if (!btn || !wrap) return;

  const move = () => {
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const maxX = Math.max(0, wrapRect.width - btnRect.width);
    const maxY = 28;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY - maxY / 2;

    btn.style.transform = `translate(${x - maxX / 2}px, ${y}px)`;
  };

  btn.addEventListener("mouseenter", move);
  btn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      move();
    },
    { passive: false }
  );

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    move();
  });
}

// ===========================
// Helpers
// ===========================
function safeSetText(el, text) {
  if (!el) return;
  el.textContent = text;
}

// ===========================
// Confetti (party poppers burst)
// ===========================
function partyPoppersBurst() {
  if (typeof confetti !== "function") return;

  const duration = 900;
  const end = Date.now() + duration;

  const burst = (originX) => {
    confetti({
      particleCount: 80,
      startVelocity: 55,
      spread: 70,
      ticks: 160,
      origin: { x: originX, y: 0.65 },
      scalar: 0.9
    });
  };

  burst(0.1);
  burst(0.9);

  const timer = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(timer);
      return;
    }
    confetti({
      particleCount: 20,
      startVelocity: 30,
      spread: 90,
      ticks: 120,
      origin: { x: Math.random(), y: 0.2 },
      scalar: 0.85
    });
  }, 140);
}

// ===========================
// Blow reminder (stays until blown)
// ===========================
let candleBlown = false;
let blowTimeout = null;

function startBlowTimer() {
  clearTimeout(blowTimeout);
  blowTimeout = setTimeout(() => {
    if (!candleBlown) showBlowPopup();
  }, 2000);
}

function showBlowPopup() {
  if (document.querySelector(".blow-popup")) return;

  const popup = document.createElement("div");
  popup.className = "blow-popup";
  popup.innerText = "Just click on blow Not asking to blow anything else just candle 😜";
  document.body.appendChild(popup);

  gsap.fromTo(
    popup,
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
  );
}

function hideBlowPopup() {
  const popup = document.querySelector(".blow-popup");
  if (!popup) return;

  gsap.to(popup, {
    opacity: 0,
    y: 16,
    duration: 0.25,
    onComplete: () => popup.remove()
  });
}

function handleCandleBlown() {
  candleBlown = true;
  clearTimeout(blowTimeout);
  hideBlowPopup();
}

// ===========================
// Cake blow animation (click based)
// Fix: works on replay by clearing old listeners + resetting flame
// ===========================
function setupCakeBlow(onDone) {
  let blowBtn = document.getElementById("blowBtn");
  const flame = document.getElementById("flame");
  const smoke = document.getElementById("smoke");
  const cake = document.getElementById("cake");

  if (!blowBtn || !flame || !smoke || !cake) return;

  // Clear old click listeners by cloning the button
  const freshBtn = blowBtn.cloneNode(true);
  blowBtn.parentNode.replaceChild(freshBtn, blowBtn);
  blowBtn = freshBtn;

  // Reset visuals every time this scene is entered (important for replay)
  blowBtn.dataset.done = "";
  gsap.set(flame, { opacity: 1, scale: 1, clearProps: "transform" });
  smoke.classList.remove("puff");
  candleBlown = false;
  hideBlowPopup();
  startBlowTimer();

  const doBlow = () => {
    if (blowBtn.dataset.done === "1") return;
    blowBtn.dataset.done = "1";

    handleCandleBlown();

    gsap.to(flame, {
      duration: 0.25,
      opacity: 0,
      scale: 0.2,
      ease: "power2.out"
    });

    smoke.classList.remove("puff");
    void smoke.offsetWidth;
    smoke.classList.add("puff");

    gsap.fromTo(
      cake,
      { y: 0 },
      { y: -4, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut" }
    );

    partyPoppersBurst();

    if (typeof onDone === "function") {
      setTimeout(() => onDone(), 600);
    }
  };

  blowBtn.addEventListener("click", doBlow);
}

// ===========================
// Memories slider
// ===========================
function setupMemoriesSlider() {
  const track = document.getElementById("memoriesTrack");
  const dotsWrap = document.getElementById("memDots");
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);
  const dots = Array.from(dotsWrap.querySelectorAll(".dot"));
  let index = 0;
  let autoTimer = null;
  let isDragging = false;
  let startX = 0;
  let currentX = 0;

  const setActiveDot = (i) => {
    dots.forEach((d, di) => d.classList.toggle("active", di === i));
  };

  const goTo = (i, animate = true) => {
    index = (i + slides.length) % slides.length;
    setActiveDot(index);
    const x = -index * 100;
    if (animate) gsap.to(track, { duration: 0.6, xPercent: x, ease: "power2.out" });
    else gsap.set(track, { xPercent: x });
  };

  const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(() => goTo(index + 1), 2400);
  };

  const stopAuto = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  };

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      stopAuto();
      goTo(i);
      startAuto();
    });
  });

  const onDown = (x) => {
    isDragging = true;
    stopAuto();
    startX = x;
    currentX = x;
  };
  const onMove = (x) => {
    if (!isDragging) return;
    currentX = x;
  };
  const onUp = () => {
    if (!isDragging) return;
    isDragging = false;
    const dx = currentX - startX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? index + 1 : index - 1);
    else goTo(index);
    startAuto();
  };

  track.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", onUp);

  goTo(0, false);
  startAuto();
  track.dataset.ready = "1";
}
// ===========================
// Memories slider (AUTO DOTS FOR ALL SLIDES)
// ===========================

// ===========================
// Insta send animation
// Fix: ensure sent bubble shows real text (no empty blue bubble)
// ===========================
function animateInstaSend(message) {
  const typed = document.querySelector(".ig-typed");
  const placeholder = document.querySelector(".ig-placeholder");
  const sendBtn = document.querySelector(".ig-send");
  const body = document.querySelector(".ig-body");
  const card = document.querySelector(".ig-card");

  const tl = gsap.timeline();
  if (!typed || !sendBtn || !card || !body) return tl;

  safeSetText(typed, "");
  if (placeholder) placeholder.style.opacity = "0";

  const fly = document.createElement("div");
  fly.className = "ig-fly";
  fly.textContent = message;
  document.body.appendChild(fly);

  gsap.set(fly, {
    position: "fixed",
    left: 0,
    top: 0,
    transform: "translateY(-50%)",
    padding: "10px 14px",
    borderRadius: "18px",
    background: "linear-gradient(135deg,#ff3cae,#ff9ad6)",
    color: "#fff",
    zIndex: 9999,
    opacity: 0,
    boxShadow: "0 18px 30px rgba(0,0,0,0.35)",
    pointerEvents: "none",
    width: "auto",
    maxWidth: "1px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere"
  });

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function scrollChatToBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function computeFlyPositions() {
    const typedRect = typed.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const vw = window.innerWidth;
    const margin = 12;

    const maxW = Math.max(180, Math.min(420, cardRect.width - 48));
    fly.style.maxWidth = maxW + "px";

    const startLeftRaw = typedRect.left + 8;
    const startTopRaw = typedRect.top + typedRect.height / 2;

    const endLeftRaw = cardRect.left + cardRect.width - maxW - 20;
    const endTopRaw = cardRect.top + cardRect.height - 160;

    const startLeft = clamp(startLeftRaw, margin, vw - maxW - margin);
    const endLeft = clamp(endLeftRaw, margin, vw - maxW - margin);

    const startTop = clamp(startTopRaw, margin, window.innerHeight - margin);
    const endTop = clamp(endTopRaw, margin + 60, window.innerHeight - margin);

    return { startLeft, startTop, endLeft, endTop };
  }

  const pos0 = computeFlyPositions();
  gsap.set(fly, { left: pos0.startLeft, top: pos0.startTop });

  const onResize = () => {
    const p = computeFlyPositions();
    gsap.set(fly, { left: p.startLeft, top: p.startTop });
  };
  window.addEventListener("resize", onResize);

  const charsPerSecond = 10;
  const typingDuration = Math.max(2.0, message.length / charsPerSecond);

  tl.to(
    {},
    {
      duration: typingDuration,
      ease: "none",
      onUpdate: function () {
        const p = this.progress();
        const n = Math.floor(message.length * p);
        safeSetText(typed, message.slice(0, n));
        scrollChatToBottom();
      }
    }
  )
    .to(sendBtn, { duration: 0.08, scale: 0.95 }, "+=0.2")
    .to(sendBtn, { duration: 0.12, scale: 1 })
    .to(fly, { duration: 0.01, opacity: 1 })
    .add(() => {
      const p = computeFlyPositions();
      gsap.set(fly, { left: p.startLeft, top: p.startTop });
      fly.dataset.endLeft = String(p.endLeft);
      fly.dataset.endTop = String(p.endTop);
    })
    .to(fly, {
      duration: 0.65,
      left: () => Number(fly.dataset.endLeft || pos0.endLeft),
      top: () => Number(fly.dataset.endTop || pos0.endTop),
      ease: "power2.out"
    })
    .add(() => {
      const newBubble = document.createElement("p");
      newBubble.className = "ig-bubble ig-right-bubble";
      newBubble.textContent = message; // FIX: real visible text
      newBubble.style.opacity = "0";
      body.appendChild(newBubble);

      gsap.to(newBubble, { opacity: 1, duration: 0.18, ease: "power1.out" });

      safeSetText(typed, "");
      if (placeholder) placeholder.style.opacity = "0.65";

      fly.remove();
      window.removeEventListener("resize", onResize);

      scrollChatToBottom();
    });

  return tl;
}

// ===========================
// Timeline
// ===========================
const animationTimeline = () => {
  if (typeof gsap === "undefined") {
    console.error("GSAP not loaded. Check your gsap script tag.");
    const c = document.querySelector(".container");
    if (c) c.style.visibility = "visible";
    return;
  }

  const container = document.querySelector(".container");
  if (container) container.style.visibility = "visible";

  const hbd = document.getElementsByClassName("wish-hbd")[0];
  if (hbd && !hbd.dataset.splitted) {
    hbd.dataset.splitted = "1";
    hbd.innerHTML = `<span>${hbd.innerHTML.split("").join("</span><span>")}</span>`;
  }

  const ideaTextTrans = { opacity: 0, y: -20, rotationX: 5, skewX: "15deg" };
  const ideaTextTransLeave = { opacity: 0, y: 20, rotationY: 5, skewX: "-15deg" };

  const messageText = "Happy birthday to youu baby girl 👙 ";

const memSlidesCount = document.querySelectorAll("#memoriesTrack .mem-slide").length || 3;
const memSecondsPerSlide = 2.4; // must match your slider interval (2400ms)
const memHoldSeconds = Math.max(6.2, memSlidesCount * memSecondsPerSlide);

  const tl = gsap.timeline({ paused: false });
  window.__birthdayTl = tl;

  tl.to(".container", { duration: 0.6, visibility: "visible" })
    .from(".one", { duration: 0.7, opacity: 0, y: 10 })
    .from(".two", { duration: 0.4, opacity: 0, y: 10 })
    .to(".one", { duration: 0.7, opacity: 0, y: 10 }, "+=3.5")
    .to(".two", { duration: 0.7, opacity: 0, y: 10 }, "-=1")
    .from(".three", { duration: 0.7, opacity: 0, y: 10 })
    .to(".three", { duration: 0.7, opacity: 0, y: 10 }, "+=3")

    .from(".four", { duration: 0.7, scale: 0.2, opacity: 0 })
    .from(".fake-btn", { duration: 0.3, scale: 0.2, opacity: 0 })
    .add(animateInstaSend(messageText))
    .to(".four", { duration: 0.5, scale: 0.2, opacity: 0, y: -150 }, "+=1")

    .from(".idea-1", { duration: 0.7, ...ideaTextTrans })
    .to(".idea-1", { duration: 0.7, ...ideaTextTransLeave }, "+=2.5")
    .from(".idea-2", { duration: 0.7, ...ideaTextTrans })
    .to(".idea-2", { duration: 0.7, ...ideaTextTransLeave }, "+=2.5")
    .from(".idea-3", { duration: 0.7, ...ideaTextTrans })
    .to(".idea-3 strong", {
      duration: 0.5,
      scale: 1.2,
      x: 10,
      backgroundColor: "rgb(255, 60, 174)",
      color: "#fff"
    })
    .to(".idea-3", { duration: 0.7, ...ideaTextTransLeave }, "+=2.5")
    .from(".idea-4", { duration: 0.7, ...ideaTextTrans })
    .to(".idea-4", { duration: 0.7, ...ideaTextTransLeave }, "+=2.5")

    .from(
      ".idea-5",
      {
        duration: 0.7,
        rotationX: 15,
        rotationZ: -10,
        skewY: "-5deg",
        y: 50,
        z: 10,
        opacity: 0
      },
      "+=1.5"
    )
    .to(".idea-5 span", { duration: 0.7, rotation: 90, x: 8 }, "+=1.4")
    .to(".idea-5", { duration: 0.7, scale: 0.2, opacity: 0 }, "+=2")

    .from(".idea-6 span", {
      duration: 0.8,
      scale: 3,
      opacity: 0,
      rotation: 15,
      ease: "expo.out",
      stagger: 0.2
    })
    .to(
      ".idea-6 span",
      {
        duration: 0.8,
        scale: 3,
        opacity: 0,
        rotation: -15,
        ease: "expo.out",
        stagger: 0.2
      },
      "+=1.5"
    )

    .call(startHearts)
    .fromTo(".baloons img", { opacity: 0.9, y: 1400 }, { opacity: 1, y: -1000, duration: 2.5, stagger: 0.2 })

    .from(
      ".profile-picture",
      {
        duration: 0.5,
        scale: 3.5,
        opacity: 0,
        x: 25,
        y: -25,
        rotationZ: -45
      },
      "-=2"
    )
    .to(".profile-wrap", { duration: 0.01, autoAlpha: 1 })
    .from(".hat", { duration: 0.5, x: -100, y: 350, rotation: -180, opacity: 0 })
    .from(".wish-hbd span", {
      duration: 0.7,
      opacity: 0,
      y: -50,
      rotation: 150,
      skewX: "30deg",
      ease: "elastic.out(1, 0.5)",
      stagger: 0.1
    })
    .fromTo(
      ".wish-hbd span",
      { scale: 1.4, rotationY: 150 },
      { scale: 1, rotationY: 0, color: "#ff69b4", ease: "expo.out", stagger: 0.1 },
      "party"
    )
    .from(".wish h5", { duration: 0.5, opacity: 0, y: 10, skewX: "-15deg" }, "party")

    // Setup cake blow (resume timeline after blow)
    .call(
      () => {
        setupCakeBlow(() => {
          if (window.__birthdayTl) window.__birthdayTl.play();
        });
        partyPoppersBurst();
      },
      null,
      "+=0.2"
    )

    // Pause here until candle is blown
    .addPause()

    .to(".eight svg", {
      duration: 0.5,
      visibility: "visible",
      opacity: 0,
      scale: 80,
      repeat: 1,
      repeatDelay: 0,
      stagger: 0.25
    })

    .to(".six", { duration: 0.6, opacity: 0, y: 30, zIndex: -1 }, "+=1.2")
    .from(".memories", { duration: 0.8, opacity: 0, y: 20 })
    .call(setupMemoriesSlider)
    .from(".memories-title", { duration: 0.7, ...ideaTextTrans }, "-=0.3")
    .from(".memories-sub", { duration: 0.6, opacity: 0, y: 10 }, "-=0.45")
    .from(".memories-slider", { duration: 0.8, scale: 0.92, opacity: 0 }, "-=0.35")
    .from(".mem-hint", { duration: 0.6, opacity: 0, y: 10 }, "-=0.4")
    .to(".memories", { duration: 0.6, opacity: 0, y: 20 }, `+=${memHoldSeconds}`)

    .from(".nine p", { duration: 1, ...ideaTextTrans, stagger: 1.2 })
    .to(".gift-wrap", { duration: 0.8, opacity: 1, visibility: "visible", y: 0, ease: "power2.out" }, "+=0.4")
    .to(".last-smile", { duration: 0.5, rotation: 90 }, "+=1")
    .call(setupNoGiftButton);

  // FIX: replay should fully restart and candle should work again
  const replyBtn = document.getElementById("replay");
  if (replyBtn) {
    replyBtn.addEventListener("click", () => {
      candleBlown = false;
      hideBlowPopup();
      tl.restart();
    });
  }
};